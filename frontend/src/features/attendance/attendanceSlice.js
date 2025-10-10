import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addAttendance,
  getAllAttendance,
  getAttendanceDetails,
  getAttendanceTasks,
  editAttendance,
  getAttendanceMonthlySummary,
  deleteAttendance,
  getAttendanceDetailAPI,
  getCurrentEmpAttendance,
  getPreviousDayAutoClockout,
  getMonthlyAttendance,
} from "../../services/services";

// Async Thunks
export const clockInAsync = createAsyncThunk(
  "attendance/clockIn",
  async (clockInData, { rejectWithValue }) => {
    try {
      const response = await addAttendance(
        // timestamp: new Date().toISOString(),
        // type: "CLOCK_IN",
        clockInData
      ); console.log("REsponse", response)
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to clock in");
    }
  }
);


export const fetchCurrentEmpAttendanceAsync = createAsyncThunk(
  "attendance/fetchCurrentEmpAttendance",
  async ({ date, isInitialFetch }, { rejectWithValue }) => {
    try {
      const response = await getCurrentEmpAttendance(date);
      console.log("Raw API Response:", response);
      const attendanceData = response.data || response;
      console.log("Processed attendance data:", attendanceData);
      return attendanceData;
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);


export const clockOutAsync = createAsyncThunk(
  "attendance/clockOut",
  async ({ id, clockOutData }, { rejectWithValue }) => {
    console.log("clockOutData", clockOutData);
    try {
      const response = await editAttendance(id, clockOutData,);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to clock out");
    }
  }
);

export const fetchAttendanceHistoryAsync = createAsyncThunk(
  "attendance/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllAttendance();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch attendance history"
      );
    }
  }
);

export const fetchAttendanceDetailAsync = createAsyncThunk(
  "attendance/fetchDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getAttendanceDetails(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch attendance detail"
      );
    }
  }
);

export const deleteAttendanceAsync = createAsyncThunk(
  "attendance/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAttendance(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete attendance record"
      );
    }
  }
);

export const updateAttendanceAsync = createAsyncThunk(
  "attendance/updateAttendance",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await editAttendance(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update attendance");
    }
  }
);

