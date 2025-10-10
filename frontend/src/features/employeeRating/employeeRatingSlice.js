import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addEmployeeRating, fetchEmployeeRatings } from "../../services/services";

// Async Thunks
export const fetchEmployeeRatingsAsync = createAsyncThunk(
    "employeeRatings/fetchEmployeeRatings",
    async (employeeId, { rejectWithValue }) => {
        try {
            const response = await fetchEmployeeRatings(employeeId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const addEmployeeRatingAsync = createAsyncThunk(
    "employeeRatings/addEmployeeRating",
    async ({ employeeId, ratingData }, { rejectWithValue }) => {
        try {
            const response = await addEmployeeRating(employeeId, ratingData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


const initialState = {
    ratings: [],
    loading: false,
    adding: false,
    error: null,
    successMessage: null,
};

const employeeRatingSlice = createSlice({
    name: "employeeRatings",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        resetRatings: (state) => {
            state.ratings = [];
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmployeeRatingsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployeeRatingsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.ratings = action.payload.ratings || action.payload.data || action.payload || [];
                state.error = null;
            })
            .addCase(fetchEmployeeRatingsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.ratings = [];
            })

            .addCase(addEmployeeRatingAsync.pending, (state) => {
                state.adding = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(addEmployeeRatingAsync.fulfilled, (state, action) => {
                state.adding = false;
                state.successMessage = action.payload.message || 'Rating added successfully';
                const newRating = action.payload.rating || action.payload.data || action.payload;
                if (newRating) {
                    state.ratings.unshift(newRating);
                }
                state.error = null;
            })
            .addCase(addEmployeeRatingAsync.rejected, (state, action) => {
                state.adding = false;
                state.error = action.payload?.message || action.payload || 'Failed to add rating';
                state.successMessage = null;
            });
    },
});

export const { clearError, clearSuccessMessage, resetRatings } = employeeRatingSlice.actions;

export default employeeRatingSlice.reducer;