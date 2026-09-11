import type { MetadataRoute } from "next";

/**
 * Next's file convention: this compiles to /manifest.webmanifest and wires
 * the <link rel="manifest"> tag automatically — no manual <link> needed in
 * layout.tsx.
 *
 * Colors match the live steel palette (globals.css --press-blue /
 * --press-paper), not the plate's own #1E293B fill in isolation: theme_color
 * is what Android tints the OS chrome (status bar, task switcher card) with
 * when the site is installed, and background_color is the splash-screen
 * fill shown before the page's own CSS loads — using the site's actual
 * light-mode paper avoids a color flash between splash and first paint.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "leetExpert — Interactive Data Structures & Algorithms",
    short_name: "leetExpert",
    description:
      "Interactive courses with live sandboxes, visualizations, and solve-first problems.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f4f9",
    theme_color: "#1e293b",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
