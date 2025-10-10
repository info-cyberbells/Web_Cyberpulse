import mongoose from 'mongoose';

const LeaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  leaveType: {
    type: String,
  },
  status: { type: String },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: false,
  },
  appliedDate: { type: Date, default: Date.now },
},

  { timestamps: true } // Enable createdAt and updatedAt
);


const LeaveRequest = mongoose.model("LeaveRequest", LeaveRequestSchema, "LeaveRequest");

export default LeaveRequest;