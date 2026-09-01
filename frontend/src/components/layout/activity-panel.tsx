import { Activity, Circle, ListTodo, Server } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { ToolCall } from "@/lib/api";

type ActivityPanelProps = {
  toolCalls: ToolCall[];
};

export function ActivityPanel({ toolCalls }: ActivityPanelProps) {
  return (
    <aside className="hidden w-80 border-l bg-muted/10 xl:block">
      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

      <div className="flex h-16 items-center gap-3 border-b px-5">
        <Activity className="size-4" />

        <div>
          <h3 className="text-sm font-semibold">MCP Activity</h3>

          <p className="text-xs text-muted-foreground">Live tool execution</p>
        </div>
      </div>

      <div className="h-[calc(100vh-4rem)] overflow-y-auto p-5">
        {/* ================================================= */}
        {/* Server status */}
        {/* ================================================= */}

        <div className="mb-5 flex items-start gap-3">
          <div className="mt-1 size-2 rounded-full bg-green-500" />

          <div>
            <p className="text-sm font-medium">MCP Server</p>

            <p className="text-xs text-muted-foreground">Connected</p>
          </div>
        </div>

        <Separator />

        {/* ================================================= */}
        {/* Recent Activity */}
        {/* ================================================= */}

        <div className="mt-5">
          <div className="mb-3 flex items-center gap-2">
            <Server className="size-4" />

            <p className="text-xs font-semibold uppercase tracking-wide">
              Recent Activity
            </p>
          </div>

          {toolCalls.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-xs text-muted-foreground">
                No tool calls yet.
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Ask TaskVault to manage a task.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {toolCalls
                .slice()
                .reverse()
                .map((tool, index) => (
                  <Card
                    key={`${tool.name}-${index}`}
                    className="overflow-hidden"
                  >
                    {/* Tool header */}

                    <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-md bg-background">
                          <Server className="size-3.5" />
                        </div>

                        <code className="text-xs font-semibold">
                          {tool.name}
                        </code>
                      </div>

                      <span
                        className={
                          tool.success
                            ? "text-xs font-medium text-green-600"
                            : "text-xs font-medium text-red-600"
                        }
                      >
                        {tool.success ? "✓ Success" : "✕ Failed"}
                      </span>
                    </div>

                    {/* Details */}

                    <div className="p-3">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Arguments
                      </p>

                      <pre className="max-h-32 overflow-auto rounded-md bg-muted/50 p-2 text-[11px] leading-relaxed">
                        {JSON.stringify(tool.arguments, null, 2)}
                      </pre>

                      {/* Result */}

                      <details className="mt-3">
                        <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Result
                        </summary>

                        <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted/50 p-2 text-[11px] leading-relaxed">
                          {JSON.stringify(tool.result, null, 2)}
                        </pre>
                      </details>

                      {/* Duration */}

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          Execution time
                        </span>

                        <span className="font-mono text-[11px]">
                          {tool.duration_ms} ms
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* Available Tools */}
        {/* ================================================= */}

        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <ListTodo className="size-4" />

            <p className="text-xs font-semibold uppercase tracking-wide">
              Available Tools
            </p>
          </div>

          <div className="space-y-2">
            {[
              "add_task",
              "list_tasks",
              "search_tasks",
              "complete_task",
              "delete_task",
            ].map((tool) => (
              <div
                key={tool}
                className="flex items-center gap-2 rounded-md border bg-background px-3 py-2"
              >
                <Circle className="size-2 fill-current" />

                <code className="text-xs">{tool}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
