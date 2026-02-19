import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployeeDocuments, uploadEmployeeDocument, deleteMyAccount } from '../../services/services';

// Async thunk for fetching employee documents
export const fetchEmployeeDocuments = createAsyncThunk(
  'employeeDocuments/fetchEmployeeDocuments',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await getEmployeeDocuments(employeeId);
      return response.documents || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for uploading documents
export const uploadDocument = createAsyncThunk(
  'employeeDocuments/uploadDocument',
  async ({ employeeId, formData, docType }, { rejectWithValue }) => {
    try {
      const response = await uploadEmployeeDocument(employeeId, formData);
      return { ...response, docType };
    } catch (error) {
      return rejectWithValue({
        error: error.response?.data?.message || 'Upload failed',
        docType
      });
    }
  }
);


export const deleteEmployeeAccountThunk = createAsyncThunk(
  "employee/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const employeeId = storedUser?.employee?.id;

      if (!employeeId) {
        throw new Error("Employee ID not found");
      }

      const response = await deleteMyAccount(employeeId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const employeeDocumentsSlice = createSlice({
  name: 'employeeDocuments',
  initialState: {
    documents: [],
    loading: false,
    error: null,
    uploadStatus: {}, // Track upload status for each document type
    deleteLoading: false,
    deleteError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadStatus: (state, action) => {
      const { docType, status } = action.payload;
      state.uploadStatus[docType] = status;
    },
    clearUploadStatus: (state, action) => {
      const { docType } = action.payload;
      delete state.uploadStatus[docType];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchEmployeeDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchEmployeeDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload document
      .addCase(uploadDocument.pending, (state, action) => {
        const { docType } = action.meta.arg;
        state.uploadStatus[docType] = { uploading: true, success: false, error: null };
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        const { docType } = action.payload;
        state.uploadStatus[docType] = {
          uploading: false,
          success: true,
          error: null,
          documentUrl: action.payload.document?.documentUrl
        };
        // Optionally update the documents array
        const existingDocIndex = state.documents.findIndex(doc => doc.documentType === docType);
        if (existingDocIndex !== -1) {
          state.documents[existingDocIndex] = action.payload.document;
        } else {
          state.documents.push(action.payload.document);
        }
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        const { docType, error } = action.payload;
        state.uploadStatus[docType] = { uploading: false, success: false, error };
      })

      .addCase(deleteEmployeeAccountThunk.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteEmployeeAccountThunk.fulfilled, (state) => {
        state.deleteLoading = false;
      })
      .addCase(deleteEmployeeAccountThunk.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  }
});

export const { clearError, setUploadStatus, clearUploadStatus } = employeeDocumentsSlice.actions;
export default employeeDocumentsSlice.reducer;