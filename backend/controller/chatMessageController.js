import Message from '../model/MessageModel.js';
import Conversation from '../model/ConversationModel.js';
import { CHAT_CONSTANTS } from '../utils/chatConstants.js';

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || CHAT_CONSTANTS.MESSAGES_PER_PAGE;
    const before = req.query.before; // cursor: messageId

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const query = {
      conversationId,
      deletedFor: { $ne: userId },
    };

    if (before) {
      query._id = { $lt: before };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'name email image')
      .populate({ path: 'replyTo', select: 'content senderId type', populate: { path: 'senderId', select: 'name email image' } })
      .sort({ _id: -1 })
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    const result = hasMore ? messages.slice(0, limit) : messages;

    return res.status(200).json({
      success: true,
      data: result.reverse(),
      pagination: {
        hasMore,
        nextCursor: hasMore ? result[0]._id : null,
      },
    });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = 'text', replyTo = null, attachments = [] } = req.body;
    const senderId = req.user.id;

    if (!conversationId || (!content && attachments.length === 0)) {
      return res.status(400).json({ success: false, message: 'Conversation ID and content are required' });
    }

    if (content && content.length > CHAT_CONSTANTS.MESSAGE_MAX_LENGTH) {
      return res.status(400).json({ success: false, message: 'Message too long' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: senderId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

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

    // Update conversation lastMessage
    conversation.lastMessage = {
      content: content || (attachments.length > 0 ? `${type} attachment` : ''),
      senderId,
      type,
      timestamp: message.createdAt,
    };

    conversation.metadata.forEach(meta => {
      if (meta.userId.toString() !== senderId) {
        meta.unreadCount += 1;
      }
    });

    await conversation.save();

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name email image')
      .populate({ path: 'replyTo', select: 'content senderId type', populate: { path: 'senderId', select: 'name email image' } });

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
