from google.adk import Agent
from tools.text_tools import RouterTool

class RouterAgent(Agent):
    def __init__(self):
        router_tool = RouterTool()
        super().__init__(
            name="RouterAgent",
            tools=[router_tool]
        )
