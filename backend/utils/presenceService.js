// In-memory presence tracking (upgrade to Redis for multi-server)
const onlineUsersMap = new Map(); // userId -> { socketIds: Set, lastSeen: Date }

export const setOnline = (userId, socketId) => {
  if (!onlineUsersMap.has(userId)) {
    onlineUsersMap.set(userId, { socketIds: new Set(), lastSeen: new Date() });
  }
  onlineUsersMap.get(userId).socketIds.add(socketId);
};

export const setOffline = (userId, socketId) => {
  const user = onlineUsersMap.get(userId);
  if (user) {
    user.socketIds.delete(socketId);
    if (user.socketIds.size === 0) {
      user.lastSeen = new Date();
      onlineUsersMap.delete(userId);
      return true; // fully offline
    }
  }
  return false; // still online on other tabs
};

export const isOnline = (userId) => {
  const user = onlineUsersMap.get(userId);
  return user && user.socketIds.size > 0;
};

export const getOnlineUsersList = () => {
  const users = [];
  onlineUsersMap.forEach((data, userId) => {
    if (data.socketIds.size > 0) users.push(userId);
  });
  return users;
};

export const getLastSeen = (userId) => {
  const user = onlineUsersMap.get(userId);
  return user?.lastSeen || null;
};
