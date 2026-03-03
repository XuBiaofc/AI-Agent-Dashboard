"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import {
  ToolEvent,
  EventStoreState,
  INITIAL_EVENT_STORE,
} from "@/lib/types/events";

// --- Action interfaces (no discriminated unions) ---
interface EventAction {
  actionType: string; // "ADD_EVENT" | "UPDATE_EVENT" | "SET_AGENT_STATUS" | "CLEAR_EVENTS"
  event?: ToolEvent;
  eventId?: string;
  updates?: Partial<ToolEvent>;
  agentStatus?: string;
}

function deriveCountsByAction(events: ToolEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const evt of events) {
    const key = `${evt.toolName}:${evt.action}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function eventReducer(
  state: EventStoreState,
  action: EventAction
): EventStoreState {
  if (action.actionType === "ADD_EVENT" && action.event) {
    const newEvents = [...state.events, action.event];
    return {
      ...state,
      events: newEvents,
      countsByAction: deriveCountsByAction(newEvents),
    };
  }

  if (action.actionType === "UPDATE_EVENT" && action.eventId && action.updates) {
    const newEvents = state.events.map((evt) =>
      evt.id === action.eventId ? { ...evt, ...action.updates } : evt
    );
    return {
      ...state,
      events: newEvents,
      countsByAction: deriveCountsByAction(newEvents),
    };
  }

  if (action.actionType === "SET_AGENT_STATUS" && action.agentStatus) {
    return { ...state, agentStatus: action.agentStatus };
  }

  if (action.actionType === "CLEAR_EVENTS") {
    return { ...INITIAL_EVENT_STORE };
  }

  return state;
}

// --- Context ---
interface EventStoreContextValue {
  state: EventStoreState;
  addEvent: (event: ToolEvent) => void;
  updateEvent: (eventId: string, updates: Partial<ToolEvent>) => void;
  setAgentStatus: (status: string) => void;
  clearEvents: () => void;
}

const EventStoreContext = createContext<EventStoreContextValue | null>(null);

export function EventStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(eventReducer, INITIAL_EVENT_STORE);

  const addEvent = useCallback(
    (event: ToolEvent) =>
      dispatch({ actionType: "ADD_EVENT", event }),
    []
  );

  const updateEvent = useCallback(
    (eventId: string, updates: Partial<ToolEvent>) =>
      dispatch({ actionType: "UPDATE_EVENT", eventId, updates }),
    []
  );

  const setAgentStatus = useCallback(
    (agentStatus: string) =>
      dispatch({ actionType: "SET_AGENT_STATUS", agentStatus }),
    []
  );

  const clearEvents = useCallback(
    () => dispatch({ actionType: "CLEAR_EVENTS" }),
    []
  );

  const value = React.useMemo(
    () => ({ state, addEvent, updateEvent, setAgentStatus, clearEvents }),
    [state, addEvent, updateEvent, setAgentStatus, clearEvents]
  );

  return (
    <EventStoreContext.Provider value={value}>
      {children}
    </EventStoreContext.Provider>
  );
}

export function useEventStore(): EventStoreContextValue {
  const ctx = useContext(EventStoreContext);
  if (!ctx) {
    throw new Error("useEventStore must be used within an EventStoreProvider");
  }
  return ctx;
}
