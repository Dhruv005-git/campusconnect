import mongoose from "mongoose"

const noteSchema = new mongoose.Schema({
  uploader:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:       { type: String, required: true },
  description: { type: String },
  subject:     { type: String, required: true },
  department:  { type: String, required: true },
  semester:    { type: Number, required: true },
  type:        { type: String, enum: ["notes", "pyq", "assignment", "project"], default: "notes" },
  fileUrl:     { type: String, required: true },
  fileType:    { type: String },
  downloads:   { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model("Note", noteSchema)