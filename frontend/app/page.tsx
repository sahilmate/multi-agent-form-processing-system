"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, FileText, Clock, Building2, User, MapPin, Calendar, AlertCircle, Shield, LogIn, UserPlus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

interface ExtractedFields {
  name?: string
  date?: string
  address?: string
  incident_type?: string
  phone?: string
  id_number?: string
  details?: string
  [key: string]: string | undefined
}

interface Department {
  department_id: string
  department_name: string
  confidence: number
  method: string
  options?: Array<{id: string, name: string}>
}

interface ProcessingResult {
  ocr_text: string
  input_text?: string
  fields: ExtractedFields
  form_type: string
  department: Department
  auto_fill_results?: any
  log_id?: string
  status: string
}

interface ProcessingLog {
  id: string
  timestamp: string
  filename: string
  form_type: string
  department: string | Department
  status: string
  processing_time?: number
  ocr_text?: string
  fields?: ExtractedFields
}

export default function AutoPilotGov() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [logs, setLogs] = useState<ProcessingLog[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [textInput, setTextInput] = useState<string>('')
  const [inputType, setInputType] = useState<'image' | 'text'>('image')

  // Fetch processing logs on component mount
  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/logs/")
      if (response.ok) {
        const logsData = await response.json()
        setLogs(logsData)
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === "image/jpeg" || droppedFile.type === "image/png")) {
      setFile(droppedFile)
      setError(null)
    } else {
      setError("Please upload a valid JPG or PNG image file.")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const processForm = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setResult(null)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 500)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/process-form", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const data = await response.json()
        console.log("Form processing result:", data)
        setResult(data)
        // Refresh logs after successful processing
        setTimeout(() => fetchLogs(), 1000)
      } else {
        const errorData = await response.text()
        try {
          const jsonError = JSON.parse(errorData)
          setError(jsonError.message || jsonError.detail || "Processing failed. Please try again.")
        } catch {
          setError("Processing failed. Please try again.")
        }
      }
    } catch (err) {
      clearInterval(progressInterval)
      setError("Network error. Please check your connection and try again.")
      console.error("Form processing error:", err)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const processTextInput = async () => {
    if (!textInput.trim()) {
      setError("Please enter some text to process")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setResult(null)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 500)

    try {
      const response = await fetch("/submit-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: textInput }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const data = await response.json()
        console.log("Text processing result:", data)
        setResult(data)
        // Refresh logs after successful processing
        setTimeout(() => fetchLogs(), 1000)
      } else {
        const errorData = await response.text()
        try {
          const jsonError = JSON.parse(errorData)
          setError(jsonError.message || jsonError.detail || "Processing failed. Please try again.")
        } catch {
          setError("Text processing failed. Please try again.")
        }
      }
    } catch (err) {
      clearInterval(progressInterval)
      setError("Network error. Please check your connection and try again.")
      console.error("Text processing error:", err)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const resetForm = () => {
    setFile(null)
    setTextInput('')
    setResult(null)
    setError(null)
    setProgress(0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AutoPilotGov</h1>
                <p className="text-sm text-gray-500">Government Form Automation System</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                v1.0
              </Badge>
              <Link href="/citizen/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Citizen Login
              </Link>
              <Link href="/citizen/register" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                <UserPlus className="h-4 w-4 mr-1" />
                Register
              </Link>
              <Link href="/admin/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Submit Government Form</span>
                </CardTitle>
                <CardDescription>
                  Upload a scanned image of your government form (FIR or Pension) or enter a text description. The system will use LLM-based OCR to extract text, analyze content, classify the form type, and route to the appropriate department.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Input Type Toggle */}
                <div className="mb-6">
                  <div className="flex space-x-4 justify-center">
                    <Button 
                      variant={inputType === 'image' ? "default" : "outline"} 
                      onClick={() => setInputType('image')}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Image Upload
                    </Button>
                    <Button 
                      variant={inputType === 'text' ? "default" : "outline"} 
                      onClick={() => setInputType('text')}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Text Input
                    </Button>
                  </div>
                </div>
                
                {/* Image Upload UI */}
                {inputType === 'image' && (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver
                        ? "border-blue-400 bg-blue-50"
                        : file
                          ? "border-green-400 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                          <FileText className="h-8 w-8 text-green-600" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <div className="flex space-x-3 justify-center">
                          <Button onClick={processForm} disabled={isProcessing}>
                            {isProcessing ? "Processing..." : "Process Form"}
                          </Button>
                          <Button variant="outline" onClick={resetForm} disabled={isProcessing}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">Drag and drop your form here</p>
                          <p className="text-gray-500">or click to browse files</p>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload">
                          <Button variant="outline" className="cursor-pointer" asChild>
                            <span>Choose File</span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Text Input UI */}
                {inputType === 'text' && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter your complaint or request description
                      </label>
                      <textarea
                        id="text-input"
                        className="w-full min-h-[150px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Example: My phone was snatched near Central Bus Station at 9:30 PM yesterday by two unknown men on a motorcycle..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="flex justify-center space-x-3">
                      <Button onClick={processTextInput} disabled={isProcessing || !textInput.trim()}>
                        {isProcessing ? "Processing..." : "Process Text"}
                      </Button>
                      <Button variant="outline" onClick={() => setTextInput('')} disabled={isProcessing || !textInput.trim()}>
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="font-medium">Processing... Please wait</span>
                      <span className="text-gray-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert className="mt-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Citizen Account Prompt */}
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-700">Have a citizen account?</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Sign in to track your submissions and get notifications
                    </p>
                    <div className="mt-3 space-x-3">
                      <Link href="/citizen/login">
                        <Button variant="outline">
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/citizen/register">
                        <Button variant="secondary">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Processing Results</CardTitle>
                  <CardDescription>Form has been successfully processed and analyzed</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="fields">Extracted Fields</TabsTrigger>
                      <TabsTrigger value="text">Full Text</TabsTrigger>
                      <TabsTrigger value="autofill">Auto-Fill</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Form Type</p>
                                <p className="text-lg font-semibold">{result.form_type}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Suggested Department</p>
                                <p className="text-lg font-semibold">{result.department?.department_name || "Not specified"}</p>
                                {result.department?.confidence && (
                                  <p className="text-xs text-gray-500">
                                    Confidence: {Math.round(result.department.confidence * 100)}%
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      {result.input_text && (
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-start space-x-2">
                              <FileText className="h-5 w-5 text-gray-600 mt-1" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Original Input</p>
                                <p className="text-gray-900">{result.input_text}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="fields" className="space-y-4">
                      <div className="grid gap-4">
                        {Object.entries(result.fields || {}).map(
                          ([key, value]) =>
                            value && (
                              <div key={key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                {key === "name" && <User className="h-5 w-5 text-gray-600 mt-0.5" />}
                                {key === "date" && <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />}
                                {key === "address" && <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />}
                                {key === "incident_type" && <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />}
                                {!["name", "date", "address", "incident_type"].includes(key) && (
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
                    </TabsContent>

                    <TabsContent value="text">
                      <ScrollArea className="h-64 w-full rounded-md border p-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result.ocr_text || "No OCR text available"}</pre>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="autofill" className="space-y-4">
                      {result.auto_fill_results ? (
                        <>
                          {result.auto_fill_results.status === "fallback" && (
                            <Alert className="mb-4">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Using basic auto-fill due to AI service limitations
                              </AlertDescription>
                            </Alert>
                          )}
                          <div className="grid gap-4">
                            {result.auto_fill_results.message ? (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">{result.auto_fill_results.message}</p>
                              </div>
                            ) : (
                              Object.entries(result.auto_fill_results).map(([key, value]) => (
                                <div key={key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="text-sm font-medium text-gray-500 capitalize">
                                      {key.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-gray-900">{String(value)}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No auto-fill data available</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Processing Logs Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Processing History</span>
                </CardTitle>
                <CardDescription>Recent form processing activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {(logs && logs.length > 0) ? (
                      logs.map((log, index) => (
                        <div key={log.id || `log-${index}`} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant={log.status === "success" ? "default" : "destructive"} className="text-xs">
                              {log.status || "processed"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate">{log.filename || `Form ${index + 1}`}</p>
                            <p className="text-xs text-gray-600">
                              Form Type: <span className="font-medium">{log.form_type || "Unknown"}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              Dept: <span className="font-medium">
                                {typeof log.department === 'object' 
                                  ? (log.department.department_name || log.department.department_id || JSON.stringify(log.department)) 
                                  : (log.department || "General")}
                              </span>
                            </p>
                          </div>
                          {log.processing_time && (
                            <p className="text-xs text-gray-400">Processed in {log.processing_time}s</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No processing history yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">OCR Service (Groq)</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">NER Processing (LLM)</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">MongoDB</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
