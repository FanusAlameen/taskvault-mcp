"use client";

import { useState } from "react";

import { AssistantView } from "@/components/assistant/assistant-view";
import { ActivityPanel } from "@/components/layout/activity-panel";
import { Sidebar, type View } from "@/components/layout/sidebar";
import { TasksView } from "@/components/tasks/tasks-view";

import type { ToolCall } from "@/lib/api";

export default function Home() {
  const [activeView, setActiveView] = useState<View>("assistant");

  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

  const [tasksVersion, setTasksVersion] = useState(0);

  function handleTasksChanged() {
    setTasksVersion((previous) => previous + 1);
  }

  return (
    <main className="h-screen overflow-hidden bg-background">
      <div className="flex h-full min-h-0">
        {/* ================================================= */}
        {/* Sidebar */}
        {/* ================================================= */}

        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        {/* ================================================= */}
        {/* Main content */}
        {/* ================================================= */}

        <section className="flex min-w-0 flex-1 flex-col">
          {activeView === "assistant" && (
            <AssistantView
              onToolCalls={setToolCalls}
              onTasksChanged={handleTasksChanged}
            />
          )}

          {activeView === "tasks" && (
            <TasksView completed={false} refreshKey={tasksVersion} />
          )}

          {activeView === "completed" && (
            <TasksView completed={true} refreshKey={tasksVersion} />
          )}
        </section>

        {/* ================================================= */}
        {/* MCP Activity */}
        {/* ================================================= */}

        <ActivityPanel toolCalls={toolCalls} />
      </div>
    </main>
  );
}
