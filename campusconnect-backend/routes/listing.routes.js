import express from "express"
import {
  getListings,
  getListing,
  createListing,
  deleteListing,
  toggleAvailability
} from "../controllers/listing.controller.js"
import { protect } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/upload.middleware.js"

const router = express.Router()

router.get("/", protect, getListings)
router.get("/:id", protect, getListing)
router.post("/", protect, upload.array("images", 4), createListing)
router.delete("/:id", protect, deleteListing)
router.patch("/:id/toggle", protect, toggleAvailability)

export default router