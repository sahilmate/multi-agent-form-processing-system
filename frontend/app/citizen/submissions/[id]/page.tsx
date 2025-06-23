"use client"

import { useState, useEffect, use } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronLeft, 
  Loader2, 
  Send, 
  FileText, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Clipboard
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useCitizenAuth } from "@/hooks/use-citizen-auth"

export default function SubmissionDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useCitizenAuth()
  
  // Use React.use() to unwrap the params promise for Next.js 15
  const resolvedParams = use(params)
  const submissionId = resolvedParams.id
  
  const [submission, setSubmission] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/citizen/login")
    }  }, [authLoading, user, router])
    useEffect(() => {
    if (user && submissionId) {
      // Log the submission ID for debugging
      console.log("Fetching submission details for ID:", submissionId);
      fetchSubmissionDetails();
    }
  }, [user, submissionId]);

  const fetchSubmissionDetails = async () => {
    try {
      setIsLoading(true);
      
      if (!submissionId) {
        setError("Invalid submission ID");
        setIsLoading(false);
        return;
      }
      
      const url = `/api/citizens/submissions/${submissionId}`;
      console.log("Making request to:", url);
      
      const token = localStorage.getItem("citizen_token");
      console.log("Using token:", token ? "Found" : "Not found");
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        // Log the OCR text for debugging
        console.log("OCR text type:", typeof data.ocr_text);
        console.log("OCR text length:", data.ocr_text ? data.ocr_text.length : 0);
        console.log("Input text type:", typeof data.input_text);
        console.log("Input text length:", data.input_text ? data.input_text.length : 0);
        
        setSubmission(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error data:", errorData);
        setError(`Failed to load submission details: ${errorData.detail || response.statusText}`)
      }
    } catch (err) {
      console.error("Error fetching submission details:", err)
      setError("An error occurred while loading the submission")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!comment.trim()) {
      return
    }
    
    try {
      setIsSubmittingComment(true)
      
      const response = await fetch(`/api/citizens/submissions/${submissionId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("citizen_token")}`
        },
        body: JSON.stringify({ comment })
      })
      
      if (response.ok) {
        // Clear comment and refresh data
        setComment("")
        toast({
          title: "Comment Added",
          description: "Your comment has been added to the submission",
        })
        await fetchSubmissionDetails()
      } else {
        toast({
          title: "Error",
          description: "Failed to add comment",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Error adding comment:", err)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }
  
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-xl text-gray-700">Loading...</span>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/citizen/dashboard")}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  if (!submission) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/citizen/dashboard")}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold">Submission Details</h1>            <div className="flex items-center gap-2 mt-1">
              <Badge>{submission.form_type}</Badge>
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
              <span className="text-sm text-gray-500">
                Submitted on {formatDateTime(submission.submission_date)}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">          {/* Left column: Form Information */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Results</CardTitle>
                <CardDescription>
                  Form has been successfully processed and analyzed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="fields">Extracted Fields</TabsTrigger>
                    <TabsTrigger value="text">Full Text</TabsTrigger>
                    <TabsTrigger value="form">Auto-Fill</TabsTrigger>
                  </TabsList>
                  
                  {/* Summary Tab */}
                  <TabsContent value="summary">
                    <div className="space-y-6">
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
                              <p className="text-sm font-medium text-gray-500">Suggested Department</p>
                              <p className="font-semibold">
                                {typeof submission.department === "object"
                                  ? submission.department.department_name
                                  : submission.department || "Not specified"}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <User className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Name</p>
                              <p className="font-semibold">
                                {submission.fields?.name || "Not specified"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Date</p>
                              <p className="font-semibold">
                                {submission.fields?.date || "Not specified"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Incident Type</p>
                              <p className="font-semibold">
                                {submission.fields?.incident_type || "Not specified"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                    {/* Extracted Fields Tab */}
                  <TabsContent value="fields">
                    {submission.fields && Object.keys(submission.fields).length > 0 ? (
                      <div className="grid gap-4">
                        {Object.entries(submission.fields).map(
                          ([key, value]: [string, any]) =>
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
                  </TabsContent>                  {/* Full Text Tab */}
                  <TabsContent value="text">
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {submission.ocr_text || submission.input_text ? (
                          submission.ocr_text || submission.input_text
                        ) : (
                          <>
                            <p className="mb-2 text-red-500">No text content available</p>
                            <p className="mb-2 text-xs text-gray-500">Debug info:</p>
                            <p className="text-xs text-gray-500">OCR text: {typeof submission.ocr_text} {submission.ocr_text === "" ? "(empty string)" : "(undefined)"}</p>
                            <p className="text-xs text-gray-500">Input text: {typeof submission.input_text} {submission.input_text === "" ? "(empty string)" : "(undefined)"}</p>
                            <p className="text-xs text-gray-500">Available fields: {Object.keys(submission).join(", ")}</p>
                          </>
                        )}
                      </pre>
                    </ScrollArea>                    <div className="mt-4">
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
                    </div>
                  </TabsContent>
                    {/* Auto-Fill Form Tab */}
                  <TabsContent value="form">
                    {submission.auto_fill_results && Object.keys(submission.auto_fill_results).length > 0 ? (
                      <div className="grid gap-4">
                        {Object.entries(submission.auto_fill_results).map(
                          ([key, value]: [string, any]) =>
                            value && typeof value !== "object" && (
                              <div key={key} className="grid grid-cols-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 capitalize col-span-1">
                                  {key.replace(/_/g, " ")}
                                </p>
                                <p className="text-gray-900 col-span-2">{String(value)}</p>
                              </div>
                            ),
                        )}
                        
                        {/* Handle nested objects like items_stolen if present */}
                        {submission.auto_fill_results?.items_stolen && typeof submission.auto_fill_results.items_stolen === "object" && (
                          <div className="grid grid-cols-1 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-500 capitalize mb-2">
                              Items Stolen
                            </p>
                            <div className="pl-4 space-y-2">
                              {Object.entries(submission.auto_fill_results.items_stolen as Record<string, any>).map(
                                ([itemKey, itemValue]) => (
                                  <div key={itemKey} className="grid grid-cols-3">
                                    <p className="text-sm font-medium text-gray-500 capitalize col-span-1">
                                      {itemKey.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-gray-900 col-span-2">{String(itemValue)}</p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No auto-filled form data available</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
                <CardDescription>
                  Communication regarding this submission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {submission.comments && submission.comments.length > 0 ? (
                  <div className="space-y-4">
                    {submission.comments.map((comment: any) => (
                      <div key={comment._id} className={`p-3 rounded-lg ${
                        comment.user_id === user?.id ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                      }`}>
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm">
                            {comment.user_name || "User"} 
                            <span className="ml-2 font-normal text-gray-500">({comment.user_role})</span>
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">No comments yet</p>
                )}
                
                <form onSubmit={handleAddComment} className="mt-4">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add a comment about your submission..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      type="submit"
                      disabled={isSubmittingComment || !comment.trim()} 
                      className="w-full"
                    >
                      {isSubmittingComment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Comment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column: Status and Department */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tracking ID</h3>
                    <p className="mt-1 font-mono">{submission.tracking_id || "Not assigned"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                    <span className="mt-1 flex items-center">
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
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="mt-1">
                      {(submission.department && submission.department.department_name) || 
                       submission.department || "Not assigned"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p className="mt-1 flex items-center text-sm">
                      <Clock className="h-3 w-3 mr-1 text-gray-400" />
                      {formatDateTime(submission.last_updated || submission.submission_date)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* History Card */}
            <Card>
              <CardHeader>
                <CardTitle>Submission History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {submission.history && submission.history.length > 0 ? (
                    submission.history.map((event: any) => (
                      <div key={event._id} className="border-l-2 border-gray-200 pl-3 pb-2">
                        <p className="text-sm">
                          {event.action.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(event.timestamp)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-500">No history available</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Documents Card */}
            {submission.documents && submission.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {submission.documents.map((doc: any) => (
                      <li key={doc._id}>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            {doc.name || "Document"}
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
