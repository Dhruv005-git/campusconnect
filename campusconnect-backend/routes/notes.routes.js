import express from "express"
import {
  getNotes, getNote, uploadNote, downloadNote, deleteNote
} from "../controllers/notes.controller.js"
import { protect } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/upload.middleware.js"

const router = express.Router()

router.get("/", protect, getNotes)
router.get("/:id", protect, getNote)
router.post("/", protect, upload.single("file"), uploadNote)
router.patch("/:id/download", protect, downloadNote)
router.delete("/:id", protect, deleteNote)

export default router