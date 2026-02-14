"""
Ollama Client for Test Case Generator
Handles API communication with local Ollama instance
"""
import requests
import json

class OllamaClient:
    def __init__(self, base_url="http://localhost:11434"):
        self.base_url = base_url
        self.model = "llama3.2:latest"
    
    def generate(self, prompt: str, system_prompt: str = None) -> dict:
        """
        Generate a response from Ollama
        """
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 1024,
                "temperature": 0.3,
            },
            "keep_alive": "10m"
        }
        
        if system_prompt:
            payload["system"] = system_prompt
        
        print(f"DEBUG: Sending request to Ollama model: {self.model}")
        try:
            # Increased timeout to 300s
            response = requests.post(url, json=payload, timeout=300)
            print(f"DEBUG: Ollama response received with status: {response.status_code}")
            response.raise_for_status()
            
            result = response.json()
            return {
                "success": True,
                "response": result.get("response", "")
            }
        except requests.exceptions.ConnectionError:
            return {
                "success": False,
                "error": "Cannot connect to Ollama. Make sure Ollama is running on localhost:11434"
            }
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Request timed out (300s). Try a shorter prompt or wait for model to load."
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"API Error: {str(e)}"
            }
    
    def check_health(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def list_models(self) -> list:
        """List available models"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [model["name"] for model in data.get("models", [])]
            return []
        except:
            return []


# Test case generation prompt template
TEST_CASE_SYSTEM_PROMPT = """You are an Expert QA Automation Architect. Your goal is to generate professional, executable test cases.

Instructions:
1. Analyze the user requirements deeply.
2. Strategy: Plan for 3-5 Positive Scenarios and 3-5 Negative/Edge Case Scenarios.
3. Format: Output must be in clean, structured Markdown.

Required Fields per Test Case:
- **Test ID**: TC_XXX
- **Title**: Clear, concise title.
- **Type**: Positive | Negative | Security | Performance
- **Priority**: P0 (Blocker) | P1 (High) | P2 (Medium) | P3 (Low)
- **Severity**: Critical | Major | Minor
- **Pre-conditions**: State necessary setup (e.g., "User is on login page").
- **Test Data**: Specific emails, passwords, or inputs to use.
- **Steps**:
  | Step # | Action | Expected Result |
  |--------|--------|-----------------|
  | 1 | [Action] | [Result] |
- **Jira/Azure Tags**: Labels for export (e.g., `Component:Auth`, `Sprint:24`).

Tone: Precision-focused, no fluff.
"""


if __name__ == "__main__":
    # Quick test
    client = OllamaClient()
    print("Checking Ollama health...")
    if client.check_health():
        print("✅ Ollama is running!")
        print(f"Available models: {client.list_models()}")
    else:
        print("❌ Ollama is not running. Please start Ollama first.")
