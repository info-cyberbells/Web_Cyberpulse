import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllEmployees, sendSalarySlipEmail, uploadSalarySlip } from '../../services/services';

// Fetch all employees
export const fetchAllEmployees = createAsyncThunk(
    'salary/fetchAllEmployees',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllEmployees();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Send salary slip email
export const sendSlipEmail = createAsyncThunk(
    'salary/sendSlipEmail',
    async (emailData, { rejectWithValue }) => {
        try {
            const response = await sendSalarySlipEmail(emailData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Upload salary slip
export const uploadSlip = createAsyncThunk(
    'salary/uploadSlip',
    async ({ employeeId, formData }, { rejectWithValue }) => {
        try {
            const response = await uploadSalarySlip(employeeId, formData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const salarySlipSlice = createSlice({
    name: 'salary',
    initialState: {
        employees: [],
        employeesWithSlips: [],
        loading: false,
        emailLoading: false,
        uploadLoading: false,
        error: null,
        emailError: null,
        uploadError: null,
        emailSuccess: false,
        uploadSuccess: false,
    },
    reducers: {
        clearErrors: (state) => {
            state.error = null;
            state.emailError = null;
            state.uploadError = null;
        },
        clearSuccess: (state) => {
            state.emailSuccess = false;
            state.uploadSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch employees
            .addCase(fetchAllEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllEmployees.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success) {
                    const activeEmployees = action.payload.data.filter(emp => emp.status !== '0');
                    state.employees = activeEmployees;
                    state.employeesWithSlips = activeEmployees.filter(emp => emp.salarySlips && emp.salarySlips.length > 0);
                }
            })
            .addCase(fetchAllEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Send email
            .addCase(sendSlipEmail.pending, (state) => {
                state.emailLoading = true;
                state.emailError = null;
                state.emailSuccess = false;
            })
            .addCase(sendSlipEmail.fulfilled, (state) => {
                state.emailLoading = false;
                state.emailSuccess = true;
            })
            .addCase(sendSlipEmail.rejected, (state, action) => {
                state.emailLoading = false;
                state.emailError = action.payload;
            })
            // Upload slip
            .addCase(uploadSlip.pending, (state) => {
                state.uploadLoading = true;
                state.uploadError = null;
                state.uploadSuccess = false;
            })
            .addCase(uploadSlip.fulfilled, (state) => {
                state.uploadLoading = false;
                state.uploadSuccess = true;
            })
            .addCase(uploadSlip.rejected, (state, action) => {
                state.uploadLoading = false;
                state.uploadError = action.payload;
            });
    }
});

export const { clearErrors, clearSuccess } = salarySlipSlice.actions;
export default salarySlipSlice.reducer;