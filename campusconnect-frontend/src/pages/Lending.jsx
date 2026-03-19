import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/layout/Navbar"
import api from "../api/axios"

const categoryEmoji = {
  calculator: "🔢", lab: "🧪", books: "📚",
  tools: "🔧", electronics: "💻", other: "📦",
}

const DEPARTMENTS = ["All", "Computer Science", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Chemical Engineering", "Electronics & Communication"]

export default function Lending() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("browse")
  const [myRequests, setMyRequests] = useState([])
  const [itemRequests, setItemRequests] = useState([])
  const [department, setDepartment] = useState("All")
  const [availableOnly, setAvailableOnly] = useState(false)

  useEffect(() => {
    if (activeTab === "browse") fetchItems()
    if (activeTab === "my-requests") fetchMyRequests()
    if (activeTab === "item-requests") fetchItemRequests()
  }, [activeTab, department, availableOnly])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {}
      if (department !== "All") params.department = department
      if (availableOnly) params.available = true
      const res = await api.get("/lend", { params })
      setItems(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyRequests = async () => {
    setLoading(true)
    try {
      const res = await api.get("/lend/my-requests")
      setMyRequests(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchItemRequests = async () => {
    setLoading(true)
    try {
      const res = await api.get("/lend/item-requests")
      setItemRequests(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestUpdate = async (requestId, status) => {
    try {
      await api.patch(`/lend/requests/${requestId}`, { status })
      fetchItemRequests()
    } catch (err) {
      console.error(err)
    }
  }

  const statusConfig = {
    pending:  { label: "Pending",  bg: "bg-[#FAEEDA]", text: "text-[#633806]" },
    approved: { label: "Approved", bg: "bg-[#EAF3DE]", text: "text-[#27500A]" },
    rejected: { label: "Rejected", bg: "bg-[#FCEBEB]", text: "text-[#791F1F]" },
    returned: { label: "Returned", bg: "bg-[#EEEDFE]", text: "text-[#3C3489]" },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-gray-900 mb-1">Lending</h1>
            <p className="text-sm text-gray-500">Borrow or lend academic items temporarily</p>
          </div>
          <Link
            to="/lend/create"
            className="flex items-center gap-1.5 bg-[#534AB7] text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-[#3C3489] transition-colors"
          >
            <span>+</span> Lend an item
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {[
            { key: "browse", label: "Browse items" },
            { key: "my-requests", label: "My requests" },
            { key: "item-requests", label: "Requests for me" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-[#534AB7] text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Browse tab */}
        {activeTab === "browse" && (
          <>
            {/* Filters */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Department:</span>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white focus:border-[#534AB7]"
                >
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${availableOnly ? "bg-[#534AB7]" : "bg-gray-200"}`}
                >
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${availableOnly ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-xs text-gray-600">Available only</span>
              </label>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl h-48 animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-500 text-sm mb-3">No items available</p>
                <Link to="/lend/create" className="text-sm text-[#534AB7] hover:underline">
                  Be the first to lend an item!
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item) => (
                  <LendCard key={item._id} item={item} currentUser={user} />
                ))}
              </div>
            )}
          </>
        )}

        {/* My requests tab */}
        {activeTab === "my-requests" && (
          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl h-24 animate-pulse" />
              ))
            ) : myRequests.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-gray-500 text-sm">No borrow requests sent yet</p>
              </div>
            ) : (
              myRequests.map((req) => {
                const status = statusConfig[req.status]
                return (
                  <div key={req._id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#EEEDFE] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {categoryEmoji[req.item?.category] || "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{req.item?.title}</p>
                      <p className="text-xs text-gray-400">
                        From {req.owner?.name} · {req.duration} days
                      </p>
                      {req.returnDate && (
                        <p className="text-xs text-gray-400">
                          Return by {new Date(req.returnDate).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Item requests tab */}
        {activeTab === "item-requests" && (
          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl h-24 animate-pulse" />
              ))
            ) : itemRequests.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-gray-500 text-sm">No requests received yet</p>
              </div>
            ) : (
              itemRequests.map((req) => {
                const status = statusConfig[req.status]
                return (
                  <div key={req._id} className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-[#EEEDFE] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {categoryEmoji[req.item?.category] || "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{req.item?.title}</p>
                        <p className="text-xs text-gray-400">
                          {req.borrower?.name} · {req.borrower?.department} · Year {req.borrower?.year}
                        </p>
                        <p className="text-xs text-gray-400">Wants for {req.duration} days</p>
                        {req.message && (
                          <p className="text-xs text-gray-600 mt-1 italic">"{req.message}"</p>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>
                    {req.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestUpdate(req._id, "approved")}
                          className="flex-1 bg-[#534AB7] text-white py-2 rounded-lg text-xs font-medium hover:bg-[#3C3489] transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequestUpdate(req._id, "rejected")}
                          className="flex-1 border border-red-200 text-red-500 py-2 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {req.status === "approved" && (
                      <button
                        onClick={() => handleRequestUpdate(req._id, "returned")}
                        className="w-full border border-[#534AB7] text-[#534AB7] py-2 rounded-lg text-xs font-medium hover:bg-[#EEEDFE] transition-colors"
                      >
                        Mark as returned
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function LendCard({ item, currentUser }) {
  const [showModal, setShowModal] = useState(false)
  const [duration, setDuration] = useState(3)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const emoji = categoryEmoji[item.category] || "📦"
  const isOwner = currentUser?._id === item.owner?._id

  const handleBorrow = async () => {
    setLoading(true)
    try {
      await api.post(`/lend/${item._id}/borrow`, { duration, message })
      setSuccess(true)
      setShowModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#534AB7] transition-all">
        <div className="h-32 bg-[#EEEDFE] flex items-center justify-center text-5xl">
          {item.images?.[0] ? (
            <img src={item.images[0]} className="w-full h-full object-cover" alt={item.title} />
          ) : (
            <span>{emoji}</span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
              item.isAvailable ? "bg-[#EAF3DE] text-[#27500A]" : "bg-gray-100 text-gray-500"
            }`}>
              {item.isAvailable ? "Available" : "Borrowed"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-1">{item.department}</p>
          <p className="text-xs text-gray-400 mb-3">
            Up to {item.maxDuration} days · {item.owner?.name}
          </p>
          {isOwner ? (
            <div className="text-xs text-center text-[#534AB7] bg-[#EEEDFE] py-2 rounded-lg font-medium">
              Your item
            </div>
          ) : success ? (
            <div className="text-xs text-center text-[#27500A] bg-[#EAF3DE] py-2 rounded-lg font-medium">
              Request sent! ✓
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              disabled={!item.isAvailable}
              className="w-full bg-[#534AB7] text-white py-2 rounded-lg text-xs font-medium hover:bg-[#3C3489] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {item.isAvailable ? "Request to borrow" : "Not available"}
            </button>
          )}
        </div>
      </div>

      {/* Borrow modal */}
      {showModal && (
        <div
          style={{ minHeight: "400px", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}
          className="fixed inset-0 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-1">Borrow request</h3>
            <p className="text-sm text-gray-500 mb-4">{item.title}</p>

            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">
                Duration: <span className="font-medium text-gray-900">{duration} days</span>
              </label>
              <input
                type="range"
                min={1}
                max={item.maxDuration}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 day</span>
                <span>{item.maxDuration} days max</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-sm text-gray-600 mb-1 block">Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Why do you need this item?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#534AB7] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBorrow}
                disabled={loading}
                className="flex-1 bg-[#534AB7] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3C3489] disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}