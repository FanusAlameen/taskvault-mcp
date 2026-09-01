import traceback
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.mcp_client import call_mcp_tool
from src.taskvault.agent import TaskVaultAgent


# =========================================================
# Application
# =========================================================

app = FastAPI(
    title="TaskVault API",
    description="API bridge between the TaskVault frontend and MCP server",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Agent
# =========================================================

agent = TaskVaultAgent()


# =========================================================
# Request / Response models
# =========================================================

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    tool_calls: list[dict[str, Any]] = Field(default_factory=list)


class ToolRequest(BaseModel):
    arguments: dict[str, Any] = Field(default_factory=dict)


class ToolResponse(BaseModel):
    result: Any


# =========================================================
# Health check
# =========================================================

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "TaskVault API",
    }


# =========================================================
# Chat
# =========================================================

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = await agent.chat(request.message)

        return ChatResponse(
            response=result.get(
                "response",
                "I couldn't generate a response.",
            ),
            tool_calls=result.get(
                "tool_calls",
                [],
            ),
        )

    except Exception as error:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# =========================================================
# MCP Tool Bridge
# =========================================================

@app.post("/api/tools/{tool_name}", response_model=ToolResponse)
async def execute_tool(
    tool_name: str,
    request: ToolRequest,
):
    try:
        result = await call_mcp_tool(
            tool_name=tool_name,
            arguments=request.arguments,
        )

        return ToolResponse(
            result=result,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"MCP tool execution failed: {error}",
        )