import ScheduledMessage from '../model/ScheduledMessageModel.js';
import Conversation from '../model/ConversationModel.js';
import Employee from '../model/employeeModel.js';

export const scheduleMessage = async (req, res) => {
  try {
    const { conversationId, content, type = 'text', attachments = [], scheduledFor } = req.body;
    const userId = req.user.id;

    if (!conversationId || !content || !scheduledFor) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'Scheduled time must be in the future' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const sender = await Employee.findById(userId);

    const scheduled = await ScheduledMessage.create({
      conversationId,
      senderId: userId,
      content,
      type,
      attachments,
      scheduledFor: scheduledDate,
      organizationId: sender.organizationId,
    });

    return res.status(201).json({ success: true, data: scheduled });
  } catch (error) {
    console.error('scheduleMessage error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const cancelScheduledMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const scheduled = await ScheduledMessage.findOne({
      _id: messageId,
      senderId: userId,
      status: 'pending',
    });

    if (!scheduled) {
      return res.status(404).json({ success: false, message: 'Scheduled message not found' });
    }

    scheduled.status = 'cancelled';
    await scheduled.save();

    return res.status(200).json({ success: true, message: 'Scheduled message cancelled' });
  } catch (error) {
    console.error('cancelScheduledMessage error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getScheduledMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.query;

    const query = { senderId: userId, status: 'pending' };
    if (conversationId) query.conversationId = conversationId;

    const messages = await ScheduledMessage.find(query)
      .populate('conversationId', 'type groupName participants')
      .sort({ scheduledFor: 1 });

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('getScheduledMessages error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
