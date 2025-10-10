import mongoose from "mongoose";

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

  Employeestatus: {
    type: String,
    enum: ["active", "on break", "clocked out"],
    default: "active",
  },
});

const Attendance = mongoose.model("Attendance", AttendanceSchema, "Attendance");
export default Attendance;