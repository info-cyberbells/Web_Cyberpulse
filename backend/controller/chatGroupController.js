import Conversation from '../model/ConversationModel.js';
import Employee from '../model/employeeModel.js';
import Message from '../model/MessageModel.js';
import { CHAT_CONSTANTS } from '../utils/chatConstants.js';
import { isGroupAdmin, isMember } from '../utils/groupPermissions.js';

export const createGroup = async (req, res) => {
  try {
    const { groupName, participants = [], groupDescription = '' } = req.body;
    const userId = req.user.id;

    if (!groupName || groupName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    // Ensure creator is included in participants
    const allParticipants = [...new Set([userId, ...participants])];

    if (allParticipants.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 participants required' });
    }

    if (allParticipants.length > CHAT_CONSTANTS.MAX_GROUP_MEMBERS) {
      return res.status(400).json({ success: false, message: `Maximum ${CHAT_CONSTANTS.MAX_GROUP_MEMBERS} members allowed` });
    }

    const sender = await Employee.findById(userId);

    const conversation = await Conversation.create({
      type: 'group',
      groupName: groupName.trim(),
      groupDescription,
      participants: allParticipants,
      admins: [userId],
      createdBy: userId,
      metadata: allParticipants.map(pId => ({ userId: pId, unreadCount: 0 })),
      organizationId: sender.organizationId,
    });

    // Create system message
    await Message.create({
      conversationId: conversation._id,
      senderId: userId,
      content: `${sender.name} created group "${groupName}"`,
      type: 'system',
      organizationId: sender.organizationId,
    });

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name email image')
      .populate('admins', 'name email image');

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('createGroup error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addMember = async (req, res) => {
  try {
    const { conversationId, memberId } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!isGroupAdmin(conversation, userId)) {
      return res.status(403).json({ success: false, message: 'Only admins can add members' });
    }

    if (isMember(conversation, memberId)) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    if (conversation.participants.length >= CHAT_CONSTANTS.MAX_GROUP_MEMBERS) {
      return res.status(400).json({ success: false, message: 'Group is full' });
    }

    conversation.participants.push(memberId);
    conversation.metadata.push({ userId: memberId, unreadCount: 0 });
    await conversation.save();

    const member = await Employee.findById(memberId, 'name');
    const admin = await Employee.findById(userId, 'name');

    await Message.create({
      conversationId,
      senderId: userId,
      content: `${admin.name} added ${member.name}`,
      type: 'system',
      organizationId: conversation.organizationId,
    });

    const populated = await Conversation.findById(conversationId)
      .populate('participants', 'name email image')
      .populate('admins', 'name email image');

    return res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error('addMember error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { conversationId, memberId } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!isGroupAdmin(conversation, userId)) {
      return res.status(403).json({ success: false, message: 'Only admins can remove members' });
    }

    if (memberId === conversation.createdBy?.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove the group creator' });
    }

    conversation.participants = conversation.participants.filter(
      p => p.toString() !== memberId
    );
    conversation.admins = conversation.admins.filter(
      a => a.toString() !== memberId
    );
    conversation.metadata = conversation.metadata.filter(
      m => m.userId.toString() !== memberId
    );
    await conversation.save();

    const member = await Employee.findById(memberId, 'name');
    const admin = await Employee.findById(userId, 'name');

    await Message.create({
      conversationId,
      senderId: userId,
      content: `${admin.name} removed ${member.name}`,
      type: 'system',
      organizationId: conversation.organizationId,
    });

    const populated = await Conversation.findById(conversationId)
      .populate('participants', 'name email image')
      .populate('admins', 'name email image');

    return res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error('removeMember error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!isMember(conversation, userId)) {
      return res.status(400).json({ success: false, message: 'You are not a member' });
    }

    conversation.participants = conversation.participants.filter(
      p => p.toString() !== userId
    );
    conversation.admins = conversation.admins.filter(
      a => a.toString() !== userId
    );
    conversation.metadata = conversation.metadata.filter(
      m => m.userId.toString() !== userId
    );

    // If no admins left, promote first participant
    if (conversation.admins.length === 0 && conversation.participants.length > 0) {
      conversation.admins.push(conversation.participants[0]);
    }

    await conversation.save();

    const user = await Employee.findById(userId, 'name');
    await Message.create({
      conversationId,
      senderId: userId,
      content: `${user.name} left the group`,
      type: 'system',
      organizationId: conversation.organizationId,
    });

    return res.status(200).json({ success: true, message: 'Left group successfully' });
  } catch (error) {
    console.error('leaveGroup error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateGroupInfo = async (req, res) => {
  try {
    const { conversationId, groupName, groupDescription, groupImage } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!isGroupAdmin(conversation, userId)) {
      return res.status(403).json({ success: false, message: 'Only admins can update group info' });
    }

    if (groupName) conversation.groupName = groupName.trim();
    if (groupDescription !== undefined) conversation.groupDescription = groupDescription;
    if (groupImage !== undefined) conversation.groupImage = groupImage;
    await conversation.save();

    const populated = await Conversation.findById(conversationId)
      .populate('participants', 'name email image')
      .populate('admins', 'name email image');

    return res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error('updateGroupInfo error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const { conversationId, memberId } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!isGroupAdmin(conversation, userId)) {
      return res.status(403).json({ success: false, message: 'Only admins can promote members' });
    }

    if (!isMember(conversation, memberId)) {
      return res.status(400).json({ success: false, message: 'User is not a member' });
    }

    if (isGroupAdmin(conversation, memberId)) {
      return res.status(400).json({ success: false, message: 'User is already an admin' });
    }

    conversation.admins.push(memberId);
    await conversation.save();

    return res.status(200).json({ success: true, message: 'Member promoted to admin' });
  } catch (error) {
    console.error('promoteToAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const demoteFromAdmin = async (req, res) => {
  try {
    const { conversationId, memberId } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!isGroupAdmin(conversation, userId)) {
      return res.status(403).json({ success: false, message: 'Only admins can demote members' });
    }

    if (memberId === conversation.createdBy?.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot demote the group creator' });
    }

    conversation.admins = conversation.admins.filter(
      a => a.toString() !== memberId
    );
    await conversation.save();

    return res.status(200).json({ success: true, message: 'Admin demoted to member' });
  } catch (error) {
    console.error('demoteFromAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
