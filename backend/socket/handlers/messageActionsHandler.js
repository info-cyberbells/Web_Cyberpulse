import Message from '../../model/MessageModel.js';
import Conversation from '../../model/ConversationModel.js';
import { CHAT_CONSTANTS } from '../../utils/chatConstants.js';

export const registerMessageActionsHandlers = (io, socket) => {
  // Edit message (15 min window)
  socket.on('message:edit', async ({ messageId, content }, callback) => {
    try {
      const userId = socket.userId;
      const message = await Message.findById(messageId);

      if (!message || message.senderId.toString() !== userId) {
        return callback?.({ success: false, message: 'Cannot edit this message' });
      }

      const elapsed = Date.now() - message.createdAt.getTime();
      if (elapsed > CHAT_CONSTANTS.EDIT_WINDOW_MS) {
        return callback?.({ success: false, message: 'Edit window expired' });
      }

      message.content = content;
      message.isEdited = true;
      await message.save();

      io.to(`conversation:${message.conversationId}`).emit('message:edited', {
        messageId,
        content,
        isEdited: true,
        conversationId: message.conversationId.toString(),
      });

      callback?.({ success: true });
    } catch (error) {
      console.error('message:edit error:', error);
      callback?.({ success: false, message: 'Failed to edit message' });
    }
  });

  // Delete for me
  socket.on('message:delete-for-me', async ({ messageId }, callback) => {
    try {
      const userId = socket.userId;
      const message = await Message.findById(messageId);
      if (!message) {
        return callback?.({ success: false, message: 'Message not found' });
      }
      await Message.updateOne(
        { _id: messageId },
        { $addToSet: { deletedFor: userId } }
      );
      callback?.({ success: true, messageId, conversationId: message.conversationId.toString() });
    } catch (error) {
      console.error('message:delete-for-me error:', error);
      callback?.({ success: false, message: 'Failed to delete message' });
    }
  });

  // Delete for everyone (1 hour window)
  socket.on('message:delete-for-everyone', async ({ messageId }, callback) => {
    try {
      const userId = socket.userId;
      const message = await Message.findById(messageId);

      if (!message || message.senderId.toString() !== userId) {
        return callback?.({ success: false, message: 'Cannot delete this message' });
      }

      const elapsed = Date.now() - message.createdAt.getTime();
      if (elapsed > CHAT_CONSTANTS.DELETE_FOR_EVERYONE_WINDOW_MS) {
        return callback?.({ success: false, message: 'Delete window expired' });
      }

      message.deletedForEveryone = true;
      message.content = '';
      message.attachments = [];
      await message.save();

      io.to(`conversation:${message.conversationId}`).emit('message:deleted-for-everyone', {
        messageId,
        conversationId: message.conversationId,
      });

      callback?.({ success: true });
    } catch (error) {
      console.error('message:delete-for-everyone error:', error);
      callback?.({ success: false, message: 'Failed to delete message' });
    }
  });

  // Pin/Unpin message
  socket.on('message:pin', async ({ messageId, pin }, callback) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        return callback?.({ success: false, message: 'Message not found' });
      }

      const conversation = await Conversation.findById(message.conversationId);
      if (!conversation.participants.some(p => p.toString() === socket.userId)) {
        return callback?.({ success: false, message: 'Not a participant' });
      }

      message.isPinned = pin;
      await message.save();

      io.to(`conversation:${message.conversationId}`).emit('message:pinned', {
        messageId,
        isPinned: pin,
        conversationId: message.conversationId,
      });

      callback?.({ success: true });
    } catch (error) {
      console.error('message:pin error:', error);
      callback?.({ success: false, message: 'Failed to pin message' });
    }
  });

  // Forward message
  socket.on('message:forward', async ({ messageId, targetConversationIds }, callback) => {
    try {
      const userId = socket.userId;
      const original = await Message.findById(messageId);
      if (!original) {
        return callback?.({ success: false, message: 'Message not found' });
      }

      const forwarded = [];
      for (const convId of targetConversationIds) {
        const conv = await Conversation.findOne({ _id: convId, participants: userId });
        if (!conv) continue;

        const newMsg = await Message.create({
          conversationId: convId,
          senderId: userId,
          content: original.content,
          type: original.type,
          attachments: original.attachments,
          status: 'sent',
          organizationId: conv.organizationId,
        });

        const populated = await Message.findById(newMsg._id)
          .populate('senderId', 'name email image');

        conv.lastMessage = {
          content: original.content,
          senderId: userId,
          type: original.type,
          timestamp: newMsg.createdAt,
        };
        await conv.save();

        io.to(`conversation:${convId}`).emit('message:received', {
          success: true,
          data: populated,
        });

        forwarded.push(populated);
      }

      callback?.({ success: true, data: forwarded });
    } catch (error) {
      console.error('message:forward error:', error);
      callback?.({ success: false, message: 'Failed to forward message' });
    }
  });
};
