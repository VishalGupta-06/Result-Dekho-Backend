import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  registration: {
    type: String,
    required: true,
  },

  otp: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 120 seconds = 2 minutes
  },
});

export const OTP = mongoose.model("OTP", otpSchema);