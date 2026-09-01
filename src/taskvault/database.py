import os
import sqlite3
from datetime import datetime
from pathlib import Path

from .models import Task


# BASE_DIR = Path(__file__).resolve().parents[2]
# DATABASE_PATH = BASE_DIR / "tasks.db"

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_DIR = Path(
    os.getenv(
        "TASKVAULT_DATA_DIR",
        BASE_DIR / "data",
    )
)

DATA_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_PATH = DATA_DIR / "tasks.db"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row

    return connection


def initialize_database() -> None:
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            priority TEXT DEFAULT 'medium',
            due_date TEXT,
            completed INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
        """
    )

    connection.commit()
    connection.close()


def create_task(
    title: str,
    description: str = "",
    priority: str = "medium",
    due_date: str | None = None,
) -> int:

    created_at = datetime.now().isoformat(timespec="seconds")

    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO tasks (
            title,
            description,
            priority,
            due_date,
            completed,
            created_at
        )
        VALUES (?, ?, ?, ?, 0, ?)
        """,
        (
            title,
            description,
            priority,
            due_date,
            created_at,
        ),
    )

    connection.commit()

    task_id = cursor.lastrowid

    connection.close()

    return task_id


def get_tasks(
    include_completed: bool = False,
) -> list[Task]:

    connection = get_connection()

    if include_completed:
        cursor = connection.execute(
            """
            SELECT *
            FROM tasks
            ORDER BY
                completed ASC,
                CASE priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                END,
                due_date ASC
            """
        )
    else:
        cursor = connection.execute(
            """
            SELECT *
            FROM tasks
            WHERE completed = 0
            ORDER BY
                CASE priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                END,
                due_date ASC
            """
        )

    tasks = [dict(row) for row in cursor.fetchall()]

    connection.close()

    return tasks


def search_tasks(query: str) -> list[Task]:

    connection = get_connection()

    search_pattern = f"%{query}%"

    cursor = connection.execute(
        """
        SELECT *
        FROM tasks
        WHERE title LIKE ?
           OR description LIKE ?
        ORDER BY completed ASC, due_date ASC
        """,
        (
            search_pattern,
            search_pattern,
        ),
    )

    tasks = [dict(row) for row in cursor.fetchall()]

    connection.close()

    return tasks


def mark_task_complete(task_id: int) -> bool:

    connection = get_connection()

    cursor = connection.execute(
        """
        UPDATE tasks
        SET completed = 1
        WHERE id = ?
        """,
        (task_id,),
    )

    connection.commit()

    updated = cursor.rowcount

    connection.close()

    return updated > 0


def remove_task(task_id: int) -> bool:

    connection = get_connection()

    cursor = connection.execute(
        """
        DELETE FROM tasks
        WHERE id = ?
        """,
        (task_id,),
    )

    connection.commit()

    deleted = cursor.rowcount

    connection.close()

    return deleted > 0