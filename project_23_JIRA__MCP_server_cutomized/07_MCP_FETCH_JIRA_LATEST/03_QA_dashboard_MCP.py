from fastmcp import FastMCP
import json, os, requests
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
mcp = FastMCP("QA Dashboard JIRA")

JIRA_BASE = os.getenv("JIRA_BASE_URL", "")
JIRA_EMAIL = os.getenv("JIRA_EMAIL", "")
JIRA_TOKEN = os.getenv("JIRA_API_TOKEN", "")

def _jira_auth():
    return (JIRA_EMAIL, JIRA_TOKEN)

def _fetch_jira_issue(ticket_id):
    url = f"{JIRA_BASE}/rest/api/3/issue/{ticket_id}"
    try:
        resp = requests.get(url, auth=_jira_auth(), timeout=30, headers={"Accept": "application/json"})
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def _extract_description(fields):
    desc = "No description provided."
    description_field = fields.get("description")
    if description_field and isinstance(description_field, dict):
        try:
            content = description_field.get("content", [])
            text_parts = []
            for block in content:
                if isinstance(block, dict) and "content" in block:
                    for item in block["content"]:
                        if isinstance(item, dict) and "text" in item:
                            text_parts.append(item["text"])
            if text_parts:
                desc = "\n".join(text_parts)
        except Exception:
            desc = str(description_field)
    return desc

@mcp.tool()
def fetch_jira_ticket(ticket_id: str) -> dict:
    data = _fetch_jira_issue(ticket_id)
    if "error" in data:
        return data
    fields = data.get("fields", {})
    return {
        "key": data.get("key", ticket_id),
        "summary": fields.get("summary", "No summary"),
        "description": _extract_description(fields),
        "priority": fields.get("priority", {}).get("name", "Not specified"),
        "issue_type": fields.get("issuetype", {}).get("name", "Not specified"),
        "status": fields.get("status", {}).get("name", "Unknown"),
        "reporter": fields.get("reporter", {}).get("displayName", "Unknown"),
        "assignee": fields.get("assignee", {}).get("displayName", "Unassigned") if fields.get("assignee") else "Unassigned",
        "labels": fields.get("labels", []),
        "created": fields.get("created", "Unknown"),
        "updated": fields.get("updated", "Unknown"),
    }

@mcp.tool()
def search_jira_tickets(jql: str = "project = SCRUM ORDER BY created DESC", max_results: int = 10) -> list:
    url = f"{JIRA_BASE}/rest/api/3/search"
    try:
        resp = requests.get(url, auth=_jira_auth(), timeout=30, headers={"Accept": "application/json"},
            params={"jql": jql, "maxResults": max_results, "fields": "summary,status,priority,issuetype,created,updated,assignee,reporter,labels"})
        resp.raise_for_status()
        tickets = []
        for issue in resp.json().get("issues", []):
            f = issue.get("fields", {})
            tickets.append({
                "key": issue.get("key"),
                "summary": f.get("summary", ""),
                "status": f.get("status", {}).get("name", ""),
                "priority": f.get("priority", {}).get("name", ""),
                "issue_type": f.get("issuetype", {}).get("name", ""),
                "created": f.get("created", ""),
                "assignee": f.get("assignee", {}).get("displayName", "Unassigned") if f.get("assignee") else "Unassigned",
                "reporter": f.get("reporter", {}).get("displayName", "Unknown"),
            })
        return tickets
    except Exception as e:
        return [{"error": str(e)}]

@mcp.tool()
def generate_test_plan(ticket_id: str) -> dict:
    data = _fetch_jira_issue(ticket_id)
    if "error" in data:
        return data
    fields = data.get("fields", {})
    summary = fields.get("summary", "Unknown")
    return {
        "ticket_id": ticket_id,
        "ticket_summary": summary,
        "generated_at": datetime.now().isoformat(),
        "executive_summary": f"Test Plan for {ticket_id}",
        "test_strategy": {
            "objectives": ["Validate fix", "Regression test", "Verify acceptance criteria"],
            "test_approach": [
                {"phase": "Phase 1", "activity": "Test Planning", "owner": "QA Lead"},
                {"phase": "Phase 2", "activity": "Test Development", "owner": "QA Engineer"},
                {"phase": "Phase 3", "activity": "Test Execution", "owner": "QA Engineer"},
            ],
            "entry_criteria": ["Fix deployed", "Test data ready"],
            "exit_criteria": ["No critical bugs", "Coverage >= 80%"],
        },
        "test_scenarios": [
            {"id": "TS-01", "title": f"Verify {summary} - Happy Path", "priority": "High", "expected_result": "Feature works correctly"},
            {"id": "TS-02", "title": f"Verify {summary} - Negative", "priority": "High", "expected_result": "Handles errors gracefully"},
            {"id": "TS-03", "title": "Regression Check", "priority": "High", "expected_result": "No regression defects"},
        ],
        "defect_management": {"tool": "JIRA", "sla": {"Critical": "24h", "High": "48h"}},
        "sign_off_criteria": ["All acceptance criteria met", "No critical defects"],
    }

