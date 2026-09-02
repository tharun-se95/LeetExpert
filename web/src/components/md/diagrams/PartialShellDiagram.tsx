"use client";

import { BrowserMockup } from "@/components/md/diagrams/BrowserMockup";

/**
 * Partial Prerendering's core shape: one page, a static shell served
 * instantly from a prerendered cache, with a dynamic "hole" — dashed
 * border, distinct fill — that streams in per-request content without
 * forcing the whole route into dynamic rendering.
 */
export function PartialShellDiagram() {
  const width = 320;
  const height = 200;
  const x = 40;
  const y = 20;
  const w = 240;
  const h = 160;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[320px]"
      role="img"
      aria-label="A product page split into a static shell — navigation, images, description, served instantly from a prerendered cache — and one dynamic hole, the personalized cart, streamed in per request inside a dashed boundary."
    >
      <BrowserMockup x={x} y={y} width={w} height={h} url="acme.com/product/42">
        <g transform="translate(10, 10)">
          <rect x={0} y={0} width={w - 20} height={16} rx={3} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
          <text x={8} y={11} fontSize={8} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
            nav — static shell
          </text>

          <rect x={0} y={24} width={(w - 20) * 0.55} height={70} rx={3} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
          <text x={8} y={38} fontSize={8} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
            image + description
          </text>
          <text x={8} y={50} fontSize={7.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
            static shell
          </text>

          <rect
            x={(w - 20) * 0.55 + 10}
            y={24}
            width={(w - 20) * 0.45 - 10}
            height={70}
            rx={3}
            fill="var(--family-accent, var(--accent))"
            fillOpacity={0.16}
            stroke="var(--family-accent, var(--accent))"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x={(w - 20) * 0.55 + 18}
            y={44}
            fontSize={8}
            fontWeight={700}
            fill="var(--foreground)"
            fontFamily="var(--font-sans), system-ui"
          >
            cart
          </text>
          <text
            x={(w - 20) * 0.55 + 18}
            y={56}
            fontSize={7.5}
            fill="var(--muted)"
            fontFamily="var(--font-sans), system-ui"
          >
            dynamic hole —
          </text>
          <text
            x={(w - 20) * 0.55 + 18}
            y={66}
            fontSize={7.5}
            fill="var(--muted)"
            fontFamily="var(--font-sans), system-ui"
          >
            per request
          </text>
        </g>
      </BrowserMockup>
    </svg>
  );
}
