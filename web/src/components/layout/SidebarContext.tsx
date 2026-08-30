"use client";

import { createContext, useContext } from "react";

interface SidebarContextValue {
  open: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Owned by AppShell (it holds the actual open/closed state), consumed
 * wherever a lessons-drawer opener needs to live outside the header —
 * the floating opener on lesson pages, the inline one next to the problem
 * title. `useSidebar` throws for a control that assumes the drawer exists;
 * `useSidebarOptional` is for anything (like AppShell itself) that also
 * renders on routes with no course chrome at all.
 */
export function SidebarProvider({
  open,
  toggle,
  children,
}: SidebarContextValue & { children: React.ReactNode }) {
  return (
    <SidebarContext.Provider value={{ open, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarOptional(): SidebarContextValue | null {
  return useContext(SidebarContext);
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider");
  return ctx;
}
