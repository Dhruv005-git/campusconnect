import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  // Prevent "Send OTP..." from hanging forever if SMTP is blocked/misconfigured.
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
})

export const sendOTPEmail = async (toEmail, otp, name) => {
  const mailOptions = {
    from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your CampusConnect verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2 style="color: #534AB7;">Hey ${name}! 👋</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #534AB7; padding: 20px 0;">
          ${otp}
        </div>
        <p style="color: #888;">This code expires in 10 minutes.</p>
        <p style="color: #888;">— CampusConnect Team</p>
      </div>
    `,
  }

  // Fallback "hard timeout" even if SMTP library doesn't return in time.
  const timeoutMs = 12000
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("OTP email send timed out")), timeoutMs)
  })

  return Promise.race([transporter.sendMail(mailOptions), timeoutPromise])
}