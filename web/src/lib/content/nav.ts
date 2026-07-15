import { FAMILIES, FOUNDATIONS, STATIC_PAGES, type FamilyMeta } from "./manifest";

export interface NavItem {
  title: string;
  href: string;
  id: string;
  children?: NavItem[];
}

export interface FlatNavEntry {
  title: string;
  href: string;
  id: string;
  section: string;
}

export function buildSidebarNav(): NavItem[] {
  return [
    {
      id: "home",
      title: "Overview",
      href: "/",
    },
    {
      id: "foundations",
      title: "Part 1 — Foundations",
      href: "/foundations/solving-problems",
      children: FOUNDATIONS.map((c) => ({
        id: `foundations-${c.slug}`,
        title: c.shortTitle,
        href: `/foundations/${c.slug}`,
      })),
    },
    {
      id: "patterns",
      title: "Part 2 — Pattern Families",
      href: "/patterns/linear-traversal",
      children: FAMILIES.map((f) => ({
        id: `family-${f.id}`,
        title: `${f.number}. ${f.title}`,
        href: `/patterns/${f.id}`,
        children: f.patterns.map((p) => ({
          id: `pattern-${f.id}-${p.slug}`,
          title: p.title,
          href: `/patterns/${f.id}/${p.slug}`,
        })),
      })),
    },
    {
      id: "recognition",
      title: "Part 3 — Recognition",
      href: STATIC_PAGES.recognition.href,
      children: [
        {
          id: "recognition-guide",
          title: "Guide + Walkthrough",
          href: STATIC_PAGES.recognition.href,
        },
        {
          id: "recognition-stems",
          title: "Practice Stems",
          href: STATIC_PAGES.stems.href,
        },
        {
          id: "decision-trees",
          title: "Decision Trees",
          href: STATIC_PAGES.decisionTrees.href,
        },
      ],
    },
    {
      id: "cheat-sheets",
      title: "Part 4 — Cheat Sheets",
      href: "/cheat-sheets",
      children: FAMILIES.map((f) => ({
        id: `cheat-${f.id}`,
        title: `${f.number}. ${f.shortTitle}`,
        href: `/cheat-sheets/${f.id}`,
      })),
    },
    {
      id: "practice",
      title: "Part 5 — Practice",
      href: "/practice",
      children: FAMILIES.map((f) => ({
        id: `practice-${f.id}`,
        title: `${f.number}. ${f.shortTitle}`,
        href: `/practice/${f.id}`,
      })),
    },
    {
      id: "reference",
      title: "Reference",
      href: STATIC_PAGES.glossary.href,
      children: [
        {
          id: "glossary",
          title: "Glossary",
          href: STATIC_PAGES.glossary.href,
        },
        {
          id: "question-bank",
          title: "Question Bank",
          href: STATIC_PAGES.questionBank.href,
        },
      ],
    },
  ];
}

/** Reading order for prev/next chapter links. */
export function buildFlatNav(): FlatNavEntry[] {
  const entries: FlatNavEntry[] = [];

  for (const c of FOUNDATIONS) {
    entries.push({
      id: `foundations-${c.slug}`,
      title: c.title,
      href: `/foundations/${c.slug}`,
      section: "Foundations",
    });
  }

  for (const f of FAMILIES) {
    entries.push({
      id: `family-${f.id}`,
      title: `Family ${f.number} — ${f.title}`,
      href: `/patterns/${f.id}`,
      section: "Patterns",
    });
    for (const p of f.patterns) {
      entries.push({
        id: `pattern-${f.id}-${p.slug}`,
        title: p.title,
        href: `/patterns/${f.id}/${p.slug}`,
        section: `Family ${f.number}`,
      });
    }
  }

  entries.push(
    {
      id: "recognition-guide",
      title: STATIC_PAGES.recognition.title,
      href: STATIC_PAGES.recognition.href,
      section: "Recognition",
    },
    {
      id: "recognition-stems",
      title: STATIC_PAGES.stems.title,
      href: STATIC_PAGES.stems.href,
      section: "Recognition",
    },
    {
      id: "decision-trees",
      title: STATIC_PAGES.decisionTrees.title,
      href: STATIC_PAGES.decisionTrees.href,
      section: "Recognition",
    },
  );

  entries.push({
    id: "cheat-index",
    title: "Cheat Sheets",
    href: "/cheat-sheets",
    section: "Cheat Sheets",
  });
  for (const f of FAMILIES) {
    entries.push({
      id: `cheat-${f.id}`,
      title: `${f.title} Cheat Sheet`,
      href: `/cheat-sheets/${f.id}`,
      section: "Cheat Sheets",
    });
  }

  entries.push({
    id: "practice-index",
    title: "Practice Roadmap",
    href: "/practice",
    section: "Practice",
  });
  for (const f of FAMILIES) {
    entries.push({
      id: `practice-${f.id}`,
      title: `${f.title} Practice`,
      href: `/practice/${f.id}`,
      section: "Practice",
    });
  }

  entries.push(
    {
      id: "glossary",
      title: STATIC_PAGES.glossary.title,
      href: STATIC_PAGES.glossary.href,
      section: "Reference",
    },
    {
      id: "question-bank",
      title: STATIC_PAGES.questionBank.title,
      href: STATIC_PAGES.questionBank.href,
      section: "Reference",
    },
  );

  return entries;
}

export function getPrevNext(pathname: string): {
  prev: FlatNavEntry | null;
  next: FlatNavEntry | null;
} {
  const flat = buildFlatNav();
  const idx = flat.findIndex((e) => e.href === pathname);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}

export function familyHref(family: FamilyMeta): string {
  return `/patterns/${family.id}`;
}
