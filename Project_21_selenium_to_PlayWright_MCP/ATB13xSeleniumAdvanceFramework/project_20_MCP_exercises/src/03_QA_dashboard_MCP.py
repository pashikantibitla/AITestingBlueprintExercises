"""
MCP Server 3: QA Dashboard
==========================
Demonstrates: TOOLS + RESOURCES for QA metrics, test runs, bugs, and coverage.

Run:    fastmcp dev inspector 03_QA_dashboard_MCP.py
Test:   fastmcp call 03_QA_dashboard_MCP.py get_qa_metrics
"""

from fastmcp import FastMCP
import json
from datetime import datetime, timedelta
from typing import Optional

mcp = FastMCP("QA Dashboard")

# ── In-memory QA data store (would connect to DB in production) ──
_qa_data = {
    "projects": [
        {"id": "proj_001", "name": "E-commerce Platform", "status": "active"},
        {"id": "proj_002", "name": "Mobile Banking App", "status": "active"},
        {"id": "proj_003", "name": "AI Chatbot", "status": "completed"},
    ],
    "test_runs": [
        {"id": "run_001", "project_id": "proj_001", "name": "Sprint 24 Regression", "date": "2026-04-28", "passed": 142, "failed": 3, "skipped": 5, "status": "completed"},
        {"id": "run_002", "project_id": "proj_001", "name": "Smoke Test - Payment Flow", "date": "2026-04-29", "passed": 45, "failed": 1, "skipped": 0, "status": "completed"},
        {"id": "run_003", "project_id": "proj_002", "name": "Security Audit Suite", "date": "2026-04-27", "passed": 89, "failed": 12, "skipped": 2, "status": "completed"},
        {"id": "run_004", "project_id": "proj_002", "name": "API Contract Tests", "date": "2026-04-29", "passed": 0, "failed": 0, "skipped": 0, "status": "in_progress"},
    ],
    "bugs": [
        {"id": "BUG-101", "project_id": "proj_001", "title": "Checkout button unresponsive on Safari", "severity": "high", "status": "open", "assigned_to": "qa_lead", "created": "2026-04-25"},
        {"id": "BUG-102", "project_id": "proj_001", "title": "Discount coupon not applying correctly", "severity": "medium", "status": "in_progress", "assigned_to": "dev_team", "created": "2026-04-26"},
        {"id": "BUG-103", "project_id": "proj_002", "title": "Session timeout too short", "severity": "critical", "status": "open", "assigned_to": "security_team", "created": "2026-04-28"},
        {"id": "BUG-104", "project_id": "proj_002", "title": "Biometric login fails on Android 14", "severity": "high", "status": "resolved", "assigned_to": "mobile_team", "created": "2026-04-20"},
        {"id": "BUG-105", "project_id": "proj_001", "title": "Product image loading slow", "severity": "low", "status": "open", "assigned_to": "frontend_team", "created": "2026-04-29"},
    ],
    "test_cases": [
        {"id": "TC-001", "project_id": "proj_001", "title": "User Registration Flow", "automation_status": "automated", "last_run": "2026-04-28", "result": "passed"},
        {"id": "TC-002", "project_id": "proj_001", "title": "Payment Gateway Integration", "automation_status": "automated", "last_run": "2026-04-28", "result": "passed"},
        {"id": "TC-003", "project_id": "proj_001", "title": "Order Cancellation", "automation_status": "manual", "last_run": "2026-04-25", "result": "failed"},
        {"id": "TC-004", "project_id": "proj_002", "title": "Two-Factor Authentication", "automation_status": "automated", "last_run": "2026-04-27", "result": "passed"},
        {"id": "TC-005", "project_id": "proj_002", "title": "Fund Transfer Limits", "automation_status": "partial", "last_run": "2026-04-26", "result": "passed"},
    ]
}


# ═══════════════════════════════════════════════════════════════
# TOOLS  →  AI can CALL these to perform actions / fetch data
# ═══════════════════════════════════════════════════════════════

@mcp.tool()
def get_projects() -> list:
    """List all QA projects with their status."""
    return _qa_data["projects"]


