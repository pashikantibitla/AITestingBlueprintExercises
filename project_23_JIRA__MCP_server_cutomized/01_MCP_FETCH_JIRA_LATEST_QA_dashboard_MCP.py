"""
MCP Server: QA Dashboard with JIRA Integration (No CREW.AI)
===========================================================
Direct JIRA REST API connection via FastMCP tools & resources.

Run:    fastmcp run 03_QA_dashboard_MCP.py -t sse -p 8002
Test:   fastmcp call 03_QA_dashboard_MCP.py fetch_jira_ticket ticket_id="SCRUM-2"
"""

from fastmcp import FastMCP
import json
import os
import requests
from dotenv import load_dotenv
from datetime import datetime
from typing import Optional

load_dotenv()

mcp = FastMCP("QA Dashboard JIRA")

# ── JIRA Configuration (from env or defaults) ──
JIRA_BASE = os.getenv("JIRA_BASE_URL", "https://mounikapashikantibitla-1771170864282.atlassian.net")
JIRA_EMAIL = os.getenv("JIRA_EMAIL", "mounikapashikantibitla@gmail.com")
# Fallback to hardcoded token from original project if env var not set
JIRA_TOKEN = os.getenv("JIRA_API_TOKEN", "")


def _jira_auth():
    """Return JIRA auth tuple."""
    return (JIRA_EMAIL, JIRA_TOKEN)


def _fetch_jira_issue(ticket_id: str) -> dict:
    """Internal helper to fetch a JIRA issue via REST API v3."""
    url = f"{JIRA_BASE}/rest/api/3/issue/{ticket_id}"
    try:
        resp = requests.get(url, auth=_jira_auth(), timeout=30, headers={"Accept": "application/json"})
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}


def _extract_description(fields: dict) -> str:
    """Extract plain text from Atlassian Document Format description."""
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


# ═══════════════════════════════════════════════════════════════
# TOOLS  ->  AI can CALL these to perform actions / fetch data
# ═══════════════════════════════════════════════════════════════

