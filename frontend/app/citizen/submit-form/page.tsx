"use client"

import { useState, useRef } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, Upload, SendHorizonal, FileText, Loader2, Image as ImageIcon } from "lucide-react"
import { useCitizenAuth } from "@/hooks/use-citizen-auth"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"

export default function SubmitForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useCitizenAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [activeTab, setActiveTab] = useState("image-upload")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [textInput, setTextInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmittingText, setIsSubmittingText] = useState(false)
  
  // Check if user is authenticated
  if (!isLoading && !user) {
    router.replace("/citizen/login")
    return null
  }
  
  const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }
    
    const file = e.target.files[0]
    
    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      setFileError("Invalid file type. Please upload a PNG, JPEG, or PDF file.")
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }
    
    setSelectedFile(file)
    
    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // For PDFs, just display an icon
      setPreviewUrl(null)
    }
  }
  
  const handleUploadFile = async () => {
    if (!selectedFile) {
      setFileError("Please select a file to upload")
      return
    }
    
    try {
      setIsUploading(true)
      setUploadProgress(10)
      
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const simulateProgress = () => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.floor(Math.random() * 10)
        })
      }
      
      // Simulate progress updates
      const progressInterval = setInterval(simulateProgress, 300)
      
      const response = await fetch('/api/citizens/submit-form', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('citizen_token')}`
        },
        body: formData
      })
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (response.ok) {
        const data = await response.json()
        
        toast({
          title: "Form Submitted",
          description: "Your form has been successfully uploaded and processed.",
        })
        
        // Redirect to the submission details page
        if (data.log_id) {
          router.push(`/citizen/submissions/${data.log_id}`)
        } else {
          router.push('/citizen/dashboard')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Upload Failed",
          description: errorData.message || "Failed to process your form",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error('Error uploading file:', err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleSubmitText = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to process",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsSubmittingText(true)
      
      const response = await fetch('/api/citizens/submit-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('citizen_token')}`
        },
        body: JSON.stringify({ text: textInput })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        toast({
          title: "Text Submitted",
          description: "Your information has been successfully processed.",
        })
        
        // Redirect to the submission details page
        if (data.log_id) {
          router.push(`/citizen/submissions/${data.log_id}`)
        } else {
          router.push('/citizen/dashboard')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Submission Failed",
          description: errorData.message || "Failed to process your information",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error('Error submitting text:', err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSubmittingText(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-xl font-semibold">Submit a New Form</h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload a document or describe your request
            </p>
          </div>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Submit Information</CardTitle>
            <CardDescription>
              Choose how you want to submit your information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="image-upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </TabsTrigger>
                <TabsTrigger value="text-input">
                  <FileText className="h-4 w-4 mr-2" />
                  Text Description
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="image-upload" className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors
                    ${fileError ? 'border-red-300' : 'border-gray-300'}
                  `}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Label htmlFor="file-upload" className="sr-only">Upload document</Label>
                  <input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    aria-label="Upload document"
                    title="Upload document"
                  />
                  
                  {previewUrl ? (
                    <div className="flex flex-col items-center">
                      <div className="w-48 h-48 overflow-hidden mb-4">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-gray-500">{selectedFile?.name}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFile(null)
                          setPreviewUrl(null)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : selectedFile && selectedFile.type === 'application/pdf' ? (
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-red-50 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="h-12 w-12 text-red-500" />
                      </div>
                      <p className="text-sm text-gray-500">{selectedFile.name}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFile(null)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="font-medium">Click to upload a document</p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG or PDF (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
                
                {fileError && (
                  <p className="text-sm text-red-500">{fileError}</p>
                )}
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
                
                <Button
                  className="w-full"
                  disabled={!selectedFile || isUploading}
                  onClick={handleUploadFile}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload and Process
                    </>
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="text-input" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Enter your request or form information
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe your request in detail. For example: 'I want to file a complaint about the garbage collection in my neighborhood at 123 Main St.'"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
                
                <Button
                  className="w-full"
                  disabled={!textInput.trim() || isSubmittingText}
                  onClick={handleSubmitText}
                >
                  {isSubmittingText ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <SendHorizonal className="mr-2 h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-xs text-gray-500 text-center">
              By submitting this form, you acknowledge that your information will be processed 
              according to our privacy policy and may be shared with relevant government departments.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
