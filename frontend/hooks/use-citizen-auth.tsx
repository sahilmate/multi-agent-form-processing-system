"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  full_name: string
  email: string
  phone?: string
  address?: string
  id_number?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const CitizenAuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => false,
  logout: () => {},
})

export const CitizenAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  
  useEffect(() => {
    // Check if user is logged in on component mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("citizen_token")
        
        if (!token) {
          setUser(null)
          setIsLoading(false)
          return
        }
        
        // Verify token and get user data
        const response = await fetch("/api/citizens/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // Token invalid - clear it
          localStorage.removeItem("citizen_token")
          setUser(null)
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        setError("Failed to authenticate")
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])
    const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch("/api/citizens/token", {
        method: "POST",
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("citizen_token", data.access_token)
        
        // Fetch user profile with the token
        const profileResponse = await fetch("/api/citizens/profile", {
          headers: {
            "Authorization": `Bearer ${data.access_token}`
          }
        })
        
        if (profileResponse.ok) {
          const userData = await profileResponse.json()
          setUser(userData)
          return true
        } else {
          throw new Error("Failed to fetch user profile")
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Invalid username or password")
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  const logout = () => {
    localStorage.removeItem("citizen_token")
    setUser(null)
  }
  
  return (
    <CitizenAuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </CitizenAuthContext.Provider>
  )
}

export const useCitizenAuth = () => useContext(CitizenAuthContext)
