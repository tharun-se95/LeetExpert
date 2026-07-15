import fs from "fs";
import path from "path";
import readingTime from "reading-time";
import { slugify } from "@/lib/slugify";
import {
  FAMILIES,
  FOUNDATIONS,
  STATIC_PAGES,
  getFamily,
  getFoundation,
  getPattern,
} from "./manifest";

const handbookRoot = path.resolve(process.cwd(), "..");

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface LoadedDoc {
  title: string;
  markdown: string;
  toc: TocItem[];
  readingMinutes: number;
  sourcePath: string;
}

function readHandbookFile(relativePath: string): string {
  const full = path.join(handbookRoot, relativePath);
  if (!fs.existsSync(full)) {
    throw new Error(`Handbook file not found: ${relativePath}`);
  }
  // Normalize CRLF so ## heading keys match the manifest on Windows.
  return fs.readFileSync(full, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

/** Strip a leading H1 so the page chrome can own the title. */
function stripLeadingH1(markdown: string): string {
  return markdown.replace(/^#\s+.+\n+/, "");
}

export function extractToc(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();

  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;
    // Skip fenced code interiors roughly — headings inside ``` are rare in this handbook
    const level = match[1].length;
    const text = match[2].replace(/[*_`]/g, "").trim();
    let id = slugify(text);
    const count = seen.get(id) ?? 0;
    if (count > 0) id = `${id}-${count}`;
    seen.set(slugify(text), count + 1);
    toc.push({ id, text, level });
  }
  return toc;
}

/**
 * Rewrite relative handbook markdown links to app routes where possible.
 */
export function rewriteMarkdownLinks(markdown: string): string {
  const familyFileToId = new Map(
    FAMILIES.map((f) => [path.basename(f.file), f.id]),
  );

  return markdown.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (full, label: string, href: string) => {
      if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) {
        return full;
      }

      const cleaned = href.replace(/^\.\.\//, "").replace(/^\.\//, "");
      const base = path.basename(cleaned).replace(/\\/g, "/");

      if (cleaned.includes("GLOSSARY") || base === "GLOSSARY.md") {
        return `[${label}](/glossary)`;
      }
      if (cleaned.includes("DECISION_TREES") || base === "DECISION_TREES.md") {
        return `[${label}](/decision-trees)`;
      }
      if (cleaned.includes("QUESTION_BANK") || base === "QUESTION_BANK.md") {
        return `[${label}](/question-bank)`;
      }
      if (cleaned.includes("recognition-stems")) {
        return `[${label}](/recognition/stems)`;
      }
      if (
        cleaned.includes("part-3-pattern-recognition/README") ||
        (cleaned.includes("part-3") && base === "README.md")
      ) {
        return `[${label}](/recognition)`;
      }

      const chapterMatch = /chapter-0(\d)-([a-z0-9-]+)\.md/.exec(base);
      if (chapterMatch) {
        const slugMap: Record<string, string> = {
          "01": "solving-problems",
          "02": "big-o",
          "03": "pattern-recognition",
        };
        const slug = slugMap[chapterMatch[1]];
        if (slug) return `[${label}](/foundations/${slug})`;
      }

      if (cleaned.includes("part-4-cheat-sheets") || cleaned.includes("cheat-sheets")) {
        if (base.startsWith("family-")) {
          const num = base.match(/family-(\d)/)?.[1];
          const family = FAMILIES.find((f) => f.number === Number(num));
          if (family) return `[${label}](/cheat-sheets/${family.id})`;
        }
        if (base === "README.md") return `[${label}](/cheat-sheets)`;
      }

      if (cleaned.includes("part-5-practice") || cleaned.includes("practice-roadmap")) {
        if (base.startsWith("family-")) {
          const num = base.match(/family-(\d)/)?.[1];
          const family = FAMILIES.find((f) => f.number === Number(num));
          if (family) return `[${label}](/practice/${family.id})`;
        }
        if (base === "README.md") return `[${label}](/practice)`;
      }

      if (cleaned.includes("part-2") || base.startsWith("family-")) {
        const id = familyFileToId.get(base);
        if (id) return `[${label}](/patterns/${id})`;
        const num = base.match(/family-(\d)/)?.[1];
        const family = FAMILIES.find((f) => f.number === Number(num));
        if (family) return `[${label}](/patterns/${family.id})`;
      }

      // Unmapped relative links — drop the broken path, keep label as text
      if (href.endsWith(".md")) {
        return label;
      }
      return full;
    },
  );
}

function finalizeDoc(
  raw: string,
  fallbackTitle: string,
  sourcePath: string,
  options?: { keepH1?: boolean },
): LoadedDoc {
  const title = extractTitle(raw, fallbackTitle);
  let markdown = options?.keepH1 ? raw : stripLeadingH1(raw);
  markdown = rewriteMarkdownLinks(markdown);
  const toc = extractToc(markdown);
  const readingMinutes = Math.max(1, Math.ceil(readingTime(raw).minutes));
  return { title, markdown, toc, readingMinutes, sourcePath };
}

/** Split a family file into overview + named pattern sections. */
export function splitFamilyMarkdown(raw: string): {
  overview: string;
  sections: Map<string, string>;
} {
  const lines = raw.split("\n");
  const sections = new Map<string, string>();
  let currentHeading: string | null = null;
  let buffer: string[] = [];
  const overviewLines: string[] = [];

  const flush = () => {
    if (currentHeading === null) {
      overviewLines.push(...buffer);
    } else if (currentHeading === "Family Overview") {
      overviewLines.push(`## Family Overview`, ...buffer);
    } else {
      sections.set(currentHeading, buffer.join("\n").trim());
    }
    buffer = [];
  };

  for (const line of lines) {
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      flush();
      currentHeading = h2[1].trim();
      continue;
    }
    // Skip leading H1 from overview body (title comes from page chrome)
    if (currentHeading === null && /^#\s+/.test(line)) continue;
    buffer.push(line);
  }
  flush();

  return {
    overview: overviewLines.join("\n").trim(),
    sections,
  };
}

export function loadFoundation(slug: string): LoadedDoc | null {
  const chapter = getFoundation(slug);
  if (!chapter) return null;
  const raw = readHandbookFile(chapter.file);
  return finalizeDoc(raw, chapter.title, chapter.file);
}

export function loadFamilyOverview(familyId: string): LoadedDoc | null {
  const family = getFamily(familyId);
  if (!family) return null;
  const raw = readHandbookFile(family.file);
  const { overview } = splitFamilyMarkdown(raw);

  // Build a short overview page with pattern cards listed in markdown
  const patternLinks = family.patterns
    .map((p) => `- [${p.title}](/patterns/${family.id}/${p.slug})`)
    .join("\n");

  const markdown = rewriteMarkdownLinks(
    `${overview}\n\n## Patterns in this family\n\n${patternLinks}`,
  );

  return {
    title: `Family ${family.number} — ${family.title}`,
    markdown,
    toc: extractToc(markdown),
    readingMinutes: Math.max(1, Math.ceil(readingTime(overview).minutes)),
    sourcePath: family.file,
  };
}

export function loadPattern(
  familyId: string,
  patternSlug: string,
): LoadedDoc | null {
  const hit = getPattern(familyId, patternSlug);
  if (!hit) return null;
  const { family, pattern } = hit;
  const raw = readHandbookFile(family.file);
  const { sections } = splitFamilyMarkdown(raw);
  const body = sections.get(pattern.heading);
  if (!body) {
    throw new Error(
      `Pattern section "${pattern.heading}" not found in ${family.file}`,
    );
  }
  const markdown = rewriteMarkdownLinks(body);
  return {
    title: pattern.title,
    markdown,
    toc: extractToc(markdown),
    readingMinutes: Math.max(1, Math.ceil(readingTime(body).minutes)),
    sourcePath: family.file,
  };
}

export function loadStaticPage(
  key: keyof typeof STATIC_PAGES,
): LoadedDoc {
  const page = STATIC_PAGES[key];
  const raw = readHandbookFile(page.file);
  return finalizeDoc(raw, page.title, page.file);
}

export function loadCheatSheet(familyId: string): LoadedDoc | null {
  const family = getFamily(familyId);
  if (!family) return null;
  const raw = readHandbookFile(family.cheatSheetFile);
  return finalizeDoc(raw, `${family.title} Cheat Sheet`, family.cheatSheetFile);
}

export function loadPractice(familyId: string): LoadedDoc | null {
  const family = getFamily(familyId);
  if (!family) return null;
  const raw = readHandbookFile(family.practiceFile);
  return finalizeDoc(raw, `${family.title} Practice`, family.practiceFile);
}

export function loadAllForPrint(): {
  title: string;
  markdown: string;
  href: string;
}[] {
  const docs: { title: string; markdown: string; href: string }[] = [];

  for (const c of FOUNDATIONS) {
    const doc = loadFoundation(c.slug)!;
    docs.push({ title: doc.title, markdown: doc.markdown, href: `/foundations/${c.slug}` });
  }

  for (const f of FAMILIES) {
    const overview = loadFamilyOverview(f.id)!;
    docs.push({
      title: overview.title,
      markdown: overview.markdown,
      href: `/patterns/${f.id}`,
    });
    for (const p of f.patterns) {
      const doc = loadPattern(f.id, p.slug)!;
      docs.push({
        title: `${f.title} › ${doc.title}`,
        markdown: doc.markdown,
        href: `/patterns/${f.id}/${p.slug}`,
      });
    }
  }

  for (const key of [
    "recognition",
    "stems",
    "decisionTrees",
    "cheatSheetsIndex",
  ] as const) {
    const doc = loadStaticPage(key);
    docs.push({
      title: doc.title,
      markdown: doc.markdown,
      href: STATIC_PAGES[key].href,
    });
  }

  for (const f of FAMILIES) {
    const sheet = loadCheatSheet(f.id)!;
    docs.push({
      title: sheet.title,
      markdown: sheet.markdown,
      href: `/cheat-sheets/${f.id}`,
    });
  }

  const practiceIdx = loadStaticPage("practiceIndex");
  docs.push({
    title: practiceIdx.title,
    markdown: practiceIdx.markdown,
    href: "/practice",
  });

  for (const f of FAMILIES) {
    const practice = loadPractice(f.id)!;
    docs.push({
      title: practice.title,
      markdown: practice.markdown,
      href: `/practice/${f.id}`,
    });
  }

  for (const key of ["glossary", "questionBank"] as const) {
    const doc = loadStaticPage(key);
    docs.push({
      title: doc.title,
      markdown: doc.markdown,
      href: STATIC_PAGES[key].href,
    });
  }

  return docs;
}

export function allFamilyIds(): string[] {
  return FAMILIES.map((f) => f.id);
}

export function allFoundationSlugs(): string[] {
  return FOUNDATIONS.map((c) => c.slug);
}

export function allPatternParams(): { family: string; pattern: string }[] {
  const params: { family: string; pattern: string }[] = [];
  for (const f of FAMILIES) {
    for (const p of f.patterns) {
      params.push({ family: f.id, pattern: p.slug });
    }
  }
  return params;
}
