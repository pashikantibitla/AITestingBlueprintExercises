# 📜 Gemini.md - Project Constitution

## 🎯 Project: Local LLM Test Case Generator

**North Star:** Generate comprehensive test cases from user input using local LLM (Ollama with llama3.2)

---

## 📊 Data Schemas

### Input Schema (User Request)
```json
{
  "user_input": "string - User's description of feature/functionality to test"
}
```

### Output Schema (Generated Test Cases)
```json
{
  "test_cases": [
    {
      "test_id": "TC_001",
      "title": "string - Test case title",
      "description": "string - Detailed description",
      "preconditions": ["string - Prerequisites"],
      "steps": [
        {
          "step_number": 1,
          "action": "string - Action to perform",
          "expected_result": "string - Expected outcome"
        }
      ],
      "test_data": "string - Sample test data if applicable",
      "priority": "HIGH | MEDIUM | LOW",
      "category": "string - Functional/UI/Security/Performance"
    }
  ],
  "summary": {
    "total_cases": "number",
    "generated_at": "timestamp"
  }
}
```

---

## ⚙️ Behavioral Rules

1. **Model:** Use llama3.2 via Ollama API
2. **Endpoint:** `http://localhost:11434/api/generate`
3. **Response Style:** Professional, structured test cases
4. **Format:** Always follow the defined test case template
5. **Do NOT:** Generate incomplete or vague test cases
6. **Do NOT:** Include code implementations, only test case specifications

---

## 🏗️ Architecture Invariants

1. All API calls go through `tools/ollama_client.py`
2. UI is a single-page chat interface
3. Templates stored in `tools/templates/`
4. Temporary data stored in `.tmp/`

---

## 📝 Maintenance Log

|| Date | Change | Author |
|------|--------|--------|
| 2026-01-26 | Initial project setup | System Pilot |
| 2026-01-26 | Phase 2 Link: Ollama connectivity verified | System Pilot |
| 2026-01-26 | Phase 3 Architect: Built Flask Backend & Client | System Pilot |
| 2026-01-26 | Phase 4 Stylize: Premium Glassmorphism UI built | System Pilot |
| 2026-01-26 | Phase 5 Trigger: Project finalized and documented | System Pilot |
| 2026-01-31 | Phase 5 Automation: Created run_app.bat and requirements.txt | Antigravity |
