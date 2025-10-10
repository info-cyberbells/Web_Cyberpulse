import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllAdvanceSalaryRequests, updateAdvanceSalaryRequest, createAdvanceSalaryRequest, getMyAdvanceSalaryRequests } from "../../services/services";

// Async Thunks

export const submitAdvanceSalaryRequest = createAsyncThunk(
    "advanceSalary/submitRequest",
    async (requestData, { rejectWithValue }) => {
        try {
            const response = await createAdvanceSalaryRequest(requestData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


export const fetchAdvanceSalaryRequests = createAsyncThunk(
    "advanceSalary/fetchRequests",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllAdvanceSalaryRequests();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateSalaryRequestStatus = createAsyncThunk(
    "advanceSalary/updateStatus",
    async ({ requestId, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateAdvanceSalaryRequest(requestId, updateData);
            return { requestId, updateData, response: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchMyAdvanceSalaryRequests = createAsyncThunk(
    "advanceSalary/fetchMyRequests",
    async (employeeId, { rejectWithValue }) => {
        try {
            const response = await getMyAdvanceSalaryRequests(employeeId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


// Initial State
const initialState = {
    requests: [],
    myRequests: [],
    loading: false,
    myRequestsLoading: false,
    submitLoading: false,
    actionLoading: null,
    error: null,
    myRequestsError: null,
    successMessage: null,
};

// Slice
const advanceSalarySlice = createSlice({
    name: "advanceSalary",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.myRequestsError = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        setActionLoading: (state, action) => {
            state.actionLoading = action.payload;
        },
        resetForm: (state) => { // ADD THIS
            state.submitLoading = false;
            state.successMessage = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            .addCase(submitAdvanceSalaryRequest.pending, (state) => {
                state.submitLoading = true;
                state.error = null;
            })
            .addCase(submitAdvanceSalaryRequest.fulfilled, (state, action) => {
                state.submitLoading = false;
                state.successMessage = "Your advance salary request has been submitted.";
                // Add the new request to myRequests
                state.myRequests.unshift(action.payload);
            })
            .addCase(submitAdvanceSalaryRequest.rejected, (state, action) => {
                state.submitLoading = false;
                state.error = action.payload;
            })
            // Fetch Requests
            .addCase(fetchAdvanceSalaryRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdvanceSalaryRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(fetchAdvanceSalaryRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Status
            .addCase(updateSalaryRequestStatus.pending, (state, action) => {
                state.actionLoading = action.meta.arg.requestId + action.meta.arg.updateData.status;
                state.error = null;
            })
            .addCase(updateSalaryRequestStatus.fulfilled, (state, action) => {
                state.actionLoading = null;
                const { requestId, updateData, response } = action.payload;

                // Update the specific request in the state
                const requestIndex = state.requests.findIndex(r => r._id === requestId);
                if (requestIndex !== -1) {
                    state.requests[requestIndex] = {
                        ...state.requests[requestIndex],
                        status: updateData.status,
                        responseNote: updateData.responseNote,
                        approvalImagePath: response?.approvalImagePath || state.requests[requestIndex].approvalImagePath
                    };
                }

                state.successMessage = `Request ${updateData.status} successfully.`;
            })
            .addCase(updateSalaryRequestStatus.rejected, (state, action) => {
                state.actionLoading = null;
                state.error = action.payload;
            })
            .addCase(fetchMyAdvanceSalaryRequests.pending, (state) => {
                state.myRequestsLoading = true;
                state.myRequestsError = null;
            })
            .addCase(fetchMyAdvanceSalaryRequests.fulfilled, (state, action) => {
                state.myRequestsLoading = false;
                state.myRequests = action.payload;
            })
            .addCase(fetchMyAdvanceSalaryRequests.rejected, (state, action) => {
                state.myRequestsLoading = false;
                state.myRequestsError = action.payload;
            })
    },
});

export const { clearError, clearSuccessMessage, setActionLoading, resetForm } = advanceSalarySlice.actions;
export default advanceSalarySlice.reducer;