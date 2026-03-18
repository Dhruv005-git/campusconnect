import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, ".env") })

console.log("EMAIL_USER:", process.env.EMAIL_USER)
console.log("EMAIL_PASS:", process.env.EMAIL_PASS)
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length)
console.log("EMAIL_PASS hex:", Buffer.from(process.env.EMAIL_PASS || "").toString("hex"))