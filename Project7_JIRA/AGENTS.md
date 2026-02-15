# AGENTS.md - Project Guide for AI Coding Agents

**Project:** JIRA Automation System  
**Protocol:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger)  
**Architecture:** A.N.T. 3-Layer Architecture  
**Status:** Phase 1 - Blueprint (Awaiting User Input)  
**Last Updated:** 2026-02-15

---

## 1. Project Overview

This project implements **deterministic, self-healing automation** for JIRA workflows using the **B.L.A.S.T.** protocol. It follows a strict 5-phase development methodology prioritizing reliability over speed.

### Mission
Build automation that integrates with JIRA (and potentially other services) to perform specific business logic tasks without human intervention, while maintaining full traceability and self-healing capabilities.

### Current State
- **Phase 0 (Initialization):** ✅ Complete
- **Phase 1 (Blueprint):** 🟡 In Progress - Awaiting user answers to Discovery Questions
- **Phases 2-5:** 🔴 Pending

### Key Constraint
**NO CODE** is to be written in `tools/` until:
1. All 5 Discovery Questions are answered
2. Data Schema is defined in `gemini.md`
3. Blueprint is approved in `task_plan.md`

---

## 2. Technology Stack

### Core Technologies
| Component | Technology | Version |
|-----------|------------|---------|
| Language | Python | 3.x |
| Protocol | B.L.A.S.T. | Master |
| Architecture | A.N.T. 3-Layer | - |
| Documentation | Markdown | - |

### External Integrations (Pending Discovery)
- **JIRA REST API** (v2/v3) - Likely primary integration
- **Slack** (potential - webhook/bot API)
- **Notion** (potential - database API)
- **Other services TBD**

### Project Structure
```
Project7_JIRA/
├── gemini.md              # 🏛️ PROJECT CONSTITUTION - The Law
├── BLAST.md               # Master protocol reference
├── task_plan.md           # Phase tracking and checklists
├── findings.md            # Research and discoveries
├── progress.md            # Execution log and errors
├── .env.template          # Environment variables template
├── .gitignore             # Git exclusions
├── architecture/          # Layer 1: SOPs (Standard Operating Procedures)
│   ├── 01_discovery_sop.md
│   ├── 02_data_schema_sop.md
│   └── 03_integration_sop.md
├── tools/                 # Layer 3: Python scripts (EMPTY - Phase 1 halt)
└── .tmp/                  # Temporary workbench (intermediate files)
```

---

## 3. Build and Run Commands

### Prerequisites
```bash
# Python 3.x required
python --version  # Should be 3.8+

# Create virtual environment (when Phase 3 starts)
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies (when requirements.txt created)
pip install -r requirements.txt
```

### Environment Setup
```bash
# Copy template and fill in credentials
cp .env.template .env

# Edit .env with actual values:
# - JIRA_BASE_URL
# - JIRA_USERNAME
# - JIRA_API_TOKEN
# - Other service credentials
```

### Development Commands (Phase 3+)
```bash
# Run handshake tests (Phase 2)
python tools/verify_jira.py

# Run individual tools (Phase 3)
python tools/[tool_name].py

# Run full pipeline (Phase 5)
python tools/trigger.py
```

---

## 4. Code Style Guidelines

### Python Standards
- **Language:** Python 3.8+
- **Style:** PEP 8 compliant
- **Docstrings:** Google style
- **Type hints:** Required for all functions

### Example Tool Structure (for Phase 3)
```python
"""
Tool: [name]
Purpose: [single sentence description]
SOP: architecture/[XX]_[name]_sop.md
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def tool_function(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Single-purpose, atomic operation.
    
    Args:
        input_data: Description of input
        
    Returns:
        Description of output
        
    Raises:
        Specific exceptions with clear messages
    """
    # Implementation
    pass

def test_connection() -> bool:
    """Verify external service connectivity."""
    pass

if __name__ == "__main__":
    # Handshake test for Phase 2
    result = test_connection()
    print(f"Test: {'PASS' if result else 'FAIL'}")
```

### Naming Conventions
- **Tools:** `verb_noun.py` (e.g., `create_jira_ticket.py`)
- **SOPs:** `XX_verb_noun_sop.md` (e.g., `01_discovery_sop.md`)
- **Constants:** UPPER_SNAKE_CASE
- **Functions:** lower_snake_case
- **Classes:** PascalCase

### File Organization Rules
1. **Atomicity:** Each tool does ONE thing
2. **Determinism:** Same input = Same output (always)
3. **Testability:** Each tool has a test_connection() function
4. **Documentation:** Every file references its SOP

---

## 5. Testing Instructions

### Phase 2: Link Testing (Connectivity)
Create handshake scripts for each integration:

```python
# tools/verify_[service].py
def test_connection():
    """
    Minimal API call to verify:
    1. Network connectivity
    2. Authentication works
    3. Service is responding
    """
    pass
```

### Phase 3: Tool Testing
- Test each tool individually
- Verify input/output schemas match `gemini.md`
- Log all results to `progress.md`

### Phase 5: Integration Testing
- Test full pipeline end-to-end
- Verify cloud payload delivery
- Confirm triggers work (cron/webhooks)

### Testing Standards
1. **Log Everything:** All tests logged in `progress.md`
2. **Error Capture:** Full stack traces saved
3. **No Assumptions:** Never assume a service is available
4. **Retry Logic:** Handle transient failures gracefully

