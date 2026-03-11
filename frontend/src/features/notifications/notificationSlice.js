import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationSettings,
  updateNotificationSettings,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
} from "../../services/services";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ page = 1, limit = 50 } = {}, { rejectWithValue }) => {
    try {
      return await getNotifications(page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      return await getUnreadNotificationCount();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markRead = createAsyncThunk(
  "notifications/markRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      return await markNotificationAsRead(notificationId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markAllRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      return await markAllNotificationsAsRead();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSettings = createAsyncThunk(
  "notifications/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      return await getNotificationSettings();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const saveSettings = createAsyncThunk(
  "notifications/saveSettings",
  async (settings, { rejectWithValue }) => {
    try {
      return await updateNotificationSettings(settings);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUserPreferences = createAsyncThunk(
  "notifications/fetchUserPreferences",
  async (_, { rejectWithValue }) => {
    try {
      return await getUserNotificationPreferences();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const saveUserPreferences = createAsyncThunk(
  "notifications/saveUserPreferences",
  async (data, { rejectWithValue }) => {
    try {
      return await updateUserNotificationPreferences(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
  settings: null,
  userPreferences: null,
  preferencesLoading: false,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addRealtimeNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
      state.pagination.total += 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const id = action.payload.data._id;
        const notif = state.notifications.find((n) => n._id === id);
        if (notif && !notif.isRead) {
          notif.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload.data;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.settings = action.payload.data;
      })
      .addCase(fetchUserPreferences.pending, (state) => {
        state.preferencesLoading = true;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.userPreferences = action.payload.data;
      })
      .addCase(fetchUserPreferences.rejected, (state) => {
        state.preferencesLoading = false;
      })
      .addCase(saveUserPreferences.fulfilled, (state, action) => {
        state.userPreferences = action.payload.data;
      });
  },
});

export const { addRealtimeNotification, clearError } =
  notificationSlice.actions;
export default notificationSlice.reducer;
