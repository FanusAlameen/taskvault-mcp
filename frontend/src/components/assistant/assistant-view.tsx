"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { Send, Sparkles, User } from "lucide-react";

import { Card } from "@/components/ui/card";

import { sendChatMessage, type ToolCall } from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AssistantViewProps = {
  onToolCalls: (toolCalls: ToolCall[]) => void;
  onTasksChanged: () => void;
};

export function AssistantView({
  onToolCalls,
  onTasksChanged,
}: AssistantViewProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(text?: string) {
    const userMessage = (text ?? message).trim();

    if (!userMessage || loading) {
      return;
    }

    setMessage("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setLoading(true);

    try {
      const data = await sendChatMessage(userMessage);

      onToolCalls(data.tool_calls ?? []);

      // ---------------------------------------------------
      // Detect task mutations
      // ---------------------------------------------------

      const taskWasChanged = data.tool_calls?.some(
        (tool) =>
          tool.success &&
          ["add_task", "complete_task", "delete_task"].includes(tool.name),
      );

      if (taskWasChanged) {
        onTasksChanged();
      }

      // ---------------------------------------------------
      // Assistant response
      // ---------------------------------------------------

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.response ?? "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I couldn't complete that request. Please make sure the TaskVault backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    sendMessage();
  }

  return (
    <>
      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

      <header className="flex h-16 items-center justify-between border-b px-6">
        <div>
          <h2 className="font-semibold">AI Assistant</h2>

          <p className="text-xs text-muted-foreground">
            Manage your tasks using natural language
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs">
          <span className="size-2 rounded-full bg-green-500" />
          MCP Connected
        </div>
      </header>

      {/* ================================================= */}
      {/* Chat */}
      {/* ================================================= */}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {messages.length === 0 ? (
          /* ------------------------------------------------ */
          /* Empty state */
          /* ------------------------------------------------ */

          <div className="flex flex-1 items-center justify-center p-8">
            <div className="w-full max-w-2xl space-y-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border bg-muted/40">
                  <Sparkles className="size-7" />
                </div>

                <h3 className="text-2xl font-semibold">
                  What can I help you with?
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Manage your TaskVault using natural language.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Card
                  className="cursor-pointer p-4 transition hover:bg-accent"
                  onClick={() =>
                    sendMessage("Show me what I should work on today.")
                  }
                >
                  <p className="text-sm font-medium">Plan my day</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Show me what I should work on today.
                  </p>
                </Card>

                <Card
                  className="cursor-pointer p-4 transition hover:bg-accent"
                  onClick={() => sendMessage("Add a task called Test Task.")}
                >
                  <p className="text-sm font-medium">Add a task</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Create a task using natural language.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------ */
          /* Conversation */
          /* ------------------------------------------------ */

          <div className="min-h-0 flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((item, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    item.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted">
                      <Sparkles className="size-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                      item.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border bg-muted/40"
                    }`}
                  >
                    {item.role === "assistant" ? (
                      <div className="space-y-2 leading-6">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),

                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),

                            ul: ({ children }) => (
                              <ul className="my-2 list-disc space-y-1 pl-5">
                                {children}
                              </ul>
                            ),

                            ol: ({ children }) => (
                              <ol className="my-2 list-decimal space-y-1 pl-5">
                                {children}
                              </ol>
                            ),

                            li: ({ children }) => <li>{children}</li>,

                            h1: ({ children }) => (
                              <h1 className="mb-2 text-base font-semibold">
                                {children}
                              </h1>
                            ),

                            h2: ({ children }) => (
                              <h2 className="mb-2 text-base font-semibold">
                                {children}
                              </h2>
                            ),

                            h3: ({ children }) => (
                              <h3 className="mb-2 text-sm font-semibold">
                                {children}
                              </h3>
                            ),

                            code: ({ children }) => (
                              <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-xs">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {item.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{item.content}</div>
                    )}
                  </div>

                  {item.role === "user" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading */}

              {loading && (
                <div className="flex gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg border bg-muted">
                    <Sparkles className="size-4" />
                  </div>

                  <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    TaskVault is thinking...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* Input */}
        {/* ================================================= */}

        <div className="border-t p-5">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 rounded-xl border bg-background p-2 shadow-sm">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask TaskVault anything..."
                disabled={loading}
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />

              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-4" />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
