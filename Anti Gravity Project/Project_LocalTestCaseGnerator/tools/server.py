"""
Test Case Generator API Server
Flask-based backend for the Test Case Generator UI
"""
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys

# Add tools directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ollama_client import OllamaClient, TEST_CASE_SYSTEM_PROMPT

app = Flask(__name__, static_folder='../static', static_url_path='')
CORS(app)

# Initialize Ollama client
ollama = OllamaClient()

@app.route('/')
def serve_index():
    """Serve the main chat UI"""
    return send_from_directory('../static', 'index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if Ollama is running"""
    is_healthy = ollama.check_health()
    models = ollama.list_models() if is_healthy else []
    
    return jsonify({
        "ollama_status": "connected" if is_healthy else "disconnected",
        "available_models": models,
        "current_model": ollama.model
    })

@app.route('/api/generate', methods=['POST'])
def generate_test_cases():
    """Generate test cases from user input"""
    data = request.get_json()
    
    if not data or 'input' not in data:
        return jsonify({
            "success": False,
            "error": "No input provided"
        }), 400
    
    user_input = data['input'].strip()
    print(f"DEBUG: Received generation request for input: {user_input[:50]}...")
    
    if not user_input:
        return jsonify({
            "success": False,
            "error": "Input cannot be empty"
        }), 400
    
    # Create the prompt for test case generation
    prompt = f"""Based on the following feature/requirement description, generate comprehensive test cases:

---
{user_input}
---

Generate detailed test cases following the specified format."""

    # Call Ollama
    result = ollama.generate(prompt, system_prompt=TEST_CASE_SYSTEM_PROMPT)
    print(f"DEBUG: Generation result success: {result.get('success')}")
    
    return jsonify(result)

@app.route('/api/models', methods=['GET'])
def list_models():
    """List available Ollama models"""
    models = ollama.list_models()
    return jsonify({
        "models": models,
        "current": ollama.model
    })

@app.route('/api/model', methods=['POST'])
def set_model():
    """Change the active model"""
    data = request.get_json()
    if data and 'model' in data:
        ollama.model = data['model']
        return jsonify({"success": True, "model": ollama.model})
    return jsonify({"success": False, "error": "No model specified"}), 400


if __name__ == '__main__':
    print("🚀 Starting Test Case Generator Server...")
    print("📍 Server running at: http://localhost:5000")
    print("🔗 Ollama endpoint: http://localhost:11434")
    
    # Check Ollama status
    if ollama.check_health():
        print("✅ Ollama is connected!")
        print(f"📦 Available models: {ollama.list_models()}")
    else:
        print("⚠️  Warning: Ollama is not running. Please start Ollama first.")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
