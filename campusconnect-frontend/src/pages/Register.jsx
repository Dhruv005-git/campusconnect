import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../api/axios"

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    year: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/auth/register", formData)
      // userId save karo OTP page ke liye
      localStorage.setItem("pendingUserId", res.data.userId)
      navigate("/verify-otp")
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-3 h-3 rounded-full bg-[#534AB7]"></div>
          <span className="text-xl font-medium text-gray-900">CampusConnect</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Create account</h1>
          <p className="text-sm text-gray-500 mb-6">Join your campus marketplace</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Full name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Rahul Krishnan"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">College email ID</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@sot.pdpu.ac.in"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min 6 characters"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors bg-white"
              >
                <option value="">Select department</option>
                <option>Computer Science</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
                <option>Electrical Engineering</option>
                <option>Chemical Engineering</option>
                <option>Electronics & Communication</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors bg-white"
              >
                <option value="">Select year</option>
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#534AB7] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#3C3489] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Sending OTP..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#534AB7] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}