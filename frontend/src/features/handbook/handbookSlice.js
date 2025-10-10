import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getAllHandbooks,
    uploadHandbook,
    deleteHandbook,
    getAllHandbooksAdmin,
    fetchAllEmployees
} from "../../services/services";

// Async Thunks
export const fetchHandbooks = createAsyncThunk(
    "handbook/fetchHandbooks",
    async (employeeId, { rejectWithValue }) => {
        try {
            const response = await getAllHandbooks(employeeId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchAllHandbooks = createAsyncThunk(
    "handbook/fetchAllHandbooks",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllHandbooksAdmin();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const uploadNewHandbook = createAsyncThunk(
    "handbook/uploadHandbook",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await uploadHandbook(formData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const removeHandbook = createAsyncThunk(
    "handbook/deleteHandbook",
    async (handbookId, { rejectWithValue }) => {
        try {
            await deleteHandbook(handbookId);
            return handbookId;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchEmployeesForHandbook = createAsyncThunk(
    "handbook/fetchEmployees",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchAllEmployees();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Initial State
const initialState = {
    handbooks: [],
    employees: [],
    loading: false,
    uploadLoading: false,
    error: null,
    successMessage: null,
};

// Slice
const handbookSlice = createSlice({
    name: "handbook",
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
            // Fetch User Handbooks
            .addCase(fetchHandbooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHandbooks.fulfilled, (state, action) => {
                state.loading = false;
                state.handbooks = action.payload.success ? action.payload.handbooks : [];
            })
            .addCase(fetchHandbooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch All Handbooks (Admin)
            .addCase(fetchAllHandbooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllHandbooks.fulfilled, (state, action) => {
                state.loading = false;
                state.handbooks = action.payload.success ? action.payload.handbooks : [];
            })
            .addCase(fetchAllHandbooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Upload Handbook
            .addCase(uploadNewHandbook.pending, (state) => {
                state.uploadLoading = true;
                state.error = null;
            })
            .addCase(uploadNewHandbook.fulfilled, (state, action) => {
                state.uploadLoading = false;
                state.successMessage = action.payload.message || "Handbook uploaded successfully";
            })
            .addCase(uploadNewHandbook.rejected, (state, action) => {
                state.uploadLoading = false;
                state.error = action.payload;
            })

            // Delete Handbook
            .addCase(removeHandbook.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeHandbook.fulfilled, (state, action) => {
                state.loading = false;
                state.handbooks = state.handbooks.filter(handbook => handbook._id !== action.payload);
                state.successMessage = "Handbook deleted successfully";
            })
            .addCase(removeHandbook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Employees
            .addCase(fetchEmployeesForHandbook.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployeesForHandbook.fulfilled, (state, action) => {
                state.loading = false;
                const activeEmployees = (action.payload.data || []).filter(emp => emp.status !== '0');
                state.employees = activeEmployees;
            })
            .addCase(fetchEmployeesForHandbook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearSuccessMessage } = handbookSlice.actions;
export default handbookSlice.reducer;