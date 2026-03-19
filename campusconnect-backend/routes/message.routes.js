import express from "express"
import {
  getConversations, getMessages, sendMessage, getUnreadCount
} from "../controllers/message.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/conversations", protect, getConversations)
router.get("/unread", protect, getUnreadCount)
router.get("/:otherUserId", protect, getMessages)
router.post("/", protect, sendMessage)

export default router