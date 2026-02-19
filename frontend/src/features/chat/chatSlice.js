import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await apiClient.get('/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchArchivedConversations = createAsyncThunk(
  'chat/fetchArchivedConversations',
  async (_, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await apiClient.get('/chat/conversations?archived=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch archived conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, before }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const params = before ? { before } : {};
      const res = await apiClient.get(`/chat/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return { conversationId, ...res.data, prepend: !!before };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const createDirectConversation = createAsyncThunk(
  'chat/createDirectConversation',
  async (participantId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await apiClient.post('/chat/conversations', { participantId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create conversation');
    }
  }
);

export const createGroupConversation = createAsyncThunk(
  'chat/createGroupConversation',
  async ({ groupName, participants, groupDescription }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await apiClient.post('/chat/groups', { groupName, participants, groupDescription }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create group');
    }
  }
);

export const sendMessageHTTP = createAsyncThunk(
  'chat/sendMessageHTTP',
  async ({ conversationId, content, type, replyTo, attachments }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await apiClient.post('/chat/messages', { conversationId, content, type, replyTo, attachments }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message');
    }
  }
);

export const uploadAttachment = createAsyncThunk(
  'chat/uploadAttachment',
  async (file, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/chat/attachments/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Upload failed');
    }
  }
);

export const searchMessages = createAsyncThunk(
  'chat/searchMessages',
  async ({ query, conversationId }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const params = { query };
      if (conversationId) params.conversationId = conversationId;
      const res = await apiClient.get('/chat/search', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchEmployeeList = createAsyncThunk(
  'chat/fetchEmployeeList',
  async (_, { rejectWithValue }) => {
    try {
      const orgId = JSON.parse(localStorage.getItem('user'))?.employee?.organizationId;
      const params = orgId ? { organizationId: orgId } : {};
      const res = await apiClient.get('/employee/fetchAll', { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const deleteConversationThunk = createAsyncThunk(
  'chat/deleteConversation',
  async ({ conversationId, deleteMessages = false }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      await apiClient.delete(`/chat/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { deleteMessages },
      });
      return conversationId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete conversation');
    }
  }
);

