import User from "../models/User.js"
import bcrypt from "bcryptjs"
import { generateOTP } from "../utils/generateOTP.js"
import { generateToken } from "../utils/generateToken.js"
import { sendOTPEmail } from "../config/mailer.js"

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, department, year } = req.body

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: "Email already registered" })
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }
    const emailDomain = email.split("@")[1]
    if (!emailDomain?.endsWith("pdpu.ac.in")) {
    return res.status(400).json({ 
      message: "Please use your PDPU college email ID (e.g. name@sot.pdpu.ac.in)" 
    })
  }

    const hashed = await bcrypt.hash(password, 10)
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

    const user = await User.create({
      name, email,
      password: hashed,
      department, year,
      otp, otpExpiry
    })

    try {
      await sendOTPEmail(email, otp, name)
    } catch (err) {
      // If SMTP fails/blocks, don't leave the request hanging.
      // The UI will show this message to the user.
      console.error("sendOTPEmail failed:", err?.message || err)
      return res.status(500).json({
        message: "Could not send OTP email. Please try again in a few minutes."
      })
    }

    res.status(201).json({
      message: "Registered! Check your email for OTP.",
      userId: user._id
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "User not found" })

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" })
    if (user.otpExpiry < new Date()) return res.status(400).json({ message: "OTP expired" })

    user.isVerified = true
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    const token = generateToken(user._id)
    res.json({ message: "Email verified!", token, user: {
      id: user._id, name: user.name, email: user.email,
      department: user.department, year: user.year
    }})
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: "User not found" })
    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email first" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: "Invalid password" })

    const token = generateToken(user._id)
    res.json({ token, user: {
      id: user._id, name: user.name, email: user.email,
      department: user.department, year: user.year
    }})
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get current user
export const getMe = async (req, res) => {
  res.json(req.user)
}

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { name, department, year } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department, year },
      { new: true }
    ).select("-password")
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}