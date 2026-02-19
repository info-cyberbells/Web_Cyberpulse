import Conversation from '../model/ConversationModel.js';

export const isGroupAdmin = (conversation, userId) => {
  return conversation.admins.some(admin => admin.toString() === userId.toString());
};

export const isMember = (conversation, userId) => {
  return conversation.participants.some(p => p.toString() === userId.toString());
};

export const canSendMessage = (conversation, userId) => {
  return isMember(conversation, userId);
};

export const getGroupConversation = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    type: 'group',
    participants: userId,
  });
  return conversation;
};
