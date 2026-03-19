import express from "express"
import {
  getLendItems, getLendItem, createLendItem, deleteLendItem,
  sendBorrowRequest, getMyRequests, getItemRequests, updateRequest
} from "../controllers/lend.controller.js"
import { protect } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/upload.middleware.js"

const router = express.Router()

router.get("/", protect, getLendItems)
router.get("/my-requests", protect, getMyRequests)
router.get("/item-requests", protect, getItemRequests)
router.get("/:id", protect, getLendItem)
router.post("/", protect, upload.array("images", 3), createLendItem)
router.delete("/:id", protect, deleteLendItem)
router.post("/:id/borrow", protect, sendBorrowRequest)
router.patch("/requests/:requestId", protect, updateRequest)

export default router