@mcp.tool()
def fetch_jira_ticket(ticket_id: str) -> dict:
    """Fetch a JIRA ticket by ID and return structured details."""
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
    """Search JIRA tickets using JQL (JIRA Query Language)."""
    url = f"{JIRA_BASE}/rest/api/3/search"
    try:
        resp = requests.get(
            url,
            auth=_jira_auth(),
            timeout=30,
            headers={"Accept": "application/json"},
            params={"jql": jql, "maxResults": max_results, "fields": "summary,status,priority,issuetype,created,updated,assignee,reporter,labels"}
        )
        resp.raise_for_status()
        results = resp.json()
        tickets = []
        for issue in results.get("issues", []):
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
    """Generate a structured test plan for a given JIRA ticket (no LLM - template-based)."""
    data = _fetch_jira_issue(ticket_id)
    if "error" in data:
        return data

    fields = data.get("fields", {})
    summary = fields.get("summary", "Unknown")
    desc = _extract_description(fields)
    priority = fields.get("priority", {}).get("name", "Not specified")
    issue_type = fields.get("issuetype", {}).get("name", "Not specified")

    # Template-based test plan (no CREW.AI, no external LLM)
    test_plan = {
        "ticket_id": ticket_id,
        "ticket_summary": summary,
        "generated_at": datetime.now().isoformat(),
        "executive_summary": f"This document outlines the Test Plan and Test Strategy for JIRA ticket {ticket_id}. The objective is to validate the fix, ensure no regressions, and confirm all acceptance criteria are met.",
        "test_strategy": {
            "objectives": [
                "Validate that the reported issue is fixed and does not reoccur under normal conditions.",
                "Ensure related functionality remains unaffected (regression testing).",
                "Verify acceptance criteria are fully met before sign-off.",
                "Identify any edge cases or boundary conditions that may expose additional issues.",
            ],
            "scope": {
                "in_scope": [
                    f"Functional testing of {issue_type.lower()} and related user flows.",
                    "Regression testing of affected modules and downstream integrations.",
                    "Cross-browser and cross-platform verification (if applicable).",
                    "UI/UX validation for any visual or interaction changes."
                ],
                "out_of_scope": [
                    "Performance testing (unless explicitly specified in ticket).",
                    "Security penetration testing (unless ticket is security-related).",
                    "Third-party integration testing beyond direct dependencies.",
                    "Load testing and stress testing."
                ]
            },
            "test_approach": [
                {"phase": "Phase 1", "activity": "Test Planning & Design", "owner": "QA Lead"},
                {"phase": "Phase 2", "activity": "Test Case Development", "owner": "QA Engineer"},
                {"phase": "Phase 3", "activity": "Test Execution", "owner": "QA Engineer"},
                {"phase": "Phase 4", "activity": "Bug Verification & Regression", "owner": "QA Engineer"},
                {"phase": "Phase 5", "activity": "Sign-off & Reporting", "owner": "QA Lead"},
            ],
            "test_types": [
                {"type": "Functional Testing", "purpose": "Verify the fix meets requirements and behaves as expected."},
                {"type": "Regression Testing", "purpose": "Ensure no side effects or broken functionality in related areas."},
                {"type": "Smoke Testing", "purpose": "Quick validation of critical paths after deployment."},
                {"type": "Exploratory Testing", "purpose": "Ad-hoc testing around the fix to uncover hidden issues."},
                {"type": "UAT", "purpose": "Business stakeholder validation before release."},
            ],
            "entry_criteria": [
                "Fix deployed to stable test environment.",
                "Test data prepared and validated.",
                "Test environment is stable and accessible.",
                "Requirements and acceptance criteria are clear and documented."
            ],
            "exit_criteria": [
                "All test cases executed with documented results.",
                "No critical or high defects open.",
                "All acceptance criteria are met.",
                "Test coverage is >= 80%.",
                "Stakeholder sign-off obtained."
            ],
            "risk_assessment": [
                {"risk": "Environment instability", "probability": "Medium", "impact": "High", "mitigation": "Use dedicated test environment; maintain environment health checks."},
                {"risk": "Incomplete requirements", "probability": "Low", "impact": "Medium", "mitigation": "Clarify with Product Owner before test design."},
                {"risk": "Regression in related modules", "probability": "Medium", "impact": "High", "mitigation": "Execute broad regression suite; monitor error logs."},
            ]
        },
        "test_scenarios": [
            {
                "id": "TS-01",
                "title": f"Verify {summary} - Happy Path",
                "preconditions": "User is authenticated; test environment is stable.",
                "steps": [
                    "Navigate to the affected feature/module.",
                    "Perform the primary action as per normal business flow.",
                    "Verify the expected outcome is achieved without errors."
                ],
                "expected_result": "The feature works correctly and the issue is no longer reproducible.",
                "priority": "High"
            },
            {
                "id": "TS-02",
                "title": f"Verify {summary} - Negative Scenario",
                "preconditions": "User is authenticated; invalid/malformed input data is prepared.",
                "steps": [
                    "Navigate to the affected feature/module.",
                    "Provide invalid or edge-case input data.",
                    "Submit the action and observe system behavior."
                ],
                "expected_result": "System handles invalid input gracefully with appropriate error messages.",
                "priority": "High"
            },
            {
                "id": "TS-03",
                "title": "Regression - Related Module Check",
                "preconditions": "Fix deployed; related modules accessible.",
                "steps": [
                    "Identify modules that interact with the fixed component.",
                    "Execute core workflows through each related module.",
                    "Verify no new defects or broken functionality."
                ],
                "expected_result": "All related modules function correctly; no regression defects found.",
                "priority": "High"
            },
            {
                "id": "TS-04",
                "title": "Boundary Value Analysis",
                "preconditions": "Boundary values for inputs are identified and documented.",
                "steps": [
                    "Test with minimum valid input value.",
                    "Test with maximum valid input value.",
                    "Test with values just below and above boundaries."
                ],
                "expected_result": "System accepts valid boundaries and rejects invalid ones with proper messaging.",
                "priority": "Medium"
            },
            {
                "id": "TS-05",
                "title": "Cross-Browser / Cross-Platform Verification",
                "preconditions": "Application deployed to test environment; multiple browsers/platforms available.",
                "steps": [
                    "Execute the fix validation on Chrome browser.",
                    "Execute the fix validation on Firefox browser.",
                    "Execute the fix validation on mobile responsive view (if applicable)."
                ],
                "expected_result": "Consistent behavior across all supported browsers and platforms.",
                "priority": "Medium"
            },
            {
                "id": "TS-06",
                "title": "Edge Case - Concurrent User Actions",
                "preconditions": "Multiple test user accounts prepared; load testing tool available (optional).",
                "steps": [
                    "Simulate two users performing the same action simultaneously.",
                    "Observe data consistency and locking mechanisms.",
                    "Verify no race conditions or data corruption occur."
                ],
                "expected_result": "System handles concurrency correctly; data remains consistent.",
                "priority": "Low"
            },
        ],
        "test_data_requirements": [
            "Valid user credentials for authenticated flows.",
            "Invalid/malformed input data for negative testing.",
            "Boundary value datasets (min, max, below min, above max).",
            "Sample product/catalog data relevant to the module.",
            "Payment test data (test credit cards, sandbox payment accounts)."
        ],
        "defect_management": {
            "tool": "JIRA",
            "severity_levels": ["Critical", "High", "Medium", "Low"],
            "sla": {
                "Critical": "24 hours",
                "High": "48 hours",
                "Medium": "1 week",
                "Low": "next sprint"
            }
        },
        "sign_off_criteria": [
            "All acceptance criteria are met and verified.",
            "No critical or high-severity defects are open.",
            "Test coverage is >= 80%.",
            "Stakeholder approval is obtained via formal sign-off."
        ],
        "approvals": [
            {"role": "QA Lead", "name": "", "signature_date": ""},
            {"role": "Product Owner", "name": "", "signature_date": ""}
        ]
    }

    return test_plan


