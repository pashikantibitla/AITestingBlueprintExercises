@echo off
cd /d "D:\AI testing blueprint\project_20_MCP_exercises"
set NODE_OPTIONS=--dns-result-order=ipv4first
set MCP_PROXY_AUTH_TOKEN=fixed-token-12345
fastmcp dev inspector helloworldcalculator.py --inspector-version 0.20.0 > inspector.log 2>&1
