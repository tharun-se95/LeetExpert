import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

/**
 * Three faces, three jobs.
 *
 * Display carries the poster headings of the Riso system; body is a humanist
 * face chosen for long technical reading; mono serves both code blocks and
 * the interface labels that borrow the code voice.
 *
 * Bricolage and JetBrains are variable, so each ships one file across all
 * weights. IBM Plex Sans is not, so its weights are pinned explicitly rather
 * than pulling the whole family.
 */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-face",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DSA Course",
    template: "%s · DSA Course",
  },
  description:
    "A complete data structures & algorithms course — every structure from first principles, implemented from scratch, drilled with solve-first problems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
