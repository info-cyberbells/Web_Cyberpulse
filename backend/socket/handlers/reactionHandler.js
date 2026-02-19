import Message from '../../model/MessageModel.js';
import Employee from '../../model/employeeModel.js';

export const registerReactionHandlers = (io, socket) => {
  socket.on('reaction:add', async ({ messageId, emoji }, callback) => {
    try {
      const userId = socket.userId;
      const message = await Message.findById(messageId);
      if (!message) {
        return callback?.({ success: false, message: 'Message not found' });
      }

      // Remove existing reaction by this user for same emoji
      message.reactions = message.reactions.filter(
        r => !(r.userId.toString() === userId && r.emoji === emoji)
      );

      // Add reaction
      message.reactions.push({ emoji, userId });

      // Recalculate counts
      const counts = {};
      message.reactions.forEach(r => {
        counts[r.emoji] = (counts[r.emoji] || 0) + 1;
      });
      message.reactionCounts = counts;

      await message.save();

      const convId = message.conversationId.toString();

      io.to(`conversation:${convId}`).emit('reaction:updated', {
        messageId,
        conversationId: convId,
        reactions: message.reactions,
        reactionCounts: message.reactionCounts,
      });

      // Update conversation sidebar preview to show the reaction
      const reactor = await Employee.findById(userId, 'name');
      const reactorName = reactor?.name || 'Someone';
      const msgPreview = message.content?.length > 20
        ? message.content.substring(0, 20) + '...'
        : (message.content || 'a message');

      io.to(`conversation:${convId}`).emit('reaction:activity', {
        conversationId: convId,
        reactorName,
        reactorId: userId,
        emoji,
        messagePreview: msgPreview,
        timestamp: new Date(),
      });

      callback?.({ success: true });
    } catch (error) {
      console.error('reaction:add error:', error);
      callback?.({ success: false, message: 'Failed to add reaction' });
    }
  });

  socket.on('reaction:remove', async ({ messageId, emoji }, callback) => {
    try {
      const userId = socket.userId;
      const message = await Message.findById(messageId);
      if (!message) {
        return callback?.({ success: false, message: 'Message not found' });
      }

      message.reactions = message.reactions.filter(
        r => !(r.userId.toString() === userId && r.emoji === emoji)
      );

      const counts = {};
      message.reactions.forEach(r => {
        counts[r.emoji] = (counts[r.emoji] || 0) + 1;
      });
      message.reactionCounts = counts;

      await message.save();

      io.to(`conversation:${message.conversationId}`).emit('reaction:updated', {
        messageId,
        conversationId: message.conversationId.toString(),
        reactions: message.reactions,
        reactionCounts: message.reactionCounts,
      });

      callback?.({ success: true });
    } catch (error) {
      console.error('reaction:remove error:', error);
      callback?.({ success: false, message: 'Failed to remove reaction' });
    }
  });
};
