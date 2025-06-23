from google.adk import Agent
from tools.vision_tools import VisionTools

class OCRAgent(Agent):
    def __init__(self):
        vision_tool = VisionTools()
        super().__init__(
            name="OCRAgent",
            tools=[vision_tool]
        )
