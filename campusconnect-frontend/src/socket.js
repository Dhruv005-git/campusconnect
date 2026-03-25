import { io } from "socket.io-client"

// socket.io server lives at the backend host root, not under "/api"
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
const socketUrl = rawApiUrl.replace(/\/api\/?$/, "")

const socket = io(socketUrl, {
  autoConnect: false,
})

export default socket