@mcp.tool()
def bug_triage_analysis(ticket_id: str) -> dict:
    data = _fetch_jira_issue(ticket_id)
    if "error" in data:
        return data
    fields = data.get("fields", {})
    summary = fields.get("summary", "Unknown")
    priority = fields.get("priority", {}).get("name", "Not specified")
    labels = fields.get("labels", [])
    severity = "P3 (Minor)"
    if priority.lower() in ["highest", "critical"]: severity = "P0 (Blocker)"
    elif priority.lower() == "high": severity = "P1 (Critical)"
    elif priority.lower() == "medium": severity = "P2 (Major)"
    elif priority.lower() == "low": severity = "P4 (Trivial)"
    category = "Functional"
    if any(l in labels for l in ["ui", "ux"]): category = "UI"
    elif any(l in labels for l in ["performance"]): category = "Performance"
    elif any(l in labels for l in ["security"]): category = "Security"
    return {
        "ticket_id": ticket_id,
        "ticket_summary": summary,
        "triage_date": datetime.now().isoformat(),
        "classification": {"severity": severity, "priority": priority, "category": category},
        "sprint_priority": "High" if severity in ["P0 (Blocker)", "P1 (Critical)"] else "Medium",
        "root_cause_analysis": {
            "likely_cause": "Requires investigation. Common: logic error, missing validation, integration failure.",
            "investigation_steps": ["Reproduce issue", "Check logs", "Review commits"],
        },
        "test_recommendations": {
            "verification_tests": [f"Confirm fix for '{summary}'"],
            "automation_approach": "Playwright (TypeScript) for E2E.",
        },
    }

@mcp.tool()
def get_jira_projects() -> list:
    url = f"{JIRA_BASE}/rest/api/3/project"
    try:
        resp = requests.get(url, auth=_jira_auth(), timeout=30, headers={"Accept": "application/json"})
        resp.raise_for_status()
        return [{"id": p.get("id"), "key": p.get("key"), "name": p.get("name"), "project_type": p.get("projectTypeKey")} for p in resp.json()]
    except Exception as e:
        return [{"error": str(e)}]

@mcp.tool()
def get_issue_types() -> list:
    url = f"{JIRA_BASE}/rest/api/3/issuetype"
    try:
        resp = requests.get(url, auth=_jira_auth(), timeout=30, headers={"Accept": "application/json"})
        resp.raise_for_status()
        return [{"id": t.get("id"), "name": t.get("name"), "subtask": t.get("subtask", False)} for t in resp.json()]
    except Exception as e:
        return [{"error": str(e)}]

@mcp.resource("jira://ticket/{ticket_id}")
def jira_ticket_resource(ticket_id: str) -> str:
    data = fetch_jira_ticket(ticket_id)
    if "error" in data:
        return f"Error: {data['error']}"
    return f"JIRA Ticket: {data['key']}\nSummary: {data['summary']}\nPriority: {data['priority']}\nStatus: {data['status']}"

@mcp.resource("jira://projects")
def jira_projects_resource() -> str:
    projects = get_jira_projects()
    if projects and "error" in projects[0]:
        return f"Error: {projects[0]['error']}"
    return "\n".join([f"[{p['key']}] {p['name']}" for p in projects])

@mcp.resource("testplan://{ticket_id}")
def test_plan_resource(ticket_id: str) -> str:
    plan = generate_test_plan(ticket_id)
    if "error" in plan:
        return f"Error: {plan['error']}"
    return f"Test Plan for {plan['ticket_id']}: {plan['ticket_summary']}"

@mcp.resource("triage://{ticket_id}")
def triage_resource(ticket_id: str) -> str:
    triage = bug_triage_analysis(ticket_id)
    if "error" in triage:
        return f"Error: {triage['error']}"
    return f"Triage: {triage['ticket_id']} | Severity: {triage['classification']['severity']}"

if __name__ == "__main__":
    mcp.run()
