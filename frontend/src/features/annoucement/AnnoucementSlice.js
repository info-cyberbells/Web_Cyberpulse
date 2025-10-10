import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addAnnoucement,
  getAllAnnoucement,
  editAnnoucement,
  deleteAnnoucement,
  getAnnoucementDetails,
} from "../../services/services";

// Async thunks
export const addNewAnnoucement = createAsyncThunk(
  "Annoucements/addNewAnnoucement",
  async (AnnoucementData, { rejectWithValue }) => {
    try {
      const response = await addAnnoucement(AnnoucementData);
      console.log("Add new Annoucement", response)
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAllAnnoucements = createAsyncThunk(
  "Annoucements/fetchAllAnnoucements",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllAnnoucement();
      console.log(response)
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAnnoucementDetails = createAsyncThunk(
  "Annoucements/fetchAnnoucementDetails",
  async (AnnoucementId, { rejectWithValue }) => {
    try {
      const response = await getAnnoucementDetails(AnnoucementId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const editExistingAnnoucement = createAsyncThunk(
  "Annoucements/editExistingAnnoucement",
  async ({ id, AnnoucementData }, { rejectWithValue }) => {
    try {
      const response = await editAnnoucement(id, AnnoucementData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeAnnoucement = createAsyncThunk(
  "Annoucements/removeAnnoucement",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteAnnoucement(id);
      return { response, id };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  AnnoucementList: [],
  currentAnnoucement: null,
  loading: false,
  error: null,
  successMessage: null,
};

const AnnoucementSlice = createSlice({
  name: "Annoucements",
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Annoucement cases
      .addCase(addNewAnnoucement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewAnnoucement.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Annoucement added successfully";
        state.AnnoucementList.push(action.payload.announcement);
      })
      .addCase(addNewAnnoucement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'An error occurred';
      })

      // Fetch All Annoucements cases
      .addCase(fetchAllAnnoucements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAnnoucements.fulfilled, (state, action) => {
        state.loading = false;
        console.log("API Response:", action.payload);
        state.AnnoucementList = action.payload.data || [];
      })
      .addCase(fetchAllAnnoucements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'An error occurred';
      })

      // Fetch Annoucement Details cases
      .addCase(fetchAnnoucementDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnoucementDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnnoucement = action.payload.data;
      })
      .addCase(fetchAnnoucementDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'An error occurred';
      })

      // Edit Annoucement cases
      .addCase(editExistingAnnoucement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editExistingAnnoucement.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Annoucement updated successfully";
        const index = state.AnnoucementList.findIndex(
          (Annoucement) => Annoucement._id === action.payload.data._id
        );
        if (index !== -1) {
          state.AnnoucementList[index] = action.payload.data;
        }
      })
      .addCase(editExistingAnnoucement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'An error occurred';
      })

      // Delete Annoucement cases
      .addCase(removeAnnoucement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAnnoucement.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Annoucement deleted successfully";
        state.AnnoucementList = state.AnnoucementList.filter(
          (Annoucement) => Annoucement._id !== action.payload.id
        );
      })
      .addCase(removeAnnoucement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'An error occurred';
      });
  },
});

export const { clearSuccessMessage, clearError } = AnnoucementSlice.actions;
export default AnnoucementSlice.reducer;