"use client";

import { getDesktopURL } from "@/lib/e2b/utils";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { LeftPanel } from "@/components/dashboard/LeftPanel";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { ProjectInfo } from "@/components/project-info";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ABORTED } from "@/lib/utils";
import { useEventStore } from "@/lib/stores/event-store";
import { useSessionStore } from "@/lib/stores/session-store";
import { ToolEvent } from "@/lib/types/events";
import { ChatMessages } from "@/components/dashboard/ChatMessages";
import { DebugPanel } from "@/components/dashboard/DebugPanel";
import { AgentStatusBar } from "@/components/dashboard/AgentStatusBar";
import { Input } from "@/components/input";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import { SessionSidebar } from "@/components/dashboard/SessionSidebar";
import { Monitor, MessageSquare, Zap } from "lucide-react";
import { VNCViewer } from "@/components/dashboard/VNCViewer";
import { ToolCallTimeline } from "@/components/dashboard/ToolCallTimeline";

export default function Dashboard() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<string>("chat"); // "chat" | "vnc" | "tools"

  // Event store
  const { addEvent, updateEvent, setAgentStatus } = useEventStore();

  // Session store
  const {
    activeSession,
    createSession,
    updateSessionMessages,
    updateSession,
  } = useSessionStore();

  // Track processed tool call IDs to avoid duplicates
  const processedToolCalls = useRef<Set<string>>(new Set());

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop: stopGeneration,
    append,
    setMessages,
  } = useChat({
    api: "/api/chat",
    id: sandboxId ?? undefined,
    body: {
      sandboxId,
    },
    maxSteps: 30,
    onError: (error) => {
      console.error(error);
      setAgentStatus("error");
      toast.error("There was an error", {
        description: "Please try again later.",
        richColors: true,
        position: "top-center",
      });
    },
  });

  // --- Event Pipeline: capture tool invocations ---
  useEffect(() => {
    // Update agent status based on chat status
    if (status === "streaming") {
      setAgentStatus("thinking");
    } else if (status === "submitted") {
      setAgentStatus("acting");
    } else if (status === "ready") {
      setAgentStatus("idle");
    }

    // Scan messages for tool invocations
    for (const message of messages) {
      if (message.role !== "assistant") continue;
      for (const part of message.parts) {
        if (part.type !== "tool-invocation") continue;
        const inv = part.toolInvocation;
        const callId = inv.toolCallId;

        if (!processedToolCalls.current.has(callId)) {
          // New tool call — add event
          processedToolCalls.current.add(callId);
          const event: ToolEvent = {
            id: callId,
            timestamp: Date.now(),
            toolName: inv.toolName,
            action: inv.args?.action ?? inv.args?.command?.slice(0, 30) ?? inv.toolName,
            payload: inv.args ?? {},
            status: inv.state === "result" ? "completed" : "running",
            duration: 0,
            result: inv.state === "result" ? inv.result : null,
            error: null,
          };
          addEvent(event);
        } else {
          // Existing tool call — update status
          if (inv.state === "result") {
            updateEvent(callId, {
              status: inv.result === ABORTED ? "error" : "completed",
              result: inv.result,
              duration: Date.now() - (processedToolCalls.current.has(callId) ? Date.now() : 0),
              error: inv.result === ABORTED ? "Aborted by user" : null,
            });
          }
        }
      }
    }
  }, [messages, status, addEvent, updateEvent, setAgentStatus]);

  // --- Persist messages to active session ---
  useEffect(() => {
    if (activeSession && messages.length > 0) {
      const serialized = messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: typeof m.content === "string" ? m.content : "",
        parts: m.parts,
        createdAt: Date.now(),
      }));
      updateSessionMessages(activeSession.id, serialized);
    }
  }, [messages, activeSession, updateSessionMessages]);

  // --- Auto-create first session ---
  useEffect(() => {
    if (!activeSession) {
      createSession("New Chat");
    }
  }, [activeSession, createSession]);

  // --- Store sandbox info in session ---
  useEffect(() => {
    if (activeSession && sandboxId) {
      updateSession(activeSession.id, { sandboxId, streamUrl });
    }
  }, [sandboxId, streamUrl, activeSession, updateSession]);

  const stop = useCallback(() => {
    stopGeneration();

    const lastMessage = messages.at(-1);
    const lastMessageLastPart = lastMessage?.parts.at(-1);
    if (
      lastMessage?.role === "assistant" &&
      lastMessageLastPart?.type === "tool-invocation"
    ) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          ...lastMessage,
          parts: [
            ...lastMessage.parts.slice(0, -1),
            {
              ...lastMessageLastPart,
              toolInvocation: {
                ...lastMessageLastPart.toolInvocation,
                state: "result",
                result: ABORTED,
              },
            },
          ],
        },
      ]);
    }
  }, [messages, stopGeneration, setMessages]);

  const isLoading = status !== "ready";

  const refreshDesktop = useCallback(async () => {
    try {
      setIsInitializing(true);
      const { streamUrl: newUrl, id } = await getDesktopURL(
        sandboxId || undefined
      );
      setStreamUrl(newUrl);
      setSandboxId(id);
    } catch (err) {
      console.error("Failed to refresh desktop:", err);
    } finally {
      setIsInitializing(false);
    }
  }, [sandboxId]);

  // Kill desktop on page close
  useEffect(() => {
    if (!sandboxId) return;

    const killDesktop = () => {
      if (!sandboxId) return;
      navigator.sendBeacon(
        `/api/kill-desktop?sandboxId=${encodeURIComponent(sandboxId)}`
      );
    };

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(
      navigator.userAgent
    );

    if (isIOS || isSafari) {
      window.addEventListener("pagehide", killDesktop);
      return () => {
        window.removeEventListener("pagehide", killDesktop);
        killDesktop();
      };
    } else {
      window.addEventListener("beforeunload", killDesktop);
      return () => {
        window.removeEventListener("beforeunload", killDesktop);
        killDesktop();
      };
    }
  }, [sandboxId]);

  // Initialize desktop
  useEffect(() => {
    const init = async () => {
      try {
        setIsInitializing(true);
        const { streamUrl: newUrl, id } = await getDesktopURL(
          sandboxId ?? undefined
        );
        setStreamUrl(newUrl);
        setSandboxId(id);
      } catch (err) {
        console.error("Failed to initialize desktop:", err);
        toast.error("Failed to initialize desktop");
      } finally {
        setIsInitializing(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emptyState = <ProjectInfo />;

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="flex h-dvh relative bg-zinc-950">
      {/* ==================== DESKTOP LAYOUT ==================== */}
      <div className="w-full hidden xl:block">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel: Chat */}
          <ResizablePanel
            defaultSize={35}
            minSize={25}
            maxSize={50}
            className="flex flex-col border-r border-zinc-800"
          >
            <LeftPanel
              messages={messages}
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              isInitializing={isInitializing}
              status={status}
              stop={stop}
              append={append}
              emptyStateNode={emptyState}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel: VNC + Tool Details */}
          <ResizablePanel
            defaultSize={65}
            minSize={40}
            className="bg-zinc-950"
          >
            <RightPanel
              streamUrl={streamUrl}
              isInitializing={isInitializing}
              onRefresh={refreshDesktop}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* ==================== MOBILE LAYOUT ==================== */}
      <div className="w-full xl:hidden flex flex-col">
        {/* Mobile Tab Bar */}
        <div className="flex border-b border-zinc-800 bg-zinc-950">
          <button
            onClick={() => setMobileTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors cursor-pointer ${
              mobileTab === "chat"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-zinc-500"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setMobileTab("vnc")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors cursor-pointer ${
              mobileTab === "vnc"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-zinc-500"
            }`}
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </button>
          <button
            onClick={() => setMobileTab("tools")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors cursor-pointer ${
              mobileTab === "tools"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-zinc-500"
            }`}
          >
            <Zap className="w-4 h-4" />
            Tools
          </button>
        </div>

        {/* Mobile Content */}
        {mobileTab === "chat" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <SessionSidebar />
            <AgentStatusBar />
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              status={status}
              emptyStateNode={emptyState}
            />
            {messages.length === 0 && (
              <PromptSuggestions
                disabled={isInitializing}
                submitPrompt={(prompt: string) =>
                  append({ role: "user" as const, content: prompt })
                }
              />
            )}
            <DebugPanel />
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
        )}

        {mobileTab === "vnc" && (
          <div className="flex-1">
            <VNCViewer
              streamUrl={streamUrl}
              isInitializing={isInitializing}
              onRefresh={refreshDesktop}
            />
          </div>
        )}

        {mobileTab === "tools" && (
          <div className="flex-1 overflow-hidden">
            <ToolCallTimeline />
          </div>
        )}
      </div>
    </div>
  );
}
