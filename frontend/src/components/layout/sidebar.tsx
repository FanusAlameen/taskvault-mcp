"use client";

import { CheckCircle2, ListTodo, MessageSquare, Sparkles } from "lucide-react";

export type View = "assistant" | "tasks" | "completed";

type SidebarProps = {
  activeView: View;
  onViewChange: (view: View) => void;
};

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="hidden w-64 border-r bg-muted/20 p-6 md:block">
      {/* ================================================= */}
      {/* Brand */}
      {/* ================================================= */}

      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </div>

        <div>
          <h1 className="font-semibold">TaskVault</h1>

          <p className="text-xs text-muted-foreground">MCP-powered AI</p>
        </div>
      </div>

      {/* ================================================= */}
      {/* Navigation */}
      {/* ================================================= */}

      <nav className="space-y-2">
        <button
          type="button"
          onClick={() => onViewChange("assistant")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
            activeView === "assistant"
              ? "bg-accent font-medium text-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <MessageSquare className="size-4" />
          AI Assistant
        </button>

        <button
          type="button"
          onClick={() => onViewChange("tasks")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
            activeView === "tasks"
              ? "bg-accent font-medium text-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <ListTodo className="size-4" />
          Tasks
        </button>

        <button
          type="button"
          onClick={() => onViewChange("completed")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
            activeView === "completed"
              ? "bg-accent font-medium text-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="size-4" />
          Completed
        </button>
      </nav>
    </aside>
  );
}
