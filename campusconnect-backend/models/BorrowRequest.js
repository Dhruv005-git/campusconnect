import mongoose from "mongoose"

const borrowRequestSchema = new mongoose.Schema({
  item:       { type: mongoose.Schema.Types.ObjectId, ref: "LendItem", required: true },
  borrower:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  owner:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  duration:   { type: Number, required: true }, // in days
  message:    { type: String },
  status:     { type: String, enum: ["pending", "approved", "rejected", "returned"], default: "pending" },
  returnDate: { type: Date },
}, { timestamps: true })

export default mongoose.model("BorrowRequest", borrowRequestSchema)