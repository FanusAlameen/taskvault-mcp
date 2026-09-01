# TaskVault MCP

A local Model Context Protocol (MCP) server for managing personal tasks through AI assistants.

Built from scratch using Python, the official MCP Python SDK, and SQLite.

## What is MCP?

Model Context Protocol (MCP) is a standardized protocol that allows AI applications to interact with external tools and data.

TaskVault demonstrates three MCP primitives:

- Tools
- Resources
- Prompts

## Architecture

```text
AI Host
  │
  │ MCP
  ▼
TaskVault MCP Server
  │
  ├── Tools
  │   ├── add_task
  │   ├── list_tasks
  │   ├── search_tasks
  │   ├── complete_task
  │   └── delete_task
  │
  ├── Resource
  │   └── tasks://all
  │
  └── Prompt
      └── plan_my_day
  │
  ▼
SQLite
  │
  ▼
tasks.db
```
