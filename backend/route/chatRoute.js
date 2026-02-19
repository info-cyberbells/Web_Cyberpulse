import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation,
  archiveConversation,
} from '../controller/chatConversationController.js';
import {
  getMessages,
  sendMessage,
} from '../controller/chatMessageController.js';
import {
  createGroup,
  addMember,
  removeMember,
  leaveGroup,
  updateGroupInfo,
  promoteToAdmin,
  demoteFromAdmin,
} from '../controller/chatGroupController.js';
import { uploadAttachment } from '../controller/chatAttachmentController.js';
import { chatUpload } from '../middleware/chatUploadMiddleware.js';
import { searchMessages } from '../controller/chatSearchController.js';
import { getThreadReplies, addThreadReply } from '../controller/chatThreadController.js';
import {
  muteConversation,
  blockUser,
  unblockUser,
  getBlockedUsers,
  setDisappearingMessages,
} from '../controller/chatSettingsController.js';
import { sendBroadcast } from '../controller/chatBroadcastController.js';
import {
  createInviteLink,
  revokeInviteLink,
  joinViaLink,
  getJoinRequests,
  handleJoinRequest,
  getInviteLinks,
} from '../controller/chatGroupAdminController.js';
import { initiateCall, endCall, getCallHistory } from '../controller/chatCallController.js';
import { scheduleMessage, cancelScheduledMessage, getScheduledMessages } from '../controller/chatScheduleController.js';

const routerChat = express.Router();

// All chat routes require authentication
routerChat.use(authenticateToken);

// Conversation routes
routerChat.post('/conversations', createConversation);
routerChat.get('/conversations', getConversations);
routerChat.get('/conversations/:id', getConversationById);
routerChat.delete('/conversations/:conversationId', deleteConversation);
routerChat.post('/conversations/:conversationId/archive', archiveConversation);

// Message routes
routerChat.get('/messages/:conversationId', getMessages);
routerChat.post('/messages', sendMessage);

// Group routes
routerChat.post('/groups', createGroup);
routerChat.post('/groups/add-member', addMember);
routerChat.post('/groups/remove-member', removeMember);
routerChat.post('/groups/leave', leaveGroup);
routerChat.put('/groups/info', updateGroupInfo);
routerChat.post('/groups/promote', promoteToAdmin);
routerChat.post('/groups/demote', demoteFromAdmin);

// Attachment routes
routerChat.post('/attachments/upload', chatUpload.single('file'), uploadAttachment);

// Search routes
routerChat.get('/search', searchMessages);

// Thread routes
routerChat.get('/threads/:messageId', getThreadReplies);
routerChat.post('/threads/:messageId', addThreadReply);

// Settings routes
routerChat.post('/settings/mute', muteConversation);
routerChat.post('/settings/block', blockUser);
routerChat.post('/settings/unblock', unblockUser);
routerChat.get('/settings/blocked', getBlockedUsers);
routerChat.post('/settings/disappearing', setDisappearingMessages);

// Broadcast routes
routerChat.post('/broadcast', sendBroadcast);

// Group admin routes
routerChat.post('/invite-links', createInviteLink);
routerChat.get('/invite-links/:conversationId', getInviteLinks);
routerChat.patch('/invite-links/:linkId/revoke', revokeInviteLink);
routerChat.post('/join/:token', joinViaLink);
routerChat.get('/join-requests/:conversationId', getJoinRequests);
routerChat.post('/join-requests/handle', handleJoinRequest);

// Call routes
routerChat.post('/calls/initiate', initiateCall);
routerChat.post('/calls/end', endCall);
routerChat.get('/calls/history', getCallHistory);

// Scheduled message routes
routerChat.post('/scheduled', scheduleMessage);
routerChat.get('/scheduled', getScheduledMessages);
routerChat.patch('/scheduled/:messageId/cancel', cancelScheduledMessage);

export default routerChat;