@mcp.tool()
def get_test_run_summary(run_id: Optional[str] = None, project_id: Optional[str] = None) -> dict:
    """Get test run summary by run_id or project_id. Returns pass/fail/skip counts."""
    runs = _qa_data["test_runs"]

    if run_id:
        run = next((r for r in runs if r["id"] == run_id), None)
        if not run:
            return {"error": f"Test run '{run_id}' not found"}
        total = run["passed"] + run["failed"] + run["skipped"]
        return {
            "run_id": run["id"],
            "name": run["name"],
            "date": run["date"],
            "status": run["status"],
            "total": total,
            "passed": run["passed"],
            "failed": run["failed"],
            "skipped": run["skipped"],
            "pass_rate": round(run["passed"] / max(total, 1) * 100, 1)
        }

    if project_id:
        project_runs = [r for r in runs if r["project_id"] == project_id]
        if not project_runs:
            return {"error": f"No test runs found for project '{project_id}'"}
        total_passed = sum(r["passed"] for r in project_runs)
        total_failed = sum(r["failed"] for r in project_runs)
        total_skipped = sum(r["skipped"] for r in project_runs)
        total = total_passed + total_failed + total_skipped
        return {
            "project_id": project_id,
            "total_runs": len(project_runs),
            "total_tests": total,
            "passed": total_passed,
            "failed": total_failed,
            "skipped": total_skipped,
            "pass_rate": round(total_passed / max(total, 1) * 100, 1),
            "runs": [{"id": r["id"], "name": r["name"], "status": r["status"]} for r in project_runs]
        }

    # Return all runs summary
    total_passed = sum(r["passed"] for r in runs)
    total_failed = sum(r["failed"] for r in runs)
    total_skipped = sum(r["skipped"] for r in runs)
    total = total_passed + total_failed + total_skipped
    return {
        "total_runs": len(runs),
        "total_tests": total,
        "passed": total_passed,
        "failed": total_failed,
        "skipped": total_skipped,
        "pass_rate": round(total_passed / max(total, 1) * 100, 1)
    }


@mcp.tool()
def get_bug_summary(project_id: Optional[str] = None, severity: Optional[str] = None) -> dict:
    """Get bug summary. Filter by project_id or severity (critical/high/medium/low)."""
    bugs = _qa_data["bugs"]

    if project_id:
        bugs = [b for b in bugs if b["project_id"] == project_id]
    if severity:
        bugs = [b for b in bugs if b["severity"] == severity.lower()]

    status_counts = {}
    severity_counts = {}
    for b in bugs:
        status_counts[b["status"]] = status_counts.get(b["status"], 0) + 1
        severity_counts[b["severity"]] = severity_counts.get(b["severity"], 0) + 1

    return {
        "total_bugs": len(bugs),
        "by_status": status_counts,
        "by_severity": severity_counts,
        "open_critical": len([b for b in bugs if b["status"] == "open" and b["severity"] == "critical"]),
        "bugs": [{"id": b["id"], "title": b["title"], "severity": b["severity"], "status": b["status"]} for b in bugs]
    }


@mcp.tool()
def get_test_case_coverage(project_id: Optional[str] = None) -> dict:
    """Get test case automation coverage. Filter by project_id."""
    cases = _qa_data["test_cases"]

    if project_id:
        cases = [c for c in cases if c["project_id"] == project_id]

    auto_counts = {}
    result_counts = {}
    for c in cases:
        auto_counts[c["automation_status"]] = auto_counts.get(c["automation_status"], 0) + 1
        result_counts[c["result"]] = result_counts.get(c["result"], 0) + 1

    total = len(cases)
    automated = auto_counts.get("automated", 0)

    return {
        "total_test_cases": total,
        "automation_coverage": round(automated / max(total, 1) * 100, 1),
        "by_automation_status": auto_counts,
        "by_last_result": result_counts,
        "test_cases": [{"id": c["id"], "title": c["title"], "status": c["automation_status"], "last_result": c["result"]} for c in cases]
    }


