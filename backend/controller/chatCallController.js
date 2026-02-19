import CallLog from '../model/CallLogModel.js';
import Conversation from '../model/ConversationModel.js';
import Employee from '../model/employeeModel.js';

export const initiateCall = async (req, res) => {
  try {
    const { conversationId, callType } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const sender = await Employee.findById(userId);

    const callLog = await CallLog.create({
      conversationId,
      callType,
      initiatedBy: userId,
      participants: conversation.participants,
      status: 'initiated',
      organizationId: sender.organizationId,
    });

    return res.status(201).json({ success: true, data: callLog });
  } catch (error) {
    console.error('initiateCall error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const endCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const userId = req.user.id;

    const callLog = await CallLog.findById(callId);
    if (!callLog) {
      return res.status(404).json({ success: false, message: 'Call not found' });
    }

    callLog.status = 'ended';
    callLog.endedAt = new Date();
    if (callLog.startedAt) {
      callLog.duration = Math.round((callLog.endedAt - callLog.startedAt) / 1000);
    }
    await callLog.save();

    return res.status(200).json({ success: true, data: callLog });
  } catch (error) {
    console.error('endCall error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const calls = await CallLog.find({
      participants: userId,
    })
      .populate('initiatedBy', 'name email image')
      .populate('participants', 'name email image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CallLog.countDocuments({ participants: userId });

    return res.status(200).json({
      success: true,
      data: calls,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('getCallHistory error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
