"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Soft fade/rise on route change — disabled under prefers-reduced-motion. */
export function PageEnter({
  children,
  fill = false,
}: {
  children: React.ReactNode;
  /** Stretch to the main pane (IDE problem pages). Skip the rise so height stays exact. */
  fill?: boolean;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return fill ? <div className="h-full">{children}</div> : <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      className={cn(fill && "h-full")}
      initial={{ opacity: 0, y: fill ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
