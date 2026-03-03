"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import {
  ChatSession,
  SessionStoreState,
  INITIAL_SESSION_STORE,
} from "@/lib/types/sessions";

const STORAGE_KEY = "ai-dashboard-sessions";

// --- Action interface (no discriminated unions) ---
interface SessionAction {
  actionType: string; // "CREATE" | "SWITCH" | "DELETE" | "UPDATE_MESSAGES" | "UPDATE_SESSION" | "LOAD" | "SET_ACTIVE"
  session?: ChatSession;
  sessionId?: string;
  messages?: ChatSession["messages"];
  updates?: Partial<ChatSession>;
  sessions?: ChatSession[];
  activeSessionId?: string | null;
}

function generateId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sessionReducer(
  state: SessionStoreState,
  action: SessionAction
): SessionStoreState {
  if (action.actionType === "LOAD" && action.sessions !== undefined) {
    return {
      sessions: action.sessions,
      activeSessionId: action.activeSessionId ?? state.activeSessionId,
    };
  }

  if (action.actionType === "CREATE" && action.session) {
    return {
      sessions: [action.session, ...state.sessions],
      activeSessionId: action.session.id,
    };
  }

  if (action.actionType === "SWITCH" && action.sessionId) {
    return { ...state, activeSessionId: action.sessionId };
  }

  if (action.actionType === "DELETE" && action.sessionId) {
    const filtered = state.sessions.filter((s) => s.id !== action.sessionId);
    const newActive =
      state.activeSessionId === action.sessionId
        ? filtered[0]?.id ?? null
        : state.activeSessionId;
    return { sessions: filtered, activeSessionId: newActive };
  }

  if (
    action.actionType === "UPDATE_MESSAGES" &&
    action.sessionId &&
    action.messages
  ) {
    return {
      ...state,
      sessions: state.sessions.map((s) =>
        s.id === action.sessionId
          ? { ...s, messages: action.messages!, updatedAt: Date.now() }
          : s
      ),
    };
  }

  if (
    action.actionType === "UPDATE_SESSION" &&
    action.sessionId &&
    action.updates
  ) {
    return {
      ...state,
      sessions: state.sessions.map((s) =>
        s.id === action.sessionId
          ? { ...s, ...action.updates, updatedAt: Date.now() }
          : s
      ),
    };
  }

  if (action.actionType === "SET_ACTIVE") {
    return { ...state, activeSessionId: action.activeSessionId ?? null };
  }

  return state;
}

// --- Context ---
interface SessionStoreContextValue {
  state: SessionStoreState;
  activeSession: ChatSession | null;
  createSession: (title?: string) => ChatSession;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  updateSessionMessages: (
    sessionId: string,
    messages: ChatSession["messages"]
  ) => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
}

const SessionStoreContext = createContext<SessionStoreContextValue | null>(null);

export function SessionStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(sessionReducer, INITIAL_SESSION_STORE);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SessionStoreState;
        dispatch({
          actionType: "LOAD",
          sessions: parsed.sessions,
          activeSessionId: parsed.activeSessionId,
        });
      }
    } catch {
      // Corrupted data — ignore
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full — ignore
    }
  }, [state]);

  const createSession = useCallback(
    (title?: string): ChatSession => {
      const session: ChatSession = {
        id: generateId(),
        title: title || `Session ${state.sessions.length + 1}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        sandboxId: null,
        streamUrl: null,
      };
      dispatch({ actionType: "CREATE", session });
      return session;
    },
    [state.sessions.length]
  );

  const switchSession = useCallback(
    (id: string) => dispatch({ actionType: "SWITCH", sessionId: id }),
    []
  );

  const deleteSession = useCallback(
    (id: string) => dispatch({ actionType: "DELETE", sessionId: id }),
    []
  );

  const updateSessionMessages = useCallback(
    (sessionId: string, messages: ChatSession["messages"]) =>
      dispatch({ actionType: "UPDATE_MESSAGES", sessionId, messages }),
    []
  );

  const updateSession = useCallback(
    (sessionId: string, updates: Partial<ChatSession>) =>
      dispatch({ actionType: "UPDATE_SESSION", sessionId, updates }),
    []
  );

  const activeSession =
    state.sessions.find((s) => s.id === state.activeSessionId) ?? null;

  const value = React.useMemo(
    () => ({
      state,
      activeSession,
      createSession,
      switchSession,
      deleteSession,
      updateSessionMessages,
      updateSession,
    }),
    [
      state,
      activeSession,
      createSession,
      switchSession,
      deleteSession,
      updateSessionMessages,
      updateSession,
    ]
  );

  return (
    <SessionStoreContext.Provider value={value}>
      {children}
    </SessionStoreContext.Provider>
  );
}

export function useSessionStore(): SessionStoreContextValue {
  const ctx = useContext(SessionStoreContext);
  if (!ctx) {
    throw new Error(
      "useSessionStore must be used within a SessionStoreProvider"
    );
  }
  return ctx;
}