export const fetchAutoClockOutAsync = createAsyncThunk(
  "attendance/fetchAutoClockOut",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPreviousDayAutoClockout();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const fetchAttendanceTasksAsync = createAsyncThunk(
  "attendance/task",
  async ({ date, employeeId }, { rejectWithValue }) => {
    try {
      const response = await getAttendanceTasks(date, employeeId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch attendance tasks"
      );
    }
  }
);

//fetch monthly attendance async
export const fetchMonthlyAttendanceAsync = createAsyncThunk(
  "attendance/fetchMonthlyAttendance",
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const response = await getMonthlyAttendance(year, month);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAttendance = createAsyncThunk(
  "attendance/getAttendance",
  async ({ id, date }, { rejectWithValue }) => {
    console.log({ id, date });
    try {
      const response = await getAttendanceDetailAPI(id, date);
      console.log("getAttendance", response);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMonthlySummary = createAsyncThunk(
  "attendance/fetchMonthlySummary",
  async ({ employeeId, date }, { rejectWithValue }) => {
    try {
      const response = await getAttendanceMonthlySummary(employeeId, date);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// Initial State
const initialState = {
  currentDayAttendance: [],
  attendanceHistory: [],
  monthlyAttendanceData: [],
  autoClockOutEmployees: [],
  totalWorkingDays: 0,
  currentAttendance: null,
  selectedAttendance: null,
  monthlyLoading: false,
  loading: false,
  autoClockOutLoading: false,
  error: null,
  successMessage: null,
  monthlyError: null,
  stats: {
    totalHours: 0,
    averageHoursPerDay: 0,
    totalDays: 0,
  },
  monthlySummary: {
    totalAttendance: 0,
    totalLate: 0,
    totalLeave: 0,
    weekendsCount: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  },
  monthlySummaryLoading: false,
  monthlySummaryError: null,
};

// Slice
const attendanceSlice = createSlice({
  name: "attendances",
  initialState: {
    currentDayAttendance: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    updateStats: (state) => {
      const totalHours = state.attendanceHistory.reduce((acc, record) => {
        if (record.clockOutTime) {
          const duration =
            new Date(record.clockOutTime) - new Date(record.clockInTime);
          return acc + duration / (1000 * 60 * 60);
        }
        return acc;
      }, 0);

      state.stats = {
        totalHours: totalHours.toFixed(2),
        totalDays: state.attendanceHistory.length,
        averageHoursPerDay: (
          totalHours / state.attendanceHistory.length
        ).toFixed(2),
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlySummary.pending, (state) => {
        state.monthlySummaryLoading = true;
        state.monthlySummaryError = null;
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.monthlySummaryLoading = false;
        state.monthlySummary = action.payload;
      })
      .addCase(fetchMonthlySummary.rejected, (state, action) => {
        state.monthlySummaryLoading = false;
        state.monthlySummaryError = action.payload;
      })

      // Get attendance
      .addCase(getAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload?.attendance[0];
        state.success = true;
      })
      .addCase(getAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Add new cases for attendance tasks
      .addCase(fetchAttendanceTasksAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceTasksAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceTasks = action.payload;
      })
      .addCase(fetchAttendanceTasksAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateAttendanceAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendanceAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload;
        state.successMessage = "Attendance updated successfully";
      })
      .addCase(updateAttendanceAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //get monthly attendance
      .addCase(fetchMonthlyAttendanceAsync.pending, (state) => {
        state.monthlyLoading = true;
        state.monthlyError = null;
      })
      .addCase(fetchMonthlyAttendanceAsync.fulfilled, (state, action) => {
        state.monthlyLoading = false;
        state.monthlyAttendanceData = action.payload.employees || [];
        state.totalWorkingDays = action.payload.totalWorkingDays || 0;
      })
      .addCase(fetchMonthlyAttendanceAsync.rejected, (state, action) => {
        state.monthlyLoading = false;
        state.monthlyError = action.payload;
        state.monthlyAttendanceData = [];
        state.totalWorkingDays = 0;
      })

      // Clock In
      .addCase(clockInAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockInAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload;
        state.successMessage = "Successfully clocked in";
        state.attendanceHistory = action.payload.attendance;
      })
      .addCase(clockInAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clock Out
      .addCase(clockOutAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockOutAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload;
        state.successMessage = "Successfully clocked out";
        // const index = state.attendanceHistory.findIndex(
        //   (record) => record._id === action.payload.attendance._id
        // );
        // if (index !== -1) {
        //   state.attendanceHistory[index] = action.payload.attendance._id;
        // }
      })
      .addCase(clockOutAsync.rejected, (state, action) => {
        state.loading = false;
        state.currentAttendance = [];
        state.error = action.payload;
      })


      //autoclockout employees
      .addCase(fetchAutoClockOutAsync.pending, (state) => {
        state.autoClockOutLoading = true;
        state.error = null;
      })
      .addCase(fetchAutoClockOutAsync.fulfilled, (state, action) => {
        state.autoClockOutLoading = false;
        state.autoClockOutEmployees = action.payload;
      })
      .addCase(fetchAutoClockOutAsync.rejected, (state, action) => {
        state.autoClockOutEmployees = false;
        state.error = action.payload;
      })

      // Fetch History
      .addCase(fetchAttendanceHistoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceHistoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceHistory =
          action.payload.attendances.attendanceHistory.attendance;
      })
      .addCase(fetchAttendanceHistoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Detail
      .addCase(fetchAttendanceDetailAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceDetailAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAttendance = action.payload;
      })
      .addCase(fetchAttendanceDetailAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    //CurrentLogin
    builder
      .addCase(fetchCurrentEmpAttendanceAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentEmpAttendanceAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDayAttendance = action.payload || [];
      })
      .addCase(fetchCurrentEmpAttendanceAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentDayAttendance = []; // Clear the data on error
      })

      // Delete
      .addCase(deleteAttendanceAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttendanceAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceHistory = state.attendanceHistory.filter(
          (record) => record.id !== action.payload
        );
        state.successMessage = "Attendance record deleted successfully";
      })
      .addCase(deleteAttendanceAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, updateStats } =
  attendanceSlice.actions;

export default attendanceSlice.reducer;
