import Conversation from '../../model/ConversationModel.js';
import { isGroupAdmin, isMember } from '../../utils/groupPermissions.js';

export const registerGroupHandlers = (io, socket) => {
  socket.on('group:member-added', ({ conversationId, memberId }) => {
    // Notify the new member to join the conversation room
    io.to(`user:${memberId}`).emit('group:joined', { conversationId });

    // Notify all members about the new member
    io.to(`conversation:${conversationId}`).emit('group:member-update', {
      conversationId,
      action: 'added',
      memberId,
    });
  });

  socket.on('group:member-removed', ({ conversationId, memberId }) => {
    // Notify removed member
    io.to(`user:${memberId}`).emit('group:removed', { conversationId });

    // Notify all members
    io.to(`conversation:${conversationId}`).emit('group:member-update', {
      conversationId,
      action: 'removed',
      memberId,
    });
  });

  socket.on('group:info-updated', ({ conversationId, updates }) => {
    io.to(`conversation:${conversationId}`).emit('group:info-changed', {
      conversationId,
      updates,
    });
  });

  socket.on('group:role-changed', ({ conversationId, memberId, role }) => {
    io.to(`conversation:${conversationId}`).emit('group:role-update', {
      conversationId,
      memberId,
      role,
    });
  });
};
