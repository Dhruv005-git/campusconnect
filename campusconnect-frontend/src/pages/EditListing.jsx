import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/layout/Navbar"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"

const INPUT_CLS =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors bg-white"
const LABEL_CLS = "text-sm text-gray-600 mb-1 block font-medium"

export default function EditListing() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "", description: "", price: "", mrp: "",
    condition: "good", category: "textbook", department: "", semester: "",
  })

  // Existing images still hosted on Cloudinary that the user wants to keep
  const [existingImages, setExistingImages] = useState([])
  // Brand-new local files selected by the user
  const [newFiles, setNewFiles] = useState([])
  const [newPreviews, setNewPreviews] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // ── fetch current listing ──────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/listings/${id}`)
        const l = res.data
        // Redirect if not the owner
        if (l.seller?._id !== user?._id) {
          navigate(`/listings/${id}`)
          return
        }
        setFormData({
          title:       l.title       ?? "",
          description: l.description ?? "",
          price:       l.price       ?? "",
          mrp:         l.mrp         ?? "",
          condition:   l.condition   ?? "good",
          category:    l.category    ?? "textbook",
          department:  l.department  ?? "",
          semester:    l.semester    ?? "",
        })
        setExistingImages(l.images ?? [])
      } catch {
        navigate("/marketplace")
      } finally {
        setLoading(false)
      }
    }
    if (user) fetch()
  }, [id, user])

  // ── handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleNewFiles = (e) => {
    const slots = 4 - existingImages.length
    const files = Array.from(e.target.files).slice(0, Math.max(0, slots))
    setNewFiles(files)
    setNewPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  const removeExisting = (url) =>
    setExistingImages((prev) => prev.filter((u) => u !== url))

  const removeNew = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx))
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const totalImages = existingImages.length + newFiles.length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.price || !formData.department || formData.semester === "") {
      setError("Please fill in all required fields.")
      return
    }
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([k, v]) => data.append(k, v))
      // Tell the backend which existing URLs to keep
      data.append("keepImages", JSON.stringify(existingImages))
      newFiles.forEach((f) => data.append("images", f))

      const res = await api.put(`/listings/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setSuccess("Listing updated!")
      setTimeout(() => navigate(`/listings/${id}`), 900)
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  // ── loading skeleton ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-white border border-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <button
          onClick={() => navigate(`/listings/${id}`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to listing
        </button>

        <h1 className="text-2xl font-medium text-gray-900 mb-1">Edit listing</h1>
        <p className="text-sm text-gray-500 mb-6">Update your listing details and photos</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 4" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Images section ─────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Photos <span className="text-gray-400 font-normal">({totalImages}/4)</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Click ✕ to remove a photo. Add new ones with the + button.
            </p>

            <div className="flex gap-2 flex-wrap">
              {/* Existing images */}
              {existingImages.map((url, i) => (
                <div key={url} className="relative group">
                  <img
                    src={url}
                    alt={`img-${i}`}
                    className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeExisting(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* New file previews */}
              {newPreviews.map((src, i) => (
                <div key={i} className="relative group">
                  <img
                    src={src}
                    alt={`new-${i}`}
                    className="w-16 h-16 object-cover rounded-xl border-2 border-[#534AB7]"
                  />
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-[#534AB7] text-white rounded-b-xl py-0.5">
                    new
                  </span>
                </div>
              ))}

              {/* Add button — only show if under 4 total */}
              {totalImages < 4 && (
                <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#534AB7] transition-colors">
                  <span className="text-2xl text-gray-400">+</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewFiles}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* ── Basic info ──────────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div>
              <label className={LABEL_CLS}>Item title <span className="text-red-400">*</span></label>
              <input
                name="title" value={formData.title} onChange={handleChange}
                required placeholder="e.g. Engineering Maths Vol.2"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Description</label>
              <textarea
                name="description" value={formData.description} onChange={handleChange}
                rows={3} placeholder="Condition details, edition, pickup info..."
                className={`${INPUT_CLS} resize-none`}
              />
            </div>
          </div>

          {/* ── Pricing ─────────────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Your price (₹) <span className="text-red-400">*</span></label>
                <input
                  name="price" value={formData.price} onChange={handleChange}
                  required type="number" min="0" placeholder="180"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Original MRP (₹)</label>
                <input
                  name="mrp" value={formData.mrp} onChange={handleChange}
                  type="number" min="0" placeholder="650"
                  className={INPUT_CLS}
                />
              </div>
            </div>
          </div>

          {/* ── Details ─────────────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Condition</label>
                <select name="condition" value={formData.condition} onChange={handleChange} className={INPUT_CLS}>
                  <option value="new">Like new</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className={INPUT_CLS}>
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
                <label className={LABEL_CLS}>Department <span className="text-red-400">*</span></label>
                <select name="department" value={formData.department} onChange={handleChange} required className={INPUT_CLS}>
                  <option value="">Select</option>
                  <option value="All">All departments</option>
                  <option>CS</option>
                  <option>EC</option>
                  <option>ME</option>
                  <option>CE</option>
                  <option>CH</option>
                  <option>BT</option>
                  <option>ICT</option>
                  <option>EE</option>
                  <option>Computer Science</option>
                  <option>Mechanical Engineering</option>
                  <option>Civil Engineering</option>
                  <option>Electrical Engineering</option>
                  <option>Chemical Engineering</option>
                  <option>Electronics &amp; Communication</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Semester <span className="text-red-400">*</span></label>
                <select name="semester" value={formData.semester} onChange={handleChange} required className={INPUT_CLS}>
                  <option value="">Select</option>
                  <option value="0">All semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Availability toggle ─────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Listing status</p>
              <p className="text-xs text-gray-400 mt-0.5">Toggle after saving if item is sold or back in stock</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/listings/${id}`)}
              className="text-xs text-[#534AB7] hover:underline"
            >
              Manage on detail page →
            </button>
          </div>

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/listings/${id}`)}
              className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#534AB7] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#3C3489] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70" />
                  </svg>
                  Saving…
                </>
              ) : "Save changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
