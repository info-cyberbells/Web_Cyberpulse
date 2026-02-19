import Conversation from '../model/ConversationModel.js';
import BlockedUser from '../model/BlockedUserModel.js';
import Employee from '../model/employeeModel.js';

export const muteConversation = async (req, res) => {
  try {
    const { conversationId, mute, mutedUntil = null } = req.body;
    const userId = req.user.id;

    const result = await Conversation.updateOne(
      { _id: conversationId, 'metadata.userId': userId },
      {
        $set: {
          'metadata.$.isMuted': mute,
          'metadata.$.mutedUntil': mutedUntil ? new Date(mutedUntil) : null,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    return res.status(200).json({ success: true, message: mute ? 'Muted' : 'Unmuted' });
  } catch (error) {
    console.error('muteConversation error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { blockedUserId } = req.body;
    const userId = req.user.id;

    if (blockedUserId === userId) {
      return res.status(400).json({ success: false, message: 'Cannot block yourself' });
    }

    const sender = await Employee.findById(userId);

    await BlockedUser.create({
      blockerId: userId,
      blockedUserId,
      organizationId: sender.organizationId,
    });

    return res.status(200).json({ success: true, message: 'User blocked' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'User already blocked' });
    }
    console.error('blockUser error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { blockedUserId } = req.body;
    const userId = req.user.id;

    await BlockedUser.deleteOne({ blockerId: userId, blockedUserId });

    return res.status(200).json({ success: true, message: 'User unblocked' });
  } catch (error) {
    console.error('unblockUser error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const blocked = await BlockedUser.find({ blockerId: userId })
      .populate('blockedUserId', 'name email image');

    return res.status(200).json({ success: true, data: blocked });
  } catch (error) {
    console.error('getBlockedUsers error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const setDisappearingMessages = async (req, res) => {
  try {
    const { conversationId, duration } = req.body; // duration in seconds, 0 to disable
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    conversation.disappearingDuration = duration || 0;
    await conversation.save();

    return res.status(200).json({
      success: true,
      message: duration ? 'Disappearing messages enabled' : 'Disappearing messages disabled',
    });
  } catch (error) {
    console.error('setDisappearingMessages error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
