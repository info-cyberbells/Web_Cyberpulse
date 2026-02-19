import Message from '../../model/MessageModel.js';
import Conversation from '../../model/ConversationModel.js';
import { CHAT_CONSTANTS } from '../../utils/chatConstants.js';
import { socketRateLimiter } from '../../middleware/rateLimitMiddleware.js';

export const registerMessageHandlers = (io, socket) => {
  socket.on('message:send', async (data, callback) => {
    try {
      if (!socketRateLimiter(socket.id)) {
        return callback?.({ success: false, message: 'Rate limit exceeded. Please slow down.' });
      }

      const { conversationId, content, type = 'text', replyTo = null, attachments = [] } = data;
      const senderId = socket.userId;

      if (!conversationId || (!content && attachments.length === 0)) {
        return callback?.({ success: false, message: 'Conversation ID and content are required' });
      }

      if (content && content.length > CHAT_CONSTANTS.MESSAGE_MAX_LENGTH) {
        return callback?.({ success: false, message: 'Message too long' });
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return callback?.({ success: false, message: 'Conversation not found' });
      }

      if (!conversation.participants.some(p => p.toString() === senderId)) {
        return callback?.({ success: false, message: 'You are not a participant of this conversation' });
      }

      // Track which users had this conversation hidden (they need a refresh)
      const wasHiddenFor = conversation.hiddenFor?.map(id => id.toString()) || [];

      // Check if this is the very first message in the conversation
      const isFirstMessage = !conversation.lastMessage?.timestamp;

      const message = await Message.create({
        conversationId,
        senderId,
        content: content || '',
        type,
        replyTo,
        attachments,
        status: 'sent',
        organizationId: conversation.organizationId,
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'name email image')
        .populate({ path: 'replyTo', select: 'content senderId type', populate: { path: 'senderId', select: 'name email image' } });

      // Update conversation lastMessage
      conversation.lastMessage = {
        content: content || (attachments.length > 0 ? `${type} attachment` : ''),
        senderId,
        type,
        timestamp: message.createdAt,
      };

      // Increment unread for all participants except sender
      conversation.metadata.forEach(meta => {
        if (meta.userId.toString() !== senderId) {
          meta.unreadCount += 1;
        }
      });

      // Unhide conversation for all participants when a new message comes in
      if (conversation.hiddenFor && conversation.hiddenFor.length > 0) {
        conversation.hiddenFor = [];
      }

      await conversation.save();

      // Emit to conversation room
      io.to(`conversation:${conversationId}`).emit('message:received', {
        success: true,
        data: populatedMessage,
      });

      // Notify all other participants via their user room
      conversation.participants.forEach(participantId => {
        const pid = participantId.toString();
        if (pid !== senderId) {
          // If this conversation was hidden for them or it's the first message,
          // they need to refetch their conversation list
          if (wasHiddenFor.includes(pid) || isFirstMessage) {
            io.to(`user:${pid}`).emit('conversation:new', {
              conversationId,
            });
          } else {
            io.to(`user:${pid}`).emit('conversation:updated', {
              conversationId,
              lastMessage: conversation.lastMessage,
            });
          }
        }
      });

      callback?.({ success: true, data: populatedMessage });
    } catch (error) {
      console.error('message:send error:', error);
      callback?.({ success: false, message: 'Failed to send message' });
    }
  });
};
