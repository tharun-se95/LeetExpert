#!/usr/bin/env python3
"""Gate A — Part 2 metrics: word counts, 10 sections, 3E/3M/2H classic lists."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FAMILIES = ROOT / "part-2-pattern-families"

REQUIRED = [
    "Purpose",
    "Recognition Clues",
    "Mental Model",
    "Visualization",
    "Generic Template",
    "Complexity",
    "Common Mistakes",
    "Classic Interview Questions",
    "Engineering Connections",
    "Summary",
]

SKIP_TITLES = re.compile(r"overview|status|note", re.I)
PLACEHOLDER = re.compile(r"Pattern section goes here|Status:\s*not yet", re.I)


def pattern_sections(text: str) -> list[tuple[str, str]]:
    matches = list(re.finditer(r"(?m)^## (.+)$", text))
    out = []
    for i, m in enumerate(matches):
        title = m.group(1).strip()
        if SKIP_TITLES.search(title):
            continue
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        out.append((title, text[start:end]))
    return out


def word_count(section: str) -> int:
    prose = re.sub(r"```.*?```", "", section, flags=re.S)
    return len(prose.split())


def has_ten_sections(section: str) -> list[str]:
    missing = []
    for name in REQUIRED:
        if not re.search(rf"(?m)^### {re.escape(name)}\s*$", section):
            missing.append(name)
    return missing


def classic_counts(section: str) -> tuple[int, int, int] | None:
    m = re.search(
        r"### Classic Interview Questions\n(.*?)(?=\n### |\n## |\Z)",
        section,
        flags=re.S,
    )
    if not m:
        return None
    block = m.group(1)

    def bullets(label: str) -> int:
        line = re.search(rf"\*\*{label}:\*\*(.+)", block)
        if not line:
            return -1
        parts = [p.strip() for p in re.split(r"·|\|", line.group(1)) if p.strip()]
        # drop footnote italics lines that aren't titles
        parts = [p for p in parts if not p.startswith("_(")]
        return len(parts)

    return bullets("Easy"), bullets("Medium"), bullets("Hard")


def main() -> int:
    failures = []
    rows = []
    for path in sorted(FAMILIES.glob("family-*.md")):
        text = path.read_text(encoding="utf-8")
        if PLACEHOLDER.search(text):
            failures.append(f"{path.name}: placeholder/status stub still present")
        for title, section in pattern_sections(text):
            wc = word_count(section)
            miss = has_ten_sections(section)
            classic = classic_counts(section)
            ok_words = wc >= 800
            ok_sec = not miss
            ok_classic = classic == (3, 3, 2)
            status = "OK" if ok_words and ok_sec and ok_classic else "FAIL"
            rows.append((path.name, title, wc, classic, miss, status))
            if not ok_words:
                failures.append(f"{path.name} / {title}: {wc} words (<800)")
            if miss:
                failures.append(f"{path.name} / {title}: missing {miss}")
            if classic is None:
                failures.append(f"{path.name} / {title}: no Classic Interview Questions")
            elif classic != (3, 3, 2):
                failures.append(
                    f"{path.name} / {title}: classic counts {classic} (want 3,3,2)"
                )

    print(f"{'file':30} {'pattern':35} {'words':>6} {'E/M/H':>10} status")
    print("-" * 95)
    for f, t, wc, classic, miss, status in rows:
        emh = "n/a" if classic is None else f"{classic[0]}/{classic[1]}/{classic[2]}"
        print(f"{f:30} {t:35} {wc:6} {emh:>10} {status}")

    print()
    if failures:
        print(f"GATE A FAIL — {len(failures)} issue(s):")
        for f in failures:
            print(" -", f)
        return 1
    print(f"GATE A PASS — {len(rows)} patterns OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
