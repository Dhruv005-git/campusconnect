import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listing:   { type: mongoose.Schema.Types.ObjectId, ref: "Listing", default: null },
  content:   { type: String, required: true },
  isRead:    { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model("Message", messageSchema)