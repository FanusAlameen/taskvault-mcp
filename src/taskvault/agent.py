import json
import os
import sys
import time
from datetime import date
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google import genai
from mcp import Client, StdioServerParameters
from mcp.client.stdio import stdio_client


load_dotenv()


# =========================================================
# Configuration
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[2]

TODAY = date.today().isoformat()


SYSTEM_INSTRUCTION = f"""
You are TaskVault, an AI task-management assistant.

Today's date is {TODAY}.

IMPORTANT DATE RULES:

- Treat {TODAY} as today.
- "Tomorrow" means the calendar day immediately after today.
- "Yesterday" means the calendar day immediately before today.
- Always use the actual current date when interpreting relative dates.
- When creating tasks, convert relative dates into YYYY-MM-DD format.
- Never invent a year.

You have access to TaskVault MCP tools.

Use the tools whenever the user's request requires reading,
creating, modifying, searching, or deleting tasks.

Never claim that a task was created or modified unless the MCP
tool successfully executed.
""".strip()


class TaskVaultAgent:

    def __init__(self) -> None:

        api_key = os.getenv("MCP_LLM_KEY")
        model = os.getenv("MCP_LLM")

        if not api_key:
            raise RuntimeError(
                "MCP_LLM_KEY is not set."
            )

        if not model:
            raise RuntimeError(
                "MCP_LLM is not set."
            )

        self.gemini = genai.Client(
            api_key=api_key
        )

        self.model = model


    # =====================================================
    # Chat
    # =====================================================

    async def chat(
        self,
        message: str,
    ) -> dict[str, Any]:

        server_params = StdioServerParameters(
            command=sys.executable,
            args=[
                "-m",
                "taskvault.server",
            ],
            cwd=BASE_DIR / "src",
        )


        # =================================================
        # Connect to MCP
        # =================================================

        async with Client(
            stdio_client(server_params)
        ) as mcp_client:


            # =============================================
            # Discover MCP tools
            # =============================================

            tools_result = (
                await mcp_client.list_tools()
            )


            gemini_tools = [
                {
                    "type": "function",
                    "name": tool.name,
                    "description": (
                        tool.description or ""
                    ),
                    "parameters": tool.input_schema,
                }
                for tool in tools_result.tools
            ]


            # =============================================
            # Track tool activity
            # =============================================

            tool_calls: list[dict[str, Any]] = []


            # =============================================
            # Initial Gemini interaction
            # =============================================

            interaction = (
                self.gemini.interactions.create(
                    model=self.model,

                    # IMPORTANT:
                    # Apply system instruction from
                    # the FIRST interaction.
                    system_instruction=SYSTEM_INSTRUCTION,

                    input=message,

                    tools=gemini_tools,
                )
            )


            # =============================================
            # Agent loop
            # =============================================

            while True:


                function_calls = [
                    step
                    for step in interaction.steps
                    if step.type == "function_call"
                ]


                # =========================================
                # No tool calls → final response
                # =========================================

                if not function_calls:

                    return {
                        "response": (
                            interaction.output_text
                            or "I couldn't generate a response."
                        ),
                        "tool_calls": tool_calls,
                    }


                function_results = []


                # =========================================
                # Execute MCP tools
                # =========================================

                for call in function_calls:

                    started_at = time.perf_counter()


                    # -------------------------------------
                    # Call MCP tool
                    # -------------------------------------

                    result = (
                        await mcp_client.call_tool(
                            call.name,
                            arguments=call.arguments,
                        )
                    )


                    duration_ms = round(
                        (
                            time.perf_counter()
                            - started_at
                        )
                        * 1000
                    )


                    # -------------------------------------
                    # Extract MCP result
                    # -------------------------------------

                    if (
                        result.structured_content
                        is not None
                    ):

                        tool_output = (
                            result.structured_content
                        )

                    else:

                        tool_output = [
                            getattr(
                                content,
                                "text",
                                str(content),
                            )
                            for content in result.content
                        ]


                    # -------------------------------------
                    # Record activity for frontend
                    # -------------------------------------

                    tool_calls.append(
                        {
                            "name": call.name,

                            "arguments": (
                                call.arguments
                            ),

                            "result": tool_output,

                            "duration_ms": duration_ms,

                            "success": not getattr(
                                result,
                                "is_error",
                                False,
                            ),
                        }
                    )


                    # -------------------------------------
                    # Prepare function result for Gemini
                    # -------------------------------------

                    function_results.append(
                        {
                            "type": "function_result",

                            "name": call.name,

                            "call_id": call.id,

                            "result": [
                                {
                                    "type": "text",

                                    "text": json.dumps(
                                        tool_output,
                                        default=str,
                                    ),
                                }
                            ],
                        }
                    )


                # =========================================
                # Give MCP results back to Gemini
                # =========================================

                interaction = (
                    self.gemini.interactions.create(
                        model=self.model,

                        previous_interaction_id=(
                            interaction.id
                        ),

                        system_instruction=(
                            SYSTEM_INSTRUCTION
                        ),

                        input=function_results,

                        tools=gemini_tools,
                    )
                )