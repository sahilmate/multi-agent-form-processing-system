from google.adk import Agent
from tools.text_tools import ClassifierTool

class ClassifierAgent(Agent):
    def __init__(self):
        classifier_tool = ClassifierTool()
        super().__init__(
            name="ClassifierAgent",
            tools=[classifier_tool]
        )
