import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addEmployee,
  getEmployeeList,
  editEmployee,
  changePasswordService,
  deleteEmployee,
  updateEmployeeStatus,
} from "../../services/services";

// Initial state with new attendance and tasks
const initialState = {
  employeeList: [],
  loading: false,
  error: null,
  successMessage: null,
  attendance: {}, // Format: { employeeId: [attendance_records] }
  tasks: {}, // Format: { employeeId: [task_records] }
};

// Existing async thunks
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

export const changePassword = createAsyncThunk(
  "employees/changePassword",
  async ({ id, passwordData }, { rejectWithValue }) => {
    try {
      // console.log("id", id, "passwordData", passwordData)
      const response = await changePasswordService(id, passwordData);
      console.log("response", response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const editExistingEmployee = createAsyncThunk(
  "employees/editExistingEmployee",
  async ({ id, employeeData }, { rejectWithValue }) => {
    try {
      const response = await editEmployee(id, employeeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

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

// New async thunks for attendance and tasks
export const fetchEmployeeAttendance = createAsyncThunk(
  "employees/fetchAttendance",
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/attendance`); // Replace with your API endpoint
      const data = await response.json();
      return { employeeId, attendance: data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//update employee Status
export const updateEmployeeStatusAsync = createAsyncThunk(
  "employees/updateStatus",
  async ({ employeeId, statusData }, { rejectWithValue }) => {
    try {
      const response = await updateEmployeeStatus(employeeId, statusData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEmployeeTasks = createAsyncThunk(
  "employees/fetchTasks",
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/tasks`); // Replace with your API endpoint
      const data = await response.json();
      return { employeeId, tasks: data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setAttendanceData: (state, action) => {
      const { employeeId, attendance } = action.payload;
      state.attendance[employeeId] = attendance;
    },
    setTasksData: (state, action) => {
      const { employeeId, tasks } = action.payload;
      state.tasks[employeeId] = tasks;
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing cases
      .addCase(addNewEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Employee added successfully";
        state.employeeList.push(action.payload.data);
      })
      .addCase(addNewEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEmployeeList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeList.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeList = action.payload.data;
      })
      .addCase(fetchEmployeeList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editExistingEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editExistingEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload.message || "Employee updated successfully";
        if (action.payload.employee) {
          const index = state.employeeList.findIndex(
            (emp) => emp.id === action.payload.employee.id
          );
          if (index !== -1) {
            state.employeeList[index] = action.payload.employee;
          }
        }
      })

      // update employee status
      .addCase(updateEmployeeStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployeeStatusAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Employee status updated successfully";
      })
      .addCase(updateEmployeeStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(editExistingEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Employee status has been Deactivated";
        state.employeeList = state.employeeList.filter(
          (emp) => emp.id !== action.meta.arg
        );
      })
      .addCase(removeEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // New cases for attendance and tasks
      .addCase(fetchEmployeeAttendance.fulfilled, (state, action) => {
        const { employeeId, attendance } = action.payload;
        state.attendance[employeeId] = attendance;
      })
      .addCase(fetchEmployeeAttendance.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchEmployeeTasks.fulfilled, (state, action) => {
        const { employeeId, tasks } = action.payload;
        state.tasks[employeeId] = tasks;
      })
      .addCase(fetchEmployeeTasks.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSuccessMessage, setAttendanceData, setTasksData } =
  employeeSlice.actions;
export default employeeSlice.reducer;
