# SOP 1: Conversion Flow Architecture (LLM Powered)

## Goal
Reliably convert a block of Selenium Java code into Playwright TypeScript code using a local LLM.

## Inputs
- `source_code`: String (Java)
- `model`: String (default: `codellama`)

## Outputs
- `converted_code`: String (TS)

## Process Logic
1. **Sanitize**: Clean input string (handle encoding).
2. **Prompt Engineering**:
    - **Persona**: Expert Test Automation Engineer.
    - **Context**: Code translation task.
    - **Constraints**: 
        - Output *only* code.
        - Use `@playwright/test`.
        - Use Async/Await.
    - **Input Injection**: Inject the Java code into the prompt.
3. **LLM Execution**: Send prompt to `localhost:11434`.
4. **Post-Processing**:
    - Remove markdown code fences (```) if present.
    - Validate basic structure (check for `import ... from '@playwright/test'`).
5. **Output**: Return final string and save to file.

## Error Handling
- If Ollama is offline -> Return error "Ollama API not reachable".
- If output is empty -> Return error "Model generation failed".
