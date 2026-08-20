"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { IconContext } from "@phosphor-icons/react";

/**
 * Icons default to `bold` rather than Phosphor's `regular`.
 *
 * The press system is a printed idiom, and a hairline icon reads as rendered
 * UI rather than ink. Setting the weight once here means no component has to
 * remember it — and it keeps the whole set consistent, which is the entire
 * reason to use an icon family instead of assorted glyphs.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <IconContext.Provider value={{ weight: "bold" }}>
        {children}
      </IconContext.Provider>
    </NextThemesProvider>
  );
}
