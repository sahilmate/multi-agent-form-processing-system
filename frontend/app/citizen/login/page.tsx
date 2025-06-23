"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LogIn, AlertCircle, User, UserPlus } from "lucide-react"

import { useCitizenAuth } from "@/hooks/use-citizen-auth"

export default function CitizenLogin() {
  const router = useRouter()
  const { login, isLoading, error } = useCitizenAuth()
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      return
    }
    
    const success = await login(username, password)
    if (success) {
      router.push("/citizen/dashboard")
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Citizen Login</CardTitle>
          <CardDescription>
            Sign in to access your government services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <div className="w-full flex flex-col gap-2">
            <div>
              <span>Don't have an account? </span>
              <Link href="/citizen/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </div>
            <div className="text-gray-500 text-xs">
              A service by the Government to simplify form processing
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
