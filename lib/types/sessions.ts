// Session types for multi-session chat history — no discriminated unions

export interface SerializedMessage {
    id: string;
    role: string; // "user" | "assistant" | "system"
    content: string;
    parts: unknown[];
    createdAt: number;
}

export interface ChatSession {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    messages: SerializedMessage[];
    sandboxId: string | null;
    streamUrl: string | null;
}

export interface SessionStoreState {
    sessions: ChatSession[];
    activeSessionId: string | null;
}

export const INITIAL_SESSION_STORE: SessionStoreState = {
    sessions: [],
    activeSessionId: null,
};
