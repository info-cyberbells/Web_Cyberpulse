import Conversation from '../model/ConversationModel.js';

// In-memory unread count cache (upgrade to Redis in production)
const unreadCache = new Map();

const getCacheKey = (userId, conversationId) => `${userId}:${conversationId}`;

export const getUnreadCount = async (userId, conversationId) => {
  const key = getCacheKey(userId, conversationId);
  if (unreadCache.has(key)) {
    return unreadCache.get(key);
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return 0;

  const meta = conversation.metadata.find(m => m.userId.toString() === userId.toString());
  const count = meta ? meta.unreadCount : 0;
  unreadCache.set(key, count);
  return count;
};

export const incrementUnread = (userId, conversationId) => {
  const key = getCacheKey(userId, conversationId);
  const current = unreadCache.get(key) || 0;
  unreadCache.set(key, current + 1);
};

export const resetUnread = (userId, conversationId) => {
  const key = getCacheKey(userId, conversationId);
  unreadCache.set(key, 0);
};

export const syncUnreadToDB = async () => {
  try {
    for (const [key, count] of unreadCache) {
      const [userId, conversationId] = key.split(':');
      await Conversation.updateOne(
        { _id: conversationId, 'metadata.userId': userId },
        { $set: { 'metadata.$.unreadCount': count } }
      );
    }
  } catch (error) {
    console.error('Unread count sync error:', error);
  }
};
