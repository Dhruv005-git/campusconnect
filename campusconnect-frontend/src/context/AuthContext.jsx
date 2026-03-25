import { createContext, useContext, useState, useEffect } from "react"
import api from "../api/axios"
import socket from "../socket"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get("/auth/me")
          setUser(res.data)
          // Socket connect karo
          socket.connect()
          socket.emit("user_online", res.data._id)
        } catch {
          localStorage.removeItem("token")
          setToken(null)
        }
      }
      setLoading(false)
    }
    fetchUser()
  }, [token])

  const login = (userData, userToken) => {
    localStorage.setItem("token", userToken)
    setToken(userToken)
    setUser(userData)
    socket.connect()
    socket.emit("user_online", userData.id)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    socket.disconnect()
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)