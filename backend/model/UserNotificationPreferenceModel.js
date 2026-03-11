import mongoose from "mongoose";

const userNotificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
    },
    preferences: {
      clock_in: { type: Boolean, default: true },
      clock_out: { type: Boolean, default: true },
      leave_request: { type: Boolean, default: true },
      wfh_credit_request: { type: Boolean, default: true },
      leave_approved: { type: Boolean, default: true },
      leave_rejected: { type: Boolean, default: true },
      event_added: { type: Boolean, default: true },
      announcement_added: { type: Boolean, default: true },
      helpdesk_ticket: { type: Boolean, default: true },
      chat_message: { type: Boolean, default: true },
    },
    pushEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const UserNotificationPreference = mongoose.model(
  "UserNotificationPreference",
  userNotificationPreferenceSchema,
  "UserNotificationPreference"
);

export default UserNotificationPreference;
