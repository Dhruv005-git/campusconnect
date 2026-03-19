import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/layout/Navbar"
import ListingCard from "../components/marketplace/ListingCard"
import api from "../api/axios"

const CATEGORIES = ["All", "textbook", "calculator", "lab", "electronics", "stationery", "other"]
const DEPARTMENTS = ["All", "Computer Science", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Chemical Engineering", "Electronics & Communication"]

export default function Marketplace() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [department, setDepartment] = useState("All")

  useEffect(() => {
    fetchListings()
  }, [category, department])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = {}
      if (category !== "All") params.category = category
      if (department !== "All") params.department = department
      if (search) params.search = search

      const res = await api.get("/listings", { params })
      setListings(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchListings()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Hero */}
        <div className="mb-6">
          <p className="text-xs font-medium text-[#534AB7] uppercase tracking-wider mb-1">
            {user?.college || "SVNIT Surat"}
          </p>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">
            Campus marketplace
          </h1>
          <p className="text-sm text-gray-500">
            Buy and sell academic resources within your campus
          </p>
        </div>

        {/* Search bar */}
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
              placeholder="Search textbooks, calculators..."
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

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? "bg-[#534AB7] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#534AB7]"
              }`}
            >
              {cat === "All" ? "All items" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Department filter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-gray-500">Department:</span>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white text-gray-700 focus:border-[#534AB7]"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">
            {loading ? "Loading..." : `${listings.length} items found`}
          </span>
          <Link
            to="/create-listing"
            className="ml-auto flex items-center gap-1.5 bg-[#534AB7] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#3C3489] transition-colors"
          >
            <span>+</span> Post item
          </Link>
        </div>

        {/* Listings grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500 text-sm">No listings found</p>
            <Link
              to="/create-listing"
              className="inline-block mt-3 text-sm text-[#534AB7] hover:underline"
            >
              Be the first to post!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}