import mongoose from "mongoose"

const lendItemSchema = new mongoose.Schema({
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:        { type: String, required: true },
  description:  { type: String },
  category:     { type: String, enum: ["calculator", "lab", "books", "tools", "electronics", "other"], default: "other" },
  department:   { type: String, required: true },
  maxDuration:  { type: Number, required: true }, // in days
  isAvailable:  { type: Boolean, default: true },
  images:       [{ type: String }],
  currentBorrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  returnDate:   { type: Date, default: null },
}, { timestamps: true })

export default mongoose.model("LendItem", lendItemSchema)