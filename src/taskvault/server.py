import sys
from datetime import date, datetime
from pathlib import Path

from mcp.server import MCPServer

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from .database import (
    create_task,
    get_tasks,
    initialize_database,
    mark_task_complete,
    remove_task,
    search_tasks as db_search_tasks,
)

CURRENT_DATE = date.today().isoformat()

mcp = MCPServer(
    "TaskVault",
    instructions=(
        "TaskVault is a personal task management MCP server. "
        f"Today's date is {CURRENT_DATE}. "
        "When interpreting relative dates such as today, tomorrow, "
        "yesterday, next Monday, or next week, use this date as "
        "the reference date. "
        "Always provide dates to tools in YYYY-MM-DD format."
    ),
)


@mcp.tool()
def add_task(
    title: str,
    description: str = "",
    priority: str = "medium",
    due_date: str | None = None,
) -> dict:
    """
    Create a new task.

    Args:
        title: Short title of the task.
        description: Optional description.
        priority: low, medium, or high.
        due_date: Optional date in YYYY-MM-DD format.
    """

    priority = priority.lower()

    if priority not in {"low", "medium", "high"}:
        raise ValueError(
            "Priority must be low, medium, or high."
        )

    if due_date:
        try:
            datetime.strptime(
                due_date,
                "%Y-%m-%d",
            )
        except ValueError:
            raise ValueError(
                "due_date must use YYYY-MM-DD format."
            )

    task_id = create_task(
        title=title,
        description=description,
        priority=priority,
        due_date=due_date,
    )

    return {
        "success": True,
        "task_id": task_id,
        "message": f"Task '{title}' created successfully.",
    }


@mcp.tool()
def list_tasks(
    include_completed: bool = False,
) -> list[dict]:
    """
    List tasks.

    Args:
        include_completed: Whether completed tasks should be included.
    """

    return get_tasks(
        include_completed=include_completed
    )


@mcp.tool()
def search_tasks(query: str) -> list[dict]:
    """
    Search tasks by title or description.

    Args:
        query: Search text.
    """

    return db_search_tasks(query)


@mcp.tool()
def complete_task(task_id: int) -> dict:
    """
    Mark a task as completed.

    Args:
        task_id: ID of the task.
    """

    success = mark_task_complete(task_id)

    if not success:
        return {
            "success": False,
            "message": f"Task {task_id} was not found.",
        }

    return {
        "success": True,
        "message": f"Task {task_id} marked as completed.",
    }


@mcp.tool()
def delete_task(task_id: int) -> dict:
    """
    Delete a task.

    Args:
        task_id: ID of the task.
    """

    success = remove_task(task_id)

    if not success:
        return {
            "success": False,
            "message": f"Task {task_id} was not found.",
        }

    return {
        "success": True,
        "message": f"Task {task_id} deleted.",
    }


@mcp.resource("tasks://all")
def all_tasks_resource() -> str:
    """
    Return all tasks as a readable resource.
    """

    tasks = get_tasks(
        include_completed=True
    )

    if not tasks:
        return "No tasks currently exist."

    lines = []

    for task in tasks:
        status = "[x]" if task["completed"] else "[ ]"

        due_date = (
            task["due_date"]
            or "No due date"
        )

        lines.append(
            f"{status} "
            f"[{task['id']}] "
            f"{task['title']} "
            f"(priority: {task['priority']}, "
            f"due: {due_date})"
        )

    return "\n".join(lines)


@mcp.prompt()
def plan_my_day() -> str:
    """
    Generate a task-planning prompt.
    """

    return """
You are my personal task planning assistant.

Use the TaskVault tools to inspect my current tasks.

Prioritize tasks using:
1. High priority
2. Nearest due date
3. Tasks requiring focused work

Give me:
- Top 3 priorities
- Recommended order
- Overdue tasks
- Tasks that could be postponed

Never invent tasks that do not exist in TaskVault.
""".strip()


initialize_database()


if __name__ == "__main__":
    mcp.run()
