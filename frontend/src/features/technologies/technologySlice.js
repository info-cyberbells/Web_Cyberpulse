import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addTechnology, getTechnologyList,  deleteTechnology,
  editTechnology } from '../../services/services';

// Async thunk to add a new technology
export const addNewTechnology = createAsyncThunk(
  'technologies/addNewTechnology',
  async (technologyData, { rejectWithValue }) => {
    try {
      const response = await addTechnology(technologyData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to fetch the technology list
export const fetchTechnologyList = createAsyncThunk(
  'technologies/fetchTechnologyList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTechnologyList();
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
// Async thunk to delete an existing technology
export const deleteExistingTechnology = createAsyncThunk(
  'technologies/deleteExistingTechnology',
  async (id, { rejectWithValue }) => {
    try {
       await deleteTechnology(id);
      return id; // Return the id of the deleted technology
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to edit an existing technology
export const editExistingTechnology = createAsyncThunk(
  'technologies/editExistingTechnology',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await editTechnology(id, updatedData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state for technologies
const initialState = {
  technologyList: [],
  loading: false,
  error: null,
  successMessage: null,
};

const technologySlice = createSlice({
  name: 'technologies',
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Handle add technology lifecycle
    builder
      .addCase(addNewTechnology.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewTechnology.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Technology added successfully';
        state.technologyList.push(action.payload.data); // Update the state with the new technology
      })
      .addCase(addNewTechnology.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle fetch technology list lifecycle
    builder
      .addCase(fetchTechnologyList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnologyList.fulfilled, (state, action) => {
        state.loading = false;
        state.technologyList = action.payload.data; // Update state with technology list
      })
      .addCase(fetchTechnologyList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      // Handle delete technology lifecycle
    builder
    .addCase(deleteExistingTechnology.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteExistingTechnology.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = 'Technology deleted successfully';
      // Remove the deleted technology from the list
      state.technologyList = state.technologyList.filter(
        (technology) => technology.id !== action.payload
      );
    })
    .addCase(deleteExistingTechnology.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

  // Handle edit technology lifecycle
  builder
    .addCase(editExistingTechnology.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(editExistingTechnology.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = 'Technology updated successfully';
      // Find the index of the updated technology
      const index = state.technologyList.findIndex(
        (technology) => technology.id === action.payload.data.id
      );
      if (index !== -1) {
        // Update the technology in the list
        state.technologyList[index] = action.payload.data;
      }
    })
    .addCase(editExistingTechnology.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

// Export the actions
export const { clearSuccessMessage } = technologySlice.actions;

// Export the reducer
export default technologySlice.reducer;
