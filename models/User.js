const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Full name of the user
    course: { type: String, required: true }, // e.g., B.Tech, MBA, etc.
    specialization: { type: String, required: true }, // e.g., AI, Marketing, etc.
    semester: { type: String, required: true }, // e.g., 3rd, 5th etc.
    jluid: { type: String, required: true, unique: true }, // JLU ID (unique)
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
