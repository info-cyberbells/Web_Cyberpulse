import Message from '../../model/MessageModel.js';
import Conversation from '../../model/ConversationModel.js';

export const registerReadReceiptHandlers = (io, socket) => {
  socket.on('read:mark', async ({ conversationId }) => {
    try {
      const userId = socket.userId;
      if (!conversationId) return;

      // Mark all messages in this conversation as seen by this user
      await Message.updateMany(
        {
          conversationId,
          senderId: { $ne: userId },
          seenBy: { $ne: userId },
        },
        {
          $addToSet: { seenBy: userId },
          $set: { status: 'seen' },
        }
      );

      // Reset unread count for this user in conversation metadata
      await Conversation.updateOne(
        { _id: conversationId, 'metadata.userId': userId },
        { $set: { 'metadata.$.unreadCount': 0 } }
      );

      // Notify other participants about read receipts
      socket.to(`conversation:${conversationId}`).emit('read:receipt', {
        conversationId,
        userId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('read:mark error:', error);
    }
  });

  socket.on('delivered:mark', async ({ messageIds }) => {
    try {
      const userId = socket.userId;
      if (!messageIds || messageIds.length === 0) return;

      await Message.updateMany(
        {
          _id: { $in: messageIds },
          senderId: { $ne: userId },
          deliveredTo: { $ne: userId },
        },
        {
          $addToSet: { deliveredTo: userId },
        }
      );

      // Update status to delivered if not already seen
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          status: 'sent',
        },
        { $set: { status: 'delivered' } }
      );
    } catch (error) {
      console.error('delivered:mark error:', error);
    }
  });
};
