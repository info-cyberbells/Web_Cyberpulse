import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register } from '../../services/services';

export const RESET_APP_STATE = 'RESET_APP_STATE';


//login user/admin
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await login(credentials);
      console.log("response", response)
      const hi = localStorage.setItem('lastPath', window.location.pathname);
      console.log("hi", hi)
      return response;
    } catch (error) {
      console.log("Error caught in loginUser:", error);
      console.log("Error response data:", error.response?.data.message);
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

// Register user/admin
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (registrationData, { rejectWithValue }) => {
    try {
      const response = await register(registrationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);


const initialState = {
  user: null,
  loading: false,
  error: null,
  message: null,
  isAuthenticated: false,
  lastPath: null,
  isLoading: true,
  registrationStep: 1,
  organizationId: null,
  registrationLoading: false,
  registrationError: null,
  adminEmail: null,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      return {
        ...initialState,
        isLoading: false
      };
    },

    // Add this new reducer
    resetAppState: (state) => {
      return initialState;
    },

    setUserFromStorage: (state, action) => {
      if (action.payload && action.payload.employee) {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.lastPath = localStorage.getItem('lastPath');
      } else {
        return { ...initialState, isLoading: false };
      }
    },
    setLastPath: (state, action) => {
      state.lastPath = action.payload;
      localStorage.setItem('lastPath', action.payload);
    },
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
    setAuthLoaded: (state) => {
      state.isLoading = false;
    },
    setRegistrationStep: (state, action) => {
      state.registrationStep = action.payload;
    },
    setOrganizationId: (state, action) => {
      state.organizationId = action.payload;
    },
    clearRegistrationState: (state) => {
      state.registrationStep = 1;
      state.organizationId = null;
      state.registrationError = null;
    },
    setAdminEmail: (state, action) => {
      state.adminEmail = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.message = action.payload?.message;
        state.error = null;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log("Rejected payload:", action.payload?.message);
        state.loading = false;
        state.error = action.payload?.message;
        state.isAuthenticated = false;
        state.message = null;
      })
      .addCase(registerUser.pending, (state) => {
        state.registrationLoading = true;
        state.registrationError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registrationLoading = false;
        console.log('Redux: registerUser fulfilled, payload:', action.payload);
        if (action.payload.orgId) {
          state.organizationId = action.payload.orgId;
          state.registrationStep = 2;
          console.log('Redux: Setting registrationStep to 2');
        } else if (action.payload.success && action.payload.message === "OTP sent to email") {
          state.registrationStep = 3;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registrationLoading = false;
        state.registrationError = action.payload?.message;
      })
  },
});

export const {
  logoutUser,
  setUserFromStorage,
  setLastPath,
  clearMessage,
  setAuthLoaded,
  resetAppState,
  setRegistrationStep,
  setOrganizationId,
  clearRegistrationState,
  setAdminEmail
} = authSlice.actions;
export default authSlice.reducer;
