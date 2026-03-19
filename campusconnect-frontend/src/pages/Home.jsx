import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/layout/Navbar"
import ListingCard from "../components/marketplace/ListingCard"
import api from "../api/axios"
import { motion } from "framer-motion"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
}

export default function Home() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [notes, setNotes] = useState([])
  const [lendItems, setLendItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [l, n, li] = await Promise.all([
          api.get("/listings"),
          api.get("/notes"),
          api.get("/lend"),
        ])
        setListings(l.data.slice(0, 4))
        setNotes(n.data.slice(0, 3))
        setLendItems(li.data.filter(i => i.isAvailable).slice(0, 3))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Navbar />

      {/* Hero */}
      <div className="bg-white  border-b border-gray-200 ">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <motion.div
            className="max-w-2xl"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#534AB7]"></div>
              <span className="text-sm font-medium text-[#534AB7]">{user?.college}</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl font-medium text-gray-900  leading-tight mb-4"
            >
              Your campus,<br />your marketplace.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-500  mb-8"
            >
              Buy, sell, borrow and share academic resources with verified students at your college.
            </motion.p>

            <motion.div variants={fadeUp} className="flex gap-3">
              <Link
                to="/marketplace"
                className="bg-[#534AB7] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#3C3489] transition-colors"
              >
                Browse marketplace
              </Link>
              <Link
                to="/create-listing"
                className="border border-gray-200  text-gray-700  px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 :bg-gray-800 transition-colors"
              >
                Sell an item
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white  border-b border-gray-200 ">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <motion.div
            className="grid grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {[
              { label: "Items listed", value: listings.length + "+", icon: "🛍️" },
              { label: "Notes shared", value: notes.length + "+", icon: "📄" },
              { label: "Items to borrow", value: lendItems.length || "0", icon: "🤝" },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-medium text-gray-900 ">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">

        {/* Features */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.h2 variants={fadeUp} className="text-lg font-medium text-gray-900  mb-4">
            What you can do
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "🛍️", title: "Buy & Sell", desc: "Trade used academic items at lower prices", to: "/marketplace" },
              { icon: "🤝", title: "Borrow", desc: "Temporarily borrow items from seniors", to: "/lending" },
              { icon: "📄", title: "Share Notes", desc: "Upload and access study resources", to: "/notes" },
              { icon: "💬", title: "Chat", desc: "Connect directly with buyers and sellers", to: "/messages" },
            ].map((feat) => (
              <motion.div key={feat.title} variants={fadeUp}>
                <Link to={feat.to}>
                  <div className="bg-white  border border-gray-200  rounded-2xl p-4 hover:border-[#534AB7] hover:shadow-sm transition-all h-full group">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">{feat.icon}</div>
                    <p className="text-sm font-medium text-gray-900  mb-1">{feat.title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent listings */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 ">Recent listings</h2>
            <Link to="/marketplace" className="text-sm text-[#534AB7] hover:underline">See all →</Link>
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white  border border-gray-200  rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <motion.div variants={fadeUp} className="text-center py-10 bg-white  border border-gray-200  rounded-2xl">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm text-gray-500 mb-2">No listings yet</p>
              <Link to="/create-listing" className="text-sm text-[#534AB7] hover:underline">Post the first one!</Link>
            </motion.div>
          ) : (
            <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <motion.div key={listing._id} variants={fadeUp}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Available to borrow */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 ">Available to borrow</h2>
            <Link to="/lending" className="text-sm text-[#534AB7] hover:underline">See all →</Link>
          </motion.div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white  border border-gray-200  rounded-xl h-16 animate-pulse" />
              ))}
            </div>
          ) : lendItems.length === 0 ? (
            <motion.div variants={fadeUp} className="text-center py-10 bg-white  border border-gray-200  rounded-2xl">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-sm text-gray-500 mb-2">Nothing to borrow yet</p>
              <Link to="/lend/create" className="text-sm text-[#534AB7] hover:underline">Lend your first item!</Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {lendItems.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link to="/lending">
                    <div className="bg-white  border border-gray-200  rounded-xl p-4 flex items-center gap-3 hover:border-[#534AB7] transition-all">
                      <div className="w-10 h-10 bg-[#EEEDFE] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} className="w-full h-full object-cover rounded-xl" alt={item.title} />
                        ) : "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900  truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.owner?.name} · Up to {item.maxDuration} days</p>
                      </div>
                      <span className="text-xs bg-[#EAF3DE] text-[#27500A] px-2.5 py-1 rounded-full font-medium flex-shrink-0">
                        Available
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent notes */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="pb-8"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 ">Recent notes</h2>
            <Link to="/notes" className="text-sm text-[#534AB7] hover:underline">See all →</Link>
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white  border border-gray-200  rounded-2xl h-32 animate-pulse" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <motion.div variants={fadeUp} className="text-center py-10 bg-white  border border-gray-200  rounded-2xl">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-sm text-gray-500 mb-2">No notes yet</p>
              <Link to="/upload-note" className="text-sm text-[#534AB7] hover:underline">Upload the first note!</Link>
            </motion.div>
          ) : (
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {notes.map((note) => (
                <motion.div
                  key={note._id}
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="bg-white  border border-gray-200  rounded-2xl p-4 hover:border-[#534AB7] transition-all h-full">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 bg-[#EEEDFE] rounded-xl flex items-center justify-center text-lg">
                        {note.fileType === "application/pdf" ? "📄" : "🖼️"}
                      </div>
                      <span className="text-xs bg-[#FAEEDA] text-[#633806] px-2 py-0.5 rounded-full font-medium">
                        Sem {note.semester}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900  mb-0.5 line-clamp-1">{note.title}</p>
                    <p className="text-xs text-gray-400 mb-2">{note.subject}</p>
                    <p className="text-xs text-gray-400">{note.uploader?.name} · {note.downloads} downloads</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  )
}