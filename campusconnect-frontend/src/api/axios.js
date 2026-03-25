import axios from "axios"

// VITE_API_URL can be either:
// - "https://host" (we append "/api"), or
// - "https://host/api" (we keep it as-is).
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
const normalizedApiUrl = rawApiUrl.replace(/\/$/, "")
const apiBaseUrl = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`

const api = axios.create({
  baseURL: apiBaseUrl,
  // Ensure "Send OTP..." never gets stuck forever in case backend/email service hangs.
  timeout: 12000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api