import express from "express"
import { register, verifyOTP, login, getMe, updateProfile } from "../controllers/auth.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/register", register)
router.post("/verify-otp", verifyOTP)
router.post("/login", login)
router.get("/me", protect, getMe)
router.put("/profile", protect, updateProfile)

export default router