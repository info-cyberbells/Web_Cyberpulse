import Message from '../model/MessageModel.js';
import Conversation from '../model/ConversationModel.js';

export const getThreadReplies = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before;

    const parentMessage = await Message.findById(messageId);
    if (!parentMessage) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const conversation = await Conversation.findOne({
      _id: parentMessage.conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    const query = {
      threadId: messageId,
      deletedFor: { $ne: userId },
    };
    if (before) query._id = { $lt: before };

    const replies = await Message.find(query)
      .populate('senderId', 'name email image')
      .sort({ _id: -1 })
      .limit(limit + 1);

    const hasMore = replies.length > limit;
    const result = hasMore ? replies.slice(0, limit) : replies;

    return res.status(200).json({
      success: true,
      data: {
        parentMessage: await Message.findById(messageId).populate('senderId', 'name email image'),
        replies: result.reverse(),
      },
      pagination: { hasMore, nextCursor: hasMore ? result[0]._id : null },
    });
  } catch (error) {
    console.error('getThreadReplies error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addThreadReply = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content, type = 'text', attachments = [] } = req.body;
    const userId = req.user.id;

    const parentMessage = await Message.findById(messageId);
    if (!parentMessage) {
      return res.status(404).json({ success: false, message: 'Parent message not found' });
    }

    const conversation = await Conversation.findOne({
      _id: parentMessage.conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    const reply = await Message.create({
      conversationId: parentMessage.conversationId,
      senderId: userId,
      content,
      type,
      attachments,
      threadId: messageId,
      status: 'sent',
      organizationId: conversation.organizationId,
    });

    const populated = await Message.findById(reply._id)
      .populate('senderId', 'name email image');

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('addThreadReply error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
