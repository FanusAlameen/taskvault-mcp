// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Task = {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  completed: number;
  created_at: string;
};

export type ToolCall = {
  name: string;
  arguments: Record<string, unknown>;
  result: unknown;
  duration_ms: number;
  success: boolean;
};

export type ChatResponse = {
  response: string;
  tool_calls: ToolCall[];
};

type ToolResponse = {
  result: unknown;
};

// =========================================================
// Generic tool executor
// =========================================================

async function executeTool<T>(
  toolName: string,
  arguments_: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/tools/${toolName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      arguments: arguments_,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? `API returned ${response.status}`);
  }

  const data: ToolResponse = await response.json();

  return data.result as T;
}

// =========================================================
// Chat
// =========================================================

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? `API returned ${response.status}`);
  }

  return response.json() as Promise<ChatResponse>;
}

// =========================================================
// Tasks
// =========================================================

export async function listTasks(includeCompleted = true): Promise<Task[]> {
  const result = await executeTool<{
    result: Task[];
  }>("list_tasks", {
    include_completed: includeCompleted,
  });

  return result.result;
}

export async function completeTask(taskId: number): Promise<unknown> {
  return executeTool("complete_task", {
    task_id: taskId,
  });
}

export async function deleteTask(taskId: number): Promise<unknown> {
  return executeTool("delete_task", {
    task_id: taskId,
  });
}

export async function addTask(task: {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  due_date?: string | null;
}): Promise<unknown> {
  return executeTool("add_task", task);
}
