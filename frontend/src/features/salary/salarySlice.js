import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAllEmployees, calculateSalary } from "../../services/services";

// Async Thunks
export const fetchEmployeesForSalary = createAsyncThunk(
  "salary/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAllEmployees();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const calculateEmployeeSalary = createAsyncThunk(
  "salary/calculateSalary",
  async (salaryData, { rejectWithValue }) => {
    try {
      const response = await calculateSalary(salaryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial State
const initialState = {
  employees: [],
  calculationResults: null,
  loading: false,
  calculating: false,
  error: null,
};

// Slice
const salarySlice = createSlice({
  name: "salary",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCalculationResults: (state) => {
      state.calculationResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployeesForSalary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesForSalary.fulfilled, (state, action) => {
        state.loading = false;
        const employeesList = (action.payload.data || []).filter(emp => emp.status !== "0");
        state.employees = employeesList;
      })
      .addCase(fetchEmployeesForSalary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.employees = [];
      })
      
      // Calculate Salary
      .addCase(calculateEmployeeSalary.pending, (state) => {
        state.calculating = true;
        state.error = null;
        state.calculationResults = null;
      })
      .addCase(calculateEmployeeSalary.fulfilled, (state, action) => {
        state.calculating = false;
        state.calculationResults = action.payload;
      })
      .addCase(calculateEmployeeSalary.rejected, (state, action) => {
        state.calculating = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCalculationResults } = salarySlice.actions;
export default salarySlice.reducer;