@mcp.tool()
def bug_triage_analysis(ticket_id: str) -> dict:
    """Perform bug triage analysis on a JIRA ticket (template-based, no LLM)."""
    data = _fetch_jira_issue(ticket_id)
    if "error" in data:
        return data

    fields = data.get("fields", {})
    summary = fields.get("summary", "Unknown")
    priority = fields.get("priority", {}).get("name", "Not specified")
    issue_type = fields.get("issuetype", {}).get("name", "Not specified")
    status = fields.get("status", {}).get("name", "Unknown")
    labels = fields.get("labels", [])

    # Simple rule-based severity classification
    severity = "P3 (Minor)"
    if priority.lower() in ["highest", "critical"]:
        severity = "P0 (Blocker)"
    elif priority.lower() == "high":
        severity = "P1 (Critical)"
    elif priority.lower() == "medium":
        severity = "P2 (Major)"
    elif priority.lower() == "low":
        severity = "P4 (Trivial)"

    category = "Functional"
    if any(l in labels for l in ["ui", "ux", "frontend"]):
        category = "UI"
    elif any(l in labels for l in ["performance", "slow", "latency"]):
        category = "Performance"
    elif any(l in labels for l in ["security", "auth", "vulnerability"]):
        category = "Security"
    elif any(l in labels for l in ["data", "database", "db"]):
        category = "Data"

    return {
        "ticket_id": ticket_id,
        "ticket_summary": summary,
        "triage_date": datetime.now().isoformat(),
        "classification": {
            "severity": severity,
            "priority": priority,
            "category": category,
            "issue_type": issue_type,
            "status": status
        },
        "business_impact": f"Ticket '{summary}' has {priority} priority and is classified as {severity}. Impact depends on affected user base and release timeline.",
        "root_cause_analysis": {
            "likely_cause": "Requires developer investigation. Common causes include: logic error, missing validation, integration failure, or data inconsistency.",
            "affected_layer": "Unknown - verify through logs (UI -> API -> Service -> DB).",
            "investigation_steps": [
                "Reproduce the issue in a stable environment.",
                "Check application logs for error stacks.",
                "Review recent commits/deployments related to the affected module.",
                "Verify database state and related records.",
                "Check third-party service status if applicable."
            ],
            "logs_to_check": ["application.log", "error.log", "access.log", "database slow-query log"]
        },
        "test_recommendations": {
            "verification_tests": [
                f"Confirm the fix for '{summary}' works under normal conditions."
            ],
            "regression_tests": [
                "Run smoke tests on the affected module.",
                "Execute integration tests with adjacent modules.",
                "Validate data consistency across related tables."
            ],
            "edge_cases": [
                "Test with null/empty inputs.",
                "Test with maximum allowed data size.",
                "Test concurrent access to the same resource.",
                "Test behavior during network interruptions."
            ],
            "automation_approach": "Use Playwright (TypeScript) for E2E validation. Add API contract tests for backend verification."
        },
        "sprint_priority": "High" if severity in ["P0 (Blocker)", "P1 (Critical)"] else "Medium"
    }


