# Hello World MCP Server - Calculator

## Project Overview
Building a simple MCP (Model Context Protocol) Calculator server using FastMCP v3.1.0 with tools and resources.

---

## Files Created

### 1. `helloworldcalculator.py`
Main MCP server file containing:
- **4 Tools**: `add`, `subtract`, `multiply`, `divide`
- **8 Resources**:
  - `calculator://tips`
  - `calculator://history/{operation}`
  - `calculator://constants`
  - `calculator://tools`
  - `calculator://tool/add`
  - `calculator://tool/subtract`
  - `calculator://tool/multiply`
  - `calculator://tool/divide`

### 2. `calculatorMCPConfig.json`
MCP client configuration for connecting to the server.

### 3. `start_inspector.bat`
Windows batch file to launch MCP Inspector for development.

### 4. `test_tools.bat`
Windows batch file to run all tool tests in one click.

### 5. `.gitignore`
Hides logs, cache, and secret files from Git.

---

## Connection Error Fixes

### Problem
MCP Inspector v0.20.0/v0.21.2 has a known **SSE bug on Windows** that causes random crashes:
```
Error: Not connected
    at SSEServerTransport.send
```

Also, Inspector binds to IPv6 `[::1]` by default, causing browser connection failures.

### Solution
1. **Use `fastmcp call` and `fastmcp list` directly** — stable, no Inspector needed
2. **Set `NODE_OPTIONS=--dns-result-order=ipv4first`** to force IPv4 binding when using Inspector
3. **Use Inspector v0.20.0** — less buggy than v0.21.2

---

## Terminal Commands

### List all tools
```bash
fastmcp list helloworldcalculator.py
```

### Call tools
```bash
fastmcp call helloworldcalculator.py add a=45 b=42
fastmcp call helloworldcalculator.py subtract a=89 b=10
fastmcp call helloworldcalculator.py multiply a=7 b=6
fastmcp call helloworldcalculator.py divide a=100 b=4
```

### Read resources
```bash
fastmcp call helloworldcalculator.py calculator://tools
fastmcp call helloworldcalculator.py calculator://constants
fastmcp call helloworldcalculator.py calculator://tool/divide
```

---

## Tool Execution Results

| Operation | Input | Result |
|---|---|---|
| add | 45 + 42 | 87.0 |
| subtract | 89 - 10 | 79.0 |
| multiply | 7 * 6 | 42.0 |
| divide | 100 / 4 | 25.0 |

---

## Kimi Code CLI MCP Configuration

Created `~/.kimi/mcp.json` to integrate Calculator MCP server into Kimi Code CLI:

```json
{
  "mcpServers": {
    "calculator": {
      "command": "fastmcp",
      "args": [
        "run",
        "D:\\AI testing blueprint\\project_20_MCP_exercises\\helloworldcalculator.py"
      ],
      "env": {
        "NODE_OPTIONS": "--dns-result-order=ipv4first"
      }
    }
  }
}
```

Kimi will auto-load the Calculator server on next startup.

---

## Git Push

- **Branch**: `TestingExercises`
- **Remote**: `origin` → `github.com:pashikantibitla/AITestingBlueprintExercises.git`
- **Commit**: `fa649a9`
- **Files pushed**: 6 files

### Secrets hidden via `.gitignore`:
- `Grog API key_1.txt`
- `Backup-codes-ammi8493.txt`
- `google client and secret doc.json`
- `inspector.log` (session tokens)
- `__pycache__/` directories

---

## Key Learnings

1. FastMCP v2/v3 uses `fastmcp run` instead of direct `python` execution
2. `mcp.add_tool(add)` is redundant when `@mcp.tool()` decorator is used
3. `mcp.run()` at bottom enables direct Python execution
4. MCP Inspector on Windows has SSE transport issues — use CLI commands for reliability
5. `NODE_OPTIONS=--dns-result-order=ipv4first` fixes IPv6 binding issues on Windows
