"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  User, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  Building2,
  MessageSquare,
  Clipboard
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Alert } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Auth context for admin authentication
import { useAuth } from "@/hooks/use-auth"
import { SubmissionEntry } from "@/app/admin/types"

export default function SubmissionDetails() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  
  // For client components in Next.js 14+, use useRef to stabilize the params
  const paramsRef = useRef(params)
  const submissionId = paramsRef.current.id
  const [submission, setSubmission] = useState<SubmissionEntry | null>(null)
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(true)
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [statusNotes, setStatusNotes] = useState("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  
  // Comments state
  const [comments, setComments] = useState<any[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isAddingComment, setIsAddingComment] = useState(false)
    // Fetch submission details
  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !user) {
      router.push("/admin/login")
      return
    }
    
    if (submissionId) {
      fetchSubmissionDetails()
      fetchComments()
    }
  }, [submissionId, user, isLoading])
    const fetchSubmissionDetails = async () => {
    try {
      setIsLoadingSubmission(true)
      
      console.log(`Fetching submission details for ID: ${submissionId}`)
      
      const response = await fetch(`/api/admin/submissions/${submissionId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        }
      })
      
      console.log(`Admin submission detail response status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Admin submission detail data:", data)
        setSubmission(data)
      } else if (response.status === 401) {
        // Unauthorized, redirect to login
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive"
        })
        router.push("/admin/login")
      } else if (response.status === 404) {
        const errorText = await response.text()
        console.error("Admin submission not found, response:", errorText)
        try {
          const errorData = JSON.parse(errorText)
          toast({
            title: "Not Found",
            description: errorData.detail || "Submission not found",
            variant: "destructive"
          })
        } catch {
          toast({
            title: "Not Found", 
            description: "Submission not found",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch submission details",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Failed to fetch submission details:", err)
      toast({
        title: "Error",
        description: "Failed to fetch submission details",
        variant: "destructive"
      })
    } finally {
      setIsLoadingSubmission(false)
    }
  }
  
  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsUpdatingStatus(true)
        const response = await fetch(`/api/admin/submissions/${submissionId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes
        })
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Status updated successfully"
        })
        
        // Close dialog and refresh submission details
        setStatusUpdateDialog(false)
        fetchSubmissionDetails()
      } else if (response.status === 401) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive"
        })
        router.push("/admin/login")
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: errorData.detail || "Failed to update status",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Failed to update status:", err)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }
  
  const fetchComments = async () => {
    try {
      setIsLoadingComments(true)
      
      const response = await fetch(`/api/admin/submissions/${submissionId}/comments`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      } else if (response.status === 401) {
        router.push("/admin/login")
      } else {
        console.error("Failed to fetch comments:", response.status)
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err)
    } finally {
      setIsLoadingComments(false)
    }
  }
  
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsAddingComment(true)
      
      const response = await fetch(`/api/admin/submissions/${submissionId}/comments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ comment: newComment })
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Comment added successfully"
        })
        setNewComment("")
        fetchComments() // Refresh comments
      } else if (response.status === 401) {
        router.push("/admin/login")
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: errorData.detail || "Failed to add comment",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Failed to add comment:", err)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      })
    } finally {
      setIsAddingComment(false)
    }
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/admin")}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Submission Details
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={fetchSubmissionDetails} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isLoadingSubmission ? (
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : submission ? (
          <div className="space-y-6">
            {/* Status Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-xl font-bold">
                      {submission.original_filename || `Submission ${submission._id}`}
                    </h2>
                    <p className="text-gray-500">
                      Submitted: {submission.timestamp && new Date(submission.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center">
                      <Badge 
                        variant={
                          submission.status === "completed" ? "success" : 
                          submission.status === "rejected" ? "destructive" : 
                          submission.status === "processing" ? "outline" : 
                          "default"
                        }
                        className="text-sm px-3 py-1"
                      >
                        {submission.status || "pending"}
                      </Badge>
                    </div>
                    <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Update Status</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Submission Status</DialogTitle>
                          <DialogDescription>
                            Change the status of this submission and add optional notes.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea 
                              placeholder="Add notes about this status update (optional)"
                              value={statusNotes}
                              onChange={(e) => setStatusNotes(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setStatusUpdateDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateStatus} disabled={isUpdatingStatus}>
                            {isUpdatingStatus ? "Updating..." : "Update Status"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Detailed Tabs */}            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="fields">Extracted Fields</TabsTrigger>
                <TabsTrigger value="text">Full Text</TabsTrigger>
                <TabsTrigger value="form">Auto-Fill Form</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
              
              {/* Summary Tab */}
              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle>Submission Summary</CardTitle>
                    <CardDescription>Overview of the submitted form and processing details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Form Type</p>
                            <p className="font-semibold">{submission.form_type || "Unknown"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Department</p>
                            <p className="font-semibold">
                              {typeof submission.department === "object"
                                ? submission.department.department_name
                                : submission.department || "Not specified"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Processing Time</p>
                            <p className="font-semibold">
                              {submission.processing_time 
                                ? `${submission.processing_time.toFixed(2)} seconds` 
                                : "Not available"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <User className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Applicant Name</p>
                            <p className="font-semibold">
                              {submission.extracted_fields?.name || "Not specified"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Date</p>
                            <p className="font-semibold">
                              {submission.extracted_fields?.date || "Not specified"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p className="font-semibold">
                              {submission.extracted_fields?.address || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status History */}
                    {submission.status_history && submission.status_history.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">Status History</h3>
                        <div className="space-y-3">
                          {submission.status_history.map((history, index) => (
                            <div key={index} className="flex items-start p-3 border rounded-lg">
                              <div className="mr-3">
                                {history.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                                {history.status === "rejected" && <XCircle className="h-5 w-5 text-red-500" />}
                                {(history.status === "pending" || history.status === "processing") && 
                                  <Clock className="h-5 w-5 text-blue-500" />}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium capitalize">{history.status}</p>
                                  <p className="text-sm text-gray-500">
                                    {history.timestamp && new Date(history.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                {history.notes && (
                                  <p className="text-sm mt-1">{history.notes}</p>
                                )}
                                {history.updated_by && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Updated by: {history.updated_by}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Notes */}
                    {submission.notes && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Notes</h3>
                        <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">
                          {submission.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Extracted Fields Tab */}
              <TabsContent value="fields">
                <Card>
                  <CardHeader>
                    <CardTitle>Extracted Fields</CardTitle>
                    <CardDescription>Information extracted from the submitted form</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submission.extracted_fields && Object.keys(submission.extracted_fields).length > 0 ? (
                      <div className="grid gap-4">
                        {Object.entries(submission.extracted_fields).map(
                          ([key, value]) =>
                            value && (
                              <div key={key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                {key === "name" && <User className="h-5 w-5 text-gray-600 mt-0.5" />}
                                {key === "date" && <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />}
                                {key === "address" && <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />}
                                {key === "phone" && <Phone className="h-5 w-5 text-gray-600 mt-0.5" />}
                                {key === "email" && <Mail className="h-5 w-5 text-gray-600 mt-0.5" />}
                                {key === "incident_type" && <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />}
                                {!["name", "date", "address", "phone", "email", "incident_type"].includes(key) && (
                                  <FileText className="h-5 w-5 text-gray-600 mt-0.5" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-500 capitalize">
                                    {key.replace(/_/g, " ")}
                                  </p>
                                  <p className="text-gray-900">{String(value)}</p>
                                </div>
                              </div>
                            ),
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No fields were extracted from this submission</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Full Text Tab */}
              <TabsContent value="text">
                <Card>
                  <CardHeader>
                    <CardTitle>Full Text Content</CardTitle>
                    <CardDescription>Complete text extracted from the submitted form</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {submission.ocr_text || submission.input_text || "No text content available"}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(submission.ocr_text || submission.input_text || "")
                        toast({
                          title: "Copied",
                          description: "Text content copied to clipboard"
                        })
                      }}
                      className="flex items-center"
                    >
                      <Clipboard className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Auto-Fill Form Tab */}
              <TabsContent value="form">
                <Card>
                  <CardHeader>
                    <CardTitle>Auto-Filled Form</CardTitle>
                    <CardDescription>Form fields automatically filled with extracted data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submission.filled_form && Object.keys(submission.filled_form).length > 0 ? (
                      <div className="grid gap-4">
                        {Object.entries(submission.filled_form).map(
                          ([key, value]) =>
                            typeof value !== "object" && (
                              <div key={key} className="grid grid-cols-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 capitalize col-span-1">
                                  {key.replace(/_/g, " ")}
                                </p>
                                <p className="text-gray-900 col-span-2">{String(value)}</p>
                              </div>
                            ),
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No auto-filled form data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>              </TabsContent>
              
              {/* Comments Tab */}
              <TabsContent value="comments">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Comments & Communication
                    </CardTitle>
                    <CardDescription>Communicate with the citizen regarding this submission</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Comment Section */}
                    <div className="space-y-3 border-b pb-4">
                      <label className="text-sm font-medium">Add Comment</label>
                      <Textarea
                        placeholder="Type your comment here..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button 
                        onClick={handleAddComment} 
                        disabled={isAddingComment || !newComment.trim()}
                        className="w-full sm:w-auto"
                      >
                        {isAddingComment ? "Adding..." : "Add Comment"}
                      </Button>
                    </div>
                    
                    {/* Comments List */}
                    <div className="space-y-4">
                      {isLoadingComments ? (
                        <div className="space-y-3">
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      ) : comments.length > 0 ? (
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-4">
                            {comments.map((comment, index) => (
                              <div 
                                key={comment._id || index} 
                                className={`p-4 rounded-lg border ${
                                  comment.user_role === 'ADMIN' 
                                    ? 'bg-blue-50 border-blue-200 ml-4' 
                                    : 'bg-gray-50 border-gray-200 mr-4'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={comment.user_role === 'ADMIN' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {comment.user_role === 'ADMIN' ? 'Admin' : 'Citizen'}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                      {comment.user_name}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p>No comments yet</p>
                          <p className="text-sm">Start a conversation with the citizen</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
            <p className="text-gray-500 mb-6">The requested submission could not be found or you don't have permission to view it.</p>
            <Button onClick={() => router.push("/admin")} variant="default">
              Return to Dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
