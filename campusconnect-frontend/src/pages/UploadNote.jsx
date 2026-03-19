import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/layout/Navbar"
import api from "../api/axios"

export default function UploadNote() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "", description: "", subject: "",
    department: "", semester: "", type: "notes",
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setError("Please select a file")
    setLoading(true)
    setError("")
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([k, v]) => data.append(k, v))
      data.append("file", file)

      await api.post("/notes", data, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      navigate("/notes")
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">Upload resource</h1>
        <p className="text-sm text-gray-500 mb-6">Share notes or PYQs with your juniors</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* File upload */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <label className="text-sm font-medium text-gray-700 block mb-3">
              File <span className="text-gray-400 font-normal">(PDF or image, max 10MB)</span>
            </label>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#534AB7] transition-colors">
              {file ? (
                <div className="text-center">
                  <div className="text-2xl mb-1">{file.type === "application/pdf" ? "📄" : "🖼️"}</div>
                  <p className="text-sm text-gray-700 font-medium">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-1">📁</div>
                  <p className="text-sm text-gray-500">Click to upload PDF or image</p>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {/* Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Title</label>
              <input
                name="title" value={formData.title} onChange={handleChange}
                required placeholder="e.g. Fluid Mechanics Unit 3 Notes"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Subject</label>
              <input
                name="subject" value={formData.subject} onChange={handleChange}
                required placeholder="e.g. Fluid Mechanics"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Description</label>
              <textarea
                name="description" value={formData.description} onChange={handleChange}
                rows={2} placeholder="Brief description of what's covered..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Type</label>
                <select
                  name="type" value={formData.type} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] bg-white"
                >
                  <option value="notes">Notes</option>
                  <option value="pyq">PYQ</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Semester</label>
                <select
                  name="semester" value={formData.semester} onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] bg-white"
                >
                  <option value="">Select</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Department</label>
              <select
                name="department" value={formData.department} onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] bg-white"
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
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#534AB7] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#3C3489] transition-colors disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload resource"}
          </button>
        </form>
      </div>
    </div>
  )
}