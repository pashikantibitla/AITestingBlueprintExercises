@echo off
echo === Calculator MCP Server - Tool Tests ===
echo.
echo [1] Listing all tools...
fastmcp list helloworldcalculator.py
echo.
echo [2] Adding 45 + 42...
fastmcp call helloworldcalculator.py add a=45 b=42
echo.
echo [3] Subtracting 89 - 10...
fastmcp call helloworldcalculator.py subtract a=89 b=10
echo.
echo [4] Multiplying 7 * 6...
fastmcp call helloworldcalculator.py multiply a=7 b=6
echo.
echo [5] Dividing 100 / 4...
fastmcp call helloworldcalculator.py divide a=100 b=4
echo.
pause
