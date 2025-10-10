import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployeeDocuments, uploadEmployeeDocument } from '../../services/services';

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

const employeeDocumentsSlice = createSlice({
  name: 'employeeDocuments',
  initialState: {
    documents: [],
    loading: false,
    error: null,
    uploadStatus: {}, // Track upload status for each document type
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
      });
  }
});

export const { clearError, setUploadStatus, clearUploadStatus } = employeeDocumentsSlice.actions;
export default employeeDocumentsSlice.reducer;