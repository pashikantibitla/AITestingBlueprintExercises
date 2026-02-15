# SOP-01: Discovery & Requirements

**Purpose:** Document answers to the 5 Discovery Questions  
**Status:** ✅ COMPLETED  
**Created:** 2026-02-15  
**Approved:** 2026-02-15

---

## 🎯 The 5 Discovery Questions

### Q1: North Star ✅
**Question:** What is the singular desired outcome?

**Answer:**
```
"Automatically sync bug reports from Slack #bugs channel to JIRA 
board 'Engineering' with proper labels and assignees"
```

**Key Points:**
- Input: Bug reports from Slack #bugs channel
- Process: Sync/create tickets automatically
- Output: JIRA board 'Engineering'
- Requirements: Proper labels and assignees

---

### Q2: Integrations ✅
**Question:** Which external services (Slack, Shopify, JIRA, etc.) do we need? Are keys ready?

**Answer:**
```
Services Required:
  1. JIRA - Create tickets, manage issues
  2. Slack - Read messages, post replies

API Keys Ready:
  ✅ JIRA API token - Ready
  ✅ Slack webhook URL - Ready
```

**Service Checklist:**
- [x] JIRA API credentials (token ready)
- [x] Slack webhook URL (ready)

---

### Q3: Source of Truth ✅
**Question:** Where does the primary data live?

**Answer:**
```
Primary Data Location: Slack messages in #bugs channel
Data Format:          Slack message JSON (via webhook/events API)
Access Method:        Slack webhook / Events API
Trigger:              New message posted in #bugs channel
```

**Data Capture:**
- Channel: #bugs
- Content: Bug report text
- Metadata: Reporter name, timestamp, thread ID

---

### Q4: Delivery Payload ✅
**Question:** How and where should the final result be delivered?

**Answer:**
```
Delivery Method:   JIRA REST API + Slack webhook
Delivery Location: 
  1. JIRA: Project "ENG" (Engineering board)
  2. Slack: Original message thread in #bugs
Format:            
  1. JIRA: New ticket with labels, assignee, description
  2. Slack: Reply with JIRA ticket link
```

**Success Criteria:**
- JIRA ticket created in ENG project
- Ticket has: title, description, labels, assignee
- Slack thread updated with ticket URL

---

### Q5: Behavioral Rules ✅
**Question:** How should the system "act"? (Tone, logic constraints, "Do Not" rules)

**Answer:**
```
Tone:              Professional, technical
Constraints:       
  - Must check for duplicates before creating
  - Must preserve original reporter info
  - Must handle errors gracefully

"Do Not" Rules:
  1. NEVER create duplicate tickets for same bug
  2. NEVER lose original reporter information
  3. NEVER fail silently (always log)
  4. NEVER process non-bug messages (filter needed)

Required Actions:
  ✅ Always @mention reporter in JIRA ticket
  ✅ Log all actions to console
  ✅ Reply to Slack thread with ticket link
```

---

## 📋 Pre-Development Checklist

Before proceeding to Phase 2 (Link), the following must be confirmed:

- [x] All 5 Discovery Questions answered
- [ ] Data Schema drafted in `gemini.md`
- [ ] API keys/secrets documented in `.env` template
- [ ] This SOP approved and locked

---

## ⚠️ HALT Condition

**DO NOT proceed to Phase 2 until:**
1. ✅ All 5 questions have concrete answers
2. ⏳ Data schemas are defined (next step)
3. ⏳ This document is marked COMPLETE

---

## 📝 Requirements Summary

| Requirement | Detail |
|-------------|--------|
| **Source** | Slack #bugs channel |
| **Destination** | JIRA Project "ENG" |
| **Trigger** | New message in #bugs |
| **Action** | Create JIRA ticket + reply to Slack |
| **Duplicate Check** | Required - prevent duplicates |
| **Reporter Tracking** | Required - @mention in JIRA |
| **Logging** | Required - all actions to console |

---

**Next Step:** Define Data Schemas in `02_data_schema_sop.md`
