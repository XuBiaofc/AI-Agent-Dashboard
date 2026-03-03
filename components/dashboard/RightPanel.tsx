"use client";

import React, { useState } from "react";
import { VNCViewer } from "./VNCViewer";
import { ToolCallTimeline } from "./ToolCallTimeline";
import { Monitor } from "lucide-react";

interface RightPanelProps {
  streamUrl: string | null;
  isInitializing: boolean;
  onRefresh: () => void;
}

export function RightPanel({
  streamUrl,
  isInitializing,
  onRefresh,
}: RightPanelProps) {
  const [toolPanelHeight, setToolPanelHeight] = useState(35); // percentage

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* VNC Section */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{ height: `${100 - toolPanelHeight}%` }}
      >
        {/* VNC Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Monitor className="w-3.5 h-3.5" />
            <span className="font-medium">Desktop View</span>
          </div>
        </div>

        <VNCViewer
          streamUrl={streamUrl}
          isInitializing={isInitializing}
          onRefresh={onRefresh}
        />
      </div>

      {/* Resize Handle */}
      <div
        className="h-1.5 bg-zinc-900 border-y border-zinc-800 cursor-row-resize flex items-center justify-center hover:bg-zinc-800 transition-colors group"
        onMouseDown={(e) => {
          e.preventDefault();
          const startY = e.clientY;
          const startHeight = toolPanelHeight;
          const parent = (e.target as HTMLElement).parentElement;
          if (!parent) return;
          const parentHeight = parent.offsetHeight;

          const onMove = (ev: MouseEvent) => {
            const delta = startY - ev.clientY;
            const deltaPercent = (delta / parentHeight) * 100;
            const newHeight = Math.max(15, Math.min(70, startHeight + deltaPercent));
            setToolPanelHeight(newHeight);
          };

          const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };

          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      >
        <div className="w-8 h-0.5 rounded-full bg-zinc-700 group-hover:bg-zinc-500 transition-colors" />
      </div>

      {/* Tool Call Timeline Section */}
      <div
        className="flex-shrink-0 overflow-hidden border-t border-zinc-800"
        style={{ height: `${toolPanelHeight}%` }}
      >
        <ToolCallTimeline />
      </div>
    </div>
  );
}
