"use client";

import React, { useState } from "react";
import { useSessionStore } from "@/lib/stores/session-store";
import {
  Plus,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
} from "lucide-react";

interface SessionSidebarProps {
  onSessionSwitch?: () => void;
}

export function SessionSidebar({ onSessionSwitch }: SessionSidebarProps) {
  const {
    state,
    activeSession,
    createSession,
    switchSession,
    deleteSession,
  } = useSessionStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCreate = () => {
    createSession();
  };

  const handleSwitch = (id: string) => {
    switchSession(id);
    onSessionSwitch?.();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
  };

  if (isCollapsed) {
    return (
      <div className="border-b border-zinc-800 bg-zinc-950/50 px-2 py-1.5 flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(false)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 cursor-pointer"
          title="Expand sessions"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-zinc-500 font-medium">
          {state.sessions.length} sessions
        </span>
        <button
          onClick={handleCreate}
          className="text-zinc-500 hover:text-emerald-400 transition-colors p-1 cursor-pointer"
          title="New session"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-b border-zinc-800 bg-zinc-950/50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <PanelLeftClose className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-300">Sessions</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCreate}
            className="text-zinc-500 hover:text-emerald-400 transition-colors p-1 rounded hover:bg-zinc-800 cursor-pointer"
            title="New session"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-zinc-800 cursor-pointer"
            title="Collapse"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Session list */}
      <div className="max-h-36 overflow-y-auto">
        {state.sessions.length === 0 ? (
          <div className="px-3 py-4 text-center">
            <div className="text-xs text-zinc-600 mb-2">No sessions yet</div>
            <button
              onClick={handleCreate}
              className="text-xs text-emerald-500 hover:text-emerald-400 font-medium cursor-pointer"
            >
              Create your first session
            </button>
          </div>
        ) : (
          state.sessions.map((session) => {
            const isActive = session.id === activeSession?.id;
            return (
              <button
                key={session.id}
                onClick={() => handleSwitch(session.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors cursor-pointer group ${
                  isActive
                    ? "bg-zinc-800/80 text-zinc-200 border-l-2 border-emerald-500"
                    : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300 border-l-2 border-transparent"
                }`}
              >
                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{session.title}</div>
                  <div className="text-[10px] text-zinc-600">
                    {session.messages.length} messages •{" "}
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-0.5 cursor-pointer"
                  title="Delete session"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
