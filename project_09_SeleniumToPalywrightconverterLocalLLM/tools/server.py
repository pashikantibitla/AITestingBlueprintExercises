
import os
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from llm_client import OllamaClient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConversionRequest(BaseModel):
    source_code: str
    project_name: str = "default_project"

class ConversionResponse(BaseModel):
    success: bool
    converted_code: str
    logs: list[str]
    file_path: str = ""

@app.post("/convert", response_model=ConversionResponse)
async def convert_endpoint(request: ConversionRequest):
    client = OllamaClient(model="codellama")
    logs = []
    
    prompt = f"""
    [INST] 
    You are an expert Test Automation Engineer. 
    Convert the following Selenium Java code into Playwright TypeScript code.
    
    RULES:
    1. Output ONLY the code. Do not include markdown backticks or explanations.
    2. Use `test` from `@playwright/test`.
    3. Use `async/await` pattern.
    4. Convert locators intelligently (e.g., By.id -> page.locator('#...')).
    5. Prioritize readability.

    JAVA SOURCE:
    {request.source_code}
    [/INST]
    """
    
    try:
        logs.append("Sending request to Ollama...")
        result_code = client.generate(prompt)
        
        # Simple cleanup if the model hallucinates markdown
        if result_code.startswith("```typescript"):
            result_code = result_code.replace("```typescript", "").replace("```", "")
        elif result_code.startswith("```"):
            result_code = result_code.replace("```", "")
            
        logs.append("Received response from Ollama.")

        # Save to disk
        output_dir = os.path.join(os.getcwd(), "converted_output")
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        filename = f"{request.project_name}.spec.ts"
        file_path = os.path.join(output_dir, filename)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(result_code)
            
        logs.append(f"Saved to: {file_path}")
        
        return ConversionResponse(
            success=True,
            converted_code=result_code,
            logs=logs,
            file_path=file_path
        )
    except Exception as e:
        return ConversionResponse(
            success=False,
            converted_code="",
            logs=[str(e)],
            file_path=""
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
