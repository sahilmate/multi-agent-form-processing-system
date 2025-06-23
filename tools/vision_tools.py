from google.adk.tools import BaseTool as Tool
import base64
import aiohttp
import os
import traceback

class VisionTools(Tool):
    def __init__(self) -> None:
        super().__init__(
            name="gemini_vision_tool",
            description="Extracts text from an image using Google Gemini Vision.",
        )
        print(f"VisionTools initialized with name: {self.name}")

    async def call(self, image_bytes: bytes) -> str:
        """
        Extracts text from an image using the Google Gemini Vision API.

        Args:
            image_bytes: The raw bytes of the image.

        Returns:
            The extracted text as a string.
        """
        try:
            print(f"VisionTools.call started with image of size: {len(image_bytes)} bytes")
            
            GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
            if not GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY environment variable not set.")
            print("GEMINI_API_KEY found in environment variables")
            
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            print(f"Image encoded to base64 string of length: {len(base64_image)}")
            
            # Updated URL to use Gemini 1.5 Flash instead of the deprecated Gemini Pro Vision
            url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            
            headers = {
                "Content-Type": "application/json"
            }
            
            payload = {
                "contents": [{
                    "parts": [
                        {"text": "Extract all text from this document."},
                        {"inline_data": {
                            "mime_type": "image/jpeg",
                            "data": base64_image
                        }}
                    ]
                }]
            }
            print("Prepared request payload for Gemini API")

            print(f"Making API request to Gemini Vision at: {url}")
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    print(f"Received response with status: {response.status}")
                    if response.status == 200:
                        resp_json = await response.json()
                        print("Successfully parsed JSON response")
                        text = resp_json['candidates'][0]['content']['parts'][0]['text']
                        print(f"Extracted text of length: {len(text)}")
                        return text
                    else:
                        error_text = await response.text()
                        print(f"API error: {response.status} - {error_text}")
                        raise Exception(f"Gemini API error: {response.status} - {error_text}")
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"Error in VisionTools.call: {str(e)}")
            print(f"Traceback: {error_trace}")
            raise Exception(f"Error in VisionTools.call: {str(e)}\n{error_trace}")
