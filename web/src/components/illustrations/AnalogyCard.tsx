"use client";

import { motion } from "motion/react";
import { MotifMark } from "@/components/illustrations/MotifMark";
import type { FamilyMotif } from "@/lib/visual/familyTheme";

export function AnalogyCard({
  motif,
  accent,
  title,
  caption,
}: {
  motif: FamilyMotif;
  accent: string;
  title: string;
  caption: string;
}) {
  return (
    <motion.div
      className="flex w-full max-w-[160px] flex-col items-center text-center"
      whileHover={{ rotate: 2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="flex h-[140px] w-[140px] items-center justify-center rounded-2xl border border-border bg-background/70 p-3"
        style={{
          boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 15%, transparent)`,
        }}
      >
        <MotifMark motif={motif} accent={accent} className="h-full w-full" />
      </div>
      <p className="mt-3 text-sm font-semibold tracking-tight">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted">{caption}</p>
    </motion.div>
  );
}
