"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { PageEnter } from "@/components/layout/PageEnter";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProgressProvider } from "@/components/providers/ProgressProvider";
import { VisitTracker } from "@/components/providers/VisitTracker";
import { allLessonIds } from "@/lib/course/manifest";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const totalCount = allLessonIds().length;

  // Cmd/Ctrl+K from anywhere. Bound at the shell rather than in the header so
  // it works with focus anywhere on the page — including inside the sandbox
  // editor, which otherwise swallows keystrokes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ProgressProvider totalCount={totalCount}>
      <VisitTracker />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="flex h-dvh flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <div className="flex min-h-0 flex-1">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="min-w-0 flex-1 overflow-y-auto">
            <PageEnter>{children}</PageEnter>
          </main>
        </div>
      </div>
    </ProgressProvider>
  );
}
