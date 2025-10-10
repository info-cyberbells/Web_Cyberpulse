import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  eventType: {
    type: String,

    required: true,
  },
  eventDate: { type: Date, required: true },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",

  },
  teamMembers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // Array of employee references
  ],
  type: {
    type: String,

  },

  location: {
    type: String,

  },
  priority: {
    type: String,

  },
  status: {
    type: String,
    enum: [
      'pending',
      'completed',
      'cancelled',
      'scheduled',
      'unconfirmed',
      'postponed'
    ],
    default: 'pending'
  },

  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", EventSchema, "Event");

export default Event;
