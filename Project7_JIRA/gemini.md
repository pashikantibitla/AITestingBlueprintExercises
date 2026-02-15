# gemini.md - Project Constitution

**Project:** JIRA Automation System  
**Role:** The Law. Single source of truth for schemas, rules, and architecture.  
**Created:** 2026-02-15  
**Version:** 0.2.0

---

## 🚨 MANDATORY RULES

1. **Data Schema First:** No code in `tools/` until schema is defined here
2. **Architecture Updates First:** If logic changes, update SOP in `architecture/` before code
3. **Self-Annealing:** Failed tools must update architecture docs with learnings
4. **No Guessing:** Business logic must be deterministic, never probabilistic

---

## 🎯 DISCOVERY ANSWERS (Phase 1 - COMPLETED)

### Q1: North Star ✅
**"Automatically sync bug reports from Slack #bugs channel to JIRA board 'Engineering' with proper labels and assignees"**

### Q2: Integrations ✅
- **JIRA** - API token ready
- **Slack** - Webhook URL ready

### Q3: Source of Truth ✅
**Slack messages in #bugs channel**

### Q4: Delivery Payload ✅
- Create JIRA tickets in project "ENG"
- Update Slack thread with ticket link

### Q5: Behavioral Rules ✅
- ✅ Always @mention reporter in JIRA ticket
- ✅ Log all actions to console
- ❌ NEVER create duplicate tickets for same bug
- ❌ NEVER lose original reporter information
- ❌ NEVER fail silently

---

## 📋 DATA SCHEMAS

### Input Schema (Slack Message)

```json
{
  "type": "object",
  "description": "Slack message event from #bugs channel",
  "required": ["text", "user", "ts", "channel"],
  "properties": {
    "type": { "type": "string", "enum": ["message"] },
    "text": { "type": "string", "minLength": 10 },
    "user": { "type": "string", "description": "Slack user ID" },
    "user_name": { "type": "string", "description": "Display name" },
    "ts": { "type": "string", "description": "Unique message timestamp" },
    "channel": { "type": "string" },
    "channel_name": { "type": "string", "enum": ["bugs"] },
    "thread_ts": { "type": "string" },
    "attachments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": { "type": "string" },
          "title": { "type": "string" }
        }
      }
    }
  }
}
```

### Output Schema (JIRA Ticket)

```json
{
  "type": "object",
  "description": "JIRA ticket created in ENG project",
  "required": ["id", "key", "self", "url"],
  "properties": {
    "id": { "type": "string", "example": "10001" },
    "key": { "type": "string", "example": "ENG-123" },
    "self": { "type": "string", "format": "uri" },
    "url": { "type": "string", "format": "uri", "description": "Human-readable URL" },
    "fields": {
      "type": "object",
      "properties": {
        "summary": { "type": "string" },
        "description": { "type": "string" },
        "labels": { "type": "array", "items": { "type": "string" } },
        "assignee": { "type": "object", "properties": { "accountId": { "type": "string" }, "displayName": { "type": "string" } } },
        "reporter": { "type": "object", "properties": { "accountId": { "type": "string" }, "displayName": { "type": "string" } } },
        "created": { "type": "string", "format": "date-time" }
      }
    }
  }
}
```

### Output Schema (Slack Reply)

```json
{
  "type": "object",
  "description": "Slack thread reply",
  "required": ["channel", "thread_ts", "text"],
  "properties": {
    "channel": { "type": "string" },
    "thread_ts": { "type": "string" },
    "text": { "type": "string", "example": "✅ JIRA ticket created: ENG-123" },
    "blocks": { "type": "array" }
  }
}
```

### Intermediate Schema (Parsed Bug Report)

```json
{
  "type": "object",
  "required": ["slack_message_id", "reporter", "bug_description", "severity"],
  "properties": {
    "slack_message_id": { "type": "string" },
    "reporter": {
      "type": "object",
      "properties": {
        "slack_user_id": { "type": "string" },
        "slack_username": { "type": "string" },
        "jira_account_id": { "type": "string" }
      }
    },
    "bug_description": { "type": "string" },
    "severity": { "type": "string", "enum": ["critical", "high", "medium", "low"] },
    "labels": { "type": "array", "items": { "type": "string" } },
    "screenshots": { "type": "array", "items": { "type": "string", "format": "uri" } },
    "is_duplicate": { "type": "boolean" }
  }
}
```

---

## 🏗️ ARCHITECTURAL INVARIANTS

### 3-Layer Architecture (A.N.T.)

| Layer | Location | Purpose | Rules |
|-------|----------|---------|-------|
| 1. Architecture | `architecture/` | SOPs, technical docs | Update before code changes |
| 2. Navigation | In reasoning | Decision routing | Call tools in order, don't perform complex tasks |
| 3. Tools | `tools/` | Python scripts | Atomic, testable, deterministic |

### Environment Rules
- `.env` → API keys/secrets (verified in Phase 2)
- `.tmp/` → All intermediate files (ephemeral)
- Cloud → Final payload destination (project complete when here)

### Duplicate Detection Rules
- **Method:** Fuzzy matching on bug description
- **Threshold:** 0.85 (85% similarity)
- **Fields:** Description + Reporter
- **Window:** 7 days
- **Action if duplicate:** Skip creation, reply with existing ticket link

---

## 📐 BEHAVIORAL RULES

### System Behavior
- **Tone:** Professional, technical
- **Error Handling:** Explicit, logged, never silent
- **Idempotency:** Same input = Same output (deterministic)

### Required Actions
- ✅ Always @mention reporter in JIRA ticket
- ✅ Log all actions to console
- ✅ Reply to Slack thread with ticket link

### Prohibitions ("Do Not")
- ❌ NEVER create duplicate tickets for same bug
- ❌ NEVER lose original reporter information
- ❌ NEVER fail silently (always log)
- ❌ NEVER process non-bug messages (filter required)

---

## 🔧 TECHNICAL STANDARDS

### Code Standards
- **Language:** Python 3.8+
- **Style:** PEP 8 compliant
- **Docstrings:** Google style
- **Type hints:** Required for all functions
- **Scripts:** Atomic and testable
- **Error handling:** Explicit, logged to `progress.md`
- **Environment:** Use `.env` for all secrets

### Documentation Standards
- SOPs: Markdown in `architecture/`
- Updates: Mandatory before code changes
- Findings: All discoveries go to `findings.md`

### Integration Standards
- **JIRA:** REST API v2, API Token auth
- **Slack:** Webhook for posting, Events API for reading
- **Retry Logic:** 3 attempts with exponential backoff
- **Timeouts:** 10 seconds default

---

## 📋 MAINTENANCE LOG

| Date | Version | Change | Reason |
|------|---------|--------|--------|
| 2026-02-15 | 0.1.0 | Initial creation | Phase 0 complete |
| 2026-02-15 | 0.2.0 | Added Discovery Answers & Schemas | Phase 1 complete |

---

## ⏸️ CURRENT STATUS

**Phase:** 1 - Blueprint ✅ COMPLETED  
**Sub-phase:** Discovery & Schema Definition  
**Completed:** 2026-02-15  
**Next:** Phase 2 - Link (Connectivity) - AWAITING APPROVAL

### Deliverables Completed
- [x] 5 Discovery Questions answered
- [x] Data Schemas defined (Input, Output, Intermediate)
- [x] SOPs created (3 documents)
- [x] Integration specs documented
- [x] Behavioral rules established

### Ready for Phase 2
- [ ] User approval to proceed
- [ ] Environment variables configured
- [ ] Handshake tests to be built

---

*This document is law. All project decisions must align with definitions herein.*