@mcp.tool()
def get_qa_metrics() -> dict:
    """Get overall QA health metrics across all projects."""
    runs = _qa_data["test_runs"]
    bugs = _qa_data["bugs"]
    cases = _qa_data["test_cases"]

    total_passed = sum(r["passed"] for r in runs)
    total_failed = sum(r["failed"] for r in runs)
    total_tests = total_passed + total_failed + sum(r["skipped"] for r in runs)

    open_bugs = len([b for b in bugs if b["status"] in ("open", "in_progress")])
    critical_bugs = len([b for b in bugs if b["severity"] == "critical" and b["status"] == "open"])
    automated_cases = len([c for c in cases if c["automation_status"] == "automated"])

    return {
        "overall_health": "healthy" if total_failed == 0 and critical_bugs == 0 else "needs_attention",
        "test_execution": {
            "total_runs": len(runs),
            "total_tests_executed": total_tests,
            "pass_rate": round(total_passed / max(total_tests, 1) * 100, 1),
            "active_runs": len([r for r in runs if r["status"] == "in_progress"])
        },
        "bug_tracking": {
            "total_bugs": len(bugs),
            "open_bugs": open_bugs,
            "critical_open": critical_bugs,
            "resolved_today": len([b for b in bugs if b["status"] == "resolved"])
        },
        "automation": {
            "total_test_cases": len(cases),
            "automated": automated_cases,
            "automation_coverage": round(automated_cases / max(len(cases), 1) * 100, 1)
        }
    }


# ═══════════════════════════════════════════════════════════════
# RESOURCES  →  Read-only data the AI can access (like GET endpoints)
# ═══════════════════════════════════════════════════════════════

@mcp.resource("qa-dashboard://projects")
def get_projects_resource() -> str:
    """List of all active QA projects."""
    lines = ["QA Projects", "==========="]
    for p in _qa_data["projects"]:
        lines.append(f"[{p['status'].upper()}] {p['name']} (ID: {p['id']})")
    return "\n".join(lines)


@mcp.resource("qa-dashboard://metrics")
def get_metrics_resource() -> str:
    """Overall QA health metrics as a readable text report."""
    metrics = get_qa_metrics()
    return (
        f"QA Health Report - {datetime.now().strftime('%Y-%m-%d')}\n"
        f"================================\n\n"
        f"Overall Status: {metrics['overall_health'].upper()}\n\n"
        f"Test Execution:\n"
        f"  - Total Runs: {metrics['test_execution']['total_runs']}\n"
        f"  - Tests Executed: {metrics['test_execution']['total_tests_executed']}\n"
        f"  - Pass Rate: {metrics['test_execution']['pass_rate']}%\n"
        f"  - Active Runs: {metrics['test_execution']['active_runs']}\n\n"
        f"Bug Tracking:\n"
        f"  - Total Bugs: {metrics['bug_tracking']['total_bugs']}\n"
        f"  - Open Bugs: {metrics['bug_tracking']['open_bugs']}\n"
        f"  - Critical Open: {metrics['bug_tracking']['critical_open']}\n\n"
        f"Automation:\n"
        f"  - Total Cases: {metrics['automation']['total_test_cases']}\n"
        f"  - Automated: {metrics['automation']['automated']}\n"
        f"  - Coverage: {metrics['automation']['automation_coverage']}%\n"
    )


@mcp.resource("qa-dashboard://bugs/open")
def get_open_bugs_resource() -> str:
    """List of all open and in-progress bugs."""
    open_bugs = [b for b in _qa_data["bugs"] if b["status"] in ("open", "in_progress")]
    lines = [f"Open Bugs ({len(open_bugs)})", "=" * 40]
    for b in open_bugs:
        lines.append(f"[{b['severity'].upper()}] {b['id']}: {b['title']} ({b['status']}) -> {b['assigned_to']}")
    return "\n".join(lines)


@mcp.resource("qa-dashboard://projects/{project_id}/details")
def get_project_details_resource(project_id: str) -> str:
    """Detailed status for a specific project."""
    project = next((p for p in _qa_data["projects"] if p["id"] == project_id), None)
    if not project:
        return f"Project '{project_id}' not found."

    runs = [r for r in _qa_data["test_runs"] if r["project_id"] == project_id]
    bugs = [b for b in _qa_data["bugs"] if b["project_id"] == project_id]
    cases = [c for c in _qa_data["test_cases"] if c["project_id"] == project_id]

    lines = [
        f"Project: {project['name']} ({project_id})",
        f"Status: {project['status']}",
        "",
        f"Test Runs: {len(runs)}",
        f"Bugs: {len(bugs)} (Open: {len([b for b in bugs if b['status'] == 'open'])})",
        f"Test Cases: {len(cases)}",
        "",
        "Recent Bugs:",
    ]
    for b in bugs[:3]:
        lines.append(f"  [{b['severity']}] {b['title']} ({b['status']})")

    return "\n".join(lines)


