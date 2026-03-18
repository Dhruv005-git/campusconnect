import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
})

export const sendOTPEmail = async (toEmail, otp, name) => {
  await transporter.sendMail({
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
    `
  })
}