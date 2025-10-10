import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getStatusList } from '../../services/services'; // Import the service

// Async thunk to fetch the status list from the API
export const fetchStatusList = createAsyncThunk(
  'status/fetchStatusList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getStatusList();
      console.log("response",response)
      return response; // Return the data if successful
      
    } catch (error) {
      return rejectWithValue(error.response.data); // Handle any errors
    }
  }
);

// Initial state
const initialState = {
  statusList: [],
  loading: false,
  error: null,
};

// Redux slice for managing status
const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatusList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatusList.fulfilled, (state, action) => {
        state.loading = false;
        state.statusList = action.payload.data; // Store the fetched status list
      })
      .addCase(fetchStatusList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Handle the error
      });
  },
});

// Export the reducer to add it to the store
export default statusSlice.reducer;