export const archiveConversationThunk = createAsyncThunk(
  'chat/archiveConversation',
  async (conversationId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await apiClient.post(`/chat/conversations/${conversationId}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { conversationId, archived: res.data.archived };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to archive conversation');
    }
  }
);

export const fetchConversationById = createAsyncThunk(
  'chat/fetchConversationById',
  async (conversationId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await apiClient.get(`/chat/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch conversation');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    archivedConversations: [],
    activeConversation: null,
    messages: {},          // { conversationId: [messages] }
    pagination: {},        // { conversationId: { hasMore, nextCursor } }
    onlineUsers: [],
    typingUsers: {},       // { conversationId: [userIds] }
    unreadCounts: {},      // { conversationId: count }
    connectionStatus: 'disconnected', // connected, disconnected, reconnecting
    searchResults: [],
    employees: [],
    replyTo: null,
    editingMessage: null,
    loading: false,
    messagesLoading: false,
    error: null,
  },
  reducers: {
    setConnectionStatus(state, action) {
      state.connectionStatus = action.payload;
    },
    setActiveConversation(state, action) {
      state.activeConversation = action.payload;
      if (action.payload) {
        state.unreadCounts[action.payload._id] = 0;
      }
    },
    addMessage(state, action) {
      const msg = action.payload;
      const convId = msg.conversationId;
      if (!state.messages[convId]) state.messages[convId] = [];
      const exists = state.messages[convId].some(m => m._id === msg._id);
      if (!exists) {
        state.messages[convId].push(msg);
      }
    },
    updateConversationLastMessage(state, action) {
      const { conversationId, lastMessage } = action.payload;
      const conv = state.conversations.find(c => c._id === conversationId);
      if (conv) {
        conv.lastMessage = lastMessage;
        // Move to top
        state.conversations = [
          conv,
          ...state.conversations.filter(c => c._id !== conversationId),
        ];
      }
    },
    incrementUnread(state, action) {
      const convId = action.payload;
      if (state.activeConversation?._id !== convId) {
        state.unreadCounts[convId] = (state.unreadCounts[convId] || 0) + 1;
      }
    },
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
    addOnlineUser(state, action) {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser(state, action) {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
    setTypingUser(state, action) {
      const { conversationId, userId } = action.payload;
      if (!state.typingUsers[conversationId]) state.typingUsers[conversationId] = [];
      if (!state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      }
    },
    removeTypingUser(state, action) {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
      }
    },
    updateMessageInStore(state, action) {
      const { messageId, updates, conversationId } = action.payload;
      const msgs = state.messages[conversationId];
      if (msgs) {
        const idx = msgs.findIndex(m => m._id === messageId);
        if (idx !== -1) {
          msgs[idx] = { ...msgs[idx], ...updates };
        }
      }
    },
    removeMessageFromStore(state, action) {
      const { messageId, conversationId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].map(m =>
          m._id === messageId ? { ...m, deletedForEveryone: true, content: 'This message was deleted' } : m
        );
      }
    },
    deleteMessageForMe(state, action) {
      const { messageId, conversationId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].filter(m => m._id !== messageId);
      }
    },
    markMessagesAsSeen(state, action) {
      const { conversationId, userId } = action.payload;
      const msgs = state.messages[conversationId];
      if (msgs) {
        msgs.forEach(m => {
          const senderId = typeof m.senderId === 'object' ? m.senderId._id : m.senderId;
          if (senderId === userId) return; // don't mark own messages
          // For messages we sent, mark them as seen by the reader
          const currentUserId = JSON.parse(localStorage.getItem('user'))?.employee?.id;
          if (senderId === currentUserId) {
            m.status = 'seen';
          }
        });
      }
    },
    removeConversation(state, action) {
      const convId = action.payload;
      state.conversations = state.conversations.filter(c => c._id !== convId);
      if (state.activeConversation?._id === convId) {
        state.activeConversation = null;
      }
      delete state.messages[convId];
      delete state.unreadCounts[convId];
    },
    setReplyTo(state, action) {
      state.replyTo = action.payload;
    },
    setEditingMessage(state, action) {
      state.editingMessage = action.payload;
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },
    addConversation(state, action) {
      const conv = action.payload;
      if (!state.conversations.find(c => c._id === conv._id)) {
        state.conversations.unshift(conv);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => { state.loading = true; })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.data || [];
        // Set unread counts from metadata
        (action.payload.data || []).forEach(conv => {
          const userId = JSON.parse(localStorage.getItem('user'))?.employee?.id;
          const meta = conv.metadata?.find(m => m.userId === userId);
          if (meta) state.unreadCounts[conv._id] = meta.unreadCount;
        });
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => { state.messagesLoading = true; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        const { conversationId, data, pagination, prepend } = action.payload;
        if (prepend && state.messages[conversationId]) {
          state.messages[conversationId] = [...(data || []), ...state.messages[conversationId]];
        } else {
          state.messages[conversationId] = data || [];
        }
        state.pagination[conversationId] = pagination;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      })
      .addCase(createDirectConversation.fulfilled, (state, action) => {
        const conv = action.payload.data;
        if (!state.conversations.find(c => c._id === conv._id)) {
          state.conversations.unshift(conv);
        }
        state.activeConversation = conv;
      })
      .addCase(createGroupConversation.fulfilled, (state, action) => {
        const conv = action.payload.data;
        state.conversations.unshift(conv);
        state.activeConversation = conv;
      })
      .addCase(searchMessages.fulfilled, (state, action) => {
        state.searchResults = action.payload.data || [];
      })
      .addCase(fetchEmployeeList.fulfilled, (state, action) => {
        state.employees = action.payload.employees || action.payload.data || [];
      })
      .addCase(deleteConversationThunk.fulfilled, (state, action) => {
        const convId = action.payload;
        state.conversations = state.conversations.filter(c => c._id !== convId);
        if (state.activeConversation?._id === convId) {
          state.activeConversation = null;
        }
        delete state.messages[convId];
        delete state.unreadCounts[convId];
      })
      .addCase(fetchConversationById.fulfilled, (state, action) => {
        const conv = action.payload.data;
        if (conv) {
          const idx = state.conversations.findIndex(c => c._id === conv._id);
          if (idx !== -1) {
            state.conversations[idx] = conv;
          }
          if (state.activeConversation?._id === conv._id) {
            state.activeConversation = conv;
          }
        }
      })
      .addCase(archiveConversationThunk.fulfilled, (state, action) => {
        const { conversationId, archived } = action.payload;
        if (archived) {
          // Move from conversations to archivedConversations
          const conv = state.conversations.find(c => c._id === conversationId);
          state.conversations = state.conversations.filter(c => c._id !== conversationId);
          if (conv) state.archivedConversations.unshift(conv);
          if (state.activeConversation?._id === conversationId) {
            state.activeConversation = null;
          }
        } else {
          // Unarchive: move from archivedConversations to conversations
          const conv = state.archivedConversations.find(c => c._id === conversationId);
          state.archivedConversations = state.archivedConversations.filter(c => c._id !== conversationId);
          if (conv) state.conversations.unshift(conv);
        }
      })
      .addCase(fetchArchivedConversations.fulfilled, (state, action) => {
        state.archivedConversations = action.payload.data || [];
      });
  },
});

export const {
  setConnectionStatus,
  setActiveConversation,
  addMessage,
  updateConversationLastMessage,
  incrementUnread,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setTypingUser,
  removeTypingUser,
  updateMessageInStore,
  removeMessageFromStore,
  deleteMessageForMe,
  markMessagesAsSeen,
  removeConversation,
  setReplyTo,
  setEditingMessage,
  clearSearchResults,
  addConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
