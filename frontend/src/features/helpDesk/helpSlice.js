import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addHelpdesk, updateHelpdeskTicketStatus, getUserTickets, getAllHelpdeskTickets } from '../../services/services';

// Async Thunks
export const createHelpdesk = createAsyncThunk(
  'helpdesk/createHelpdesk',
  async (data, { rejectWithValue }) => {
    try {
      const response = await addHelpdesk(data);
      return response.data; // Assuming the response has data property
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);


export const fetchUserTickets = createAsyncThunk(
  'helpdesk/fetchUserTickets',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await getUserTickets(employeeId);

      // Filter tickets to only show those matching the current employeeId
      const allTickets = response.data || [];
      const myTickets = allTickets.filter(ticket =>
        ticket.employeeId &&
        (typeof ticket.employeeId === 'string' ? ticket.employeeId === employeeId :
          ticket.employeeId._id === employeeId)
      );

      return myTickets;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//update ticket status
export const updateTicketStatus = createAsyncThunk(
  "helpdesk/updateTicketStatus",
  async ({ ticketId, status }, { rejectWithValue }) => {
    try {
      const response = await updateHelpdeskTicketStatus(ticketId, { status });
      return { ticketId, status, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchHelpdeskTickets = createAsyncThunk(
  'helpdesk/fetchTickets',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAllHelpdeskTickets(params);
      return response.data; // Return the data array directly
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

// Initial State
const initialState = {
  tickets: [],
  userTickets: [],
  currentTicket: null,
  loading: false,
  loadingTickets: false,
  error: null,
  ticketsError: null,
  success: false,
  totalCount: 0
};

// Slice
const helpdeskSlice = createSlice({
  name: 'helpdesk',
  initialState,
  reducers: {
    resetHelpdeskState: (state) => {
      return initialState;
    },
    clearHelpdeskError: (state) => {
      state.error = null;
      state.success = false;
    },
    setCurrentTicket: (state, action) => {
      state.currentTicket = action.payload;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Helpdesk
      .addCase(createHelpdesk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createHelpdesk.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.unshift(action.payload);
        state.success = true;
        state.totalCount += 1;
      })
      .addCase(createHelpdesk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      //update ticket status
      .addCase(updateTicketStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        state.loading = false;
        const ticketIndex = state.tickets.findIndex(
          ticket => ticket.ticketId === action.payload.ticketId
        );
        if (ticketIndex !== -1) {
          state.tickets[ticketIndex].status = action.payload.status;
        }
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //fetch ticket as user 
      .addCase(fetchUserTickets.pending, (state) => {
        state.loadingTickets = true;
        state.ticketsError = null;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action) => {
        state.loadingTickets = false;
        state.userTickets = action.payload;
        state.ticketsError = null;
      })
      .addCase(fetchUserTickets.rejected, (state, action) => {
        state.loadingTickets = false;
        state.ticketsError = action.payload;
        state.userTickets = [];
      })

      // Fetch Tickets
      .addCase(fetchHelpdeskTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHelpdeskTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload; // Directly set the data array as tickets
        state.totalCount = action.payload.length; // Use array length for total count
      })
      .addCase(fetchHelpdeskTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const {
  resetHelpdeskState,
  clearHelpdeskError,
  setCurrentTicket,
  clearCurrentTicket
} = helpdeskSlice.actions;

// Selectors
export const selectHelpdeskTickets = (state) => state.helpdesk.tickets;
export const selectHelpdeskLoading = (state) => state.helpdesk.loading;
export const selectHelpdeskError = (state) => state.helpdesk.error;
export const selectHelpdeskSuccess = (state) => state.helpdesk.success;
export const selectCurrentTicket = (state) => state.helpdesk.currentTicket;
export const selectTotalTickets = (state) => state.helpdesk.totalCount;

export default helpdeskSlice.reducer;