@mcp.tool()
def get_jira_projects() -> list:
    """List all accessible JIRA projects."""
    url = f"{JIRA_BASE}/rest/api/3/project"
    try:
        resp = requests.get(url, auth=_jira_auth(), timeout=30, headers={"Accept": "application/json"})
        resp.raise_for_status()
        projects = []
        for p in resp.json():
            projects.append({
                "id": p.get("id"),
                "key": p.get("key"),
                "name": p.get("name"),
                "project_type": p.get("projectTypeKey"),
                "avatar_url": p.get("avatarUrls", {}).get("48x48", "")
            })
        return projects
    except Exception as e:
        return [{"error": str(e)}]


@mcp.tool()
def get_issue_types() -> list:
    """List available JIRA issue types."""
    url = f"{JIRA_BASE}/rest/api/3/issuetype"
    try:
        resp = requests.get(url, auth=_jira_auth(), timeout=30, headers={"Accept": "application/json"})
        resp.raise_for_status()
        types = []
        for t in resp.json():
            types.append({
                "id": t.get("id"),
                "name": t.get("name"),
                "description": t.get("description", ""),
                "subtask": t.get("subtask", False)
            })
        return types
    except Exception as e:
        return [{"error": str(e)}]


# ================================================================
# RESOURCES  ->  Read-only data the AI can access
# ================================================================

@mcp.resource("jira://ticket/{ticket_id}")
def jira_ticket_resource(ticket_id: str) -> str:
    """Formatted JIRA ticket details as a readable text resource."""
    data = fetch_jira_ticket(ticket_id)
    if "error" in data:
        return f"Error fetching ticket {ticket_id}: {data['error']}"

    return (
        f"JIRA Ticket: {data['key']}\n"
        f"{'=' * 50}\n"
        f"Summary:    {data['summary']}\n"
        f"Type:       {data['issue_type']}\n"
        f"Priority:   {data['priority']}\n"
        f"Status:     {data['status']}\n"
        f"Reporter:   {data['reporter']}\n"
        f"Assignee:   {data['assignee']}\n"
        f"Labels:     {', '.join(data['labels']) if data['labels'] else 'None'}\n"
        f"Created:    {data['created']}\n"
        f"Updated:    {data['updated']}\n\n"
        f"Description:\n{'-' * 40}\n"
        f"{data['description']}\n"
    )


@mcp.resource("jira://projects")
def jira_projects_resource() -> str:
    """List of all accessible JIRA projects."""
    projects = get_jira_projects()
    if projects and "error" in projects[0]:
        return f"Error: {projects[0]['error']}"

    lines = ["JIRA Projects", "=" * 40]
    for p in projects:
        lines.append(f"[{p['key']}] {p['name']} (Type: {p['project_type']})")
    return "\n".join(lines)


