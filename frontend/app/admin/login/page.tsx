"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { LockIcon, LogInIcon, ShieldIcon } from "lucide-react"

export default function AdminLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
    const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      // Use the auth hook's login function
      const success = await login(username, password)
      
      if (success) {
        // Redirect to admin dashboard
        router.push("/admin")
      }
    } catch (err) {
      console.error("Login error:", err)
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            <ShieldIcon className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the AutoPilotGov admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <LogInIcon className="mr-2 h-4 w-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>        </CardContent>
        <CardFooter className="text-center text-sm">
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-center items-center text-gray-500">
              <LockIcon className="h-3 w-3 mr-1" />
              <span>Secure government access only</span>
            </div>
            <div>
              <span>Don't have an account? </span>
              <Link href="/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
