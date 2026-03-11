import mongoose from "mongoose";

const fcmTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    device: {
      type: String,
      default: "web",
    },
  },
  { timestamps: true }
);

// One token per user-device combination
fcmTokenSchema.index({ userId: 1, token: 1 }, { unique: true });
// Quick lookup by userId
fcmTokenSchema.index({ userId: 1 });

const FcmToken = mongoose.model("FcmToken", fcmTokenSchema, "FcmToken");

export default FcmToken;
