import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/layout/Navbar"
import api from "../api/axios"

export default function CreateListing() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "", description: "", price: "",
    mrp: "", condition: "good", category: "textbook",
    department: "", semester: "",
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 4)
    setImages(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([k, v]) => data.append(k, v))
      images.forEach((img) => data.append("images", img))

      await api.post("/listings", data, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      navigate("/")
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
        <h1 className="text-2xl font-medium text-gray-900 mb-1">Post an item</h1>
        <p className="text-sm text-gray-500 mb-6">List something for your fellow students</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Images */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <label className="text-sm font-medium text-gray-700 block mb-3">
              Photos <span className="text-gray-400 font-normal">(up to 4)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {previews.map((src, i) => (
                <img key={i} src={src} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
              ))}
              <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#534AB7] transition-colors">
                <span className="text-2xl text-gray-400">+</span>
                <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
              </label>
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Item title</label>
              <input
                name="title" value={formData.title} onChange={handleChange}
                required placeholder="e.g. Engineering Maths Vol.2"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Description</label>
              <textarea
                name="description" value={formData.description} onChange={handleChange}
                rows={3} placeholder="Condition details, edition, pickup location..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Your price (₹)</label>
                <input
                  name="price" value={formData.price} onChange={handleChange}
                  required type="number" placeholder="180"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Original MRP (₹)</label>
                <input
                  name="mrp" value={formData.mrp} onChange={handleChange}
                  type="number" placeholder="650"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Condition</label>
                <select
                  name="condition" value={formData.condition} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] bg-white"
                >
                  <option value="new">Like new</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Category</label>
                <select
                  name="category" value={formData.category} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] bg-white"
                >
                  <option value="textbook">Textbook</option>
                  <option value="calculator">Calculator</option>
                  <option value="lab">Lab equipment</option>
                  <option value="electronics">Electronics</option>
                  <option value="stationery">Stationery</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Department</label>
                <select
                  name="department" value={formData.department} onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] bg-white"
                >
                  <option value="">Select</option>
                  <option>Computer Science</option>
                  <option>Mechanical Engineering</option>
                  <option>Civil Engineering</option>
                  <option>Electrical Engineering</option>
                  <option>Chemical Engineering</option>
                  <option>Electronics & Communication</option>
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
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#534AB7] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#3C3489] transition-colors disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post listing"}
          </button>
        </form>
      </div>
    </div>
  )
}