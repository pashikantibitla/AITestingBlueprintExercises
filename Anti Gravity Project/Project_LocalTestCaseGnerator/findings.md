# 🔍 Findings - Local LLM Test Case Generator

## 📊 Research & Discoveries

### Ollama API
- **Endpoint:** `http://localhost:11434/api/generate`
- **Model:** llama3.2
- **Method:** POST with JSON payload

### API Request Format
```json
{
  "model": "llama3.2",
  "prompt": "your prompt here",
  "stream": false
}
```

### API Response Format
```json
{
  "model": "llama3.2",
  "response": "generated text",
  "done": true
}
```

---

## ⚠️ Constraints

1. Ollama must be running locally
2. llama3.2 model must be pulled beforehand
3. Default port: 11434

---

## 💡 Insights

*To be updated as discoveries are made...*

---

## 📚 Resources

- Ollama API Docs: https://github.com/ollama/ollama/blob/main/docs/api.md
