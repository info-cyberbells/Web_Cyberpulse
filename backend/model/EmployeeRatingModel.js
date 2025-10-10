import mongoose from "mongoose";

const employeeRatingSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: {
      type: String, // e.g., "2025-06"
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: true,
    },
    SystemRating: {
      type: Number,
      min: 0,
      max: 100,
      required: false, 
    },
    behaviour: {
      type: String,
      required: false,
    },
    leadershipAndResponsibility: {
      type: String,
      required: false,
    },
    comments: {
      type: String,
    },
    givenBy: {
      type: String,
      required: true,
    },
    givenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const EmployeeRating = mongoose.model("EmployeeRating", employeeRatingSchema, "EmployeeRating");

export default EmployeeRating;
