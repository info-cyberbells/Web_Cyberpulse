import Conversation from '../model/ConversationModel.js';
import GroupInviteLink from '../model/GroupInviteLinkModel.js';
import GroupJoinRequest from '../model/GroupJoinRequestModel.js';
import Employee from '../model/employeeModel.js';
import Message from '../model/MessageModel.js';
import { isGroupAdmin, isMember } from '../utils/groupPermissions.js';
import { generateInviteToken } from '../utils/inviteLinkGenerator.js';

export const createInviteLink = async (req, res) => {
  try {
    const { conversationId, maxUses = 0, expiresInHours = 0, requiresApproval = false } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== 'group') {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!isGroupAdmin(conversation, userId)) {
      return res.status(403).json({ success: false, message: 'Only admins can create invite links' });
    }

    const token = generateInviteToken();
    const expiresAt = expiresInHours > 0
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
      : null;

    const inviteLink = await GroupInviteLink.create({
      token,
      conversationId,
      createdBy: userId,
      maxUses,
      expiresAt,
      requiresApproval,
    });

    return res.status(201).json({ success: true, data: inviteLink });
  } catch (error) {
    console.error('createInviteLink error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const revokeInviteLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user.id;

    const link = await GroupInviteLink.findById(linkId);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    const conversation = await Conversation.findById(link.conversationId);
    if (!isGroupAdmin(conversation, userId)) {
      return res.status(403).json({ success: false, message: 'Only admins can revoke links' });
    }

    link.isActive = false;
    await link.save();

    return res.status(200).json({ success: true, message: 'Link revoked' });
  } catch (error) {
    console.error('revokeInviteLink error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const joinViaLink = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    const link = await GroupInviteLink.findOne({ token, isActive: true });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Invalid or expired invite link' });
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invite link expired' });
    }

    if (link.maxUses > 0 && link.useCount >= link.maxUses) {
      return res.status(400).json({ success: false, message: 'Invite link usage limit reached' });
    }

    const conversation = await Conversation.findById(link.conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (isMember(conversation, userId)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    if (link.requiresApproval) {
      const existing = await GroupJoinRequest.findOne({
        conversationId: link.conversationId,
        userId,
        status: 'pending',
      });

      if (existing) {
        return res.status(400).json({ success: false, message: 'Join request already pending' });
      }

      await GroupJoinRequest.create({
        conversationId: link.conversationId,
        userId,
        inviteLinkToken: token,
      });

      return res.status(200).json({ success: true, message: 'Join request submitted' });
    }

    // Direct join
    conversation.participants.push(userId);
    conversation.metadata.push({ userId, unreadCount: 0 });
    await conversation.save();

    link.useCount += 1;
    await link.save();

    const user = await Employee.findById(userId, 'name');
    await Message.create({
      conversationId: conversation._id,
      senderId: userId,
      content: `${user.name} joined via invite link`,
      type: 'system',
      organizationId: conversation.organizationId,
    });

    return res.status(200).json({ success: true, message: 'Joined group successfully' });
  } catch (error) {
    console.error('joinViaLink error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getJoinRequests = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !isGroupAdmin(conversation, userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const requests = await GroupJoinRequest.find({
      conversationId,
      status: 'pending',
    }).populate('userId', 'name email image');

    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error('getJoinRequests error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const handleJoinRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'approve' or 'reject'
    const userId = req.user.id;

    const request = await GroupJoinRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const conversation = await Conversation.findById(request.conversationId);
    if (!isGroupAdmin(conversation, userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (action === 'approve') {
      conversation.participants.push(request.userId);
      conversation.metadata.push({ userId: request.userId, unreadCount: 0 });
      await conversation.save();

      request.status = 'approved';
      await request.save();

      const user = await Employee.findById(request.userId, 'name');
      await Message.create({
        conversationId: conversation._id,
        senderId: request.userId,
        content: `${user.name} joined the group`,
        type: 'system',
        organizationId: conversation.organizationId,
      });

      // Increment invite link use count
      if (request.inviteLinkToken) {
        await GroupInviteLink.updateOne(
          { token: request.inviteLinkToken },
          { $inc: { useCount: 1 } }
        );
      }
    } else {
      request.status = 'rejected';
      await request.save();
    }

    return res.status(200).json({ success: true, message: `Request ${action}d` });
  } catch (error) {
    console.error('handleJoinRequest error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getInviteLinks = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !isGroupAdmin(conversation, userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const links = await GroupInviteLink.find({
      conversationId,
      isActive: true,
    });

    return res.status(200).json({ success: true, data: links });
  } catch (error) {
    console.error('getInviteLinks error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
