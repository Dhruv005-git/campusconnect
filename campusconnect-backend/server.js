import 'dotenv/config';

import listingRoutes from "./routes/listing.routes.js"
import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import authRoutes from "./routes/auth.routes.js"
import notesRoutes from "./routes/notes.routes.js"
import lendRoutes from "./routes/lend.routes.js"
import messageRoutes from "./routes/message.routes.js"  

connectDB()

const app = express()
app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/listings", listingRoutes)
app.use("/api/notes", notesRoutes)
app.use("/api/lend", lendRoutes)
app.use("/api/messages", messageRoutes)
app.get("/", (req, res) => res.send("CampusConnect API running"))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))