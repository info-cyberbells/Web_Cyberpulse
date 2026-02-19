export const CHAT_CONSTANTS = {
  MESSAGE_MAX_LENGTH: 5000,
  EDIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  DELETE_FOR_EVERYONE_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  MESSAGES_PER_PAGE: 50,
  CONVERSATIONS_PER_PAGE: 20,
  MAX_GROUP_MEMBERS: 256,
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    DOCUMENT: 'document',
    VOICE: 'voice',
    SYSTEM: 'system',
  },
  MESSAGE_STATUS: {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    SEEN: 'seen',
  },
  CONVERSATION_TYPES: {
    DIRECT: 'direct',
    GROUP: 'group',
  },
};
