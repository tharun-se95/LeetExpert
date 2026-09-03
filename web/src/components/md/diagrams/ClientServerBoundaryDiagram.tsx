"use client";

import { Browser, Function as FunctionIcon, HardDrives, Lightning } from "@phosphor-icons/react";

/**
 * The actual mechanism behind `"use client"` / `"use server"`, drawn as a
 * component tree cut by a boundary line — not a comparison of three bullet
 * lists. `Page` (no directive) renders only on the server. Its child
 * `LikeButton` is the exact node where the tree crosses into the browser:
 * marked by a glowing "use client" tag sitting ON the boundary line, never
 * splitting the node itself (nothing is half-server/half-client). A second,
 * dashed edge runs the other way — `likePost`, a `"use server"` *function*
 * called from inside that client code, drawn back on the server side of the
 * line, because a function crossing is a call, not a subtree relocation.
 *
 * Phosphor icon components render their own `<svg>`, which nests validly
 * inside this canvas's `<svg>` (SVG explicitly allows nested viewports) and
 * accepts `x`/`y`/`size`/`color` directly — real iconography instead of
 * only rects, paths, and text, at zero extra dependency cost since
 * `@phosphor-icons/react` already ships with the callout system.
 */
export function ClientServerBoundaryDiagram() {
  const width = 520;
  const height = 340;

  const boundaryX = 258;
  const bandTop = 34;
  const bandBottom = 282;

  // Page (no directive) — server band, top.
  const pageX = 44;
  const pageY = 46;
  const nodeW = 178;
  const nodeH = 60;

  // LikeButton ("use client") — client band, middle. This is the crossover
  // node: it sits entirely inside the client band, never straddling the line.
  const likeX = 292;
  const likeY = 132;

  // likePost ("use server") — back in the server band, bottom. A function,
  // not a subtree, so it's drawn as its own node rather than nested under
  // LikeButton.
  const postX = 44;
  const postY = 226;

  // Solid tree edge Page -> LikeButton, crossing the boundary once.
  const edge1From = { x: pageX + nodeW, y: pageY + nodeH / 2 };
  const edge1To = { x: likeX, y: likeY + nodeH / 2 };
  const crossT = (boundaryX - edge1From.x) / (edge1To.x - edge1From.x);
  const crossY = edge1From.y + crossT * (edge1To.y - edge1From.y);

  // Dashed call edge LikeButton -> likePost, crossing back the other way.
  const edge2From = { x: likeX, y: likeY + nodeH - 10 };
  const edge2To = { x: postX + nodeW, y: postY + 16 };
  const edge2Mid = { x: boundaryX - 12, y: (edge2From.y + edge2To.y) / 2 + 8 };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[520px]"
      role="img"
      aria-label={
        'A component tree rendered on the server. "Page" has no directive and executes only server-side, ' +
        'shipping no code to the browser. Its child "LikeButton" is the exact point the tree crosses a ' +
        'dashed boundary line marked "use client" — shown as a glowing marker sitting on the line itself, ' +
        "not splitting the node, because nothing is half-server/half-client: LikeButton is server-rendered " +
        "once for first paint, then its code ships and hydrates so it runs for real in the browser after that. " +
        'A second, dashed arrow runs the opposite direction back into the server band to "likePost", a function ' +
        'marked "use server" that LikeButton calls from its onClick handler — despite being invoked from ' +
        "browser code, likePost's body always executes back on the server over a network call Next.js generates, " +
        "which is why it is drawn as its own node on the server side rather than nested inside the client subtree."
      }
    >
      <defs>
        <marker id="csb-arrow-muted" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--muted)" />
        </marker>
        <marker id="csb-arrow-insight" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--insight)" />
        </marker>
        <pattern id="csb-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <linearGradient id="csb-fade-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="csb-fade-bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Server / Browser bands, with a faint dot texture for depth without noise */}
      <rect x={16} y={bandTop} width={boundaryX - 16} height={bandBottom - bandTop} rx={14} fill="var(--surface)" />
      <rect x={16} y={bandTop} width={boundaryX - 16} height={bandBottom - bandTop} rx={14} fill="url(#csb-dots)" fillOpacity={0.5} />
      <rect
        x={boundaryX}
        y={bandTop}
        width={width - 16 - boundaryX}
        height={bandBottom - bandTop}
        rx={14}
        fill="var(--accent)"
        fillOpacity={0.05}
      />
      <rect x={boundaryX} y={bandTop} width={width - 16 - boundaryX} height={bandBottom - bandTop} rx={14} fill="url(#csb-dots)" fillOpacity={0.5} />

      <HardDrives x={(16 + boundaryX) / 2 - 46} y={bandTop - 21} size={13} color="var(--muted)" />
      <text x={(16 + boundaryX) / 2 + 4} y={bandTop - 12} fontSize={10} fontWeight={600} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui" letterSpacing={1.2}>
        SERVER
      </text>
      <Browser x={(boundaryX + width - 16) / 2 - 42} y={bandTop - 21} size={13} color="var(--muted)" />
      <text x={(boundaryX + width - 16) / 2 + 8} y={bandTop - 12} fontSize={10} fontWeight={600} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui" letterSpacing={1.2}>
        BROWSER
      </text>

      {/* Boundary line, faded at both ends rather than hard-cut */}
      <line x1={boundaryX} y1={bandTop} x2={boundaryX} y2={bandTop + 28} stroke="url(#csb-fade-top)" strokeWidth={1.5} strokeDasharray="1 4" strokeLinecap="round" />
      <line x1={boundaryX} y1={bandTop + 28} x2={boundaryX} y2={bandBottom - 28} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="1 4" strokeLinecap="round" />
      <line x1={boundaryX} y1={bandBottom - 28} x2={boundaryX} y2={bandBottom} stroke="url(#csb-fade-bottom)" strokeWidth={1.5} strokeDasharray="1 4" strokeLinecap="round" />

      {/* Solid tree edge: Page -> LikeButton, crossing once */}
      <path
        d={`M ${edge1From.x} ${edge1From.y} L ${edge1To.x - 6} ${edge1To.y}`}
        stroke="var(--muted)"
        strokeWidth={1.25}
        strokeLinecap="round"
        fill="none"
        markerEnd="url(#csb-arrow-muted)"
      />

      {/* Glowing crossover marker sitting ON the boundary line — the node
          itself never straddles it, only this marker does. */}
      <circle cx={boundaryX} cy={crossY} r={12} fill="var(--accent)" fillOpacity={0.14} />
      <circle cx={boundaryX} cy={crossY} r={7} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1.25} />
      <Lightning x={boundaryX - 4.5} y={crossY - 4.5} size={9} color="var(--accent)" weight="fill" />
      <rect x={boundaryX - 38} y={crossY - 32} width={76} height={18} rx={9} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1} />
      <text x={boundaryX} y={crossY - 20} fontSize={9} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-mono), monospace" letterSpacing={0.2}>
        use client
      </text>

      {/* Dashed call edge: LikeButton -> likePost, crossing back */}
      <path
        d={`M ${edge2From.x} ${edge2From.y} Q ${edge2Mid.x} ${edge2Mid.y} ${edge2To.x + 6} ${edge2To.y}`}
        stroke="var(--insight)"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeDasharray="1 4"
        fill="none"
        markerEnd="url(#csb-arrow-insight)"
      />
      <rect x={boundaryX - 4} y={edge2Mid.y - 20} width={128} height={15} rx={7.5} fill="var(--elevated)" stroke="var(--insight)" strokeOpacity={0.4} strokeWidth={1} />
      <text x={boundaryX + 60} y={edge2Mid.y - 9.5} fontSize={8.5} fontWeight={600} fill="var(--insight)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        onClick() → network call
      </text>

      {/* Page node */}
      <rect x={pageX} y={pageY} width={nodeW} height={nodeH} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <text x={pageX + nodeW / 2} y={pageY + 21} fontSize={13} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        Page
      </text>
      <text x={pageX + nodeW / 2} y={pageY + 37} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        no directive
      </text>
      <text x={pageX + nodeW / 2} y={pageY + 50} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        renders only on the server
      </text>

      {/* LikeButton node — the crossover component */}
      <rect x={likeX} y={likeY} width={nodeW} height={nodeH} rx={12} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1.5} />
      <text x={likeX + nodeW / 2} y={likeY + 21} fontSize={13} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        LikeButton
      </text>
      <text x={likeX + nodeW / 2} y={likeY + 37} fontSize={9.5} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        &quot;use client&quot;
      </text>
      <text x={likeX + nodeW / 2} y={likeY + 50} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        SSR once, then hydrates
      </text>

      {/* likePost node — a function, drawn on the server side */}
      <rect x={postX} y={postY} width={nodeW} height={nodeH} rx={12} fill="var(--elevated)" stroke="var(--insight)" strokeWidth={1.5} strokeDasharray="4 3" />
      <FunctionIcon x={postX + nodeW / 2 - 44} y={postY + 12} size={13} color="var(--insight)" />
      <text x={postX + nodeW / 2 + 6} y={postY + 21} fontSize={13} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        likePost()
      </text>
      <text x={postX + nodeW / 2} y={postY + 37} fontSize={9.5} fontWeight={600} fill="var(--insight)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        &quot;use server&quot;
      </text>
      <text x={postX + nodeW / 2} y={postY + 50} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        always runs on the server
      </text>

      {/* Caption legend */}
      <text x={width / 2} y={height - 26} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        Solid = the tree edge that crosses into the browser.
      </text>
      <text x={width / 2} y={height - 12} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        Dashed = a &quot;use server&quot; call that always runs on the server.
      </text>
    </svg>
  );
}
