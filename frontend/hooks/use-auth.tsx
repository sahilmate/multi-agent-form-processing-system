"use client"

import { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { useToast } from "@/components/ui/use-toast"

// Define the user type
interface User {
  id: string
  username: string
  full_name: string
  role: string
  department_id?: string
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {}
})

// Provider component that wraps your app and makes auth available
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('admin_token')
    
    if (token) {
      // Fetch user data from the server
      fetch('/api/admin/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          // If response is not ok, clear token
          throw new Error('Invalid token')
        })
        .then(userData => {
          setUser(userData)
        })
        .catch(err => {
          console.error('Auth error:', err)
          localStorage.removeItem('admin_token')
          setUser(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }  }, [])
  // Login function with username and password
  const login = async (username: string, password: string): Promise<boolean> => {
    try {      // Make API call to login
      const formData = new FormData()
      formData.append("username", username)
      formData.append("password", password)
      
      const response = await fetch('/api/admin/token', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        
        // Save token to localStorage
        localStorage.setItem('admin_token', data.access_token)
        
        // Set user data
        setUser({
          id: username,
          username: username,
          full_name: data.user_name,
          role: data.user_role
        })
        
        // Show success toast
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user_name}!`
        })
        
        return true
      } else {
        // Handle authentication error
        const error = await response.json()
        
        toast({
          title: "Login failed",
          description: error.detail || "Invalid username or password",
          variant: "destructive"
        })
        
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
      
      return false
    }
  }

  // Logout clears the user data
  const logout = () => {
    localStorage.removeItem('admin_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook that simplifies access to the auth context
export function useAuth() {
  return useContext(AuthContext)
}
