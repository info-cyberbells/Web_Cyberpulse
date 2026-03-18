import mongoose from "mongoose";
import { encryptTime, decryptTime } from "../utils/timeEncryption.js";

const AttendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: { type: Date, required: true },
  clockInTime: { type: String },
  clockOutTime: { type: String },
  clockInSelfie: { type: String },
  platform: { type: String, default: "Web" },
  clockOutSelfie: { type: String },
  isEmergency: { type: Boolean },
  emergencyReason: { type: String },
  autoClockOut: { type: Boolean, default: false },
  workingDay: { type: Number, default: 0 },
  breakTime: { type: Number, default: 0 },
  breakTimings: [
    {
      name: { type: String, required: true, trim: true },
      startTime: { type: String, required: true },
      endTime: { type: String },
      pausedAt: { type: String, default: null },
      pausedDuration: { type: Number, default: 0 },
    },
  ],
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  activeTaskIdBeforeBreak: {
    type: String,
    default: null
  },

  isWFH: {
    type: Boolean,
    default: false,
  },

  clockInLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },

  Employeestatus: {
    type: String,
    enum: ["active", "on break", "clocked out"],
    default: "active",
  },
});

// Encrypt clockInTime and clockOutTime before saving
AttendanceSchema.pre('save', function (next) {
  if (this.isModified('clockInTime') && this.clockInTime) {
    this.clockInTime = encryptTime(this.clockInTime);
  }
  if (this.isModified('clockOutTime') && this.clockOutTime) {
    this.clockOutTime = encryptTime(this.clockOutTime);
  }
  next();
});

// Decrypt clockInTime and clockOutTime after loading from DB
AttendanceSchema.post('init', function (doc) {
  if (doc.clockInTime) {
    doc.clockInTime = decryptTime(doc.clockInTime);
  }
  if (doc.clockOutTime) {
    doc.clockOutTime = decryptTime(doc.clockOutTime);
  }
});

const Attendance = mongoose.model("Attendance", AttendanceSchema, "Attendance");
export default Attendance;
