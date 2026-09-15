import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Shared renderer for opengraph-image.tsx and twitter-image.tsx (both need
 * the identical 1200x630 card — Twitter doesn't fall back to og:image on its
 * own, so we render both routes rather than only one).
 *
 * Route B from the leetexpert-social-artist playbook: the backdrop is
 * auto-flow (Google Flow) generated atmosphere, the wordmark/tagline are
 * real composited typography — never ask the generator for text, it
 * produces malformed glyphs. Statically optimized (no request-time data),
 * so this runs once at build and is cached like any other static asset.
 */
export async function renderOgImage() {
  const backdrop = await readFile(
    join(process.cwd(), "src/assets/brand/og-backdrop.png"),
  );
  const backdropSrc = `data:image/png;base64,${backdrop.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og's
            Satori renderer requires a plain <img>, not next/image. */}
        <img
          src={backdropSrc}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", inset: 0, objectFit: "cover" }}
        />
        {/* Steel scrim so white type stays AA-legible over whatever the
            generated backdrop's brightest region happens to be. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(115deg, rgba(22,32,46,0.92) 0%, rgba(22,32,46,0.72) 42%, rgba(22,32,46,0.30) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 88px",
            height: "100%",
            maxWidth: 760,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {/* The lamp in its dark-theme colours, straight on the steel
                scrim (#5be07a vs the scrim colour #16202e is 9.68:1).
                Mirrors the dark press-lamp tokens; checked by
                tests/brandLamp.test.tsx. */}
            <svg width="56" height="56" viewBox="0 0 64 64">
              <defs>
                <radialGradient id="halo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#5be07a" stopOpacity={0.85} />
                  <stop offset="33%" stopColor="#5be07a" stopOpacity={0.42} />
                  <stop offset="69%" stopColor="#5be07a" stopOpacity={0.11} />
                  <stop offset="100%" stopColor="#5be07a" stopOpacity={0} />
                </radialGradient>
                <radialGradient id="core" cx="38%" cy="34%" r="70%">
                  <stop offset="0%" stopColor="#cfffd8" />
                  <stop offset="45%" stopColor="#5be07a" />
                  <stop offset="100%" stopColor="#2fb455" />
                </radialGradient>
              </defs>
              <circle cx="32" cy="32" r="30" fill="url(#halo)" />
              <circle cx="32" cy="32" r="15" fill="url(#core)" />
            </svg>
            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 600,
                color: "#FFFFFF",
                letterSpacing: -0.5,
              }}
            >
              leetExpert
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 58,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.12,
              letterSpacing: -1,
            }}
          >
            Data Structures &amp; Algorithms, taught interactively
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 26,
              color: "#CBD5E1",
              lineHeight: 1.4,
            }}
          >
            Live sandboxes, real visualizations, solve-first problems.
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
