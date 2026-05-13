import mongoose from "mongoose";

const organizationSettingsSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
    },
    workingHoursRequired: {
      type: Number,
      default: 8,
      min: 1,
      max: 24,
    },
    maxBreakDurationMinutes: {
      type: Number,
      default: 60,
      min: 0,
    },
    minClockOutHour: {
      type: Number,
      default: 18,
      min: 0,
      max: 23,
    },
    minClockOutMinute: {
      type: Number,
      default: 0,
      min: 0,
      max: 59,
    },

    locationMode: {
      type: String,
      enum: ["off", "radius", "address"],
      default: "off",
    },
    geofenceLatitude: {
      type: Number,
      default: null,
    },
    geofenceLongitude: {
      type: Number,
      default: null,
    },
    geofenceAddress: {
      type: String,
      default: null,
    },
    geofenceRadius: {
      type: Number,
      default: 100, // metres
    },
    wfhEnabled: {
      type: Boolean,
      default: true,
    },

    // ── Leave Quota Policy ────────────────────────────────────────────────────
    // "quarterly_reset"   → reset all employees in this org to 3 every Jan/Apr/Jul/Oct
    // "monthly_increment" → add +1 to every employee's leaveQuota each month
    leaveQuotaPolicy: {
      type: String,
      enum: ["quarterly_reset", "monthly_increment"],
      default: "quarterly_reset",
    },
    // Month (1-12) from which monthly-increment accumulation begins.
    leaveQuotaIncrementStartMonth: {
      type: Number,
      default: 4,
      min: 1,
      max: 12,
    },
  },
  { timestamps: true }
);

const OrganizationSettings =
  mongoose.models.OrganizationSettings ||
  mongoose.model("OrganizationSettings", organizationSettingsSchema, "OrganizationSettings");

export default OrganizationSettings;
