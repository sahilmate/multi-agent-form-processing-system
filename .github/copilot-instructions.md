# 🤖 GitHub Copilot Instructions for ADK Hackathon Project

**Project:** Multi-Agent Form Processing System
**Deadline:** 4 Days (June 24, 2025)
**Core Technology:** Google Agent Development Kit (ADK)
**Hackathon Category:** Automation of Complex Processes

---

## 🎯 Primary Objective

**Pivot the existing form-processing logic into a multi-agent system using the Google Agent Development Kit (ADK).** The goal is to meet the hackathon's core requirement of demonstrating multiple AI agents collaborating to solve a task. We are no longer building a simple pipeline; we are building an orchestrated agentic workflow.

---

## 🏛️ Agent-Based Architecture

This is the most critical part. The system must be composed of distinct agents, each with a specialized role.

| Agent Role          | Responsibility                                                              | Tools It Will Use                                     |
|---------------------|-----------------------------------------------------------------------------|-------------------------------------------------------|
| **OrchestratorAgent** | **The Manager.** Receives the initial request (image/text) and directs the workflow by calling other specialist agents in sequence. | None. It calls other agents.                          |
| **OCRAgent**        | **The Transcriber.** Extracts text from an image.                           | A `gemini_vision_tool` that takes an image and returns text. |
| **NERAgent**        | **The Analyst.** Extracts structured entities (name, address, etc.) from text. | A `gemini_ner_tool` that takes text and returns JSON. |
| **ClassifierAgent** | **The Sorter.** Determines the type of form or document from the text.      | A `gemini_classify_tool` that takes text and returns a label (e.g., "FIR"). |
| **RouterAgent**     | **The Dispatcher.** Suggests the correct government department for routing. | A `gemini_routing_tool` that takes text/entities and returns a department name. |

---

## 🚀 High-Intensity 4-Day Plan

| Day | Focus                               | Key Tasks                                                                                             |
|-----|-------------------------------------|-------------------------------------------------------------------------------------------------------|
| **1** | **ADK & Architecture**              | - Learn ADK basics from the official repo. <br>- Define the agent classes and their interactions. <br>- Create the project structure. |
| **2** | **Agent & Tool Implementation**     | - Wrap existing Python functions (OCR, NER) into "tools" for the ADK. <br>- Code the `OCRAgent`, `NERAgent`, etc. <br>- Implement the `OrchestratorAgent` logic. |
| **3** | **Deployment & Documentation**      | - **Create a `Dockerfile`**. <br>- **Deploy the app to Google Cloud Run** to get a public URL. <br>- Create the architecture diagram. |
| **4** | **Final Submission Assets**         | - Record a <3 minute demo video. <br>- Write the Devpost project description. <br>- Submit everything. |

---

## 📁 Required Project Structure (ADK-Focused)

```
adk-hackathon-project/
├── agents/
│   ├── __init__.py
│   ├── orchestrator.py
│   ├── ocr_agent.py
│   ├── ner_agent.py
│   └── ... (other agents)
├── tools/
│   ├── __init__.py
│   ├── vision_tools.py
│   └── text_tools.py
├── main.py             # FastAPI or Flask app to expose the OrchestratorAgent
├── Dockerfile          # For Cloud Run deployment
├── requirements.txt
├── .env
└── README.md
```

---

## ⚙️ Technology Stack (Hackathon Mandates)

| Component           | Technology                               | Priority |
|---------------------|------------------------------------------|----------|
| **Agent Framework** | **Google Agent Development Kit (ADK)**   | **MUST** |
| **Deployment**      | **Google Cloud Run**                     | **MUST** |
| **AI Models**       | **Google Gemini API** (Vision & Pro)     | **MUST** |
| API Server          | FastAPI                                  | HIGH     |
| Secrets             | python-dotenv                            | HIGH     |

---

## ✅ What Success Looks Like (Submission-Ready)

1.  **A Public URL:** A working endpoint on Google Cloud Run that triggers the `OrchestratorAgent`.
2.  **A Public Git Repo:** Clean, documented code following the ADK structure.
3.  **An Architecture Diagram:** A visual chart showing the agents, Cloud Run, and Gemini API.
4.  **A Demo Video:** A short (under 3 min) screen recording of the system in action.
5.  **A Completed Devpost Submission:** All fields filled out, describing the multi-agent approach.

**Final Output:** A JSON response from the API endpoint, like:
`{ "form_type": "FIR", "extracted_fields": { "name": "John Doe" }, "suggested_route": "Police Department", "agent_workflow": ["Orchestrator", "OCRAgent", "NERAgent", "ClassifierAgent", "RouterAgent"] }`
// filepath: c:\Users\sahil\Downloads\tryingwgemini\copilot\copilot-instructions.md
# 🤖 GitHub Copilot Instructions for ADK Hackathon Project

