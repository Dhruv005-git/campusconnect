import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"

export default function VerifyOTP() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const userId = localStorage.getItem("pendingUserId")
      const res = await api.post("/auth/verify-otp", { userId, otp })
      localStorage.removeItem("pendingUserId")
      login(res.data.user, res.data.token)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-3 h-3 rounded-full bg-[#534AB7]"></div>
          <span className="text-xl font-medium text-gray-900">CampusConnect</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="w-12 h-12 bg-[#EEEDFE] rounded-xl flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 className="text-2xl font-medium text-gray-900 mb-1">Check your email</h1>
          <p className="text-sm text-gray-500 mb-6">Enter the 6-digit code we sent you</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">OTP code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                placeholder="123456"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors tracking-widest text-center text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#534AB7] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#3C3489] transition-colors disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}