"use client";

import React, { useState } from "react";
import {
  Terminal,
  Monitor,
  Clock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { ToolEvent } from "@/lib/types/events";

interface ToolCallDetailProps {
  event: ToolEvent;
  isExpanded?: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending: { cls: "bg-amber-500/15 text-amber-400", label: "Pending" },
    running: { cls: "bg-blue-500/15 text-blue-400", label: "Running" },
    completed: { cls: "bg-emerald-500/15 text-emerald-400", label: "Done" },
    error: { cls: "bg-red-500/15 text-red-400", label: "Error" },
  };
  const info = map[status] || map.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${info.cls}`}
    >
      {status === "running" || status === "pending" ? (
        <Loader2 className="w-2.5 h-2.5 animate-spin" />
      ) : status === "completed" ? (
        <CheckCircle2 className="w-2.5 h-2.5" />
      ) : (
        <XCircle className="w-2.5 h-2.5" />
      )}
      {info.label}
    </span>
  );
}

export function ToolCallDetail({ event, isExpanded: defaultExpanded = false }: ToolCallDetailProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const isScreenshot =
    event.toolName === "computer" && event.action === "screenshot";

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-all">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-800/50 transition-colors cursor-pointer"
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {event.toolName === "bash" ? (
            <Terminal className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <Monitor className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          )}
          <span className="text-xs font-mono text-zinc-300 truncate">
            {event.toolName}
            <span className="text-zinc-600 mx-1">→</span>
            {event.action}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={event.status} />
          {event.duration > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-500">
              <Clock className="w-2.5 h-2.5" />
              {event.duration}ms
            </span>
          )}
        </div>
      </button>

      {/* Detail body */}
      {isExpanded && (
        <div className="border-t border-zinc-800 px-3 py-3 space-y-3">
          {/* Timestamp */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <Clock className="w-3 h-3" />
            {new Date(event.timestamp).toLocaleTimeString()}
          </div>

          {/* Payload */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 font-semibold">
              Payload
            </div>
            <pre className="text-[11px] text-zinc-400 bg-zinc-950 rounded-md p-2.5 overflow-x-auto font-mono leading-relaxed max-h-40 overflow-y-auto">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </div>

          {/* Result */}
          {event.result !== null && event.result !== undefined && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 font-semibold">
                Result
              </div>
              {isScreenshot && typeof event.result === "object" ? (
                <div className="text-[11px] text-zinc-500 italic">
                  [Screenshot image data]
                </div>
              ) : (
                <pre className="text-[11px] text-zinc-400 bg-zinc-950 rounded-md p-2.5 overflow-x-auto font-mono leading-relaxed max-h-40 overflow-y-auto">
                  {typeof event.result === "string"
                    ? event.result
                    : JSON.stringify(event.result, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Error */}
          {event.error && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-red-400 mb-1.5 font-semibold">
                Error
              </div>
              <pre className="text-[11px] text-red-300 bg-red-950/30 rounded-md p-2.5 overflow-x-auto font-mono">
                {event.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
