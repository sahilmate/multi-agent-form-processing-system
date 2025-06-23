from google.adk import Agent
from tools.text_tools import NERTool

class NERAgent(Agent):
    def __init__(self):
        ner_tool = NERTool()
        super().__init__(
            name="NERAgent",
            tools=[ner_tool]
        )
