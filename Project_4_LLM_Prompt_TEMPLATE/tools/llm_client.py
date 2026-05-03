
import requests

class OllamaClient:
    def __init__(self, model="codellama"):
        self.base_url = "http://localhost:11434/api/generate"
        self.model = model

    def generate(self, prompt, temperature=0.1):
        """
        Sends a prompt to Ollama and returns the generated text.
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_ctx": 4096  # Increase context for larger files
            }
        }
        
        try:
            print(f"[INFO] Sending request to Ollama ({self.model})...")
            response = requests.post(self.base_url, json=payload, timeout=300)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except requests.exceptions.RequestException as e:
            return f"Error connecting to Ollama: {str(e)}"

if __name__ == "__main__":
    client = OllamaClient()
    print(client.generate("Write a Hello World in TypeScript"))
