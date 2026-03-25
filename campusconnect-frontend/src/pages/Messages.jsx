import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/layout/Navbar"
import api from "../api/axios"
import socket from "../socket"

export default function Messages() {
  const { user } = useAuth()
  const { otherUserId } = useParams()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeConvo, setActiveConvo] = useState(otherUserId || null)
  const [activeUser, setActiveUser] = useState(null)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState("")
  const [onlineUsers, setOnlineUsers] = useState([])
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const getRoomId = (userId1, userId2) => {
    return [userId1, userId2].sort().join("_")
  }

  useEffect(() => {
    fetchConversations()

    // Socket events
    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message])
      fetchConversations()
    })

    socket.on("user_typing", (userName) => {
      setTypingUser(userName)
      setIsTyping(true)
    })

    socket.on("user_stop_typing", () => {
      setIsTyping(false)
      setTypingUser("")
    })

    socket.on("online_users", (users) => {
      setOnlineUsers(users)
    })

    return () => {
      socket.off("receive_message")
      socket.off("user_typing")
      socket.off("user_stop_typing")
      socket.off("online_users")
    }
  }, [])

  useEffect(() => {
    if (activeConvo && user) {
      fetchMessages(activeConvo)
      const roomId = getRoomId(user._id, activeConvo)
      socket.emit("join_room", roomId)
    }
  }, [activeConvo])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await api.get("/messages/conversations")
      setConversations(res.data)
      if (otherUserId) {
        const convo = res.data.find(c => c.user._id === otherUserId)
        if (convo) setActiveUser(convo.user)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`)
      setMessages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSelectConvo = (convo) => {
    setActiveConvo(convo.user._id)
    setActiveUser(convo.user)
    setMessages([])
    navigate(`/messages/${convo.user._id}`, { replace: true })
  }

  const handleTyping = (e) => {
    setContent(e.target.value)

    if (!activeConvo || !user) return
    const roomId = getRoomId(user._id, activeConvo)
    socket.emit("typing", { roomId, userName: user.name })

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { roomId })
    }, 1500)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim() || !activeConvo) return
    setSending(true)

    const roomId = getRoomId(user._id, activeConvo)
    socket.emit("stop_typing", { roomId })

    try {
      const res = await api.post("/messages", {
        receiverId: activeConvo,
        content,
      })
      setMessages((prev) => [...prev, res.data])
      setContent("")
      fetchConversations()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (date) => new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit"
  })

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short"
  })

  const isOnline = (userId) => onlineUsers.includes(userId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-medium text-gray-900 mb-4">Messages</h1>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex" style={{ height: "600px" }}>

          {/* Sidebar */}
          <div className="w-72 border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-xs text-gray-500">No conversations yet</p>
                </div>
              ) : (
                conversations.map((convo) => (
                  <div
                    key={convo.user._id}
                    onClick={() => handleSelectConvo(convo)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      activeConvo === convo.user._id ? "bg-[#EEEDFE]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-sm font-medium">
                        {convo.user.name?.charAt(0).toUpperCase()}
                      </div>
                      {isOnline(convo.user._id) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{convo.user.name}</p>
                        <p className="text-xs text-gray-400 flex-shrink-0 ml-1">
                          {formatDate(convo.lastMessage.createdAt)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{convo.lastMessage.content}</p>
                    </div>
                    {convo.unread > 0 && (
                      <div className="w-5 h-5 bg-[#534AB7] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">{convo.unread}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {!activeConvo ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-500 text-sm">Select a conversation</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-sm font-medium">
                      {activeUser?.name?.charAt(0).toUpperCase()}
                    </div>
                    {isOnline(activeConvo) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activeUser?.name}</p>
                    <p className="text-xs text-gray-400">
                      {isOnline(activeConvo) ? (
                        <span className="text-green-500">Online</span>
                      ) : (
                        `${activeUser?.department} · Year ${activeUser?.year}`
                      )}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-gray-400">No messages yet — say hello!</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMine = msg.sender._id === user?._id ||
                        msg.sender._id?.toString() === user?._id?.toString()
                      const showDate = i === 0 ||
                        formatDate(messages[i-1].createdAt) !== formatDate(msg.createdAt)

                      return (
                        <div key={msg._id}>
                          {showDate && (
                            <div className="text-center my-2">
                              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                {formatDate(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs px-3.5 py-2.5 rounded-2xl text-sm ${
                              isMine
                                ? "bg-[#534AB7] text-white rounded-br-sm"
                                : "bg-gray-100 text-gray-900 rounded-bl-sm"
                            }`}>
                              {msg.listing && (
                                <div className={`text-xs mb-1.5 pb-1.5 border-b ${
                                  isMine ? "border-white/20 text-white/70" : "border-gray-200 text-gray-500"
                                }`}>
                                  Re: {msg.listing.title}
                                </div>
                              )}
                              <p>{msg.content}</p>
                              <p className={`text-xs mt-1 ${isMine ? "text-white/60" : "text-gray-400"}`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
                        <span className="text-xs text-gray-500">{typingUser} is typing</span>
                        <div className="flex gap-0.5 ml-1">
                          {[0,1,2].map((i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={content}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#534AB7] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={sending || !content.trim()}
                    className="bg-[#534AB7] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3C3489] transition-colors disabled:opacity-50"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M14 8L2 2l3 6-3 6 12-6z" fill="white"/>
                    </svg>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}