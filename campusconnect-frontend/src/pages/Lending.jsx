import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/layout/Navbar"
import api from "../api/axios"

// ─── helpers ─────────────────────────────────────────────────────────────────
const categoryEmoji = {
  calculator: "🔢", lab: "🧪", books: "📚",
  tools: "🔧", electronics: "💻", other: "📦",
}

const DEPARTMENTS = [
  "All", "CS", "EC", "ME", "CE", "CH", "BT", "ICT", "EE",
  "Computer Science", "Mechanical Engineering", "Civil Engineering",
  "Electrical Engineering", "Chemical Engineering", "Electronics & Communication",
]

const STATUS = {
  pending:  { label: "Pending",  bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400"  },
  approved: { label: "Approved", bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500"  },
  rejected: { label: "Rejected", bg: "bg-red-50",     text: "text-red-600",    border: "border-red-200",    dot: "bg-red-400"    },
  returned: { label: "Returned", bg: "bg-[#EEEDFE]",  text: "text-[#3C3489]",  border: "border-[#C8C4F5]",  dot: "bg-[#534AB7]"  },
}

function StatusPill({ status }) {
  const cfg = STATUS[status] || STATUS.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────
export default function Lending() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("browse")

  // browse
  const [items, setItems]           = useState([])
  const [browseLoading, setBrowseLoading] = useState(true)
  const [department, setDepartment] = useState("All")
  const [availableOnly, setAvailableOnly] = useState(false)

  // my requests (as borrower)
  const [myRequests, setMyRequests] = useState([])
  const [myReqLoading, setMyReqLoading] = useState(false)

  // incoming requests (as owner)
  const [incomingReqs, setIncomingReqs] = useState([])
  const [incomingLoading, setIncomingLoading] = useState(false)

  // badge count for incoming tab
  const [pendingCount, setPendingCount] = useState(0)

  // ── data fetchers ──────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setBrowseLoading(true)
    try {
      const params = {}
      if (department !== "All") params.department = department
      if (availableOnly) params.available = true
      const res = await api.get("/lend", { params })
      setItems(res.data)
    } catch (err) { console.error(err) }
    finally { setBrowseLoading(false) }
  }, [department, availableOnly])

  const fetchMyRequests = useCallback(async () => {
    setMyReqLoading(true)
    try {
      const res = await api.get("/lend/my-requests")
      setMyRequests(res.data)
    } catch (err) { console.error(err) }
    finally { setMyReqLoading(false) }
  }, [])

  const fetchIncoming = useCallback(async () => {
    setIncomingLoading(true)
    try {
      const res = await api.get("/lend/item-requests")
      setIncomingReqs(res.data)
      setPendingCount(res.data.filter(r => r.status === "pending").length)
    } catch (err) { console.error(err) }
    finally { setIncomingLoading(false) }
  }, [])

  // initial load & re-fetch on tab switch
  useEffect(() => {
    if (activeTab === "browse")   fetchItems()
    if (activeTab === "mine")     fetchMyRequests()
    if (activeTab === "incoming") fetchIncoming()
  }, [activeTab, department, availableOnly])

  // always keep pending badge fresh
  useEffect(() => {
    fetchIncoming()
  }, [])

  // ── owner actions ─────────────────────────────────────────────────────────
  const handleAction = async (requestId, status) => {
    try {
      await api.patch(`/lend/requests/${requestId}`, { status })
      fetchIncoming()
      fetchItems() // refresh availability badges in browse
    } catch (err) { console.error(err) }
  }

  // ─────────────────────────────────────────────────────────────────────────
  const tabs = [
    { key: "browse",   label: "Browse items" },
    { key: "mine",     label: "My requests" },
    { key: "incoming", label: "Requests for me", badge: pendingCount },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-gray-900 mb-1">Lending</h1>
            <p className="text-sm text-gray-500">Borrow or lend academic items temporarily</p>
          </div>
          <Link
            to="/lend/create"
            className="flex items-center gap-1.5 bg-[#534AB7] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3C3489] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Lend an item
          </Link>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? "bg-[#534AB7] text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold leading-none ${
                  activeTab === tab.key ? "bg-white text-[#534AB7]" : "bg-[#534AB7] text-white"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB: BROWSE
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "browse" && (
          <>
            {/* Filters */}
            <div className="flex items-center gap-4 mb-5 flex-wrap">
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
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${availableOnly ? "bg-[#534AB7]" : "bg-gray-200"}`}
                >
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${availableOnly ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-xs text-gray-600">Available only</span>
              </label>
            </div>

            {browseLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl h-52 animate-pulse" />
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
                  <LendCard
                    key={item._id}
                    item={item}
                    currentUser={user}
                    onRequestSent={() => {
                      fetchMyRequests()
                      fetchIncoming()
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: MY REQUESTS (borrower view)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "mine" && (
          <div className="space-y-3">
            {myReqLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl h-24 animate-pulse" />
              ))
            ) : myRequests.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500 text-sm mb-2">You haven't sent any borrow requests yet.</p>
                <button onClick={() => setActiveTab("browse")} className="text-sm text-[#534AB7] hover:underline">
                  Browse items to borrow →
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-2">{myRequests.length} request{myRequests.length !== 1 ? "s" : ""} sent</p>
                {myRequests.map((req) => (
                  <MyRequestCard key={req._id} req={req} />
                ))}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: INCOMING REQUESTS (owner view)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "incoming" && (
          <div className="space-y-3">
            {incomingLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl h-28 animate-pulse" />
              ))
            ) : incomingReqs.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
                <div className="text-4xl mb-3">🤝</div>
                <p className="text-gray-500 text-sm mb-2">No borrow requests received yet.</p>
                <Link to="/lend/create" className="text-sm text-[#534AB7] hover:underline">
                  Lend an item to get started →
                </Link>
              </div>
            ) : (
              <>
                {/* summary strip */}
                <div className="flex gap-3 mb-2">
                  {["pending","approved","rejected","returned"].map(s => {
                    const count = incomingReqs.filter(r => r.status === s).length
                    if (!count) return null
                    const cfg = STATUS[s]
                    return (
                      <span key={s} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {count} {cfg.label}
                      </span>
                    )
                  })}
                </div>

                {incomingReqs.map((req) => (
                  <IncomingRequestCard key={req._id} req={req} onAction={handleAction} />
                ))}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// ─── MY REQUEST CARD (borrower side) ─────────────────────────────────────────
function MyRequestCard({ req }) {
  const emoji = categoryEmoji[req.item?.category] || "📦"
  const cfg = STATUS[req.status] || STATUS.pending

  return (
    <div className={`bg-white border rounded-2xl p-4 transition-all ${
      req.status === "pending" ? "border-gray-200" : `border-2 ${cfg.border}`
    }`}>
      <div className="flex items-start gap-4">
        {/* image/emoji */}
        <div className="w-12 h-12 bg-[#EEEDFE] rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
          {req.item?.images?.[0]
            ? <img src={req.item.images[0]} className="w-full h-full object-cover" alt={req.item.title} />
            : emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">{req.item?.title}</p>
            <StatusPill status={req.status} />
          </div>
          <p className="text-xs text-gray-400">Owner: <span className="font-medium text-gray-600">{req.owner?.name}</span> · {req.owner?.department}</p>
          <p className="text-xs text-gray-400 mt-0.5">Requested for <span className="font-medium text-gray-600">{req.duration} days</span></p>

          {/* status-specific info */}
          {req.status === "approved" && req.returnDate && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Approved! Return by <strong className="ml-1">{new Date(req.returnDate).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</strong>
            </div>
          )}
          {req.status === "rejected" && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Request was declined by the owner
            </div>
          )}
          {req.status === "returned" && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#534AB7] bg-[#EEEDFE] border border-[#C8C4F5] rounded-lg px-3 py-1.5">
              ✓ Completed — item returned
            </div>
          )}
          {req.status === "pending" && (
            <p className="mt-2 text-xs text-amber-600">⏳ Waiting for owner to respond…</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── INCOMING REQUEST CARD (owner side) ──────────────────────────────────────
function IncomingRequestCard({ req, onAction }) {
  const emoji = categoryEmoji[req.item?.category] || "📦"
  const [acting, setActing] = useState(null) // "approved" | "rejected" | "returned"

  const act = async (status) => {
    setActing(status)
    await onAction(req._id, status)
    setActing(null)
  }

  return (
    <div className={`bg-white border rounded-2xl p-4 transition-all ${
      req.status === "pending" ? "border-[#C8C4F5]" : "border-gray-200"
    }`}>
      <div className="flex items-start gap-4 mb-3">
        {/* item image */}
        <div className="w-14 h-14 bg-[#EEEDFE] rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
          {req.item?.images?.[0]
            ? <img src={req.item.images[0]} className="w-full h-full object-cover" alt={req.item.title} />
            : emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{req.item?.title}</p>
            <StatusPill status={req.status} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{req.item?.department}</p>
        </div>
      </div>

      {/* borrower info card */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {req.borrower?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{req.borrower?.name}</p>
            <p className="text-xs text-gray-400">{req.borrower?.department} · Year {req.borrower?.year}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#534AB7]">{req.duration} days</p>
            <p className="text-xs text-gray-400">requested</p>
          </div>
        </div>

        {req.message && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 italic">"{req.message}"</p>
          </div>
        )}
      </div>

      {/* approved: show return date */}
      {req.status === "approved" && req.returnDate && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-3">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Item is out with borrower · Due back by <strong className="ml-1">{new Date(req.returnDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</strong>
        </div>
      )}

      {/* ACTION BUTTONS */}
      {req.status === "pending" && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => act("approved")}
            disabled={!!acting}
            className="flex items-center justify-center gap-1.5 bg-[#534AB7] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3C3489] transition-colors disabled:opacity-60"
          >
            {acting === "approved" ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            Approve
          </button>
          <button
            onClick={() => act("rejected")}
            disabled={!!acting}
            className="flex items-center justify-center gap-1.5 border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            {acting === "rejected" ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
            Decline
          </button>
        </div>
      )}

      {req.status === "approved" && (
        <button
          onClick={() => act("returned")}
          disabled={!!acting}
          className="w-full flex items-center justify-center gap-2 border-2 border-[#534AB7] text-[#534AB7] py-2.5 rounded-xl text-sm font-medium hover:bg-[#EEEDFE] transition-colors disabled:opacity-60"
        >
          {acting === "returned" ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          Mark as returned
        </button>
      )}

      {req.status === "rejected" && (
        <div className="text-center text-xs text-gray-400 py-1">
          You declined this request
        </div>
      )}

      {req.status === "returned" && (
        <div className="text-center text-xs text-[#534AB7] py-1">
          ✓ Completed — item returned successfully
        </div>
      )}
    </div>
  )
}

// ─── LEND CARD (browse) ───────────────────────────────────────────────────────
function LendCard({ item, currentUser, onRequestSent }) {
  const [showModal, setShowModal] = useState(false)
  const [duration, setDuration]   = useState(Math.min(3, item.maxDuration))
  const [message, setMessage]     = useState("")
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState("")
  const emoji   = categoryEmoji[item.category] || "📦"
  const isOwner = currentUser?._id === item.owner?._id

  const handleBorrow = async () => {
    setLoading(true)
    setError("")
    try {
      await api.post(`/lend/${item._id}/borrow`, { duration, message })
      setSuccess(true)
      setShowModal(false)
      onRequestSent?.()
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#534AB7] hover:shadow-sm transition-all">
        {/* image */}
        <div className="h-36 bg-[#EEEDFE] flex items-center justify-center text-5xl overflow-hidden">
          {item.images?.[0]
            ? <img src={item.images[0]} className="w-full h-full object-cover" alt={item.title} />
            : <span>{emoji}</span>}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              item.isAvailable ? "bg-[#EAF3DE] text-[#27500A]" : "bg-gray-100 text-gray-500"
            }`}>
              {item.isAvailable ? "Available" : "Borrowed"}
            </span>
          </div>

          <p className="text-xs text-gray-400">{item.department} · <span className="capitalize">{item.category}</span></p>
          <p className="text-xs text-gray-400 mb-3">Up to {item.maxDuration} days · {item.owner?.name}</p>

          {isOwner ? (
            <div className="text-xs text-center text-[#534AB7] bg-[#EEEDFE] py-2 rounded-lg font-medium">
              Your item
            </div>
          ) : success ? (
            <div className="text-xs text-center text-green-700 bg-green-50 border border-green-200 py-2 rounded-lg font-medium flex items-center justify-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Request sent — check "My requests"
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

      {/* ── Borrow modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* modal header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-[#EEEDFE] rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                {item.images?.[0]
                  ? <img src={item.images[0]} className="w-full h-full object-cover" alt={item.title} />
                  : emoji}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 leading-tight">{item.title}</h3>
                <p className="text-xs text-gray-400">{item.owner?.name} · {item.department}</p>
              </div>
            </div>

            {/* duration slider */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">
                How many days? <span className="font-semibold text-gray-900">{duration} {duration === 1 ? "day" : "days"}</span>
                <span className="text-xs text-gray-400 ml-1">(max {item.maxDuration})</span>
              </label>
              <input
                type="range" min={1} max={item.maxDuration}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-[#534AB7]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 day</span>
                <span>{item.maxDuration} days</span>
              </div>
            </div>

            {/* message */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">
                Why do you need this? <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="e.g. Need it for my midsem tomorrow"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#534AB7] resize-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(false); setError("") }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBorrow}
                disabled={loading}
                className="flex-1 bg-[#534AB7] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3C3489] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70"/>
                    </svg>
                    Sending…
                  </>
                ) : "Send request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}