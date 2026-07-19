"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { PageEnter } from "@/components/layout/PageEnter";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProgressProvider } from "@/components/providers/ProgressProvider";
import { VisitTracker } from "@/components/providers/VisitTracker";
import { allLessonIds } from "@/lib/course/manifest";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const totalCount = allLessonIds().length;

  return (
    <ProgressProvider totalCount={totalCount}>
      <VisitTracker />
      <div className="flex h-dvh flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
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
