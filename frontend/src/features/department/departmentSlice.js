import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  getAllDepartments, 
  addDepartment, 
  updateDepartment, 
  deleteDepartment 
} from "../../services/services";

export const addNewDepartment = createAsyncThunk(
  "departments/addNewDepartment",
  async (departmentData, { rejectWithValue }) => {
    try {
      const response = await addDepartment(departmentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const fetchAllDepartments = createAsyncThunk(
  "departments/fetchAllDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllDepartments();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editDepartment = createAsyncThunk(
  "departments/editDepartment",
  async ({ departmentId, departmentData }, { rejectWithValue }) => {
    try {
      const response = await updateDepartment(departmentId, departmentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeDepartment = createAsyncThunk(
  "departments/removeDepartment",
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await deleteDepartment(departmentId);
      return { ...response, departmentId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial State
const initialState = {
  departments: [],
  departmentsList: [],
  positionsMap: {},
  loading: false,
  error: null,
  successMessage: null,
};
// Slice
const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Departments
      .addCase(fetchAllDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDepartments.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload.success && Array.isArray(action.payload.departments)) {
          const departmentsData = action.payload.departments;
          state.departments = departmentsData;
          
          // Extract unique department names
          const uniqueDepartments = [...new Set(departmentsData.map((dept) => dept.department))];
          state.departmentsList = uniqueDepartments;
          
          // Create a map of department to positions
          const positionsByDepartment = {};
          departmentsData.forEach((dept) => {
            if (!positionsByDepartment[dept.department]) {
              positionsByDepartment[dept.department] = [];
            }
            positionsByDepartment[dept.department].push(dept.position);
          });
          state.positionsMap = positionsByDepartment;
        } else {
          state.departments = [];
          state.departmentsList = [];
          state.positionsMap = {};
        }
      })
      .addCase(fetchAllDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.departments = [];
        state.departmentsList = [];
        state.positionsMap = {};
      })
      
      // Add Department
      .addCase(addNewDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Department added successfully";
      })
      .addCase(addNewDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Edit Department
      .addCase(editDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Department updated successfully";
      })
      .addCase(editDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Department
      .addCase(removeDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Department deleted successfully";
      })
      .addCase(removeDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage  } = departmentSlice.actions;
export default departmentSlice.reducer;