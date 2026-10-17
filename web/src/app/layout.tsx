import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import { LAMP_BOOT_SCRIPT } from "@/components/brand/lampBoot";
import { ACCOUNT_HINT_SCRIPT } from "@/lib/auth/accountHint";
import { isAuthConfigured } from "@/lib/auth/env";
import { CODE_LANG_CSS, CODE_LANG_INIT_SCRIPT } from "@/lib/codeLangScript";
import { SITE_ORIGIN } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  courseLd,
  educationalCredentialLd,
  organizationLd,
  websiteLd,
} from "@/lib/seo/jsonLd";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

/**
 * Three faces, three jobs.
 *
 * Space Mono (display) carries the wordmark and every heading. Space Grotesk
 * — its proportional sibling, same letterforms — is the body and UI face, so
 * headings and prose read as one system. JetBrains Mono stays on code, which
 * keeps a monospaced heading from ever being mistaken for a code block.
 *
 * Space Mono ships only 400 and 700: display call sites must use one of those
 * or the browser synthesises a fake bold (guarded in design-tokens.test.ts).
 * Space Grotesk has no italic at all, so emphasis is weight, not slant
 * (globals.css `@layer base`).
 */
const display = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Space_Grotesk({
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
  // og:image / twitter:image themselves come from the opengraph-image.tsx /
  // twitter-image.tsx file convention (auto-wires og:image:width/height/type)
  // — this block supplies the surrounding card fields those files don't.
  openGraph: {
    type: "website",
    url: SITE_ORIGIN,
    siteName: "leetExpert",
    title: "leetExpert",
    description:
      "Interactive courses with live sandboxes, visualizations, and solve-first problems. Start with Data Structures & Algorithms.",
  },
  twitter: {
    card: "summary_large_image",
    title: "leetExpert",
    description:
      "Interactive courses with live sandboxes, visualizations, and solve-first problems. Start with Data Structures & Algorithms.",
  },
};

// Split from `metadata` per Next's viewport API (themeColor/colorScheme moved
// out of Metadata in App Router) — tints Android's installed-PWA status bar
// and task-switcher card with the brand's steel ink.
export const viewport: Viewport = {
  themeColor: "#1e293b",
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
        {/* Must stay the first thing in <body>: it has to run before the
            header markup is parsed. See lampBoot.ts. <html> already has
            suppressHydrationWarning for the attribute it may add. */}
        <script dangerouslySetInnerHTML={{ __html: LAMP_BOOT_SCRIPT }} />
        {/* Sets <html data-code-lang> from storage while the HTML still
            parses, and the generated rules after it resolve every code block
            below to the learner's language. After the lamp's boot script,
            which must stay first. */}
        <script
          id="code-lang-init"
          dangerouslySetInnerHTML={{ __html: CODE_LANG_INIT_SCRIPT }}
        />
        <style id="code-lang-rules" dangerouslySetInnerHTML={{ __html: CODE_LANG_CSS }} />
        {/* Sets <html data-account> from this device's last visit while the
            HTML parses, so the header paints the avatar or Sign in at once
            (lib/auth/accountHint.ts). Only where sign-in exists. */}
        {isAuthConfigured() ? <script id="account-hint" dangerouslySetInnerHTML={{ __html: ACCOUNT_HINT_SCRIPT }} /> : null}
        {/* Site-wide entity graph. Stable @ids allow search engine crawlers
            to unify Organization, WebSite, Course, and Credential entities into
            a single rich knowledge graph. */}
        <JsonLd data={organizationLd()} />
        <JsonLd data={websiteLd()} />
        <JsonLd data={courseLd()} />
        <JsonLd data={educationalCredentialLd()} />
        <ThemeProvider>
          <AppShell authEnabled={isAuthConfigured()}>{children}</AppShell>
        </ThemeProvider>
        {/*
         * Both are cookieless and collect no personal data, so they need no
         * consent gate — which is why they were chosen over GA4 (see
         * seo/SEO_CHANGELOG.md). ~1KB each, and the /next builds hook the App
         * Router so client-side navigations are counted too.
         *
         * SpeedInsights is the load-bearing one for SEO: Core Web Vitals are
         * a ranking signal, and Search Console's CWV report stays empty until
         * the site clears CrUX's traffic threshold. This reports field data
         * from the first visitor — which matters on a site that ships Pyodide,
         * CodeMirror and Mermaid.
         */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
