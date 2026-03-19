import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/layout/Navbar"
import api from "../api/axios"

const DEPARTMENTS = ["All", "Computer Science", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Chemical Engineering", "Electronics & Communication"]

const typeConfig = {
  notes:      { label: "Notes",      bg: "bg-[#EEEDFE]", text: "text-[#3C3489]" },
  pyq:        { label: "PYQ",        bg: "bg-[#FAEEDA]", text: "text-[#633806]" },
  assignment: { label: "Assignment", bg: "bg-[#E1F5EE]", text: "text-[#085041]" },
  project:    { label: "Project",    bg: "bg-[#EAF3DE]", text: "text-[#27500A]" },
}

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("All")
  const [semester, setSemester] = useState("All")
  const [type, setType] = useState("All")

  useEffect(() => {
    fetchNotes()
  }, [department, semester, type])

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const params = {}
      if (department !== "All") params.department = department
      if (semester !== "All") params.semester = semester
      if (type !== "All") params.type = type
      if (search) params.search = search

      const res = await api.get("/notes", { params })
      setNotes(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchNotes()
  }

  const handleDownload = async (note) => {
    try {
      await api.patch(`/notes/${note._id}/download`)
      window.open(note.fileUrl, "_blank")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-gray-900 mb-1">Academic resources</h1>
          <p className="text-sm text-gray-500">Notes, PYQs and study material shared by seniors</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400 flex-shrink-0">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject, title..."
              className="flex-1 text-sm outline-none bg-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="bg-[#534AB7] text-white px-4 rounded-xl text-sm font-medium hover:bg-[#3C3489] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Type filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {["All", "notes", "pyq", "assignment", "project"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                type === t
                  ? "bg-[#534AB7] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#534AB7]"
              }`}
            >
              {t === "All" ? "All types" : typeConfig[t]?.label}
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Department:</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white text-gray-700 focus:border-[#534AB7]"
            >
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Semester:</span>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white text-gray-700 focus:border-[#534AB7]"
            >
              <option>All</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>
          <div className="ml-auto">
            <Link
              to="/upload-note"
              className="flex items-center gap-1.5 bg-[#534AB7] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#3C3489] transition-colors"
            >
              <span>+</span> Upload note
            </Link>
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4">
          {loading ? "Loading..." : `${notes.length} resources found`}
        </p>

        {/* Notes grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500 text-sm">No resources found</p>
            <Link to="/upload-note" className="inline-block mt-3 text-sm text-[#534AB7] hover:underline">
              Be the first to upload!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} onDownload={handleDownload} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NoteCard({ note, onDownload }) {
  const type = typeConfig[note.type] || typeConfig.notes
  const isPDF = note.fileType === "application/pdf"

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-[#534AB7] transition-all">

      {/* Icon + type */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-[#EEEDFE] rounded-xl flex items-center justify-center text-xl">
          {isPDF ? "📄" : "🖼️"}
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${type.bg} ${type.text}`}>
          {type.label}
        </span>
      </div>

      {/* Info */}
      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{note.title}</h3>
      <p className="text-xs text-gray-400 mb-1">{note.subject}</p>
      <p className="text-xs text-gray-400 mb-3">
        {note.department} · Sem {note.semester}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-700">{note.uploader?.name}</p>
          <p className="text-xs text-gray-400">Year {note.uploader?.year}</p>
        </div>
        <button
          onClick={() => onDownload(note)}
          className="flex items-center gap-1.5 bg-[#534AB7] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#3C3489] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {note.downloads} downloads
        </button>
      </div>
    </div>
  )
}