// departmentModel.js
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Position name is required"],
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const Department = mongoose.model("Department", departmentSchema);
export default Department;
