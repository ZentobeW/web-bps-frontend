import React, { createContext, useState, useEffect } from "react"
import { authService } from "../services/authService"

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
  // Initialize state with null first, then check localStorage in useEffect
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem("user")
        const savedToken = localStorage.getItem("token")
        
        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser))
          setToken(savedToken)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        // Clear corrupted data
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      } finally {
        setIsInitialized(true)
      }
    }

    initAuth()
  }, [])

  const loginAction = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.login(email, password)
      
      // Update state first
      setUser(response.user)
      setToken(response.token)
      
      // Then update localStorage
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("token", response.token)
      
      return response
    } catch (error) {
      console.error("Login error:", error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logoutAction = async () => {
    setLoading(true)
    setError(null)
    try {
      await authService.logout()
      
      // Clear state first
      setUser(null)
      setToken(null)
      
      // Then clear localStorage
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      
      return true
    } catch (error) {
      console.error('Logout error:', error.message)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const registerAction = async (name, email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.register(name, email, password)
      
      // Update state first
      setUser(response.user)
      setToken(response.token)
      
      // Then update localStorage
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("token", response.token)
      
      return response
    } catch (error) {
      console.error("Registration error:", error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Add a method to manually refresh user data
  const refreshUser = () => {
    try {
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        return parsedUser
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
    return null
  }

  const value = {
    user,
    token,
    loading,
    error,
    isInitialized,
    loginAction,
    logoutAction,
    registerAction,
    clearError,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }