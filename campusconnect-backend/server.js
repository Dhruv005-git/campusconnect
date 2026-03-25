import 'dotenv/config'
import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import { connectDB } from "./config/db.js"
import authRoutes from "./routes/auth.routes.js"
import listingRoutes from "./routes/listing.routes.js"
import notesRoutes from "./routes/notes.routes.js"
import lendRoutes from "./routes/lend.routes.js"
import messageRoutes from "./routes/message.routes.js"

connectDB()

const app = express()
const httpServer = createServer(app)

const allowedOrigins = [
  "http://localhost:5173",
  "https://campusconnect-frontend.vercel.app" // baad mein actual URL se replace karenge
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  }
}))

export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
})

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/listings", listingRoutes)
app.use("/api/notes", notesRoutes)
app.use("/api/lend", lendRoutes)
app.use("/api/messages", messageRoutes)

app.get("/", (req, res) => res.send("CampusConnect API running"))

// Socket.io logic
const onlineUsers = new Map() // userId -> socketId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // User online ho gaya
  socket.on("user_online", (userId) => {
    onlineUsers.set(userId, socket.id)
    io.emit("online_users", Array.from(onlineUsers.keys()))
  })

  // Room join karo (conversation ke liye)
  socket.on("join_room", (roomId) => {
    socket.join(roomId)
  })

  // Message bheja
  socket.on("send_message", (data) => {
    const { roomId, message } = data
    socket.to(roomId).emit("receive_message", message)
  })

  // Typing indicator
  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("user_typing", userName)
  })

  socket.on("stop_typing", ({ roomId }) => {
    socket.to(roomId).emit("user_stop_typing")
  })

  // Disconnect
  socket.on("disconnect", () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        onlineUsers.delete(userId)
      }
    })
    io.emit("online_users", Array.from(onlineUsers.keys()))
    console.log("User disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))