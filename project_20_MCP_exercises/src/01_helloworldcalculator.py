"""
MCP Server 1: Hello World Calculator
=====================================
The simplest possible MCP server.
Just 15 lines of actual code!

Run:   fastmcp dev 01_calculator.py
Test:  Opens MCP Inspector at http://127.0.0.1:6274

"""

from fastmcp import FastMCP

mcp = FastMCP("Calculator")

@mcp.tool()
def add(a: float, b:float) -> float:
    """Add two numbers."""
    return a + b

@mcp.tool()
def subtract(a: float, b: float) -> float:
    """Subtract b from a."""
    return a - b


@mcp.tool()
def multiply(a: float, b: float) -> float:
    """Multiply two numbers."""
    return a * b


@mcp.tool()
def divide(a: float, b: float) -> float:
    """Divide a by b. Returns error if b is zero."""
    if b == 0:
        return float("inf")
    return a / b


@mcp.resource("calculator://tips")
def calculator_tips() -> str:
    """Tips for using the calculator effectively."""
    return (
        "1. Always check for division by zero before dividing\n"
        "2. Use decimal inputs for higher precision\n"
        "3. Combine operations for complex calculations\n"
        "4. Remember: subtract(a, b) means a - b"
    )


@mcp.resource("calculator://history/{operation}")
def operation_history(operation: str) -> str:
    """Example history for a given operation."""
    history = {
        "add": "10 + 5 = 15",
        "subtract": "20 - 8 = 12",
        "multiply": "7 * 6 = 42",
        "divide": "100 / 4 = 25.0"
    }
    return history.get(operation, f"No history found for '{operation}'")


@mcp.resource("calculator://constants")
def math_constants() -> str:
    """Common mathematical constants."""
    return (
        "pi = 3.141592653589793\n"
        "e = 2.718281828459045\n"
        "golden_ratio = 1.618033988749895"
    )


@mcp.resource("calculator://tools")
def list_tools() -> str:
    """List all available calculator tools with descriptions."""
    return (
        "Available Calculator Tools:\n"
        "===========================\n\n"
        "1. add(a: float, b: float) -> float\n"
        "   Adds two numbers together.\n\n"
        "2. subtract(a: float, b: float) -> float\n"
        "   Subtracts b from a.\n\n"
        "3. multiply(a: float, b: float) -> float\n"
        "   Multiplies two numbers.\n\n"
        "4. divide(a: float, b: float) -> float\n"
        "   Divides a by b. Returns infinity if b is zero."
    )


@mcp.resource("calculator://tool/{tool_name}")
def get_tool_info(tool_name: str) -> str:
    """Get detailed information about a specific calculator tool."""
    tools = {
        "add": {
            "name": "add",
            "description": "Add two numbers.",
            "params": "a: float, b: float",
            "returns": "float (sum of a and b)"
        },
        "subtract": {
            "name": "subtract",
            "description": "Subtract b from a.",
            "params": "a: float, b: float",
            "returns": "float (difference of a and b)"
        },
        "multiply": {
            "name": "multiply",
            "description": "Multiply two numbers.",
            "params": "a: float, b: float",
            "returns": "float (product of a and b)"
        },
        "divide": {
            "name": "divide",
            "description": "Divide a by b. Returns error if b is zero.",
            "params": "a: float, b: float",
            "returns": "float (quotient of a and b, or inf if b=0)"
        }
    }
    tool = tools.get(tool_name)
    if not tool:
        return f"Tool '{tool_name}' not found. Available tools: add, subtract, multiply, divide"
    return (
        f"Tool: {tool['name']}\n"
        f"Description: {tool['description']}\n"
        f"Parameters: {tool['params']}\n"
        f"Returns: {tool['returns']}"
    )


if __name__ == "__main__":
    mcp.run()