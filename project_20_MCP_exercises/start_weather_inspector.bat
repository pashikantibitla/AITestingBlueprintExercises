@echo off
cd /d "D:\AI testing blueprint\project_20_MCP_exercises"
set NODE_OPTIONS=--dns-result-order=ipv4first
set DANGEROUSLY_OMIT_AUTH=true
fastmcp dev inspector src\02_weather_MCP.py --inspector-version 0.20.0 --ui-port 6274 --server-port 6275
