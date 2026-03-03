"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface VNCViewerProps {
  streamUrl: string | null;
  isInitializing: boolean;
  onRefresh: () => void;
}

function VNCViewerInner({ streamUrl, isInitializing, onRefresh }: VNCViewerProps) {
  if (!streamUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-zinc-700 border-t-emerald-500 animate-spin" />
          </div>
          <span className="text-sm font-medium">
            {isInitializing ? "Initializing desktop environment..." : "Loading stream..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-zinc-950">
      <iframe
        src={streamUrl}
        className="w-full h-full"
        style={{ transformOrigin: "center", width: "100%", height: "100%" }}
        allow="autoplay"
        title="VNC Desktop Stream"
      />
      <Button
        onClick={onRefresh}
        className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg text-xs z-10 transition-all"
        disabled={isInitializing}
      >
        {isInitializing ? (
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
            Creating...
          </span>
        ) : (
          "New Desktop"
        )}
      </Button>
    </div>
  );
}

// React.memo with custom comparator — prevents re-render when chat state changes
export const VNCViewer = React.memo(VNCViewerInner, (prev, next) => {
  return (
    prev.streamUrl === next.streamUrl &&
    prev.isInitializing === next.isInitializing
  );
});

VNCViewer.displayName = "VNCViewer";
