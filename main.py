from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from agents.orchestrator import OrchestratorAgent
import os
from dotenv import load_dotenv

print("Starting application...")
load_dotenv()  # Load environment variables from .env file
print("Environment variables loaded.")

app = FastAPI(title="Multi-Agent Form Processing System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Initializing Orchestrator Agent...")
# Initialize the Orchestrator Agent
orchestrator = OrchestratorAgent()
print("Orchestrator Agent initialized.")

@app.get("/")
async def root():
    """API root - provides basic information"""
    return {
        "app": "Multi-Agent Form Processing System",
        "version": "1.0.0",
        "description": "An agent-based system for processing government forms using the Google Agent Development Kit (ADK).",
        "docs": "/docs"
    }

@app.post("/process-form")
async def process_form(file: UploadFile = File(...)):
    """
    Process a form from an uploaded image.
    """
    try:
        print(f"Processing file: {file.filename}")
        image_bytes = await file.read()
        print(f"File read, size: {len(image_bytes)} bytes")
        print("Calling orchestrator.run()...")
        result = await orchestrator.run(image_bytes=image_bytes)
        print(f"Orchestrator run completed: {result}")
        
        # Transform the result to match frontend expectations
        frontend_result = {
            "form_type": result["form_type"],
            "fields": result["extracted_fields"],  # Rename to fields
            "ocr_text": result.get("ocr_text", ""),  # Include OCR text if available
            "department": {  # Convert suggested_route to department object
                "department_id": "auto-generated",
                "department_name": result["suggested_route"],
                "confidence": 0.9,
                "method": "adk-routing"
            },
            "auto_fill_results": result["extracted_fields"],  # Use same fields for auto-fill
            "agent_workflow": result["agent_workflow"],
            "status": "completed"
        }
        
        return frontend_result
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR: {str(e)}")
        print(f"TRACEBACK: {error_trace}")
        raise HTTPException(status_code=500, detail=f"{str(e)} - {error_trace}")

@app.post("/submit-text")
async def submit_text(text: str = Body(..., embed=True)):
    """
    Process a form from a text description.
    """
    try:
        print(f"Processing text: {text[:50]}...")
        print("Calling orchestrator.run()...")
        result = await orchestrator.run(text=text)
        print(f"Orchestrator run completed: {result}")
        
        # Transform the result to match frontend expectations
        frontend_result = {
            "form_type": result["form_type"],
            "fields": result["extracted_fields"],  # Rename to fields
            "input_text": text,  # Include the original text
            "department": {  # Convert suggested_route to department object
                "department_id": "auto-generated",
                "department_name": result["suggested_route"],
                "confidence": 0.9,
                "method": "adk-routing"
            },
            "auto_fill_results": result["extracted_fields"],  # Use same fields for auto-fill
            "agent_workflow": result["agent_workflow"],
            "status": "completed"
        }
        
        return frontend_result
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR: {str(e)}")
        print(f"TRACEBACK: {error_trace}")
        raise HTTPException(status_code=500, detail=f"{str(e)} - {error_trace}")

@app.get("/api/logs")
async def get_logs():
    """
    Get processing logs (mock implementation for demo).
    """
    # For the hackathon demo, we'll return mock logs
    # In a real implementation, this would fetch from a database
    return [
        {
            "id": "log1",
            "timestamp": "2025-06-24T09:30:00Z",
            "filename": "complaint.jpg",
            "form_type": "General Complaint",
            "department": "Police Department",
            "status": "completed",
            "processing_time": 4.2
        },
        {
            "id": "log2",
            "timestamp": "2025-06-24T08:15:00Z",
            "filename": "fir.jpg",
            "form_type": "FIR",
            "department": "Mumbai Police Department, Andheri East Police Station",
            "status": "completed",
            "processing_time": 3.8
        },
        {
            "id": "log3",
            "timestamp": "2025-06-24T07:45:00Z", 
            "filename": "pension.jpg",
            "form_type": "Pension",
            "department": "Pension Department",
            "status": "completed",
            "processing_time": 5.1
        }
    ]
