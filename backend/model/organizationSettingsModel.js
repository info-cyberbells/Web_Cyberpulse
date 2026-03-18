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

    geofenceEnabled: {
      type: Boolean,
      default: false,
    },
    geofenceLatitude: {
      type: Number,
      default: null,
    },
    geofenceLongitude: {
      type: Number,
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
  },
  { timestamps: true }
);

const OrganizationSettings =
  mongoose.models.OrganizationSettings ||
  mongoose.model("OrganizationSettings", organizationSettingsSchema, "OrganizationSettings");

export default OrganizationSettings;
