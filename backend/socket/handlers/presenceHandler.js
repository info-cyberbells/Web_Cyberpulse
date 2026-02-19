const onlineUsers = new Map(); // userId -> Set of socketIds

export const registerPresenceHandlers = (io, socket) => {
  const userId = socket.userId;

  // Track user online
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);

  // Broadcast online status
  socket.broadcast.emit('presence:changed', {
    userId,
    status: 'online',
  });

  // Send current online users to the connecting user
  const currentOnline = [];
  onlineUsers.forEach((sockets, uid) => {
    if (sockets.size > 0) currentOnline.push(uid);
  });
  socket.emit('presence:online-users', { users: currentOnline });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit('presence:changed', {
          userId,
          status: 'offline',
        });
      }
    }
  });
};

export const getOnlineUsers = () => {
  const users = [];
  onlineUsers.forEach((sockets, userId) => {
    if (sockets.size > 0) users.push(userId);
  });
  return users;
};
