import sys
from pathlib import Path
from typing import Any

from mcp import Client, StdioServerParameters
from mcp.client.stdio import stdio_client


BASE_DIR = Path(__file__).resolve().parents[1]


ALLOWED_TOOLS = {
    "add_task",
    "list_tasks",
    "search_tasks",
    "complete_task",
    "delete_task",
}


async def call_mcp_tool(
    tool_name: str,
    arguments: dict[str, Any] | None = None,
) -> Any:
    """
    Execute a TaskVault MCP tool and return its result.
    """

    if tool_name not in ALLOWED_TOOLS:
        raise ValueError(f"Unknown MCP tool: {tool_name}")

    server_params = StdioServerParameters(
        command=sys.executable,
        args=["-m", "taskvault.server"],
        cwd=BASE_DIR / "src",
    )

    async with Client(stdio_client(server_params)) as client:

        result = await client.call_tool(
            tool_name,
            arguments=arguments or {},
        )

        if result.structured_content is not None:
            return result.structured_content

        return [
            getattr(content, "text", str(content))
            for content in result.content
        ]