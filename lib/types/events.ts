// Event pipeline types — single interfaces, no discriminated unions

export interface ToolEvent {
    id: string;
    timestamp: number;
    toolName: string; // "computer" | "bash"
    action: string; // "screenshot", "left_click", "type", "key", "scroll", etc.
    payload: Record<string, unknown>;
    status: string; // "pending" | "running" | "completed" | "error"
    duration: number; // ms elapsed, 0 while pending/running
    result: unknown;
    error: string | null;
}

export interface EventStoreState {
    events: ToolEvent[];
    countsByAction: Record<string, number>;
    agentStatus: string; // "idle" | "thinking" | "acting" | "error"
}

export const INITIAL_EVENT_STORE: EventStoreState = {
    events: [],
    countsByAction: {},
    agentStatus: "idle",
};
