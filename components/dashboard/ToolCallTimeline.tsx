"use client";

import React from "react";
import { useEventStore } from "@/lib/stores/event-store";
import { ToolCallDetail } from "./ToolCallDetail";
import { Activity, Zap } from "lucide-react";

export function ToolCallTimeline() {
  const { state } = useEventStore();

  if (state.events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600 py-12">
        <Zap className="w-8 h-8 mb-3 opacity-40" />
        <div className="text-sm font-medium">No tool calls yet</div>
        <div className="text-xs mt-1">
          Tool invocations will appear here in real-time
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800 px-3 py-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          Tool Call Timeline
        </div>
        <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
          {state.events.length} calls
        </span>
      </div>

      {/* Events */}
      <div className="p-3 space-y-2">
        {[...state.events].reverse().map((event, idx) => (
          <ToolCallDetail
            key={event.id}
            event={event}
            isExpanded={idx === 0}
          />
        ))}
      </div>
    </div>
  );
}
