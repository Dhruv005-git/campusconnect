import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/layout/Navbar"
import api from "../api/axios"

const conditionConfig = {
  new:  { label: "Like new", bg: "bg-[#EEEDFE]", text: "text-[#3C3489]" },
  good: { label: "Good",     bg: "bg-[#EAF3DE]", text: "text-[#27500A]" },
  fair: { label: "Fair",     bg: "bg-[#FAEEDA]", text: "text-[#633806]" },
  poor: { label: "Poor",     bg: "bg-[#FCEBEB]", text: "text-[#791F1F]" },
}

const categoryEmoji = {
  textbook: "📘", calculator: "🔢", lab: "🧪",
  electronics: "💻", stationery: "✏️", other: "📦",
}

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`)
        setListing(res.data)
      } catch {
        navigate("/")
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl h-96 animate-pulse" />
      </div>
    </div>
  )

  if (!listing) return null

  const condition = conditionConfig[listing.condition] || conditionConfig.good
  const emoji = categoryEmoji[listing.category] || "📦"
  const discount = listing.mrp
    ? Math.round(((listing.mrp - listing.price) / listing.mrp) * 100)
    : null
  const isOwner = user?._id === listing.seller?._id

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">

          <div className="h-64 bg-[#EEEDFE] flex items-center justify-center">
            {listing.images?.length > 0 ? (
              <img src={listing.images[activeImg]} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl">{emoji}</span>
            )}
          </div>

          {listing.images?.length > 1 && (
            <div className="flex gap-2 p-3">
              {listing.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`thumbnail-${i}`}
                  onClick={() => setActiveImg(i)}
                  className={`w-12 h-12 object-cover rounded-lg cursor-pointer border-2 transition-colors ${
                    activeImg === i ? "border-[#534AB7]" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="p-5">

            <div className="flex gap-2 flex-wrap mb-3">
              <span className="text-xs bg-[#EEEDFE] text-[#3C3489] px-2.5 py-1 rounded-full font-medium">
                {listing.department}
              </span>
              <span className="text-xs bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full font-medium">
                Sem {listing.semester}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${condition.bg} ${condition.text}`}>
                {condition.label}
              </span>
            </div>

            <h1 className="text-xl font-medium text-gray-900 mb-1">{listing.title}</h1>
            <p className="text-sm text-gray-500 mb-4">{listing.description}</p>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-medium text-[#3C3489]">₹{listing.price}</span>
              {listing.mrp && (
                <span className="text-sm text-gray-400 line-through">₹{listing.mrp}</span>
              )}
              {discount && discount > 0 && (
                <span className="text-xs bg-[#EAF3DE] text-[#27500A] px-2 py-0.5 rounded-full">
                  {discount}% off
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 mb-5">
              Posted {new Date(listing.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              })}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                ["Category", listing.category],
                ["Department", listing.department],
                ["Semester", `Sem ${listing.semester}`],
                ["Condition", condition.label],
              ].map(([key, val]) => (
                <div key={key} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{key}</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{val}</p>
                </div>
              ))}
            </div>

            <div className="border border-gray-200 rounded-xl p-4 mb-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Seller</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#534AB7] flex items-center justify-center text-white font-medium">
                  {listing.seller?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{listing.seller?.name}</p>
                  <p className="text-xs text-gray-400">
                    {listing.seller?.department} · Year {listing.seller?.year}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] inline-block"></span>
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {isOwner ? (
              <div className="bg-[#EEEDFE] rounded-xl p-3 text-center">
                <p className="text-sm text-[#3C3489] font-medium">This is your listing</p>
              </div>
            ) : (
              <div className="flex gap-3">
                
                <a href={`mailto:${listing.seller?.email}?subject=Interested in ${listing.title}`}
                  className="flex-1 border border-[#534AB7] text-[#534AB7] rounded-xl py-3 text-sm font-medium text-center hover:bg-[#EEEDFE] transition-colors"
                >
                  Contact seller
                </a>
                <button className="flex-1 bg-[#534AB7] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#3C3489] transition-colors">
                  Buy now
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}