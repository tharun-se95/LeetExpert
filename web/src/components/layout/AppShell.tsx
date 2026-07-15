"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { PageEnter } from "@/components/layout/PageEnter";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProgressProvider } from "@/components/providers/ProgressProvider";
import { VisitTracker } from "@/components/providers/VisitTracker";
import { buildFlatNav } from "@/lib/content/nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const totalCount = buildFlatNav().length;

  return (
    <ProgressProvider totalCount={totalCount}>
      <VisitTracker />
      <div className="flex min-h-screen flex-col">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <div className="flex min-h-0 flex-1">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="min-w-0 flex-1">
            <PageEnter>{children}</PageEnter>
          </main>
        </div>
      </div>
    </ProgressProvider>
  );
}