---

## 6. Security Considerations

### Credential Management
```bash
# ✅ CORRECT: Use .env file
JIRA_API_TOKEN=your_token_here

# ❌ WRONG: Never hardcode credentials
token = "abc123"  # NEVER DO THIS
```

### Security Checklist
- [ ] `.env` is in `.gitignore`
- [ ] No secrets in code
- [ ] API tokens have minimum required permissions
- [ ] Rotate keys if exposed
- [ ] Use environment variables only

### Data Handling
- **Local (.tmp/):** Ephemeral, can be deleted
- **Cloud:** Final payload destination
- **Logs:** No PII in progress.md (use IDs, not names)

### Environment Variables (from .env.template)
```bash
JIRA_BASE_URL=         # https://[domain].atlassian.net
JIRA_USERNAME=         # Email address
JIRA_API_TOKEN=        # From id.atlassian.com
JIRA_PROJECT_KEY=      # e.g., PROJ
# Add other service credentials as needed
```

---

## 7. Architecture Overview

### B.L.A.S.T. Protocol Phases

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| 0 | Initialization | ✅ Complete | Project memory setup |
| 1 | Blueprint | 🟡 In Progress | Discovery & planning |
| 2 | Link | 🔴 Pending | API verification |
| 3 | Architect | 🔴 Pending | Build tools |
| 4 | Stylize | 🔴 Pending | Refinement |
| 5 | Trigger | 🔴 Pending | Deployment |

### A.N.T. 3-Layer Architecture

```
┌─────────────────────────────────────────┐
│  Layer 1: Architecture (architecture/)  │
│  - SOPs (Standard Operating Procedures) │
│  - Markdown documentation               │
│  - The "How-To"                         │
│  Rule: Update SOP before code changes   │
├─────────────────────────────────────────┤
│  Layer 2: Navigation (Reasoning)        │
│  - Decision routing                     │
│  - Data transformation                  │
│  - Calls tools in order                 │
│  Rule: Don't do complex tasks yourself  │
├─────────────────────────────────────────┤
│  Layer 3: Tools (tools/)                │
│  - Python scripts                       │
│  - Atomic, testable, deterministic      │
│  - The "Engines"                        │
│  Rule: One tool = One purpose           │
└─────────────────────────────────────────┘
```

### Current Architecture Files
| File | Purpose | Status |
|------|---------|--------|
| `01_discovery_sop.md` | Discovery Questions template | ✅ Ready |
| `02_data_schema_sop.md` | Data schema definition | ⏳ Pending answers |
| `03_integration_sop.md` | Integration documentation | ⏳ Pending answers |

---

## 8. Critical Rules for AI Agents

### The Golden Rules
1. **gemini.md is LAW** - No exceptions
2. **Data Schema First** - No code until schema defined
3. **Architecture Before Code** - Update SOPs first
4. **Self-Annealing** - Failed tools update architecture docs
5. **No Guessing** - Business logic must be deterministic

### Current Blockers
| Blocker | Phase | Resolution Required |
|---------|-------|---------------------|
| Discovery Q1 | Phase 1 | What is the singular desired outcome? |
| Discovery Q2 | Phase 1 | Which integrations? Keys ready? |
| Discovery Q3 | Phase 1 | Where does primary data live? |
| Discovery Q4 | Phase 1 | How/where deliver results? |
| Discovery Q5 | Phase 1 | How should the system act? |

### Decision Tree
```
Are Discovery Questions answered?
├── NO → Ask user, update architecture/01_discovery_sop.md
│        HALT - Do not proceed
│
└── YES → Is Data Schema in gemini.md?
    ├── NO → Define schemas in gemini.md and architecture/02_data_schema_sop.md
    │        HALT - Do not proceed
    │
    └── YES → Are all handshakes passing?
        ├── NO → Build verify_*.py scripts in tools/
        │        Test connections, log to progress.md
        │
        └── YES → Build tools in Phase 3
```

---

## 9. Communication Standards

### Documentation Updates
- **progress.md:** After every meaningful action
- **findings.md:** All discoveries and research
- **gemini.md:** Only for schema/rule changes
- **architecture/:** Before any code changes

### User Communication
When blocked on Discovery:
```
Status: Phase 1 - Blueprint 🟡
Blocker: Awaiting answers to 5 Discovery Questions
Action Required: Please answer Q1-Q5 in architecture/01_discovery_sop.md
```

---

## 10. Quick Reference

### Important Files
| File | Purpose | Read/Write |
|------|---------|------------|
| `gemini.md` | Project Constitution | Read as law, update only for schema changes |
| `task_plan.md` | Phase tracking | Update status after milestones |
| `progress.md` | Execution log | Append after every action |
| `findings.md` | Research | Append discoveries |
| `BLAST.md` | Protocol reference | Read-only reference |

### Command Cheat Sheet
```bash
# Check project status
cat gemini.md | grep "CURRENT STATUS"

# View phase checklist
cat task_plan.md | grep -A 20 "Phase Checklist"

# Check for blockers
cat task_plan.md | grep "Blocker"

# View recent progress
cat progress.md | grep -A 10 "Recent Activity"
```

---

*This document is a living guide. Update it when project structure or rules change.*
