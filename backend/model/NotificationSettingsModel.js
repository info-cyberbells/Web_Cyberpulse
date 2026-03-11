import mongoose from "mongoose";

const notificationSettingsSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
    },
    clock_in: { type: Boolean, default: true },
    clock_out: { type: Boolean, default: true },
    leave_request: { type: Boolean, default: true },
    wfh_credit_request: { type: Boolean, default: true },
    leave_approved: { type: Boolean, default: true },
    leave_rejected: { type: Boolean, default: true },
    event_added: { type: Boolean, default: true },
    announcement_added: { type: Boolean, default: true },
    helpdesk_ticket: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const NotificationSettings = mongoose.model(
  "NotificationSettings",
  notificationSettingsSchema,
  "NotificationSettings"
);

export default NotificationSettings;
