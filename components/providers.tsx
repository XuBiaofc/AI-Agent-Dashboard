"use client";

import React from "react";
import { EventStoreProvider } from "@/lib/stores/event-store";
import { SessionStoreProvider } from "@/lib/stores/session-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionStoreProvider>
      <EventStoreProvider>{children}</EventStoreProvider>
    </SessionStoreProvider>
  );
}
