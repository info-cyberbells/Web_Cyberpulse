import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createInvoice, getInvoiceNumber, getAllInvoices } from "../../services/services";

// Async Thunk for creating invoice
export const submitInvoice = createAsyncThunk(
    "invoice/submitInvoice",
    async (invoiceData, { rejectWithValue }) => {
        try {
            const response = await createInvoice(invoiceData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchInvoiceNumber = createAsyncThunk(
    "invoice/fetchInvoiceNumber",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getInvoiceNumber();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchAllInvoices = createAsyncThunk(
    "invoice/fetchAllInvoices",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllInvoices();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    invoices: [],
    currentInvoice: null,
    loading: false,
    submitLoading: false,
    currentInvoiceNumber: "",
    error: null,
    successMessage: null,
    showCreateForm: false,
};

const invoiceSlice = createSlice({
    name: "invoice",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        resetInvoiceState: (state) => {
            state.currentInvoice = null;
            state.error = null;
            state.successMessage = null;
        },
        setShowCreateForm: (state, action) => {
            state.showCreateForm = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Submit Invoice
            .addCase(submitInvoice.pending, (state) => {
                state.submitLoading = true;
                state.error = null;
            })
            .addCase(submitInvoice.fulfilled, (state, action) => {
                state.submitLoading = false;
                state.currentInvoice = action.payload.data || action.payload.invoice;
                if (action.payload.data) {
                    state.invoices.push(action.payload.data);
                }
                state.successMessage = action.payload.message || "Invoice created successfully";
            })
            .addCase(submitInvoice.rejected, (state, action) => {
                state.submitLoading = false;
                state.error = action.payload?.message || "Failed to create invoice";
            })
            // Fetch Invoice Number
            .addCase(fetchInvoiceNumber.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchInvoiceNumber.fulfilled, (state, action) => {
                state.loading = false;
                state.currentInvoiceNumber = action.payload.invoiceNumber;
            })
            .addCase(fetchInvoiceNumber.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch invoice number";
            })
            .addCase(fetchAllInvoices.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.invoices = action.payload.data || [];
            })
            .addCase(fetchAllInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch invoices";
            });
    },
});

export const { clearError, clearSuccessMessage, resetInvoiceState, setShowCreateForm } = invoiceSlice.actions;
export default invoiceSlice.reducer;