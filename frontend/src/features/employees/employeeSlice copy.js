import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addEmployee,
  getEmployeeList,
  editEmployee,
  deleteEmployee,
} from "../../services/services";

// Async thunk to add an employee
export const addNewEmployee = createAsyncThunk(
  "employees/addNewEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await addEmployee(employeeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to fetch the employee list
export const fetchEmployeeList = createAsyncThunk(
  "employees/fetchEmployeeList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getEmployeeList();
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to edit an employee
export const editExistingEmployee = createAsyncThunk(
  "employees/editExistingEmployee",
  async ({ id, employeeData }, { rejectWithValue }) => {
    console.log({ id, employeeData });
    try {
      const response = await editEmployee(id, employeeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to delete an employee
export const removeEmployee = createAsyncThunk(
  "employees/removeEmployee",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteEmployee(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state for employees
const initialState = {
  employeeList: [],
  loading: false,
  error: null,
  successMessage: null,
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Handle add employee lifecycle
    builder
      .addCase(addNewEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Employee added successfully";
        state.employeeList.push(action.payload.data); // Update the state with the new employee
      })
      .addCase(addNewEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle fetch employee list lifecycle
    builder
      .addCase(fetchEmployeeList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeList.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeList = action.payload.data; // Update state with employee list
      })
      .addCase(fetchEmployeeList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    // Handle edit employee lifecycle
    builder
      .addCase(editExistingEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editExistingEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Employee updated successfully";
        const index = state.employeeList.findIndex(
          (emp) => emp.id === action.payload.data.id
        );
        if (index !== -1) {
          state.employeeList[index] = action.payload.data; // Update the employee in the list
        }
      })
      .addCase(editExistingEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle delete employee lifecycle
    builder
      .addCase(removeEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Employee deleted successfully";
        state.employeeList = state.employeeList.filter(
          (emp) => emp.id !== action.meta.arg
        );
      })
      .addCase(removeEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export the actions
export const { clearSuccessMessage } = employeeSlice.actions;

// Export the reducer
export default employeeSlice.reducer;
