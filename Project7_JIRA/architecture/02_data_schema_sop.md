# SOP-02: Data Schema Definition

**Purpose:** Define all input/output data schemas  
**Status:** ✅ COMPLETED  
**Created:** 2026-02-15  
**Approved:** 2026-02-15

---

## 🚨 RULE: Data-First

Per B.L.A.S.T. Protocol:
> "Coding only begins once the 'Payload' shape is confirmed."

---

## Input Schema (Slack Message)

### Raw Input from Slack Webhook
```json
{
  "type": "object",
  "description": "Slack message event from #bugs channel",
  "required": ["text", "user", "ts", "channel"],
  "properties": {
    "type": {
      "type": "string",
      "enum": ["message"],
      "description": "Event type"
    },
    "text": {
      "type": "string",
      "description": "Bug report message content",
      "example": "🔴 Critical: Login button not working on mobile"
    },
    "user": {
      "type": "string",
      "description": "Slack user ID of reporter",
      "example": "U12345678"
    },
    "user_name": {
      "type": "string",
      "description": "Display name of reporter",
      "example": "john.doe"
    },
    "ts": {
      "type": "string",
      "description": "Message timestamp (unique ID)",
      "example": "1234567890.123456"
    },
    "channel": {
      "type": "string",
      "description": "Channel ID",
      "example": "C12345678"
    },
    "channel_name": {
      "type": "string",
      "description": "Channel name",
      "example": "bugs"
    },
    "thread_ts": {
      "type": "string",
      "description": "Thread timestamp (if in thread)",
      "example": "1234567890.123456"
    },
    "attachments": {
      "type": "array",
      "description": "File attachments (screenshots)",
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

### Input Validation Rules
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| text | string | Yes | Min 10 chars, must contain bug description |
| user | string | Yes | Must be valid Slack user ID |
| ts | string | Yes | Must be unique (prevent duplicates) |
| channel | string | Yes | Must be #bugs channel |

---

## Output Schema (JIRA Ticket + Slack Reply)

### JIRA Ticket Creation Output
```json
{
  "type": "object",
  "description": "JIRA ticket created in ENG project",
  "required": ["id", "key", "self", "url"],
  "properties": {
    "id": {
      "type": "string",
      "description": "JIRA ticket internal ID",
      "example": "10001"
    },
    "key": {
      "type": "string",
      "description": "Ticket key (ENG-XXX)",
      "example": "ENG-123"
    },
    "self": {
      "type": "string",
      "description": "API URL",
      "example": "https://company.atlassian.net/rest/api/2/issue/10001"
    },
    "url": {
      "type": "string",
      "description": "Human-readable URL",
      "example": "https://company.atlassian.net/browse/ENG-123"
    },
    "fields": {
      "type": "object",
      "properties": {
        "summary": {
          "type": "string",
          "description": "Ticket title",
          "example": "🔴 Critical: Login button not working on mobile"
        },
        "description": {
          "type": "string",
          "description": "Formatted bug description"
        },
        "labels": {
          "type": "array",
          "items": { "type": "string" },
          "example": ["bug", "mobile", "critical"]
        },
        "assignee": {
          "type": "object",
          "properties": {
            "accountId": { "type": "string" },
            "displayName": { "type": "string" }
          }
        },
        "reporter": {
          "type": "object",
          "properties": {
            "accountId": { "type": "string" },
            "displayName": { "type": "string" }
          }
        },
        "created": {
          "type": "string",
          "format": "date-time",
          "example": "2026-02-15T10:30:00.000Z"
        }
      }
    }
  }
}
```

### Slack Reply Output
```json
{
  "type": "object",
  "description": "Slack thread reply with JIRA link",
  "required": ["channel", "thread_ts", "text"],
  "properties": {
    "channel": {
      "type": "string",
      "description": "Channel ID",
      "example": "C12345678"
    },
    "thread_ts": {
      "type": "string",
      "description": "Thread timestamp to reply to",
      "example": "1234567890.123456"
    },
    "text": {
      "type": "string",
      "description": "Reply message",
      "example": "✅ JIRA ticket created: ENG-123\nhttps://company.atlassian.net/browse/ENG-123"
    },
    "blocks": {
      "type": "array",
      "description": "Rich Slack blocks (optional)",
      "items": {
        "type": "object"
      }
    }
  }
}
```

### Output Formatting Rules
| Field | Type | Format | Destination |
|-------|------|--------|-------------|
| ticket.key | string | ENG-XXX | JIRA Project ENG |
| ticket.url | string | URL | Slack reply |
| reply.text | string | Formatted message | Slack thread |

---

## Intermediate Data Schema

### Layer 1 → Layer 2 (Parsed Bug Report)
```json
{
  "type": "object",
  "description": "Parsed and validated bug report",
  "required": ["slack_message_id", "reporter", "bug_description", "severity"],
  "properties": {
    "slack_message_id": {
      "type": "string",
      "description": "Unique message ID (ts)",
      "example": "1234567890.123456"
    },
    "reporter": {
      "type": "object",
      "properties": {
        "slack_user_id": { "type": "string" },
        "slack_username": { "type": "string" },
        "jira_account_id": { "type": "string" }
      }
    },
    "bug_description": {
      "type": "string",
      "description": "Clean bug description text"
    },
    "severity": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low"],
      "description": "Parsed from emoji or text"
    },
    "labels": {
      "type": "array",
      "items": { "type": "string" },
      "example": ["bug", "mobile", "critical"]
    },
    "screenshots": {
      "type": "array",
      "items": { "type": "string", "format": "uri" }
    },
    "is_duplicate": {
      "type": "boolean",
      "description": "Flag if similar ticket exists"
    }
  }
}
```

### Layer 2 → Layer 3 (Tool Input)
```json
{
  "type": "object",
  "description": "Data passed from Navigation to Tools",
  "properties": {
    "action": {
      "type": "string",
      "enum": ["create_ticket", "skip_duplicate", "error"],
      "description": "Action to execute"
    },
    "jira_payload": {
      "type": "object",
      "description": "JIRA API request body",
      "properties": {
        "fields": {
          "type": "object",
          "properties": {
            "project": { "type": "object", "properties": { "key": { "type": "string" } } },
            "summary": { "type": "string" },
            "description": { "type": "string" },
            "issuetype": { "type": "object", "properties": { "name": { "type": "string" } } },
            "labels": { "type": "array", "items": { "type": "string" } },
            "assignee": { "type": "object", "properties": { "accountId": { "type": "string" } } }
          }
        }
      }
    },
    "slack_payload": {
      "type": "object",
      "description": "Slack reply payload"
    },
    "logging_payload": {
      "type": "object",
      "description": "Console log data"
    }
  }
}
```

---

## Schema Approval

| Schema | Defined | Approved By | Date |
|--------|---------|-------------|------|
| Input (Slack) | ✅ | System Pilot | 2026-02-15 |
| Output (JIRA + Slack) | ✅ | System Pilot | 2026-02-15 |
| Intermediate | ✅ | System Pilot | 2026-02-15 |

---

## Duplicate Detection Logic

Based on Q5 Behavioral Rule: "Never create duplicate tickets"

```json
{
  "duplicate_detection": {
    "method": "fuzzy matching on bug description",
    "threshold": 0.85,
    "fields_checked": ["description", "reporter"],
    "time_window": "7 days",
    "action_if_duplicate": "Skip creation, reply to Slack with existing ticket link"
  }
}
```

---

## Update gemini.md

Schemas defined here must be copied to `gemini.md` (Project Constitution).

**Command:**
```bash
# Schemas now in gemini.md Section: DATA SCHEMAS
```

---

**Status:** ✅ COMPLETE - Schemas defined, ready for Phase 2
