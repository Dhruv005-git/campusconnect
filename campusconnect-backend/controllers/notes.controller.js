import Note from "../models/Note.js"
import cloudinary from "../config/cloudinary.js"

// Get all notes
export const getNotes = async (req, res) => {
  try {
    const { department, semester, subject, type, search } = req.query

    let filter = {}
    if (department) filter.department = department
    if (semester) filter.semester = Number(semester)
    if (subject) filter.subject = { $regex: subject, $options: "i" }
    if (type) filter.type = type
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    const notes = await Note.find(filter)
      .populate("uploader", "name department year")
      .sort({ createdAt: -1 })

    res.json(notes)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get single note
export const getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate("uploader", "name department year")
    if (!note) return res.status(404).json({ message: "Note not found" })
    res.json(note)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Upload note
export const uploadNote = async (req, res) => {
  try {
    const { title, description, subject, department, semester, type } = req.body

    if (!req.file) return res.status(400).json({ message: "File is required" })

    const base64 = req.file.buffer.toString("base64")
    const dataUri = `data:${req.file.mimetype};base64,${base64}`

    const isPDF = req.file.mimetype === "application/pdf"

    const result = await cloudinary.uploader.upload(dataUri, {
    folder: "campusconnect/notes",
    resource_type: isPDF ? "raw" : "image",
    access_mode: "public",
    public_id: isPDF ? `${Date.now()}_${req.file.originalname.replace(/\s/g, "_")}` : undefined,
    })
    
    const note = await Note.create({
      uploader: req.user._id,
      title, description, subject, department,
      semester: Number(semester),
      type: type || "notes",
      fileUrl: result.secure_url,
      fileType: req.file.mimetype,
    })

    res.status(201).json(note)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Increment download count
export const downloadNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    )
    if (!note) return res.status(404).json({ message: "Note not found" })
    res.json({ fileUrl: note.fileUrl, downloads: note.downloads })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Delete note
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return res.status(404).json({ message: "Note not found" })
    if (note.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }
    await note.deleteOne()
    res.json({ message: "Note deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}