@mcp.resource("jira://search/{jql_query}")
def jira_search_resource(jql_query: str) -> str:
    """Search JIRA tickets using JQL and return formatted results."""
    tickets = search_jira_tickets(jql=jql_query, max_results=20)
    if not tickets:
        return "No tickets found."
    if "error" in tickets[0]:
        return f"Error: {tickets[0]['error']}"

    lines = [f"JIRA Search Results ({len(tickets)} tickets)", "=" * 50]
    for t in tickets:
        lines.append(
            f"[{t['key']}] {t['summary']}\n"
            f"    Status: {t['status']} | Priority: {t['priority']} | Type: {t['issue_type']}\n"
            f"    Assignee: {t['assignee']} | Reporter: {t['reporter']}\n"
        )
    return "\n".join(lines)


@mcp.resource("testplan://{ticket_id}")
def test_plan_resource(ticket_id: str) -> str:
    """Generated test plan for a JIRA ticket as a readable text resource."""
    plan = generate_test_plan(ticket_id)
    if "error" in plan:
        return f"Error: {plan['error']}"

    lines = [
        f"TEST PLAN & STRATEGY - {plan['ticket_id']}",
        f"{'=' * 60}",
        f"Ticket: {plan['ticket_summary']}",
        f"Generated: {plan['generated_at']}",
        "",
        "1. EXECUTIVE SUMMARY",
        f"{plan['executive_summary']}",
        "",
        "2. TEST STRATEGY",
        "2.1 Objectives:",
    ]
    for obj in plan['test_strategy']['objectives']:
        lines.append(f"  - {obj}")

    lines.extend(["", "2.2 Test Approach:", "  Phase | Activity | Owner", "  " + "-" * 40])
    for row in plan['test_strategy']['test_approach']:
        lines.append(f"  {row['phase']} | {row['activity']} | {row['owner']}")

    lines.extend(["", "3. TEST SCENARIOS", ""])
    for ts in plan['test_scenarios']:
        lines.append(f"  {ts['id']}: {ts['title']} (Priority: {ts['priority']})")
        lines.append(f"    Expected: {ts['expected_result']}")
        lines.append("")

    lines.extend([
        "4. DEFECT MANAGEMENT",
        f"  Tool: {plan['defect_management']['tool']}",
        f"  SLA - Critical: 24h | High: 48h | Medium: 1 week | Low: next sprint",
        "",
        "5. SIGN-OFF CRITERIA",
    ])
    for crit in plan['sign_off_criteria']:
        lines.append(f"  [x] {crit}")

    return "\n".join(lines)


@mcp.resource("triage://{ticket_id}")
def triage_resource(ticket_id: str) -> str:
    """Bug triage report for a JIRA ticket as a readable text resource."""
    triage = bug_triage_analysis(ticket_id)
    if "error" in triage:
        return f"Error: {triage['error']}"

    return (
        f"BUG TRIAGE REPORT - {triage['ticket_id']}\n"
        f"{'=' * 50}\n"
        f"Summary: {triage['ticket_summary']}\n"
        f"Date: {triage['triage_date']}\n\n"
        f"CLASSIFICATION\n"
        f"  Severity:   {triage['classification']['severity']}\n"
        f"  Priority:   {triage['classification']['priority']}\n"
        f"  Category:   {triage['classification']['category']}\n"
        f"  Issue Type: {triage['classification']['issue_type']}\n"
        f"  Status:     {triage['classification']['status']}\n\n"
        f"SPRINT PRIORITY: {triage['sprint_priority']}\n\n"
        f"ROOT CAUSE ANALYSIS\n"
        f"  Likely Cause: {triage['root_cause_analysis']['likely_cause']}\n"
        f"  Affected Layer: {triage['root_cause_analysis']['affected_layer']}\n\n"
        f"TEST RECOMMENDATIONS\n"
        f"  Verification: {triage['test_recommendations']['verification_tests'][0]}\n"
        f"  Automation:   {triage['test_recommendations']['automation_approach']}\n"
    )


if __name__ == "__main__":
    mcp.run()
