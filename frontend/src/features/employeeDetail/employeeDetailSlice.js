import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { format, startOfMonth } from 'date-fns';
import { toast } from 'react-toastify';
import { getEmployeeDetails, updateEmployeeStatus } from '../../services/services'

// Clean async thunk using the service
export const fetchEmployeeDetails = createAsyncThunk(
  'employeeDetails/fetchEmployeeDetails',
  async ({ monthDate, employeeId }, { rejectWithValue }) => {
    try {
      const response = await getEmployeeDetails(monthDate, employeeId);

      // Validate response data
      if (!response || typeof response !== 'object') {
        throw new Error("Invalid response format from API");
      }

      // Normalize the data
      const normalizedData = normalizeEmployeeData(response, monthDate);
      return normalizedData;

    } catch (error) {
      console.error("Error fetching employee details:", error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add this new async thunk after fetchEmployeeDetails
export const updateEmployeeDetails = createAsyncThunk(
  'employeeDetails/updateEmployeeDetails',
  async ({ employeeId, updateData }, { rejectWithValue }) => {
    try {
      const response = await updateEmployeeStatus(employeeId, updateData);
      return response;
    } catch (error) {
      console.error("Error updating employee details:", error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Helper function to normalize data (same as before)
const normalizeEmployeeData = (response, monthDate) => {
  return {
    month: response.month || format(monthDate, "MMMM yyyy"),
    data: response.data || [],
    employeeInfo: response.employeeInfo
      ? {
        name: response.employeeInfo.name || "Unknown Employee",
        email: response.employeeInfo.email || "N/A",
        phone: response.employeeInfo.phone || "N/A",
        jobRole: response.employeeInfo.jobRole || "N/A",
        department: response.employeeInfo.department || "N/A",
        position: response.employeeInfo.position || "N/A",
        address: response.employeeInfo.address || "N/A",
        gender: response.employeeInfo.gender || "N/A",
        city: response.employeeInfo.city || "N/A",
        state: response.employeeInfo.state || "N/A",
        pincode: response.employeeInfo.pincode || "N/A",
        joiningDate: response.employeeInfo.joiningDate || null,
        dob: response.employeeInfo.dob || null,
        leaveQuota: response.employeeInfo.leaveQuota || "0",
        type: response.employeeInfo.type || 2,
        image: response.employeeInfo.image
          ? response.employeeInfo.image.replace(/^https?:\/\/[^\/]+/, '')
          : '',
        documents: (response.employeeInfo.documents || []).map(doc => ({
          ...doc,
          documentUrl: doc.documentUrl
            ? doc.documentUrl.replace(/^https?:\/\/[^\/]+/, '')
            : '',
          documentType: doc.documentType || "Unknown",
          uploadedAt: doc.uploadedAt || null,
          remarks: doc.remarks || "N/A",
          _id: doc._id || ""
        })),
        bankDetails: response.employeeInfo.bankDetails || {
          accountNumber: "N/A",
          bankName: "N/A",
          ifscCode: "N/A",
          nameOnAccount: "N/A"
        },
        salarydetails: response.employeeInfo.salarydetails || {
          salary: "N/A",
          incrementcycle: "N/A",
          IncrementAmount: "N/A",
          incrementMonth: "N/A"
        }
      }
      : getDefaultEmployeeInfo()
  };
};

// Helper function for default employee info
const getDefaultEmployeeInfo = () => ({
  name: "Unknown Employee",
  email: "N/A",
  phone: "N/A",
  jobRole: "N/A",
  department: "N/A",
  position: "N/A",
  address: "N/A",
  city: "N/A",
  state: "N/A",
  pincode: "N/A",
  joiningDate: null,
  dob: null,
  leaveQuota: "0",
  type: 2,
  image: '',
  documents: [],
  bankDetails: {
    accountNumber: "N/A",
    bankName: "N/A",
    ifscCode: "N/A",
    nameOnAccount: "N/A"
  },
  salarydetails: {
    salary: "N/A",
    incrementcycle: "N/A",
    IncrementAmount: "N/A",
    incrementMonth: "N/A"
  }
});

const employeeDetailsSlice = createSlice({
  name: 'employeeDetails',
  initialState: {
    data: null,
    loading: false,
    error: null,
    currentMonth: startOfMonth(new Date())
  },
  reducers: {
    setCurrentMonth: (state, action) => {
      state.currentMonth = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearData: (state) => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(fetchEmployeeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to load employee details. Please try again.";
        toast.error("Unable to load employee details. Please try again.");

        // Set fallback data
        state.data = {
          month: format(state.currentMonth, "MMMM yyyy"),
          data: [],
          employeeInfo: getDefaultEmployeeInfo()
        };
      })
      .addCase(updateEmployeeDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployeeDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload && state.data) {
          state.data.employeeInfo = { ...state.data.employeeInfo, ...action.payload };
        }
      })
      .addCase(updateEmployeeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to update employee details. Please try again.";
        toast.error("Failed to update employee details");
      });
  }
});

export const { setCurrentMonth, clearError, clearData } = employeeDetailsSlice.actions;
export default employeeDetailsSlice.reducer;