from typing import TypedDict


class Task(TypedDict):
    id: int
    title: str
    description: str
    priority: str
    due_date: str | None
    completed: int
    created_at: str