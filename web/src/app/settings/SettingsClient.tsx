"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Code,
  DownloadSimple,
  PaintBrush,
  ShieldCheck,
} from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useCodeLang } from "@/lib/codeLang";
import { CODE_LANG_IDS, CODE_LANG_LABEL, type CodeLangId } from "@/lib/codeLanguages";

export function SettingsClient() {
  const [preferredLang, setPreferredLang] = useCodeLang();
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportData = () => {
    try {
      setExporting(true);
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("dsa-") || key.startsWith("leetexpert:") || key.startsWith("sync:"))) {
          data[key] = localStorage.getItem(key) ?? "";
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leetexpert-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] px-4 py-8 sm:px-6 lg:px-8">
      {/* Background radial gradient accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--accent)_12%,transparent),_transparent_65%)]"
      />

      <div className="relative mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/courses/dsa"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-wide text-muted transition hover:text-foreground"
          >
            <ArrowLeft weight="bold" className="h-3.5 w-3.5" />
            Back to Curriculum
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-10">
          <p className="text-xs font-mono font-medium tracking-[0.14em] text-accent uppercase">
            Preferences &amp; Diagnostics
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Configure your development runtime, editor behavior, and local progress storage.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section: Language & Runtime */}
          <section className="rounded-[length:var(--radius-lg)] border border-border bg-elevated p-6 shadow-elevation">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[length:var(--radius-md)] bg-accent/[0.1] text-accent">
                <Code weight="bold" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                  Default Programming Language
                </h2>
                <p className="text-xs text-muted">
                  Controls the primary language tab across code blocks, interactive sandboxes, and tracers.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CODE_LANG_IDS.map((id) => {
                const active = preferredLang === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPreferredLang(id as CodeLangId)}
                    className={`flex items-center justify-between rounded-[length:var(--radius-md)] border p-4 text-left transition ${
                      active
                        ? "border-accent bg-accent/[0.08] shadow-elevation"
                        : "border-border bg-surface hover:border-accent/40"
                    }`}
                  >
                    <div>
                      <span className="block font-display text-sm font-bold text-foreground">
                        {CODE_LANG_LABEL[id]}
                      </span>
                      <span className="block font-mono text-[11px] text-muted">
                        {id === "python" ? "Pyodide WASM" : "V8 Native"}
                      </span>
                    </div>
                    {active ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-on-pop">
                        <Check weight="bold" className="h-3 w-3" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section: Appearance & Interface */}
          <section className="rounded-[length:var(--radius-lg)] border border-border bg-elevated p-6 shadow-elevation">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[length:var(--radius-md)] bg-accent/[0.1] text-accent">
                  <PaintBrush weight="bold" className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                    Theme &amp; Contrast
                  </h2>
                  <p className="text-xs text-muted">
                    Toggle between the Blueprint light mode and The Grid Underneath dark theme.
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </section>

          {/* Section: Local Data & Export */}
          <section className="rounded-[length:var(--radius-lg)] border border-border bg-elevated p-6 shadow-elevation">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[length:var(--radius-md)] bg-accent/[0.1] text-accent">
                <ShieldCheck weight="bold" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                  Data Portability &amp; Local Storage
                </h2>
                <p className="text-xs text-muted">
                  Your code solutions and progress are stored locally first. Export an offline backup anytime.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[length:var(--radius-md)] border border-border bg-surface p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Export Progress Snapshot</p>
                <p className="text-xs text-muted">Download all solved drafts, notes, and module checkmarks as a JSON file.</p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                disabled={exporting}
                className="inline-flex h-9 items-center gap-2 rounded-[length:var(--radius-md)] bg-pop px-4 text-xs font-bold text-on-pop shadow-elevation transition hover:opacity-90 disabled:opacity-50"
              >
                {exportSuccess ? (
                  <>
                    <Check weight="bold" className="h-4 w-4" />
                    Exported!
                  </>
                ) : (
                  <>
                    <DownloadSimple weight="bold" className="h-4 w-4" />
                    Export Backup JSON
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
