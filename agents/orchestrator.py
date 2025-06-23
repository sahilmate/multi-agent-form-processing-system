from google.adk import Agent
from typing import Optional, Dict, List, Any
from tools.vision_tools import VisionTools
from tools.text_tools import NERTool, ClassifierTool, RouterTool
import traceback

class OrchestratorAgent(Agent):
    def __init__(self):
        # Initialize the agent
        super().__init__(
            name="OrchestratorAgent",
            # Add tools to the agent so they're accessible and properly managed
            tools=[
                VisionTools(),
                NERTool(),
                ClassifierTool(),
                RouterTool()
            ]
        )
        print(f"Orchestrator initialized with tools: {[tool.name for tool in self.tools]}")

    async def run(self, image_bytes: Optional[bytes] = None, text: Optional[str] = None):
        agent_workflow = ["Orchestrator"]
        
        try:            
            if image_bytes:
                # 1. OCR processing
                print(f"Starting OCR processing with tool: {self.tools[0].name}")
                text = await self.tools[0].call(image_bytes=image_bytes)
                print(f"OCR processing completed. Extracted text length: {len(text)}")
                agent_workflow.append("OCRAgent")
            elif not text:
                raise ValueError("Either image_bytes or text must be provided.")

            # 2. NER processing
            print(f"Starting NER processing with tool: {self.tools[1].name}")
            entities = await self.tools[1].call(text=text)
            print(f"NER processing completed. Extracted entities: {entities}")
            agent_workflow.append("NERAgent")

            # 3. Classifier processing
            print(f"Starting classification with tool: {self.tools[2].name}")
            form_type = await self.tools[2].call(text=text)
            print(f"Classification completed. Form type: {form_type}")
            agent_workflow.append("ClassifierAgent")            # 4. Router processing
            print(f"Starting routing with tool: {self.tools[3].name}")
            suggested_route = await self.tools[3].call(text=text, form_type=form_type)
            print(f"Routing completed. Suggested route: {suggested_route}")
            agent_workflow.append("RouterAgent")
            
            return {
                "form_type": form_type,
                "extracted_fields": entities,
                "suggested_route": suggested_route,
                "agent_workflow": agent_workflow,
                "ocr_text": text  # Include the extracted or provided text
            }
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"Error in OrchestratorAgent.run: {str(e)}")
            print(f"Traceback: {error_trace}")
            raise Exception(f"Error in OrchestratorAgent.run: {str(e)}\n{error_trace}")
