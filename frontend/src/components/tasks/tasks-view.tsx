"use client";

import { useEffect, useState } from "react";

import { Plus, RefreshCw } from "lucide-react";

import {
  addTask,
  completeTask,
  deleteTask,
  listTasks,
  type Task,
} from "@/lib/api";

import { TaskCard } from "./task-card";

type TasksViewProps = {
  completed: boolean;
  refreshKey?: number;
};

export function TasksView({ completed, refreshKey = 0 }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  // =======================================================
  // Load tasks
  // =======================================================

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const result = await listTasks(true);

      setTasks(result);
    } catch (error) {
      console.error(error);

      setError("Couldn't load tasks. Make sure the FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [refreshKey]);

  // =======================================================
  // Complete
  // =======================================================

  async function handleComplete(taskId: number) {
    try {
      await completeTask(taskId);

      await loadTasks();
    } catch (error) {
      console.error(error);

      setError("Couldn't complete the task.");
    }
  }

  // =======================================================
  // Delete
  // =======================================================

  async function handleDelete(taskId: number) {
    try {
      await deleteTask(taskId);

      await loadTasks();
    } catch (error) {
      console.error(error);

      setError("Couldn't delete the task.");
    }
  }

  // =======================================================
  // Filtering
  // =======================================================

  const activeTasks = tasks.filter((task) => task.completed === 0);

  const completedTasks = tasks.filter((task) => task.completed === 1);

  const visibleTasks = completed ? completedTasks : activeTasks;

  const title = completed ? "Completed" : "Tasks";

  const subtitle = completed
    ? "Tasks you've completed."
    : "Manage your tasks through the TaskVault MCP server.";

  // =======================================================
  // Render
  // =======================================================

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

      <div className="border-b px-8 py-6">
        <div className="mx-auto flex max-w-5xl items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>

            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadTasks}
              disabled={loading}
              className="rounded-lg border p-2 text-muted-foreground transition hover:bg-muted disabled:opacity-50"
              aria-label="Refresh tasks"
            >
              <RefreshCw
                className={`size-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {!completed && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <Plus className="size-4" />
                Add task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* Content */}
      {/* ================================================= */}

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-5xl">
          {/* Error */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Loading */}

          {loading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              Loading tasks...
            </div>
          ) : visibleTasks.length === 0 ? (
            <EmptyState
              completed={completed}
              onAdd={() => setShowAddForm(true)}
            />
          ) : (
            <div className="space-y-3">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* ================================================= */}
          {/* Summary */}
          {/* ================================================= */}

          {!completed && !loading && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <StatCard label="Total" value={tasks.length} />

              <StatCard label="Active" value={activeTasks.length} />

              <StatCard label="Completed" value={completedTasks.length} />
            </div>
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* Add task dialog */}
      {/* ================================================= */}

      {showAddForm && (
        <AddTaskDialog
          onClose={() => setShowAddForm(false)}
          onCreated={async () => {
            setShowAddForm(false);
            await loadTasks();
          }}
        />
      )}
    </div>
  );
}

// =========================================================
// Empty State
// =========================================================

function EmptyState({
  completed,
  onAdd,
}: {
  completed: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed p-12 text-center">
      <p className="text-sm font-medium">
        {completed ? "No completed tasks" : "No active tasks"}
      </p>

      <p className="mt-1 text-sm text-muted-foreground">
        {completed
          ? "Completed tasks will appear here."
          : "You're all caught up."}
      </p>

      {!completed && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" />
          Add task
        </button>
      )}
    </div>
  );
}

// =========================================================
// Stats
// =========================================================

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

// =========================================================
// Add Task Dialog
// =========================================================

function AddTaskDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const [dueDate, setDueDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate || null,
      });

      await onCreated();
    } catch (error) {
      console.error(error);

      setError("Couldn't create the task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Add task</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Create a task through the TaskVault MCP server.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}

          <div>
            <label className="mb-1.5 block text-xs font-medium">Title</label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs to be done?"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>

          {/* Description */}

          <div>
            <label className="mb-1.5 block text-xs font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Priority */}

          <div>
            <label className="mb-1.5 block text-xs font-medium">Priority</label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as "low" | "medium" | "high")
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="low">Low</option>

              <option value="medium">Medium</option>

              <option value="high">High</option>
            </select>
          </div>

          {/* Due date */}

          <div>
            <label className="mb-1.5 block text-xs font-medium">Due date</label>

            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Actions */}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