# ── Legacy resources from original exercise (kept for compatibility) ──
@mcp.resource("testresults://latest")
def latest_test_results() -> str:
    """Latest smoke test execution results."""
    results = {
        "run_id": "RUN-2025-0342",
        "timestamp": datetime.now().isoformat(),
        "suite": "Smoke Tests",
        "duration_seconds": 142,
        "summary": {"total": 25, "passed": 21, "failed": 3, "skipped": 1},
        "pass_rate": "84.0%",
        "failed_tests": [
            {"name": "test_checkout_payment", "error": "TimeoutError: Payment gateway did not respond in 30s", "duration": 30.2},
            {"name": "test_user_profile_update", "error": "AssertionError: Expected status 200, got 500", "duration": 2.1},
            {"name": "test_search_pagination", "error": "ElementNotFound: Pagination button not visible", "duration": 8.7},
        ],
    }
    return json.dumps(results, indent=2)


@mcp.resource("environments://status")
def environment_status() -> str:
    """Current status of all test environments."""
    envs = [
        {"name": "Development", "url": "https://dev.myapp.com", "status": "healthy", "version": "2.4.1-dev", "last_deploy": "2025-03-14T10:30:00", "uptime": "99.2%"},
        {"name": "Staging", "url": "https://staging.myapp.com", "status": "healthy", "version": "2.4.0", "last_deploy": "2025-03-13T16:00:00", "uptime": "99.8%"},
        {"name": "Production", "url": "https://myapp.com", "status": "healthy", "version": "2.3.9", "last_deploy": "2025-03-10T08:00:00", "uptime": "99.95%"},
        {"name": "Performance", "url": "https://perf.myapp.com", "status": "degraded", "version": "2.4.0", "last_deploy": "2025-03-12T14:00:00", "uptime": "95.1%", "issue": "High CPU usage - load test running"},
    ]
    return json.dumps(envs, indent=2)


@mcp.resource("bugs://open/legacy")
def open_bugs_legacy() -> str:
    """All currently open bugs with severity breakdown."""
    bugs = {
        "total_open": 18,
        "by_severity": {"critical": 1, "high": 4, "medium": 8, "low": 5},
        "critical_bugs": [{"id": "BUG-2891", "title": "Payment processing fails for international cards", "assignee": "Priya S.", "age_days": 2, "module": "Payments"}],
        "avg_resolution_days": 4.2,
    }
    return json.dumps(bugs, indent=2)


@mcp.resource("metrics://sprint")
def sprint_metrics() -> str:
    """Current sprint QA metrics and velocity."""
    metrics = {
        "sprint": "Sprint 24 (Mar 3 - Mar 14)",
        "days_remaining": 1,
        "test_cases": {"planned": 85, "executed": 78, "remaining": 7},
        "execution_rate": "91.8%",
        "bugs_found_this_sprint": 12,
        "bugs_fixed_this_sprint": 9,
        "automation_coverage": "67%",
    }
    return json.dumps(metrics, indent=2)


@mcp.resource("coverage://module/{module_name}")
def module_coverage(module_name: str) -> str:
    """Code coverage for a specific module."""
    coverage_data = {
        "auth": {"line": 89, "branch": 76, "function": 92},
        "payments": {"line": 72, "branch": 58, "function": 80},
        "search": {"line": 91, "branch": 84, "function": 95},
        "profile": {"line": 85, "branch": 71, "function": 88},
        "dashboard": {"line": 64, "branch": 52, "function": 70},
    }
    module = module_name.lower()
    if module in coverage_data:
        cov = coverage_data[module]
        return json.dumps({"module": module_name, "coverage": cov, "meets_threshold": cov["line"] >= 80, "threshold": 80}, indent=2)
    return json.dumps({"error": f"Module '{module_name}' not found", "available_modules": list(coverage_data.keys())}, indent=2)


if __name__ == "__main__":
    mcp.run()
