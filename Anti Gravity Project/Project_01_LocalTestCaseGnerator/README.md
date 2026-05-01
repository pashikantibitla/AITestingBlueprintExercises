# 🚀 B.L.A.S.T. Local Test Case Generator

A premium, local LLM-powered tool to generate comprehensive QA Test Cases from user requirements. Built with Python, Flask, and Ollama.

## ✨ Features
- **Privacy First:** 100% local execution using Ollama.
- **Llama 3.2 Powered:** High-quality test case generation using the latest open-source models.
- **Premium UI:** modern glassmorphism design with real-time status tracking.
- **Model Selector:** Easily switch between different local models.
- **Copy Tool:** One-click copy for all generated markdown tables.

## 🛠️ Setup & Running

### 1. Prerequisites
- **Ollama:** Must be installed and running. [Download here](https://ollama.com/)
- **Llama 3.2:** Pull the model if you haven't already:
  ```bash
  ollama pull llama3.2
  ```

### 2. Installation
Install the required Python dependencies:
```bash
pip install flask flask-cors requests
```

### 3. Launch the App
Run the backend server:
```bash
python tools/server.py
```

### 4. Access
Open your browser and go to:
[http://localhost:5000](http://localhost:5000)

## 📂 Project Structure
- `tools/server.py`: Flask API backend.
- `tools/ollama_client.py`: Core logic for Ollama communication and prompt engineering.
- `static/`: Frontend assets (HTML, premium CSS, JS).
- `architecture/`: Technical SOPs and logic definitions.
- `gemini.md`: Project constitution and maintenance log.

## ⚙️ Maintenance
To add new features or modify the prompt template, update:
1. `tools/ollama_client.py` -> `TEST_CASE_SYSTEM_PROMPT` for AI behavior.
2. `static/style.css` for UI modifications.

---
Built using the **B.L.A.S.T. protocol** for deterministic automation.
