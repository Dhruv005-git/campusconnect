import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Register from "./pages/Register"
import Login from "./pages/Login"
import VerifyOTP from "./pages/VerifyOTP"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  )

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/" element={
        <ProtectedRoute>
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-medium text-gray-900">
              Home page coming soon! 🚀
            </h1>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  )
}