**Project:** Multi-Agent Form Processing System
**Deadline:** 4 Days (June 24, 2025)
**Core Technology:** Google Agent Development Kit (ADK)
**Hackathon Category:** Automation of Complex Processes

---

## 🎯 Primary Objective

**Pivot the existing form-processing logic into a multi-agent system using the Google Agent Development Kit (ADK).** The goal is to meet the hackathon's core requirement of demonstrating multiple AI agents collaborating to solve a task. We are no longer building a simple pipeline; we are building an orchestrated agentic workflow.

---

## 🏛️ Agent-Based Architecture

This is the most critical part. The system must be composed of distinct agents, each with a specialized role.

| Agent Role          | Responsibility                                                              | Tools It Will Use                                     |
|---------------------|-----------------------------------------------------------------------------|-------------------------------------------------------|
| **OrchestratorAgent** | **The Manager.** Receives the initial request (image/text) and directs the workflow by calling other specialist agents in sequence. | None. It calls other agents.                          |
| **OCRAgent**        | **The Transcriber.** Extracts text from an image.                           | A `gemini_vision_tool` that takes an image and returns text. |
| **NERAgent**        | **The Analyst.** Extracts structured entities (name, address, etc.) from text. | A `gemini_ner_tool` that takes text and returns JSON. |
| **ClassifierAgent** | **The Sorter.** Determines the type of form or document from the text.      | A `gemini_classify_tool` that takes text and returns a label (e.g., "FIR"). |
| **RouterAgent**     | **The Dispatcher.** Suggests the correct government department for routing. | A `gemini_routing_tool` that takes text/entities and returns a department name. |

---

## 🚀 High-Intensity 4-Day Plan

| Day | Focus                               | Key Tasks                                                                                             |
|-----|-------------------------------------|-------------------------------------------------------------------------------------------------------|
| **1** | **ADK & Architecture**              | - Learn ADK basics from the official repo. <br>- Define the agent classes and their interactions. <br>- Create the project structure. |
| **2** | **Agent & Tool Implementation**     | - Wrap existing Python functions (OCR, NER) into "tools" for the ADK. <br>- Code the `OCRAgent`, `NERAgent`, etc. <br>- Implement the `OrchestratorAgent` logic. |
| **3** | **Deployment & Documentation**      | - **Create a `Dockerfile`**. <br>- **Deploy the app to Google Cloud Run** to get a public URL. <br>- Create the architecture diagram. |
| **4** | **Final Submission Assets**         | - Record a <3 minute demo video. <br>- Write the Devpost project description. <br>- Submit everything. |

---

## 📁 Required Project Structure (ADK-Focused)

```
adk-hackathon-project/
├── agents/
│   ├── __init__.py
│   ├── orchestrator.py
│   ├── ocr_agent.py
│   ├── ner_agent.py
│   └── ... (other agents)
├── tools/
│   ├── __init__.py
│   ├── vision_tools.py
│   └── text_tools.py
├── main.py             # FastAPI or Flask app to expose the OrchestratorAgent
├── Dockerfile          # For Cloud Run deployment
├── requirements.txt
├── .env
└── README.md
```

---

## ⚙️ Technology Stack (Hackathon Mandates)

| Component           | Technology                               | Priority |
|---------------------|------------------------------------------|----------|
| **Agent Framework** | **Google Agent Development Kit (ADK)**   | **MUST** |
| **Deployment**      | **Google Cloud Run**                     | **MUST** |
| **AI Models**       | **Google Gemini API** (Vision & Pro)     | **MUST** |
| API Server          | FastAPI                                  | HIGH     |
| Secrets             | python-dotenv                            | HIGH     |

---

## ✅ What Success Looks Like (Submission-Ready)

1.  **A Public URL:** A working endpoint on Google Cloud Run that triggers the `OrchestratorAgent`.
2.  **A Public Git Repo:** Clean, documented code following the ADK structure.
3.  **An Architecture Diagram:** A visual chart showing the agents, Cloud Run, and Gemini API.
4.  **A Demo Video:** A short (under 3 min) screen recording of the system in action.
5.  **A Completed Devpost Submission:** All fields filled out, describing the multi-agent approach.

**Final Output:** A JSON response from the API endpoint, like:
`{ "form_type": "FIR", "extracted_fields": { "name": "John Doe" }, "suggested_route": "Police Department", "agent_workflow": ["Orchestrator", "OCRAgent", "NERAgent", "ClassifierAgent", "RouterAgent"]}`