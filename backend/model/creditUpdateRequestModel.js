import mongoose from "mongoose";

const creditUpdateRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: false,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    disputedCriteria: [
      {
        key: { type: String, trim: true },
        label: { type: String, trim: true },
        reason: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

const CreditUpdateRequest = mongoose.model(
  "CreditUpdateRequest",
  creditUpdateRequestSchema,
  "CreditUpdateRequest"
);

export default CreditUpdateRequest;
