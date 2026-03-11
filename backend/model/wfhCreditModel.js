import mongoose from "mongoose";

const criteriaSchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const wfhCreditSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    criteria: {
      targetAchievement: {
        type: criteriaSchema,
        required: true,
      },
      attendance: {
        type: criteriaSchema,
        required: true,
      },
      clientAppreciation: {
        type: criteriaSchema,
        required: true,
      },
      teamwork: {
        type: criteriaSchema,
        required: true,
      },
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    isEligible: {
      type: Boolean,
      default: false,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  { timestamps: true }
);

wfhCreditSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const WfhCredit = mongoose.model("WfhCredit", wfhCreditSchema);

export default WfhCredit;
