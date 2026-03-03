"use client";

import React, { useState } from "react";
import { useEventStore } from "@/lib/stores/event-store";
import { ToolCallDetail } from "./ToolCallDetail";
import {
  ChevronDown,
  ChevronUp,
  Bug,
  Trash2,
  BarChart3,
} from "lucide-react";

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("events"); // "events" | "stats"
  const { state, clearEvents } = useEventStore();

  return (
    <div className="border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      {/* Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Bug className="w-3.5 h-3.5" />
          <span className="font-medium">Debug Panel</span>
          {state.events.length > 0 && (
            <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
              {state.events.length}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="max-h-72 overflow-hidden flex flex-col">
          {/* Tabs + Actions */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-800/50">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("events")}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  activeTab === "events"
                    ? "bg-zinc-800 text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  activeTab === "stats"
                    ? "bg-zinc-800 text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <BarChart3 className="w-3 h-3 inline mr-1" />
                Stats
              </button>
            </div>
            <button
              onClick={clearEvents}
              className="text-zinc-600 hover:text-red-400 transition-colors p-1 cursor-pointer"
              title="Clear events"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {activeTab === "events" && (
              <div className="space-y-1.5 mt-1">
                {state.events.length === 0 ? (
                  <div className="text-center text-zinc-600 text-xs py-6">
                    No events captured yet
                  </div>
                ) : (
                  [...state.events].reverse().map((event) => (
                    <ToolCallDetail key={event.id} event={event} />
                  ))
                )}
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-3 mt-2">
                {/* Agent Status */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 font-semibold">
                    Agent Status
                  </div>
                  <div className="text-sm text-zinc-300 font-mono capitalize">
                    {state.agentStatus}
                  </div>
                </div>

                {/* Counts by action */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 font-semibold">
                    Events by Action
                  </div>
                  {Object.keys(state.countsByAction).length === 0 ? (
                    <div className="text-xs text-zinc-600">No data</div>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(state.countsByAction)
                        .sort(([, a], [, b]) => b - a)
                        .map(([action, count]) => (
                          <div
                            key={action}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="font-mono text-zinc-400">
                              {action}
                            </span>
                            <span className="text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 font-semibold">
                    Summary
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-900 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-zinc-200">
                        {state.events.length}
                      </div>
                      <div className="text-zinc-500 text-[10px]">Total Events</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-zinc-200">
                        {state.events.filter((e) => e.status === "completed").length}
                      </div>
                      <div className="text-zinc-500 text-[10px]">Completed</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-zinc-200">
                        {state.events.filter((e) => e.status === "error").length}
                      </div>
                      <div className="text-zinc-500 text-[10px]">Errors</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-zinc-200">
                        {state.events.length > 0
                          ? Math.round(
                              state.events
                                .filter((e) => e.duration > 0)
                                .reduce((sum, e) => sum + e.duration, 0) /
                                Math.max(
                                  state.events.filter((e) => e.duration > 0).length,
                                  1
                                )
                            )
                          : 0}
                        ms
                      </div>
                      <div className="text-zinc-500 text-[10px]">Avg Duration</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
