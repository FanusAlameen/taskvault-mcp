"use client";

import { CheckCircle2, Circle, Trash2 } from "lucide-react";

import type { Task } from "@/lib/api";

type TaskCardProps = {
  task: Task;
  onComplete: (taskId: number) => void;
  onDelete: (taskId: number) => void;
};

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const isCompleted = task.completed === 1;

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-background px-5 py-4">
      {/* Complete button */}

      <button
        type="button"
        onClick={() => {
          if (!isCompleted) {
            onComplete(task.id);
          }
        }}
        disabled={isCompleted}
        className="shrink-0 rounded-full transition hover:bg-muted disabled:cursor-default"
        aria-label={isCompleted ? "Task completed" : "Complete task"}
      >
        {isCompleted ? (
          <CheckCircle2 className="size-6 text-muted-foreground" />
        ) : (
          <Circle className="size-6 text-muted-foreground hover:text-foreground" />
        )}
      </button>

      {/* Task information */}

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            isCompleted ? "text-muted-foreground line-through" : ""
          }`}
        >
          {task.title}
        </p>

        {task.description && (
          <p className="mt-1 text-xs text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-sm px-2 py-1 text-[11px] font-medium ${
              task.priority === "high"
                ? "bg-red-50 text-red-600"
                : task.priority === "medium"
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {task.priority}
          </span>

          {task.due_date && !isCompleted && (
            <span className="text-xs text-muted-foreground">
              Due: {formatDate(task.due_date)}
            </span>
          )}

          {isCompleted && (
            <span className="text-xs text-muted-foreground">Completed</span>
          )}
        </div>
      </div>

      {/* Delete */}

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="shrink-0 rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label="Delete task"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
