"use client";

import React from "react";
import { PreviewMessage } from "@/components/message";
import { useScrollToBottom } from "@/lib/use-scroll-to-bottom";
import { UIMessage } from "ai";
import { ToolCallBadge } from "./ToolCallBadge";
import { useEventStore } from "@/lib/stores/event-store";

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading: boolean;
  status: "error" | "submitted" | "streaming" | "ready";
  emptyStateNode?: React.ReactNode;
}

export function ChatMessages({
  messages,
  isLoading,
  status,
  emptyStateNode,
}: ChatMessagesProps) {
  const [containerRef, endRef] = useScrollToBottom();
  const { state: eventState } = useEventStore();

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      ref={containerRef}
    >
      {messages.length === 0 && emptyStateNode ? emptyStateNode : null}

      {messages.map((message, i) => (
        <div key={message.id}>
          <PreviewMessage
            message={message}
            isLoading={isLoading}
            status={status}
            isLatestMessage={i === messages.length - 1}
          />

          {/* Inline Tool Call Badges */}
          {message.role === "assistant" && (
            <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
              {message.parts
                .filter((part) => part.type === "tool-invocation")
                .map((part) => {
                  if (part.type !== "tool-invocation") return null;
                  const inv = part.toolInvocation;
                  // Find matching event from store
                  const matchedEvent = eventState.events.find(
                    (e) => e.id === inv.toolCallId
                  );
                  return (
                    <ToolCallBadge
                      key={inv.toolCallId}
                      toolName={inv.toolName}
                      action={
                        inv.args?.action ??
                        inv.args?.command?.slice(0, 20) ??
                        inv.toolName
                      }
                      status={
                        matchedEvent?.status ??
                        (inv.state === "result" ? "completed" : "running")
                      }
                      duration={matchedEvent?.duration ?? 0}
                    />
                  );
                })}
            </div>
          )}
        </div>
      ))}

      <div ref={endRef} className="pb-2" />
    </div>
  );
}
