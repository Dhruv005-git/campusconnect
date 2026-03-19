import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Register from "./pages/Register"
import Login from "./pages/Login"
import VerifyOTP from "./pages/VerifyOTP"
import Marketplace from "./pages/Marketplace"
import ListingDetail from "./pages/ListingDetail"
import CreateListing from "./pages/CreateListing"
import Notes from "./pages/Notes"
import UploadNote from "./pages/UploadNote"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  const { loading } = useAuth()

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
      <Route path="/" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
      <Route path="/listings/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
      <Route path="/create-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
      <Route path="/upload-note" element={<ProtectedRoute><UploadNote /></ProtectedRoute>} />
    </Routes>
  )
}