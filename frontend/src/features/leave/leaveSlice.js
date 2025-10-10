import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addLeave, getLeaveList, editLeave, deleteLeave, getLeaveById } from '../../services/services';

// Async thunk to add a new leave
export const addNewLeave = createAsyncThunk(
  'leaves/addNewLeave',
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await addLeave(leaveData);
      return response;
     
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const fetchLeavesByEmployeeId = createAsyncThunk(
  'leaves/fetchLeavesByEmployeeId',
  async (_, { rejectWithValue }) => {
    try {
      // Get employee ID from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      const employeeId = userData?.employee?.id;

      if (!employeeId) {
        throw new Error('Employee ID not found');
      }

      const response = await getLeaveById(employeeId);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          success: false,
          error: "No leave requests found for this employee",
          leaveList: [],
          employee: error.response.data.employee || null,
        };
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// Async thunk to fetch the leave list
export const fetchLeaveList = createAsyncThunk(
  'leaves/fetchLeaveList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLeaveList();
      console.log(response.data)
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to delete an existing leave
export const deleteExistingLeave = createAsyncThunk(
  'leaves/deleteExistingLeave',
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteLeave(id);
      return { id, response }; // Return both id and response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// Get Leave By Employee ID Service

// Async thunk to edit an existing leave
export const editExistingLeave = createAsyncThunk(
  'leaves/editExistingLeave',
  async ({ id, leaveData }, { rejectWithValue }) => {
    try {
      const response = await editLeave(id, leaveData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state for leaves
const initialState = {
  leaveList: [],
  loading: false,
  error: null,
  successMessage: null,
  selectedLeave: null,
};

const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setSelectedLeave: (state, action) => {
      state.selectedLeave = action.payload;
    },
    clearSelectedLeave: (state) => {
      state.selectedLeave = null;
    },
  },
  extraReducers: (builder) => {
    // Handle add leave lifecycle
    builder
      .addCase(addNewLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Leave request added successfully';
        if (!Array.isArray(state.leaveList)) {
          state.leaveList = [];
        }
        state.leaveList.push(action.payload.data);
      })
      .addCase(addNewLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle fetch leave list lifecycle
    builder
      .addCase(fetchLeaveList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveList.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveList = action.payload.data;
      })
      .addCase(fetchLeaveList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle delete leave lifecycle
    builder
      .addCase(deleteExistingLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Leave request deleted successfully';
        // Update the state using the correct _id field
        state.leaveList = state.leaveList.filter(
          (leave) => leave._id !== action.payload.id
        );
      })
      .addCase(deleteExistingLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle edit leave lifecycle
    builder
      .addCase(editExistingLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editExistingLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Leave request updated successfully';
        const index = state.leaveList.findIndex(
          (leave) => leave.id === action.payload.data.id
        );
        if (index !== -1) {
          state.leaveList[index] = action.payload.data;
        }
      })
      .addCase(editExistingLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // Handle fetch leaves by employee ID
    builder
      .addCase(fetchLeavesByEmployeeId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeavesByEmployeeId.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveList = Array.isArray(action.payload.data) ? action.payload.data : [];
      })
      .addCase(fetchLeavesByEmployeeId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});

// Export the actions
export const { clearSuccessMessage, setSelectedLeave, clearSelectedLeave } = leaveSlice.actions;

// Export the reducer
export default leaveSlice.reducer;