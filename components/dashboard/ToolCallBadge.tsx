"use client";

import React from "react";
import { Terminal, Monitor, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  action: string;
  status: string; // "pending" | "running" | "completed" | "error"
  duration: number;
  onClick?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "running" || status === "pending") {
    return <Loader2 className="w-3 h-3 animate-spin" />;
  }
  if (status === "completed") {
    return <CheckCircle2 className="w-3 h-3" />;
  }
  if (status === "error") {
    return <XCircle className="w-3 h-3" />;
  }
  return null;
}

function ToolIcon({ toolName }: { toolName: string }) {
  if (toolName === "bash") {
    return <Terminal className="w-3 h-3" />;
  }
  return <Monitor className="w-3 h-3" />;
}

export function ToolCallBadge({
  toolName,
  action,
  status,
  duration,
  onClick,
}: ToolCallBadgeProps) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all hover:brightness-125 cursor-pointer ${style}`}
    >
      <ToolIcon toolName={toolName} />
      <span className="font-mono">{action}</span>
      <StatusIcon status={status} />
      {status === "completed" && duration > 0 && (
        <span className="text-[10px] opacity-70">{duration}ms</span>
      )}
    </button>
  );
}
