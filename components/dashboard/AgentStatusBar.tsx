"use client";

import React from "react";
import { useEventStore } from "@/lib/stores/event-store";
import { Activity, Brain, Mouse, AlertTriangle, Coffee } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; cls: string; pulse: boolean }
> = {
  idle: {
    icon: Coffee,
    label: "Idle",
    cls: "text-zinc-400 bg-zinc-800/50",
    pulse: false,
  },
  thinking: {
    icon: Brain,
    label: "Thinking",
    cls: "text-violet-400 bg-violet-500/10",
    pulse: true,
  },
  acting: {
    icon: Mouse,
    label: "Acting",
    cls: "text-blue-400 bg-blue-500/10",
    pulse: true,
  },
  error: {
    icon: AlertTriangle,
    label: "Error",
    cls: "text-red-400 bg-red-500/10",
    pulse: false,
  },
};

export function AgentStatusBar() {
  const { state } = useEventStore();
  const config = STATUS_CONFIG[state.agentStatus] || STATUS_CONFIG.idle;
  const Icon = config.icon;
  const eventCount = state.events.length;

  return (
    <div
      className={`flex items-center justify-between px-3 py-1.5 text-xs border-b border-zinc-800 ${config.cls} transition-colors`}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <Icon className="w-3.5 h-3.5" />
          {config.pulse && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-current animate-ping opacity-40" />
          )}
        </div>
        <span className="font-medium">{config.label}</span>
      </div>
      <div className="flex items-center gap-1.5 text-zinc-500">
        <Activity className="w-3 h-3" />
        <span>{eventCount} events</span>
      </div>
    </div>
  );
}
