"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Bell, Inbox, User, Clock, CheckCircle2, AlertCircle, Loader2, Save, FileText } from "lucide-react"

// Authentication hooks
import { useCitizenAuth } from "@/hooks/use-citizen-auth"

export default function CitizenDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading, logout } = useCitizenAuth()
  
  const [activeTab, setActiveTab] = useState("profile")
  interface Submission {
    id: string;
    form_type: string;
    submission_date: string;
    status: string;
    department?: string;
    tracking_id?: string;
  }

  interface Notification {
    _id: string;
    title: string;
    message: string;
    status: 'read' | 'unread';
    created_at: string;
    submission_id?: string;
  }

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    address: "",
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/citizen/login")
    }
  }, [authLoading, user, router])
  
  // Fetch submissions data
  useEffect(() => {
    if (user && activeTab === "submissions") {
      fetchSubmissions()
    }
  }, [user, activeTab])
  
  // Fetch notifications data
  useEffect(() => {
    if (user && activeTab === "notifications") {
      fetchNotifications()
    }
  }, [user, activeTab])
  
  // Load profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
      })
    }
  }, [user])
  
  const fetchSubmissions = async () => {
    try {
      setIsLoadingSubmissions(true)
      const response = await fetch("/api/citizens/submissions", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("citizen_token")}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load submissions",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setIsLoadingSubmissions(false)
    }
  }
  
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true)
      const response = await fetch("/api/citizens/notifications", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("citizen_token")}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }
  
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      setIsUpdatingProfile(true)
      
      const response = await fetch("/api/citizens/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("citizen_token")}`
        },
        body: JSON.stringify(profileData)
      })
      
      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
        })
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update profile",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }
  
  const handleLogout = () => {
    logout()
    router.push("/")
  }
  
  const handleSubmitForm = () => {
    router.push("/citizen/submit-form")
  }
  
  const viewSubmissionDetails = (submissionId: string) => {
    router.push(`/citizen/submissions/${submissionId}`)
  }
  
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/citizens/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("citizen_token")}`
        }
      })
      
      // Update the notifications list
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId 
            ? { ...notification, status: "read" } 
            : notification
        )
      )
      
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-xl text-gray-700">Loading...</span>
      </div>
    )
  }
  
  if (!user) {
    return null // Will redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-2 text-lg font-medium text-gray-900">
                Citizen Dashboard
              </h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">
                Welcome, {user.full_name}
              </span>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmitForm}
          >
            + New Form Submission
          </Button>
        </div>
        
        <Tabs 
          defaultValue="profile" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="bg-white rounded-lg shadow"
        >
          <TabsList className="border-b w-full justify-start rounded-t-lg rounded-b-none px-6 py-2 bg-white">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-50">
              <User className="h-4 w-4 mr-1" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:bg-blue-50">
              <Inbox className="h-4 w-4 mr-1" />
              My Submissions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-50">
              <Bell className="h-4 w-4 mr-1" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="p-6">
            <h2 className="text-lg font-medium mb-4">Your Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ""}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_number">ID Number</Label>
                  <Input
                    id="id_number"
                    value={user.id_number || ""}
                    disabled
                  />
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                />
              </div>
              
              <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="submissions" className="p-6">
            <h2 className="text-lg font-medium mb-4">Your Submissions</h2>
            
            {isLoadingSubmissions ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : submissions.length > 0 ? (
              <Table>
                <TableCaption>A list of your recent form submissions</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form Type</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.form_type}</TableCell>
                      <TableCell>
                        {new Date(submission.submission_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            submission.status === "completed" ? "success" : 
                            submission.status === "rejected" ? "destructive" : 
                            submission.status === "processing" ? "outline" : 
                            "secondary"
                          }
                        >
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{submission.department || "Not assigned"}</TableCell>
                      <TableCell>{submission.tracking_id || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => viewSubmissionDetails(submission.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <Inbox className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <h3 className="font-medium">No submissions yet</h3>
                <p className="text-gray-500 mb-4">You haven't submitted any forms</p>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={handleSubmitForm}
                >
                  Submit a Form
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="notifications" className="p-6">
            <h2 className="text-lg font-medium mb-4">Your Notifications</h2>
            
            {isLoadingNotifications ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card 
                    key={notification._id}
                    className={`${notification.status === 'unread' ? 'border-l-4 border-blue-500' : ''}`}
                  >
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        <Badge variant={notification.status === 'unread' ? "default" : "outline"}>
                          {notification.status === 'unread' ? 'New' : 'Read'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(notification.created_at).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p>{notification.message}</p>
                    </CardContent>
                    <CardFooter className="py-2">
                      {notification.status === 'unread' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      {notification.submission_id && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => notification.submission_id && viewSubmissionDetails(notification.submission_id)}
                          className="ml-auto"
                        >
                          View Submission
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <h3 className="font-medium">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
