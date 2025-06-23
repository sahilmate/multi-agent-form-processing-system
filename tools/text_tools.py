from google.adk.tools import BaseTool as Tool
import aiohttp
import os
import json
import traceback
from typing import Dict, Any, Optional

class NERTool(Tool):
    def __init__(self) -> None:
        super().__init__(
            name="gemini_ner_tool",
            description="Extracts structured entities from text using Google Gemini.",
        )
        print(f"NERTool initialized with name: {self.name}")

    async def call(self, text: str, form_type: Optional[str] = None) -> Dict[str, Any]:
        try:
            print(f"NERTool.call started with text of length: {len(text)}")
            
            GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
            if not GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY environment variable not set.")            
            print("GEMINI_API_KEY found in environment variables")
            prompt = f"Extract the following fields from the text below. Return the output as a JSON object. If a field is not present, use a default value. Text: {text}"
            print(f"Created prompt of length: {len(prompt)}")
            url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
            }
            print("Prepared request payload for Gemini API")

            print(f"Making API request to Gemini at: {url}")
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    print(f"Received response with status: {response.status}")
                    if response.status == 200:
                        resp_json = await response.json()
                        print("Successfully parsed JSON response")
                        
                        # The response may be plain text, so we need to parse it into JSON
                        response_text = resp_json['candidates'][0]['content']['parts'][0]['text']
                        print(f"Raw response text: {response_text[:100]}...")
                        
                        try:
                            # Try to parse the response as JSON
                            result = json.loads(response_text)
                        except json.JSONDecodeError:
                            # If it's not valid JSON, try to extract JSON-like content
                            print("Response was not valid JSON, attempting to extract structured data")
                            # Extract anything that looks like key-value pairs
                            import re
                            result = {}
                            lines = response_text.split('\n')
                            for line in lines:
                                # Look for "key: value" or "key = value" patterns
                                match = re.match(r'^\s*["\']?([^"\']+)["\']?\s*[:=]\s*["\']?([^"\']+)["\']?\s*$', line)
                                if match:
                                    key, value = match.groups()
                                    result[key.strip()] = value.strip()
                            
                            # If we couldn't extract structured data, create a basic structure
                            if not result:
                                result = {"extracted_text": response_text}
                        
                        print(f"Extracted entities: {result}")
                        return result
                    else:
                        error_text = await response.text()
                        print(f"API error: {response.status} - {error_text}")
                        raise Exception(f"Gemini API error: {response.status} - {error_text}")
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"Error in NERTool.call: {str(e)}")
            print(f"Traceback: {error_trace}")
            raise Exception(f"Error in NERTool.call: {str(e)}\n{error_trace}")

class ClassifierTool(Tool):
    def __init__(self) -> None:
        super().__init__(
            name="gemini_classify_tool",
            description="Determines the type of form or document from text.",
        )
        print(f"ClassifierTool initialized with name: {self.name}")

    async def call(self, text: str) -> str:
        try:
            print(f"ClassifierTool.call started with text of length: {len(text)}")
            
            GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
            if not GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY environment variable not set.")
            print("GEMINI_API_KEY found in environment variables")
            
            prompt = f"Classify the following document text into one of the following categories: FIR, Pension, Ration Card, Income Certificate, Birth Certificate, Death Certificate, Marriage Certificate, General Complaint. Text: {text}"
            print(f"Created prompt of length: {len(prompt)}")
            
            url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
            }
            print("Prepared request payload for Gemini API")

            print(f"Making API request to Gemini at: {url}")
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    print(f"Received response with status: {response.status}")
                    if response.status == 200:
                        resp_json = await response.json()
                        print("Successfully parsed JSON response")
                        form_type = resp_json['candidates'][0]['content']['parts'][0]['text'].strip()
                        print(f"Classified form type: {form_type}")
                        return form_type
                    else:
                        error_text = await response.text()
                        print(f"API error: {response.status} - {error_text}")
                        raise Exception(f"Gemini API error: {response.status} - {error_text}")
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"Error in ClassifierTool.call: {str(e)}")
            print(f"Traceback: {error_trace}")
            raise Exception(f"Error in ClassifierTool.call: {str(e)}\n{error_trace}")

class RouterTool(Tool):
    def __init__(self) -> None:
        super().__init__(
            name="gemini_routing_tool",
            description="Suggests the correct government department for routing.",
        )
        print(f"RouterTool initialized with name: {self.name}")

    async def call(self, text: str, form_type: str) -> str:
        try:
            print(f"RouterTool.call started with text of length: {len(text)} and form_type: {form_type}")
            
            GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
            if not GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY environment variable not set.")
            print("GEMINI_API_KEY found in environment variables")
            
            prompt = f"Given the form type '{form_type}' and the following text, suggest the most appropriate government department to route this to. Text: {text}"
            print(f"Created prompt of length: {len(prompt)}")
            
            url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
            }
            print("Prepared request payload for Gemini API")

            print(f"Making API request to Gemini at: {url}")
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    print(f"Received response with status: {response.status}")
                    if response.status == 200:
                        resp_json = await response.json()
                        print("Successfully parsed JSON response")
                        suggested_route = resp_json['candidates'][0]['content']['parts'][0]['text'].strip()
                        print(f"Suggested route: {suggested_route}")
                        return suggested_route
                    else:
                        error_text = await response.text()
                        print(f"API error: {response.status} - {error_text}")
                        raise Exception(f"Gemini API error: {response.status} - {error_text}")
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"Error in RouterTool.call: {str(e)}")
            print(f"Traceback: {error_trace}")
            raise Exception(f"Error in RouterTool.call: {str(e)}\n{error_trace}")
