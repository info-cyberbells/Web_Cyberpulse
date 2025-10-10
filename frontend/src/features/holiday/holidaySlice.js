
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  addHoliday, 
  getAllHolidays, 
  getHolidayDetails, 
  editHoliday, 
  deleteHoliday 
} from '../../services/services';

// Initial State
const initialState = {
  holidays: [],
  selectedHoliday: null,
  loading: false,
  error: null,
  success: false
};

// Async Thunks
export const fetchHolidays = createAsyncThunk(
  'holidays/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllHolidays();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch holidays');
    }
  }
);

export const createHoliday = createAsyncThunk(
  'holidays/create',
  async (holidayData, { rejectWithValue }) => {
    try {
      const response = await addHoliday(holidayData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create holiday');
    }
  }
);

export const getHoliday = createAsyncThunk(
  'holidays/getDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getHolidayDetails(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get holiday details');
    }
  }
);

export const updateHoliday = createAsyncThunk(
  'holidays/update',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const response = await editHoliday(id, eventData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update holiday');
    }
  }
);

export const removeHoliday = createAsyncThunk(
  'holidays/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteHoliday(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete holiday');
    }
  }
);

// Slice
const holidaySlice = createSlice({
  name: 'holiday',
  initialState,
  reducers: {
    resetState: (state) => {
      state.error = null;
      state.success = false;
      state.loading = false;
    },
    setSelectedHoliday: (state, action) => {
      state.selectedHoliday = action.payload;
    },
    clearSelectedHoliday: (state) => {
      state.selectedHoliday = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Holidays
      .addCase(fetchHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays = action.payload;
        state.error = null;
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Holiday
      .addCase(createHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHoliday.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays.push(action.payload.holiday);
        state.success = true;
        state.error = null;
      })
      .addCase(createHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })

      // Get Holiday Details
      .addCase(getHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHoliday.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedHoliday = action.payload;
        state.error = null;
      })
      .addCase(getHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Holiday
      .addCase(updateHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHoliday.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both _id and id cases
        const index = state.holidays.findIndex(
          holiday => holiday._id === action.payload._id || holiday.id === action.payload.id
        );
        if (index !== -1) {
           state.holidays[index] = action.payload; 
        }
        state.success = true;
        state.error = null;
      })
      .addCase(updateHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })

      // Delete Holiday
      .addCase(removeHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeHoliday.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays = state.holidays.filter(
          holiday => holiday._id !== action.payload && holiday.id !== action.payload
        );
        state.success = true;
        state.error = null;
      })
      .addCase(removeHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const { resetState, setSelectedHoliday, clearSelectedHoliday } = holidaySlice.actions;

// Selectors
// Fix the selector to properly access the holidays array
export const selectAllHolidays = (state) => state.holiday?.holidays || [];
export const selectSelectedHoliday = (state) => state.holiday?.selectedHoliday || null;
export const selectHolidayLoading = (state) => state.holiday?.loading || false;
export const selectHolidayError = (state) => state.holiday?.error || null;
export const selectHolidaySuccess = (state) => state.holiday?.success || false;

export default holidaySlice.reducer;