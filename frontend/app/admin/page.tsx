"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  PieChart, 
  LineChart,
  Clock, 
  FileText, 
  Users, 
  Building2, 
  LayoutDashboard,
  AlertCircle,
  CheckCircle,
  XCircle,
  ClipboardList,
  Settings,
  LogOut,
  Search
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import types
import { 
  DashboardStats, 
  SubmissionEntry, 
  DepartmentStats, 
  SystemHealth,
  PaginationState,
  FiltersState
} from "./types"

// Auth context for admin authentication
import { useAuth } from "@/hooks/use-auth"

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading, logout } = useAuth()
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Fetch dashboard statistics
  useEffect(() => {
    // Check if user is authenticated and has admin rights
    if (!isLoading && !user) {
      router.push("/admin/login")
      return
    }
    
    fetchDashboardStats()
  }, [user, isLoading, router])
  
  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch("/api/admin/dashboard/stats", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        }
      })
      
      if (response.ok) {
        const data = await response.json() as DashboardStats
        setDashboardStats(data)
      } else if (response.status === 401) {
        // Unauthorized, redirect to login
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive"
        })
        logout()
        router.push("/admin/login")
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard statistics",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive"
      })
    } finally {
      setIsLoadingStats(false)
    }
  }
  
  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  }
  
  if (!user) {
    // Will redirect in useEffect
    return null
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold flex items-center">
            <LayoutDashboard className="mr-2 h-6 w-6" />
            AutoPilotGov
          </h2>
          <p className="text-sm text-gray-400 mt-1">Admin Portal</p>
        </div>
        <nav className="mt-6">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Main
          </div>
          <a 
            href="#" 
            onClick={() => setActiveTab("overview")}
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white ${activeTab === "overview" ? "bg-gray-800 text-white" : ""}`}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </a>
          <a 
            href="#" 
            onClick={() => setActiveTab("submissions")}
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white ${activeTab === "submissions" ? "bg-gray-800 text-white" : ""}`}
          >
            <ClipboardList className="mr-3 h-5 w-5" />
            Submissions
          </a>
          <a 
            href="#" 
            onClick={() => setActiveTab("departments")}
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white ${activeTab === "departments" ? "bg-gray-800 text-white" : ""}`}
          >
            <Building2 className="mr-3 h-5 w-5" />
            Departments
          </a>
          <a 
            href="#" 
            onClick={() => setActiveTab("system")}
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white ${activeTab === "system" ? "bg-gray-800 text-white" : ""}`}
          >
            <Settings className="mr-3 h-5 w-5" />
            System
          </a>
          
          <div className="px-4 py-2 mt-8 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Account
          </div>
          <div className="px-6 py-3 text-gray-300">
            <div className="font-medium">{user?.full_name}</div>
            <div className="text-sm text-gray-400">{user?.role}</div>
          </div>
          <a
            href="#"
            onClick={handleLogout}
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </a>
        </nav>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "submissions" && "Submissions"}
              {activeTab === "departments" && "Department Statistics"}
              {activeTab === "system" && "System Health"}
            </h1>
            <div className="flex items-center space-x-4">
              <Button onClick={fetchDashboardStats} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Overview Dashboard */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {isLoadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-6 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Total Submissions</p>
                            <h3 className="text-2xl font-bold">{dashboardStats?.total_submissions || 0}</h3>
                          </div>
                          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <h3 className="text-2xl font-bold">{dashboardStats?.status_counts?.pending || 0}</h3>
                          </div>
                          <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-yellow-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Completed</p>
                            <h3 className="text-2xl font-bold">{dashboardStats?.status_counts?.completed || 0}</h3>
                          </div>
                          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Rejected</p>
                            <h3 className="text-2xl font-bold">{dashboardStats?.status_counts?.rejected || 0}</h3>
                          </div>
                          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Charts and Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Form Type Distribution</CardTitle>
                        <CardDescription>Breakdown of submissions by form type</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {dashboardStats?.form_type_distribution ? (
                          <div className="space-y-4">
                            {Object.entries(dashboardStats.form_type_distribution).map(([formType, count]) => (
                              <div key={formType} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                  <span className="text-sm font-medium">{formType}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium">{String(count)}</span>
                                  <div className="ml-2 w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full" 
                                      style={{ width: `${(Number(count) / dashboardStats.total_submissions) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-48 text-gray-500">
                            No data available
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Department Distribution</CardTitle>
                        <CardDescription>Breakdown of submissions by department</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {dashboardStats?.department_distribution ? (
                          <div className="space-y-4">
                            {Object.entries(dashboardStats.department_distribution).map(([dept, count]) => (
                              <div key={dept} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                  <span className="text-sm font-medium">{dept}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium">{String(count)}</span>
                                  <div className="ml-2 w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-green-500 rounded-full" 
                                      style={{ width: `${(Number(count) / dashboardStats.total_submissions) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-48 text-gray-500">
                            No data available
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest form submissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {dashboardStats?.recent_activity && dashboardStats.recent_activity.length > 0 ? (
                            dashboardStats.recent_activity.map((activity) => (
                              <div key={activity._id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium">{activity.original_filename || "Untitled Document"}</h4>
                                    <p className="text-sm text-gray-500">
                                      {activity.timestamp && new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                  <Badge variant={activity.status === "completed" ? "success" : 
                                                 activity.status === "rejected" ? "destructive" : 
                                                 activity.status === "processing" ? "outline" : "default"}>
                                    {activity.status || "pending"}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="font-medium">Form Type:</span>{" "}
                                    {activity.form_type}
                                  </div>
                                  <div>
                                    <span className="font-medium">Department:</span>{" "}
                                    {typeof activity.department === "object" 
                                      ? activity.department.department_name 
                                      : activity.department}
                                  </div>
                                </div>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="mt-2 p-0 h-auto text-blue-600"
                                  onClick={() => router.push(`/admin/submissions/${activity._id}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center justify-center h-48 text-gray-500">
                              No recent activity
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
          
          {/* Submissions Tab */}
          {activeTab === "submissions" && (
            <SubmissionsTab user={user} />
          )}
          
          {/* Departments Tab */}
          {activeTab === "departments" && (
            <DepartmentsTab user={user} />
          )}
          
          {/* System Tab */}
          {activeTab === "system" && (
            <SystemTab user={user} />
          )}
        </main>
      </div>
    </div>
  )
}

// Submissions Tab Component
function SubmissionsTab({ user }: { user: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<SubmissionEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FiltersState>({
    status: "",
    form_type: "",
    department: "",
    start_date: "",
    end_date: ""
  })
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0
  })
  
  useEffect(() => {
    fetchSubmissions()
  }, [pagination.page, filters])
  
  const fetchSubmissions = async () => {
    try {
      setIsLoading(true)
      
      // Build query params as strings
      const queryParams = new URLSearchParams({
        page: String(pagination.page),
        page_size: String(pagination.page_size)
      })
      
      // Add filters to query
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value)
        }
      })
      
      const response = await fetch(`/api/admin/submissions?${queryParams.toString()}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.items)
        setPagination({
          ...pagination,
          total: data.total,
          total_pages: data.total_pages
        })
      } else if (response.status === 401) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch submissions",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err)
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
    const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value === "all" ? "" : value
    })
    // Reset to first page when filters change
    setPagination({
      ...pagination,
      page: 1
    })
  }
  
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.total_pages) return
    setPagination({
      ...pagination,
      page: newPage
    })
  }
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Form Type</label>
              <Select value={filters.form_type} onValueChange={(value) => handleFilterChange("form_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Form Types" />
                </SelectTrigger>                <SelectContent>
                  <SelectItem value="all">All Form Types</SelectItem>
                  <SelectItem value="FIR">FIR</SelectItem>
                  <SelectItem value="Pension">Pension</SelectItem>
                  <SelectItem value="Ration Card">Ration Card</SelectItem>
                  <SelectItem value="Income Certificate">Income Certificate</SelectItem>
                  <SelectItem value="General Complaint">General Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {user.role === "admin" && (
              <div>
                <label className="text-sm font-medium">Department</label>
                <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="police_local">Local Police</SelectItem>
                    <SelectItem value="police_cyber">Cyber Crime</SelectItem>
                    <SelectItem value="pension_office">Pension Department</SelectItem>
                    <SelectItem value="revenue">Revenue Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input 
                type="date" 
                value={filters.start_date} 
                onChange={(e) => handleFilterChange("start_date", e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input 
                type="date" 
                value={filters.end_date} 
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setFilters({
                status: "",
                form_type: "",
                department: "",
                start_date: "",
                end_date: ""
              })}
              variant="outline"
              className="mr-2"
            >
              Reset Filters
            </Button>
            <Button onClick={fetchSubmissions}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            {pagination.total} total submissions, showing page {pagination.page} of {pagination.total_pages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{submission.original_filename || "Untitled Document"}</h4>
                      <p className="text-sm text-gray-500">
                        {submission.timestamp && new Date(submission.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={submission.status === "completed" ? "success" : 
                                   submission.status === "rejected" ? "destructive" : 
                                   submission.status === "processing" ? "outline" : "default"}>
                      {submission.status || "pending"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Form Type:</span>{" "}
                      {submission.form_type}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span>{" "}
                      {typeof submission.department === "object" 
                        ? submission.department.department_name 
                        : submission.department}
                    </div>
                    {submission.processing_time && (
                      <div>
                        <span className="font-medium">Processing Time:</span>{" "}
                        {submission.processing_time.toFixed(2)}s
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-600"
                      onClick={() => router.push(`/admin/submissions/${submission._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              <div className="flex justify-center mt-6 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.total_pages)}
                  disabled={pagination.page === pagination.total_pages}
                >
                  Last
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No submissions found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Departments Tab Component
function DepartmentsTab({ user }: { user: any }) {
  const { toast } = useToast()
  const [departments, setDepartments] = useState<DepartmentStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (user.role === "admin") {
      fetchDepartmentStats()
    }
  }, [user])
  
  const fetchDepartmentStats = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch("/api/admin/departments/stats", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      } else if (response.status === 401) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch department statistics",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Failed to fetch department stats:", err)
      toast({
        title: "Error",
        description: "Failed to fetch department statistics",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (user.role !== "admin") {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Department statistics are only available to administrators
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Statistics and performance metrics for all departments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-lg p-6">
                  <Skeleton className="h-6 w-1/3 mb-4" />
                  <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : departments.length > 0 ? (
            <div className="space-y-6">
              {departments.map((dept) => (
                <div key={dept.department_id} className="border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">{dept.department_name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold">{dept.total_submissions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending</p>
                      <p className="text-2xl font-bold">{dept.pending}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="text-2xl font-bold">{dept.completed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg. Time</p>
                      <p className="text-2xl font-bold">{dept.avg_processing_time.toFixed(2)}s</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Form Types Handled</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {dept.form_types && Object.entries(dept.form_types).map(([formType, count]) => (
                        <div key={formType} className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm">{formType}: {String(count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <p className="text-xs font-medium mb-1">Completion Rate</p>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <div 
                          style={{ width: `${(dept.completed / dept.total_submissions) * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        ></div>
                      </div>
                      <p className="text-xs text-right">
                        {((dept.completed / dept.total_submissions) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No department statistics available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// System Health Tab Component
function SystemTab({ user }: { user: any }) {
  const { toast } = useToast()
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (user.role === "admin") {
      fetchSystemHealth()
    }
  }, [user])
  
  const fetchSystemHealth = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch("/api/admin/system/health", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSystemHealth(data)
      } else if (response.status === 401) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch system health information",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Failed to fetch system health:", err)
      toast({
        title: "Error",
        description: "Failed to fetch system health information",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (user.role !== "admin") {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          System health information is only available to administrators
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Status of various system components</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : systemHealth ? (
            <div className="space-y-8">
              {/* System Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">System Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="font-medium">{systemHealth.system.version}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Environment</p>
                    <p className="font-medium">{systemHealth.system.environment}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500">Server Time</p>
                    <p className="font-medium">
                      {systemHealth.system.server_time && new Date(systemHealth.system.server_time).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Database Status */}
              <div>
                <h3 className="text-lg font-medium mb-4">Database</h3>
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">MongoDB Status</p>
                    <p className="text-sm text-gray-500">
                      Response Time: {systemHealth.database.response_time.toFixed(3)}s
                    </p>
                  </div>
                  <Badge variant={systemHealth.database.status === "online" ? "success" : "destructive"}>
                    {systemHealth.database.status}
                  </Badge>
                </div>
              </div>
              
              {/* API Services */}
              <div>
                <h3 className="text-lg font-medium mb-4">API Services</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(systemHealth.services).map(([service, status]) => (
                    <div key={service} className="border rounded-lg p-4 flex items-center justify-between">
                      <p className="font-medium capitalize">{service} API</p>
                      <Badge variant={status ? "success" : "destructive"}>
                        {status ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Failed to load system health information
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
