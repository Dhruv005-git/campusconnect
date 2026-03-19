import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"
import Navbar from "../components/layout/Navbar"
import api from "../api/axios"

export default function Profile() {
  const { user, login } = useAuth()
  const [listings, setListings] = useState([])
  const [notes, setNotes] = useState([])
  const [activeTab, setActiveTab] = useState("listings")
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    department: user?.department || "",
    year: user?.year || "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [listingsRes, notesRes] = await Promise.all([
        api.get("/listings"),
        api.get("/notes"),
      ])
      setListings(listingsRes.data.filter(l => l.seller?._id === user?._id))
      setNotes(notesRes.data.filter(n => n.uploader?._id === user?._id))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put("/auth/profile", formData)
      login(res.data, localStorage.getItem("token"))
      setEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteListing = async (id) => {
    if (!confirm("Delete this listing?")) return
    try {
      await api.delete(`/listings/${id}`)
      setListings(listings.filter(l => l._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteNote = async (id) => {
    if (!confirm("Delete this note?")) return
    try {
      await api.delete(`/notes/${id}`)
      setNotes(notes.filter(n => n._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const conditionColors = {
    new:  "bg-[#EEEDFE] text-[#3C3489]",
    good: "bg-[#EAF3DE] text-[#27500A]",
    fair: "bg-[#FAEEDA] text-[#633806]",
    poor: "bg-[#FCEBEB] text-[#791F1F]",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Profile card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-2xl font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                {editing ? (
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-lg font-medium border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-[#534AB7] mb-1"
                  />
                ) : (
                  <h1 className="text-xl font-medium text-gray-900">{user?.name}</h1>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] inline-block"></span>
                    Verified student
                  </span>
                  <span className="text-xs text-gray-400">{user?.college}</span>
                </div>
              </div>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm bg-[#534AB7] text-white px-3 py-1.5 rounded-lg hover:bg-[#3C3489] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                Edit profile
              </button>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="text-xs font-medium text-gray-900 truncate">{user?.email}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Department</p>
              {editing ? (
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="text-xs font-medium w-full outline-none bg-transparent"
                >
                  <option>Computer Science</option>
                  <option>Mechanical Engineering</option>
                  <option>Civil Engineering</option>
                  <option>Electrical Engineering</option>
                  <option>Chemical Engineering</option>
                  <option>Electronics & Communication</option>
                </select>
              ) : (
                <p className="text-xs font-medium text-gray-900">{user?.department}</p>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Year</p>
              {editing ? (
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="text-xs font-medium w-full outline-none bg-transparent"
                >
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              ) : (
                <p className="text-xs font-medium text-gray-900">Year {user?.year}</p>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Items sold</p>
              <p className="text-xs font-medium text-gray-900">{listings.length} listings</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "listings"
                ? "bg-[#534AB7] text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            My listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "notes"
                ? "bg-[#534AB7] text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            My notes ({notes.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : activeTab === "listings" ? (
          <div className="space-y-3">
            {listings.length === 0 ? (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-gray-500 text-sm mb-3">No listings yet</p>
                <Link to="/create-listing" className="text-sm text-[#534AB7] hover:underline">
                  Post your first item →
                </Link>
              </div>
            ) : (
              listings.map((listing) => (
                <div key={listing._id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#EEEDFE] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} className="w-full h-full object-cover rounded-xl" />
                    ) : "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                    <p className="text-xs text-gray-400">{listing.department} · Sem {listing.semester}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-[#3C3489]">₹{listing.price}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${conditionColors[listing.condition]}`}>
                        {listing.condition}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${listing.isAvailable ? "bg-[#EAF3DE] text-[#27500A]" : "bg-gray-100 text-gray-500"}`}>
                        {listing.isAvailable ? "Available" : "Sold"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      to={`/listings/${listing._id}`}
                      className="text-xs text-[#534AB7] border border-[#534AB7] px-2.5 py-1.5 rounded-lg hover:bg-[#EEEDFE] transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteListing(listing._id)}
                      className="text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-gray-500 text-sm mb-3">No notes uploaded yet</p>
                <Link to="/upload-note" className="text-sm text-[#534AB7] hover:underline">
                  Upload your first note →
                </Link>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note._id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#EEEDFE] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {note.fileType === "application/pdf" ? "📄" : "🖼️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{note.title}</p>
                    <p className="text-xs text-gray-400">{note.subject} · {note.department}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-[#EEEDFE] text-[#3C3489] px-2 py-0.5 rounded-full">
                        Sem {note.semester}
                      </span>
                      <span className="text-xs text-gray-400">{note.downloads} downloads</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}