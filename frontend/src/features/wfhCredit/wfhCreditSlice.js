import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { evaluateWfhCredit, getAllWfhCredits, getMyWfhCredits, getEmployeeWfhCredits } from '../../services/services';

// Evaluate WFH credits for an employee
export const submitWfhEvaluation = createAsyncThunk(
  'wfhCredit/submitWfhEvaluation',
  async (creditData, { rejectWithValue }) => {
    try {
      const response = await evaluateWfhCredit(creditData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch all WFH credits (Manager/HR view)
export const fetchAllWfhCredits = createAsyncThunk(
  'wfhCredit/fetchAllWfhCredits',
  async ({ month, year } = {}, { rejectWithValue }) => {
    try {
      const response = await getAllWfhCredits(month, year);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch my own WFH credits (Employee view)
export const fetchMyWfhCredits = createAsyncThunk(
  'wfhCredit/fetchMyWfhCredits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyWfhCredits();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch WFH credits for a specific employee
export const fetchEmployeeWfhCredits = createAsyncThunk(
  'wfhCredit/fetchEmployeeWfhCredits',
  async ({ employeeId, month, year }, { rejectWithValue }) => {
    try {
      const response = await getEmployeeWfhCredits(employeeId, month, year);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  credits: [],
  myCredits: [],
  employeeCredits: [],
  loading: false,
  error: null,
  successMessage: null,
};

const wfhCreditSlice = createSlice({
  name: 'wfhCredit',
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Submit evaluation
    builder
      .addCase(submitWfhEvaluation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitWfhEvaluation.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'WFH credits evaluated successfully';
      })
      .addCase(submitWfhEvaluation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch all credits
    builder
      .addCase(fetchAllWfhCredits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllWfhCredits.fulfilled, (state, action) => {
        state.loading = false;
        state.credits = action.payload.data;
      })
      .addCase(fetchAllWfhCredits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch my credits
    builder
      .addCase(fetchMyWfhCredits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyWfhCredits.fulfilled, (state, action) => {
        state.loading = false;
        state.myCredits = action.payload.data;
      })
      .addCase(fetchMyWfhCredits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch employee credits
    builder
      .addCase(fetchEmployeeWfhCredits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeWfhCredits.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeCredits = action.payload.data;
      })
      .addCase(fetchEmployeeWfhCredits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSuccessMessage, clearError } = wfhCreditSlice.actions;

export default wfhCreditSlice.reducer;
