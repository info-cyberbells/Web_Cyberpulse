export const registerGroupAdminHandlers = (io, socket) => {
  socket.on('group:ban', ({ conversationId, userId }) => {
    io.to(`user:${userId}`).emit('group:banned', { conversationId });
    io.to(`conversation:${conversationId}`).emit('group:member-update', {
      conversationId,
      action: 'banned',
      memberId: userId,
    });
  });

  socket.on('group:unban', ({ conversationId, userId }) => {
    io.to(`user:${userId}`).emit('group:unbanned', { conversationId });
  });

  socket.on('group:join-request', ({ conversationId, requestData }) => {
    io.to(`conversation:${conversationId}`).emit('group:new-join-request', {
      conversationId,
      requestData,
    });
  });
};
