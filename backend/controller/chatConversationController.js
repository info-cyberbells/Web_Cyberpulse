import Conversation from '../model/ConversationModel.js';
import Employee from '../model/employeeModel.js';
import Message from '../model/MessageModel.js';
import { CHAT_CONSTANTS } from '../utils/chatConstants.js';

export const createConversation = async (req, res) => {
  try {
    const { participantId, type = 'direct' } = req.body;
    const userId = req.user.id;

    if (type === 'direct') {
      if (!participantId) {
        return res.status(400).json({ success: false, message: 'Participant ID is required' });
      }

      if (participantId === userId) {
        return res.status(400).json({ success: false, message: 'Cannot create conversation with yourself' });
      }

      // Check if participant exists
      const participant = await Employee.findById(participantId);
      if (!participant) {
        return res.status(404).json({ success: false, message: 'Participant not found' });
      }

      // Check for existing direct conversation (including hidden ones)
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [userId, participantId], $size: 2 },
      }).populate('participants', 'name email image');

      if (existingConversation) {
        // Unhide for this user if it was hidden
        if (existingConversation.hiddenFor?.some(id => id.toString() === userId)) {
          await Conversation.updateOne(
            { _id: existingConversation._id },
            { $pull: { hiddenFor: userId } }
          );
          existingConversation.hiddenFor = existingConversation.hiddenFor.filter(
            id => id.toString() !== userId
          );
        }
        return res.status(200).json({ success: true, data: existingConversation });
      }

      // Get sender's org
      const sender = await Employee.findById(userId);

      const conversation = await Conversation.create({
        type: 'direct',
        participants: [userId, participantId],
        metadata: [
          { userId, unreadCount: 0 },
          { userId: participantId, unreadCount: 0 },
        ],
        organizationId: sender.organizationId,
      });

      const populated = await Conversation.findById(conversation._id)
        .populate('participants', 'name email image');

      return res.status(201).json({ success: true, data: populated });
    }

    return res.status(400).json({ success: false, message: 'Invalid conversation type' });
  } catch (error) {
    console.error('createConversation error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || CHAT_CONSTANTS.CONVERSATIONS_PER_PAGE;
    const skip = (page - 1) * limit;

    const showArchived = req.query.archived === 'true';
    const filter = {
      participants: userId,
      hiddenFor: { $ne: userId },
      ...(showArchived
        ? { archivedFor: userId }
        : { archivedFor: { $ne: userId } }),
    };

    const conversations = await Conversation.find(filter)
      .populate('participants', 'name email image')
      .populate('admins', 'name email image')
      .populate('lastMessage.senderId', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Conversation.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getConversations error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId,
    })
      .populate('participants', 'name email image')
      .populate('admins', 'name email image');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    return res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error('getConversationById error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { deleteMessages } = req.body || {};

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (conversation.type === 'group') {
      return res.status(400).json({ success: false, message: 'Use leave group to exit a group conversation' });
    }

    // Hide the conversation for this user
    await Conversation.updateOne(
      { _id: conversationId },
      { $addToSet: { hiddenFor: userId } }
    );

    // If user chose to delete all messages, mark all messages as deletedFor this user
    // Next time they chat, old messages won't appear - starts fresh for them
    // But the other person still sees all old messages
    if (deleteMessages) {
      await Message.updateMany(
        { conversationId },
        { $addToSet: { deletedFor: userId } }
      );
    }

    return res.status(200).json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('deleteConversation error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Toggle archive: use metadata isPinned=false + a new archivedFor array
    const isArchived = conversation.archivedFor?.some(id => id.toString() === userId);

    if (isArchived) {
      await Conversation.updateOne(
        { _id: conversationId },
        { $pull: { archivedFor: userId } }
      );
    } else {
      await Conversation.updateOne(
        { _id: conversationId },
        { $addToSet: { archivedFor: userId } }
      );
    }

    return res.status(200).json({
      success: true,
      message: isArchived ? 'Conversation unarchived' : 'Conversation archived',
      archived: !isArchived,
    });
  } catch (error) {
    console.error('archiveConversation error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
