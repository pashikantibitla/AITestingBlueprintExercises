# MCP Inspector Setup Guide

## Why No Auth Token? (Permanent Fix)

For **local development**, OAuth and proxy tokens cause connection errors on Windows due to:
- Token mismatches between browser URL and proxy server
- MCP Inspector v0.21.2 SSE bugs on Windows
- Race conditions during startup

**Solution:** `DANGEROUSLY_OMIT_AUTH=true` disables auth for local dev.
This is the standard approach used by the MCP community.

---

## Launch Weather Inspector

Double-click:
```
start_weather_inspector.bat
```

Then open:
```
http://127.0.0.1:6274
```

Click **"Connect"** — no token needed.

---

## Launch Calculator Inspector

Double-click:
```
start_calculator_inspector.bat
```

Then open:
```
http://127.0.0.1:6276
```

---

## Background SSE Servers (Always Running)

| Server | URL | Tools |
|--------|-----|-------|
| Calculator | `http://127.0.0.1:8000/sse` | add, subtract, multiply, divide |
| Weather | `http://127.0.0.1:8001/sse` | get_weather |

---

## Config Files

| File | Purpose |
|------|---------|
| `mcp.json` | Unified client config |
| `weatherMCPConfig.json` | Weather-only config |
| `calculatorMCPConfig.json` | Calculator-only config |

---

## OAuth Note

OAuth is designed for **remote/cloud MCP servers** (e.g., Slack, GitHub APIs).
For local stdio servers like this weather tool, OAuth is not applicable.
The correct pattern for local dev is `DANGEROUSLY_OMIT_AUTH=true`.
