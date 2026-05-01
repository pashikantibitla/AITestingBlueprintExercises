# 🏗️ Test Case Generation SOP

## Goal
To generate deterministic, structured, and high-quality test cases using the local llama3.2 model.

---

## 🛠️ Tool Interaction Logic

1. **Input Interface:** User submits a feature description or requirement through the Chat UI.
2. **Preprocessing:** The backend (`server.py`) wraps the input in a specialized Test Case Blueprint prompt.
3. **LLM Execution:** The `ollama_client.py` sends the payload to the local Ollama API.
4. **Formatting:** The LLM is instructed to use Markdown for tables and structured sections.
5. **Output Delivery:** The response is returned to the UI and rendered using a Markdown parser for readability.

---

## 🧩 Test Case Components
Every generated set should ideally contain:
- Functional tests (Positive & Negative)
- UI/UX layout tests
- Security considerations (Input validation)
- Performance/Edge cases

---

## 🔄 Self-Healing Loop
- If the LLM generates malformed Markdown, the UI should still attempt to render text.
- If Ollama is disconnected, the Backend returns a descriptive error for the UI to display with a "Retry" or "Check Ollama" instruction.
