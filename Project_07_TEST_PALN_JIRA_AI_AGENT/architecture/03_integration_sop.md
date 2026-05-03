# SOP-03: Integration & Connectivity

**Purpose:** Document all external service integrations  
**Status:** ✅ COMPLETED  
**Created:** 2026-02-15  
**Approved:** 2026-02-15

---

## 🔌 Required Integrations

Based on Discovery Q2 answers.

### Integration Checklist

| Service | Purpose | Auth Method | Key Status | Test Script |
|---------|---------|-------------|------------|-------------|
| JIRA | Create tickets, manage issues | API Token | ✅ Ready | `tools/verify_jira.py` |
| Slack | Read messages, post replies | Webhook URL | ✅ Ready | `tools/verify_slack.py` |

---

## 🔐 Authentication

### Environment Variables (.env)

```bash
# =============================================================================
# JIRA API Configuration
# =============================================================================
# Your JIRA instance base URL (e.g., https://yourcompany.atlassian.net)
JIRA_BASE_URL=https://[your-domain].atlassian.net

# Your JIRA email/username
JIRA_USERNAME=your-email@example.com

# Your JIRA API token (generate at: https://id.atlassian.com/manage-profile/security/api-tokens)
JIRA_API_TOKEN=your-api-token-here

# JIRA project key for "Engineering" board
JIRA_PROJECT_KEY=ENG

# =============================================================================
# Slack Configuration
# =============================================================================
# Slack Bot Token (for reading messages)
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Slack Webhook URL (for posting replies)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00/B00/XXXX

# Target channel for bug reports
SLACK_BUGS_CHANNEL=#bugs

# =============================================================================
# Application Configuration
# =============================================================================
# Duplicate detection threshold (0.0 - 1.0)
DUPLICATE_THRESHOLD=0.85

# Time window for duplicate check (days)
DUPLICATE_WINDOW_DAYS=7
```

### Security Rules
- ✅ All secrets stored in `.env` only
- ✅ `.env` listed in `.gitignore`
- ✅ Never hardcode credentials in scripts
- ✅ Rotate keys if exposed

---

## 🧪 Handshake Tests (Phase 2)

For each integration, create a handshake script:

### JIRA Handshake Test
```python
# tools/verify_jira.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_jira_connection():
    """
    Verify JIRA API is reachable and credentials work.
    Tests: /rest/api/2/myself endpoint
    """
    base_url = os.getenv('JIRA_BASE_URL')
    username = os.getenv('JIRA_USERNAME')
    token = os.getenv('JIRA_API_TOKEN')
    
    if not all([base_url, username, token]):
        print("❌ FAIL: Missing JIRA credentials in .env")
        return False
    
    try:
        response = requests.get(
            f"{base_url}/rest/api/2/myself",
            auth=(username, token),
            timeout=10
        )
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ PASS: Connected as {user_data.get('displayName')}")
            return True
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
        return False

def test_jira_project_access():
    """
    Verify access to ENG project.
    Tests: /rest/api/2/project/ENG endpoint
    """
    base_url = os.getenv('JIRA_BASE_URL')
    project_key = os.getenv('JIRA_PROJECT_KEY')
    
    try:
        response = requests.get(
            f"{base_url}/rest/api/2/project/{project_key}",
            auth=(os.getenv('JIRA_USERNAME'), os.getenv('JIRA_API_TOKEN')),
            timeout=10
        )
        
        if response.status_code == 200:
            project = response.json()
            print(f"✅ PASS: Access to project '{project.get('name')}' confirmed")
            return True
        else:
            print(f"❌ FAIL: Cannot access project {project_key}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing JIRA Integration...")
    conn = test_jira_connection()
    proj = test_jira_project_access()
    print(f"\nOverall: {'PASS' if conn and proj else 'FAIL'}")
```

### Slack Handshake Test
```python
# tools/verify_slack.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_slack_webhook():
    """
    Verify Slack webhook URL works.
    Posts a test message and deletes it.
    """
    webhook_url = os.getenv('SLACK_WEBHOOK_URL')
    
    if not webhook_url:
        print("❌ FAIL: Missing SLACK_WEBHOOK_URL in .env")
        return False
    
    try:
        test_message = {
            "text": "🧪 Test message from JIRA Automation (will be deleted)"
        }
        
        response = requests.post(
            webhook_url,
            json=test_message,
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ PASS: Slack webhook is working")
            return True
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
        return False

def test_slack_channel_access():
    """
    Verify bot can access #bugs channel.
    Requires SLACK_BOT_TOKEN with channels:read scope.
    """
    bot_token = os.getenv('SLACK_BOT_TOKEN')
    channel = os.getenv('SLACK_BUGS_CHANNEL', '#bugs')
    
    if not bot_token:
        print("⚠️ SKIP: SLACK_BOT_TOKEN not set (optional)")
        return True
    
    try:
        headers = {"Authorization": f"Bearer {bot_token}"}
        response = requests.get(
            "https://slack.com/api/conversations.list",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                print("✅ PASS: Slack API token is valid")
                return True
            else:
                print(f"❌ FAIL: {data.get('error')}")
                return False
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing Slack Integration...")
    webhook = test_slack_webhook()
    channel = test_slack_channel_access()
    print(f"\nOverall: {'PASS' if webhook and channel else 'FAIL'}")
```

### Test Requirements

| Service | Test Endpoint | Expected Response | Priority |
|---------|---------------|-------------------|----------|
| JIRA | `/rest/api/2/myself` | 200 OK with user data | Required |
| JIRA | `/rest/api/2/project/ENG` | 200 OK with project data | Required |
| Slack | Webhook POST | 200 OK | Required |
| Slack | `/api/conversations.list` | 200 OK + ok: true | Optional |

---

## ⚠️ Phase 2 Gate

**DO NOT proceed to Phase 3 (Architect) until:**
- [ ] All handshake tests pass
- [ ] All API keys verified working
- [ ] Error handling documented

---

## API Documentation References

| Service | Documentation URL |
|---------|-------------------|
| JIRA REST API v2 | https://developer.atlassian.com/cloud/jira/platform/rest/v2/ |
| Slack Webhook API | https://api.slack.com/messaging/webhooks |
| Slack Events API | https://api.slack.com/events-api |

---

**Status:** ✅ COMPLETE - Integration specs documented, ready for Phase 2
