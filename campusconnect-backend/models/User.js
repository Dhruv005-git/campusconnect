import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  college:     { type: String, default: "PDEU Gandhinagar" },
  department:  { type: String },
  year:        { type: Number },
  isVerified:  { type: Boolean, default: false },
  otp:         { type: String },
  otpExpiry:   { type: Date },
  avatar:      { type: String },
  rating:      { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model("User", userSchema)