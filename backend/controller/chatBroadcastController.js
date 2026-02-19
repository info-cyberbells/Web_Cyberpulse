import Message from '../model/MessageModel.js';
import Conversation from '../model/ConversationModel.js';
import Employee from '../model/employeeModel.js';

export const sendBroadcast = async (req, res) => {
  try {
    const { recipientIds, content, type = 'text', attachments = [] } = req.body;
    const userId = req.user.id;

    if (!recipientIds || recipientIds.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one recipient required' });
    }

    if (!content && attachments.length === 0) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const sender = await Employee.findById(userId);
    const results = [];

    for (const recipientId of recipientIds) {
      // Find or create direct conversation
      let conversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [userId, recipientId], $size: 2 },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          type: 'direct',
          participants: [userId, recipientId],
          metadata: [
            { userId, unreadCount: 0 },
            { userId: recipientId, unreadCount: 0 },
          ],
          organizationId: sender.organizationId,
        });
      }

      const message = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        content,
        type,
        attachments,
        status: 'sent',
        organizationId: sender.organizationId,
      });

      conversation.lastMessage = {
        content,
        senderId: userId,
        type,
        timestamp: message.createdAt,
      };

      conversation.metadata.forEach(meta => {
        if (meta.userId.toString() !== userId) {
          meta.unreadCount += 1;
        }
      });

      await conversation.save();
      results.push({ recipientId, messageId: message._id, conversationId: conversation._id });
    }

    return res.status(201).json({
      success: true,
      message: `Broadcast sent to ${results.length} recipients`,
      data: results,
    });
  } catch (error) {
    console.error('sendBroadcast error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
