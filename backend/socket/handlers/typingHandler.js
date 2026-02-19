export const registerTypingHandlers = (io, socket) => {
  socket.on('typing:start', ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(`conversation:${conversationId}`).emit('typing:started', {
      userId: socket.userId,
      conversationId,
    });
  });

  socket.on('typing:stop', ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(`conversation:${conversationId}`).emit('typing:stopped', {
      userId: socket.userId,
      conversationId,
    });
  });
};
