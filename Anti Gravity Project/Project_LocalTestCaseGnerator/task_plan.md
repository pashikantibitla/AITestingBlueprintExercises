# 📋 Task Plan - Local LLM Test Case Generator

## 🎯 Project Goal
Build a local LLM-powered test case generator with a chat UI that uses Ollama (llama3.2) to generate structured test cases from user input.

---

## 📌 Phase Checklist

### ✅ Completed
- **Protocol 0 Initialization**
  - Created project constitution and logs.
- **Phase 2: Link**
  - Verified Ollama connectivity and model installation.
- **Phase 3: Architect** (Built Architecture SOP, Tools, and Chat UI)
- **Phase 4: Stylize** (Refined UI with Glassmorphism, Model Selection, and Copy features)
- **Phase 5: Trigger** (Finalized local deployment and documentation)

### ✅ ALL PHASES COMPLETE

### Phase 1: Blueprint (Vision & Logic)
- [ ] Research Ollama API documentation
- [ ] Define test case template
- [ ] Define prompt engineering strategy
- [ ] Get user approval on blueprint

### Phase 2: Link (Connectivity)
- [ ] Verify Ollama installation
- [ ] Test llama3.2 model availability
- [ ] Create `tools/ollama_client.py` connection script

### Phase 3: Architect (3-Layer Build) ✅
- [x] Create `architecture/test_case_sop.md`
- [x] Build `tools/ollama_client.py`
- [x] Build `tools/test_case_generator.py` (Integrated into server)
- [x] Integrate prompt template

### Phase 4: Stylize (Refinement & UI) ✅
- [x] Create chat UI (HTML/CSS/JS)
- [x] Apply modern styling (Glassmorphism + Premium CSS)
- [x] Format test case output display (Markdown + Tables)
- [x] Add Copy to Clipboard functionality
- [x] Add Model Selection dropdown
- [x] User feedback iteration (Refinement phase)

### Phase 5: Trigger (Deployment) ✅
- [x] Local deployment setup
- [x] Documentation completion (README.md created)
- [x] Final testing and hand-off

---

## 🔧 Tech Stack
- **Backend:** Python + Ollama API
- **Frontend:** HTML, CSS, JavaScript
- **LLM:** llama3.2 (via Ollama)
- **API:** REST (localhost:11434)
