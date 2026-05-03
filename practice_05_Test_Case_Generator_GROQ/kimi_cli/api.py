import os
from typing import List, Dict, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class KimiClient:
    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://api.moonshot.ai/v1"):
        self.api_key = api_key or os.getenv("KIMI_API_KEY")
        if not self.api_key:
            raise ValueError("KIMI_API_KEY is not set. Please set it in your environment or .env file.")
        
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=base_url
        )

    def chat(self, messages: List[Dict[str, str]], model: str = "moonshot-v1-8k", stream: bool = False):
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=stream
        )
        return response
