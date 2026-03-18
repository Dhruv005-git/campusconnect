import mongoose from "mongoose"

const listingSchema = new mongoose.Schema({
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:       { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true },
  mrp:         { type: Number },
  condition:   { type: String, enum: ["new", "good", "fair", "poor"] },
  category:    { type: String, enum: ["textbook", "calculator", "lab", "electronics", "stationery", "other"] },
  department:  { type: String },
  semester:    { type: Number },
  images:      [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  interestedCount: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model("Listing", listingSchema)