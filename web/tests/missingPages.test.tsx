// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import NotFound from "@/app/not-found";
import { SettingsClient } from "@/app/settings/SettingsClient";
import { RoadmapClient } from "@/app/courses/dsa/roadmap/RoadmapClient";
import { CheatsheetsClient } from "@/app/courses/dsa/cheatsheets/CheatsheetsClient";

// Mock router and progress providers for component static renders
vi.mock("next/navigation", () => ({
  usePathname: () => "/settings",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/components/providers/ProgressProvider", () => ({
  useProgress: () => ({
    visited: new Set(["getting-started/course-introduction", "arrays/arrays-in-memory"]),
    visitedCount: 2,
    totalCount: 104,
    solvedProblemCount: 1,
    totalProblemCount: 50,
  }),
}));

vi.mock("@/components/providers/SyncBridge", () => ({
  useSyncBridge: () => ({
    runtime: null,
    issue: null,
    abortSync: vi.fn(),
  }),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
  },
}));

describe("404 Not Found Page (web/src/app/not-found.tsx)", () => {
  it("renders the 404 header, leetExpert lamp branding, and recovery links", () => {
    const html = renderToStaticMarkup(<NotFound />);
    expect(html).toContain("404");
    expect(html).toContain("Page Not Found");
    expect(html).toContain("leet");
    expect(html).toContain("Expert");

    // Check presence of recovery links
    expect(html).toContain('href="/courses/dsa"');
    expect(html).toContain('href="/courses/dsa/problems"');
    expect(html).toContain('href="/courses/dsa/roadmap"');
    expect(html).toContain('href="/courses/dsa/cheatsheets"');
    expect(html).toContain('href="/"');
  });

  it("guides learners to shortcut search with ⌘K prompt", () => {
    const html = renderToStaticMarkup(<NotFound />);
    expect(html).toContain("⌘K");
    expect(html).toContain("Ctrl+K");
  });
});

describe("Settings & Preferences Page (web/src/app/settings)", () => {
  it("renders runtime language options and data export tools", () => {
    const html = renderToStaticMarkup(<SettingsClient />);
    expect(html).toContain("Settings");
    expect(html).toContain("Default Programming Language");
    expect(html).toContain("Python");
    expect(html).toContain("JavaScript");
    expect(html).toContain("Export Backup JSON");
    expect(html).toContain("Data Portability");
  });
});

describe("Curriculum Roadmap View (web/src/app/courses/dsa/roadmap)", () => {
  it("renders all 5 stages from Foundations to Global Reasoning", () => {
    const html = renderToStaticMarkup(<RoadmapClient />);
    expect(html).toContain("DSA Curriculum Roadmap");
    expect(html).toContain("Stage 0");
    expect(html).toContain("Foundations");
    expect(html).toContain("Stage 1");
    expect(html).toContain("Linear Structures");
    expect(html).toContain("Stage 2");
    expect(html).toContain("Techniques on Linear Data");
    expect(html).toContain("Stage 3");
    expect(html).toContain("Recursive &amp; Hierarchical");
    expect(html).toContain("Stage 4");
    expect(html).toContain("Global Reasoning");
  });

  it("links directly to concept maps and module destinations", () => {
    const html = renderToStaticMarkup(<RoadmapClient />);
    expect(html).toContain('href="/courses/dsa/arrays"');
    expect(html).toContain('href="/courses/dsa/arrays/concept-map"');
    expect(html).toContain('href="/courses/dsa/cheatsheets"');
  });
});

describe("Cheatsheets Hub (web/src/app/courses/dsa/cheatsheets)", () => {
  it("renders cheatsheet index with search filter and gold tier badges", () => {
    const html = renderToStaticMarkup(<CheatsheetsClient />);
    expect(html).toContain("DSA Cheatsheets Hub");
    expect(html).toContain("Gold Tier Only");
    expect(html).toContain("Arrays");
    expect(html).toContain("Strings");
    expect(html).toContain("Hash Tables");
    expect(html).toContain("Key Operations:");
    expect(html).toContain("Core Patterns");
    expect(html).toContain("Common Pitfall:");
  });

  it("includes direct links to drills and interactive concept maps", () => {
    const html = renderToStaticMarkup(<CheatsheetsClient />);
    expect(html).toContain('href="/courses/dsa/arrays/practice#cheatsheet"');
    expect(html).toContain('href="/courses/dsa/arrays/concept-map"');
  });
});
