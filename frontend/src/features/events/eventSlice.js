import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addEvent,
  getAllEvents,
  editEvent,
  deleteEvent,
  getEventDetails,
  getUpcomingAnnouncements,
} from "../../services/services";

// Async thunks
export const addNewEvent = createAsyncThunk(
  "events/addNewEvent",
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await addEvent(eventData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAllEvents = createAsyncThunk(
  "events/fetchAllEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllEvents();
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchEventDetails = createAsyncThunk(
  "events/fetchEventDetails",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await getEventDetails(eventId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const editExistingEvent = createAsyncThunk(
  "events/editExistingEvent",
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const response = await editEvent(id, eventData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

//upcoming announcement
export const fetchUpcomingAnnouncements = createAsyncThunk(
  "events/fetchUpcomingAnnouncements",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUpcomingAnnouncements();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeEvent = createAsyncThunk(
  "events/removeEvent",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteEvent(id);
      return { response, id };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  eventList: [],
  employeeCelebrations: [],
  currentEvent: null,
  celebrationsLoading: false,
  loading: false,
  error: null,
  celebrationsError: null,
  successMessage: null,
};

const eventSlice = createSlice({
  name: "events",
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
      // Add Event cases
      .addCase(addNewEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Event added successfully";
        state.eventList.push(action.payload.data);
      })
      .addCase(addNewEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error || "Failed to add event";
      })

      // Fetch All Events cases
      .addCase(fetchAllEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.eventList = action.payload.data;
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error || "Failed to fetch events";
      })

      // Fetch Event Details cases
      .addCase(fetchEventDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload.data;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error || "Failed to fetch event details";
      })

      // Edit Event cases
      .addCase(editExistingEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editExistingEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Event updated successfully";
        const index = state.eventList.findIndex(
          (event) => event.id === action.payload.data.id
        );
        if (index !== -1) {
          state.eventList[index] = action.payload.data;
        }
      })
      .addCase(editExistingEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error || "Failed to update event";
      })

      //upcoming announement
      .addCase(fetchUpcomingAnnouncements.pending, (state) => {
        state.celebrationsLoading = true;
        state.celebrationsError = null;
      })
      .addCase(fetchUpcomingAnnouncements.fulfilled, (state, action) => {
        state.celebrationsLoading = false;
        state.employeeCelebrations = action.payload;
      })
      .addCase(fetchUpcomingAnnouncements.rejected, (state, action) => {
        state.celebrationsLoading = false;
        state.celebrationsError = action.payload;
      })

      // Delete Event cases
      .addCase(removeEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // In eventSlice.js, update the removeEvent.fulfilled case
      .addCase(removeEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Event deleted successfully";
        // Fix: Use the correct id from the payload
        state.eventList = state.eventList.filter(
          (event) => event._id !== action.payload.id
        );
      })
      .addCase(removeEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error || "Failed to delete event";
      });
  },
});

export const { clearSuccessMessage, clearError } = eventSlice.actions;
export default eventSlice.reducer;
