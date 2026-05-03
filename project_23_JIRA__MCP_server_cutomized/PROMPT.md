# Prompt: Convert CREW.AI JIRA Tool to JIRA MCP + HTML Dashboard

## Original Request (from image)

> "We have already created our own version of the tool, which is `fetch JIRA` with CREW.AI. But what I want you to do is, can you please make the changes and starting you know, make... Put them into a single HTML file. Let's, you know, what please make the changes and starting you know, make... Put them into a single HTML file. Let's suppose index.html, which I can basically open. Tell me what are the changes that you have made. Put everything into index.html. We want the tool that we have created should come from the JIRA MCP or JIRA connection. We have all the details of MCP, right? We are not going to use the CREW tool. We are going to use JIRA MCP for that."

## Requirements

1. **Remove CREW.AI dependency** — No CrewAI agents, tasks, or crews
2. **Use JIRA MCP / JIRA direct connection** — FastMCP server calling JIRA REST API directly
3. **Single HTML file (`index.html`)** — Standalone dashboard openable in any browser
4. **Preserve functionality**:
   - Fetch JIRA ticket details
   - Generate test plans (template-based, no LLM required)
   - Bug triage analysis
   - Search JIRA tickets via JQL
   - Export capabilities

## Source Files Referenced
- `project_19_CREWAI_sample_project/crew_AI_Exercise/05_FETCH_JIRA_CREATE_TEST_PLAN_AI_AGENT.py`
- `project_19_CREWAI_sample_project/crew_AI_Exercise/03_building_a_bugTriage_agent.py`
