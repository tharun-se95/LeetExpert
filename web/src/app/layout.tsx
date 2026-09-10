import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import { SITE_ORIGIN } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationLd, websiteLd } from "@/lib/seo/jsonLd";
import "./globals.css";

/**
 * Three faces, three jobs (Linear/educational sheet).
 *
 * Display (Sora) carries logo + headings; Inter is the long-read body;
 * JetBrains Mono serves code blocks and mono UI labels.
 */
const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-face",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves relative URLs in metadata (canonical links, OG/Twitter images)
  // against the real production origin instead of leaving them host-
  // relative, which is what Next warns about and what search engines and
  // social crawlers need to resolve them correctly off-site.
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "leetExpert",
    template: "%s · leetExpert",
  },
  description:
    "Interactive courses with live sandboxes, visualizations, and solve-first problems. Start with Data Structures & Algorithms.",
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
        {/* Site-wide entity graph. Both carry stable @ids so the per-page
            Course and LearningResource nodes can reference them instead of
            re-declaring a second, unlinked publisher. */}
        <JsonLd data={organizationLd()} />
        <JsonLd data={websiteLd()} />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
