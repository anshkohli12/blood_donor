"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/authService"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const response = await authService.getCurrentUser()
          setUser(response.data) // Extract user data from response.data
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        localStorage.removeItem("token")
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      setUser(response.user)
      setIsAuthenticated(true)
      localStorage.setItem("token", response.token)
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      setUser(response.user)
      setIsAuthenticated(true)
      localStorage.setItem("token", response.token)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("token")
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
