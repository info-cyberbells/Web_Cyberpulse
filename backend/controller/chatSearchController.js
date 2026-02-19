import Message from '../model/MessageModel.js';
import Conversation from '../model/ConversationModel.js';

export const searchMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, conversationId, type, senderId, startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    // Get user's conversations
    const userConversations = await Conversation.find(
      { participants: userId },
      { _id: 1 }
    );
    const conversationIds = userConversations.map(c => c._id);

    const filter = {
      conversationId: conversationId ? conversationId : { $in: conversationIds },
      deletedFor: { $ne: userId },
      deletedForEveryone: { $ne: true },
      $text: { $search: query },
    };

    if (type) filter.type = type;
    if (senderId) filter.senderId = senderId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const messages = await Message.find(filter, { score: { $meta: 'textScore' } })
      .populate('senderId', 'name email image')
      .populate('conversationId', 'type groupName participants')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('searchMessages error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
