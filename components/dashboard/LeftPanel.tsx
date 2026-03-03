"use client";

import React from "react";
import { SessionSidebar } from "./SessionSidebar";
import { ChatMessages } from "./ChatMessages";
import { DebugPanel } from "./DebugPanel";
import { AgentStatusBar } from "./AgentStatusBar";
import { Input } from "@/components/input";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import { UIMessage } from "ai";

interface LeftPanelProps {
  messages: UIMessage[];
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isInitializing: boolean;
  status: "error" | "submitted" | "streaming" | "ready";
  stop: () => void;
  append: (message: { role: "user" | "assistant" | "system" | "data"; content: string }) => void;
  emptyStateNode?: React.ReactNode;
  onSessionSwitch?: () => void;
}

export function LeftPanel({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  isInitializing,
  status,
  stop,
  append,
  emptyStateNode,
  onSessionSwitch,
}: LeftPanelProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Session Sidebar */}
      <SessionSidebar onSessionSwitch={onSessionSwitch} />

      {/* Agent Status */}
      <AgentStatusBar />

      {/* Chat Messages */}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        status={status}
        emptyStateNode={emptyStateNode}
      />

      {/* Prompt Suggestions */}
      {messages.length === 0 && (
        <PromptSuggestions
          disabled={isInitializing}
          submitPrompt={(prompt: string) =>
            append({ role: "user", content: prompt })
          }
        />
      )}

      {/* Debug Panel */}
      <DebugPanel />

      {/* Chat Input */}
      <div className="bg-zinc-950 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="p-3">
          <Input
            handleInputChange={handleInputChange}
            input={input}
            isInitializing={isInitializing}
            isLoading={isLoading}
            status={status}
            stop={stop}
          />
        </form>
      </div>
    </div>
  );
}
