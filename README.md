# Multi-Agent Form Processing System

This project is a multi-agent system for processing government forms, built for the ADK Hackathon. It uses the Google Agent Development Kit (ADK) to orchestrate multiple AI agents, each with a specialized function, to analyze and route forms efficiently.

## 🏛️ Architecture

The system is designed with a multi-agent architecture, where each agent has a specific responsibility:

- **OrchestratorAgent**: The central manager that directs the workflow.
- **OCRAgent**: Extracts text from images.
- **NERAgent**: Performs Named Entity Recognition to extract structured data.
- **ClassifierAgent**: Determines the type of form.
- **RouterAgent**: Suggests the appropriate government department for routing.

This architecture is implemented using the Google Agent Development Kit (ADK).

## 🚀 Running the Application

This project contains both a backend API service and a Next.js frontend for demonstration.

### 1. Running the Backend API (Required for Deployment)

The backend is a self-contained FastAPI application.

1.  **Navigate to the project root.**
2.  **Create a `.env` file:**
    Create a `.env` file and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_gemini_api_key
    ```
3.  **Run the server:**
    ```bash
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### 2. Running the Frontend (Recommended for Demo)

The frontend is a Next.js application that provides a user interface to interact with the backend.

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`. It is pre-configured to connect to the backend running on port 8000.

## Architecture Diagram 
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                       Multi-Agent Form Processing System            │
│                                                                     │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           Google Cloud Run                          │
│                                                                     │
│  ┌───────────────┐                                                  │
│  │               │                                                  │
│  │  FastAPI App  │◄──── User uploads form image or submits text     │
│  │   (main.py)   │                                                  │
│  │               │                                                  │
│  └───────┬───────┘                                                  │
│          │                                                          │
│          ▼                                                          │
│  ┌───────────────────────────────────────┐                          │
│  │        OrchestratorAgent              │                          │
│  │          (agents/orchestrator.py)     │                          │
│  │                                       │                          │
│  │   Manages workflow and calls other    │                          │
│  │   specialized agents in sequence      │                          │
│  └─┬─────────────┬─────────────┬─────────┘                          │
│    │             │             │                                    │
│    ▼             ▼             ▼                                    │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐                            │
│  │ OCRAgent│   │ NERAgent│   │Classifier│                           │
│  │         │   │         │   │ Agent   │                            │
│  └────┬────┘   └────┬────┘   └────┬────┘                            │
│       │             │             │                                 │
│       ▼             ▼             ▼                                 │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐              │
│  │ Vision  │   │   NER   │   │Classifier│   │ Router │              │
│  │  Tool   │   │  Tool   │   │  Tool   │   │  Tool  │              │
│  │         │   │         │   │         │   │        │              │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬───┘              │
│       │             │             │             │                  │
└───────┼─────────────┼─────────────┼─────────────┼──────────────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                    Google Gemini 1.5 Flash API                │
│                                                               │
└───────────────────────────────────────────────────────────────┘

## 🚢 Deployment to Google Cloud Run

For the hackathon submission, we recommend deploying using GitHub Actions for better security.

### Using GitHub Actions (Recommended)

1. **Create a Google Cloud project and service account:**
   - Create a new project in Google Cloud Console
   - Create a service account with the following roles:
     - Cloud Run Admin
     - Storage Admin
     - Service Account User
     - Cloud Build Editor
   - Download the JSON key for this service account

2. **Set up GitHub repository secrets:**
   - Go to your GitHub repository > Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `GCP_PROJECT_ID`: Your Google Cloud project ID
     - `GCP_SA_KEY`: The entire content of the downloaded JSON key file
     - `GEMINI_API_KEY`: Your Gemini API key
     - Add any other environment variables from your `.env` file as secrets

3. **Push the code to GitHub:**
   - The included `.github/workflows/deploy.yml` file will automatically deploy your application to Cloud Run when you push to the main branch

4. **Monitor the deployment:**
   - Go to the "Actions" tab in your GitHub repository to monitor the deployment process
   - Once completed, you'll see the URL for your deployed application

### Manual Deployment (Alternative)

If you prefer to deploy manually:

1. **Install Google Cloud SDK and authenticate:**
   ```bash
   gcloud auth login
   ```

2. **Make sure you are in the project's root directory.**

3. **Run the gcloud deploy command:**
   ```bash
   gcloud run deploy autogov-service --source . --region us-central1 --allow-unauthenticated --set-env-vars="GEMINI_API_KEY=your_gemini_api_key"
   ```

> ⚠️ **Security Note:** Be careful not to expose your API keys or credentials in command line history, logs, or public repositories. The GitHub Actions approach is preferred because it handles secrets more securely.

## ⚙️ API Endpoints

- `POST /process-form`: Upload an image of a form for processing.
- `POST /submit-text`: Submit a text description for processing.

### Example Response

```json
{
  "form_type": "FIR",
  "extracted_fields": {
    "name": "John Doe"
  },
  "suggested_route": "Police Department",
  "agent_workflow": [
    "Orchestrator",
    "OCRAgent",
    "NERAgent",
    "ClassifierAgent",
    "RouterAgent"
  ]
}
```
