import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["clock_in", "clock_out", "leave_request", "wfh_credit_request", "leave_approved", "leave_rejected", "event_added", "announcement_added", "helpdesk_ticket"],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    resourceType: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Fast paginated queries for a user's notifications
notificationSchema.index({ recipient: 1, createdAt: -1 });
// Fast unread count
notificationSchema.index({ recipient: 1, isRead: 1 });
// Auto-delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const Notification = mongoose.model("Notification", notificationSchema, "Notification");

export default Notification;
