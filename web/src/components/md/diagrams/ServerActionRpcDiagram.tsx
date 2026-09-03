"use client";

import { Browser, Cube, Database, Function as FunctionIcon, Globe, HardDrives } from "@phosphor-icons/react";

export interface ServerActionRpcDiagramProps {
  /** The exported `"use server"` function the lesson wires to a form. */
  actionName?: string;
  /** Route the form lives on — the path the generated endpoint is POSTed to. */
  endpointPath?: string;
  /** The opaque build-time action id. This is the *only* thing the client bundle holds. */
  actionId?: string;
  /** The mutation line shown executing inside the server-side function body. */
  mutationLine?: string;
  /** Two closing lines under the canvas. */
  caption?: [string, string];
}

/* Per-character advance estimates for each type role. The viewBox is derived
   from the actual strings rendered (which are prop-driven), never from a
   guessed constant — a longer `actionName` or `endpointPath` widens the
   canvas instead of overflowing it. Deliberately a touch generous so the
   widest realistic label still clears its node's padding. */
const CH_TITLE = 7.0; // 13px sans, weight 600
const CH_MONO = 6.05; // 10px mono
const CH_CAPTION = 5.0; // 9.5px sans
const CH_PILL = 4.85; // 9px sans inside a pill
const CH_CARD = 5.45; // 9px mono inside the request card
const CH_HEADER = 7.2; // 10px sans 600 with 1.2 letter-spacing

/* Layout constants. Horizontal sizes are computed below; these are the fixed
   vertical rhythm and the paddings the width formula depends on. */
const EDGE = 16; // canvas edge -> band edge
const NODE_PAD = 14; // node edge -> text
const ICON_GAP = 20; // icon column width inside a node
const BAND_TOP = 56;
const HEADER_BASE = 46;
const SEC_PILL_Y = 60;
const ROW1_Y = 96;
const ROW1_H = 76;
const CARD_Y = 102;
const CARD_H = 64;
const ROW2_Y = 196;
const ROW2_H = 88;
const RETURN_EXIT_Y = 250; // leaves the action body's left edge
/* How far past the boundary the return leg drops before turning back. This
   trades directly against canvas width: the further right the leg sits, the
   longer the horizontal run home, and the less the gutter has to widen to fit
   the return pill on that run (see `returnRunNeed` below). */
const RETURN_LEG_DX = 60;
/* Marker units default to strokeWidth, so the arrowhead landing on L3 is
   `markerWidth 6` x the path's 1.25 stroke. The return pill has to clear it. */
const RETURN_ARROW_LEN = 6 * 1.25;
const RETURN_DASH_GAP = 8; // visible dash either side of the return pill
const ROW3_Y = 308;
const ROW3_H = 52;
const BAND_BOTTOM = 378;
const HEIGHT = 424;

const T_BROWSER = "BROWSER";
const T_NETWORK = "NETWORK";
const T_SERVER = "SERVER";

const L1_TITLE = "Client-rendered form";
const L1_CAP = "looks like a direct function call";
const L2_TITLE = "In the client bundle";
const L2_CAP_A = "an opaque id, not the body";
const L2_CAP_B = "no db import, no secrets";
const R1_TITLE = "Generated endpoint";
const R2_CAP_A = "the body executes only here";
const R2_CAP_B = "full access to server-only code";
const R3_TITLE = "Database + env secrets";
const R3_CAP = "server-only imports, never bundled";
const L3_TITLE = "Re-rendered UI";
const L3_CAP = "server sends a fresh RSC payload";
const SEC_PILL = "reachable by any HTTP client";
const WIRE_PILL = "the real HTTP request";
const INVOKE_PILL = "then invokes";
const WRITE_PILL = "mutation";
const RETURN_PILL = "revalidate → fresh UI";
const CARD_BODY = "body: FormData(title)";

const DEFAULT_CAPTION: [string, string] = [
  "The browser never holds the function body — only the id that names it, so the POST is the only way in.",
  "Dashed red: that endpoint is public. Anything able to send this request reaches it, not just your form.",
];

/**
 * Why `<form action={createPost}>` is not a function call.
 *
 * The lesson's claim is architectural, and a flat step list ("form submits →
 * POST → function runs → revalidate") cannot carry it, because a step list has
 * no sides: it never shows that steps 1 and 2 happen in the browser with only
 * a *reference* in hand, while steps 3 and 4 happen on a machine the browser
 * cannot reach except through that one POST.
 *
 * So the canvas is split into three vertical zones — browser, network, server —
 * and the same six-character action id is threaded through all three in
 * `var(--mark)`: it appears as the whole of what the JS bundle ships
 * (`createPost = ref("7f3a2c")`), again as the `Next-Action` header inside the
 * request card sitting literally on the wire, and a third time as what the
 * generated endpoint was built to answer to. Following that one string is the
 * proof: the implementation is only ever on the right of the boundary.
 *
 * The return trip is routed deliberately, not drawn as a straight line back:
 * it leaves the *action body* (not the database), drops down the network gutter,
 * and lands on a separate browser-side box for the re-rendered UI. A straight
 * line back into the bundle node would have said the wrong thing — revalidation
 * updates what is on screen, it does not send the client any more of the action.
 *
 * The dashed red stub into the endpoint is the lesson's security framing drawn
 * as geometry rather than asserted as prose — the arrow arrives from outside
 * the browser column entirely, because the endpoint's reachability has nothing
 * to do with your form.
 */
export function ServerActionRpcDiagram({
  actionName = "createPost",
  endpointPath = "/new-post",
  actionId = "7f3a2c",
  mutationLine = "await db.posts.create(…)",
  caption = DEFAULT_CAPTION,
}: ServerActionRpcDiagramProps = {}) {
  const l1Mono = `<form action={${actionName}}>`;
  const l2Mono = `${actionName} = ref("${actionId}")`;
  const r1Mono = `POST ${endpointPath}`;
  const r1CapHead = "id ";
  const r1CapTail = " · created at build time";
  const r2Title = `${actionName}(formData)`;
  const cardPost = `POST ${endpointPath}`;
  const cardAction = `Next-Action: ${actionId}`;

  const title = (s: string, icon: boolean) =>
    NODE_PAD + (icon ? ICON_GAP : 0) + s.length * CH_TITLE;
  const mono = (s: string) => NODE_PAD + s.length * CH_MONO;
  const cap = (s: string) => NODE_PAD + s.length * CH_CAPTION;

  // Node width = the longest line any node actually renders, plus padding on
  // both sides. One width for both columns keeps the boundary symmetric.
  const nodeW =
    Math.max(
      title(L1_TITLE, false),
      mono(l1Mono),
      cap(L1_CAP),
      title(L2_TITLE, true),
      mono(l2Mono),
      cap(L2_CAP_A),
      cap(L2_CAP_B),
      title(R1_TITLE, false),
      mono(r1Mono),
      cap(r1CapHead + actionId + r1CapTail),
      title(r2Title, true),
      mono(mutationLine),
      cap(R2_CAP_A),
      cap(R2_CAP_B),
      title(R3_TITLE, true),
      cap(R3_CAP),
      title(L3_TITLE, false),
      cap(L3_CAP),
    ) + NODE_PAD;

  const secPillW = SEC_PILL.length * CH_PILL + 20;
  // The "reachable by any HTTP client" pill is right-aligned in the server
  // band with its globe tucked in beside it; both must still clear the band's
  // left edge, so a long pill can widen the band on its own.
  const bandW = Math.max(nodeW + 2 * EDGE, secPillW + 44);

  const cardW = Math.max(cardPost.length, cardAction.length, CARD_BODY.length) * CH_CARD + 2 * NODE_PAD;
  const wirePillW = WIRE_PILL.length * CH_PILL + 20;
  const returnPillW = RETURN_PILL.length * CH_PILL + 20;

  // The wire pill and the request card sit centred on the boundary, so the
  // gutter must hold them outright. The return pill does not: it rides the
  // horizontal run back into the browser, which is only *half* the gutter plus
  // the left band's own edge margin. Sizing the gutter to `returnPillW` the way
  // the boundary-centred items are sized leaves the run too short, and the
  // pill's opaque fill then paints over the arrowhead landing on L3 — so the
  // run states its own requirement and the gutter is widened to meet it.
  const returnRunBase = (bandW - nodeW) / 2 + RETURN_LEG_DX - 10; // run = gutterW / 2 + this
  const returnRunNeed = returnPillW + RETURN_ARROW_LEN + 2 * RETURN_DASH_GAP;
  let gutterW = Math.max(cardW, wirePillW, 2 * (returnRunNeed - returnRunBase) - 44) + 44;

  // Captions run the full width of the canvas; if either is longer than the
  // three zones combined, the surplus is absorbed by the network gutter rather
  // than clipping off the right edge.
  const captionW = Math.max(...caption.map((c) => c.length * CH_CAPTION)) + 2 * EDGE;
  const zonesW = 2 * EDGE + 2 * bandW + gutterW;
  if (captionW > zonesW) gutterW += captionW - zonesW;

  const width = 2 * EDGE + 2 * bandW + gutterW;

  const lBandX = EDGE;
  const gutterX = lBandX + bandW;
  const rBandX = gutterX + gutterW;
  const boundaryX = gutterX + gutterW / 2;

  const lNodeX = lBandX + (bandW - nodeW) / 2;
  const rNodeX = rBandX + (bandW - nodeW) / 2;
  const lNodeR = lNodeX + nodeW;

  const cardX = boundaryX - cardW / 2;
  const rowMid = ROW1_Y + ROW1_H / 2;

  const vArrowX = rNodeX + 32;
  const pillX = rNodeX + 48;

  const secPillX = rBandX + bandW - 12 - secPillW;
  const secArrowX = secPillX + 16;

  // Return leg: out of the action body, down the network gutter, back into the
  // browser at the row where the fresh UI lands — routed around the bundle node
  // rather than through it.
  const returnLegX = boundaryX + RETURN_LEG_DX;
  const returnY = ROW3_Y + 26;
  const returnPath =
    `M ${rNodeX} ${RETURN_EXIT_Y} L ${returnLegX + 6} ${RETURN_EXIT_Y} ` +
    `Q ${returnLegX} ${RETURN_EXIT_Y} ${returnLegX} ${RETURN_EXIT_Y + 6} ` +
    `L ${returnLegX} ${returnY - 6} Q ${returnLegX} ${returnY} ${returnLegX - 6} ${returnY} ` +
    `L ${lNodeR + 4} ${returnY}`;
  // Centred on the run's *usable* span — the arrowhead's own length is excluded
  // at the left end, so the visible dash is equal either side of the pill.
  const returnPillCX = (lNodeR + 4 + RETURN_ARROW_LEN + (returnLegX - 6)) / 2;

  const header = (label: string, centerX: number, withIcon: boolean) => {
    const w = label.length * CH_HEADER + (withIcon ? 18 : 0);
    return { iconX: centerX - w / 2, textX: centerX - w / 2 + (withIcon ? 18 : 0) };
  };
  const hBrowser = header(T_BROWSER, lBandX + bandW / 2, true);
  const hServer = header(T_SERVER, rBandX + bandW / 2, true);
  const hNetwork = header(T_NETWORK, boundaryX, false);

  return (
    <svg
      viewBox={`0 0 ${width} ${HEIGHT}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        `A Server Action drawn across three zones — browser, network, server — to show that ${actionName} is an HTTP ` +
        "endpoint rather than a local function call. In the browser zone, the rendered form declares " +
        `action={${actionName}}, which reads like a direct call; directly beneath it, the JavaScript bundle is shown ` +
        `holding only a reference, ${actionName} equals ref of the id ${actionId} — an opaque id, no function body, ` +
        "no database import and no secrets. Submitting does not call anything locally: it sends a real HTTP request, " +
        `drawn as a card sitting on the boundary line in the network zone, carrying POST ${endpointPath}, a ` +
        `Next-Action header set to ${actionId}, and the serialized FormData. That request arrives at the server zone ` +
        `at a generated endpoint built at compile time for id ${actionId}, which then invokes the real body of ` +
        `${actionName}, where ${mutationLine} runs with full access to the database and environment secrets that were ` +
        "never shipped to the browser. Only after that does a dashed return arrow leave the action body, run back down " +
        "the network gutter, cross the boundary the other way, and land on a third browser-side box — the re-rendered " +
        "UI, which receives a fresh payload rather than any executable copy of the action. A separate dashed red arrow " +
        "drops into the generated endpoint from above, deliberately not from the browser column, marking that the same " +
        "endpoint is reachable by any HTTP client able to construct this request, not only by your own form."
      }
    >
      <defs>
        <marker id="sar-arrow-accent" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--accent)" />
        </marker>
        <marker id="sar-arrow-muted" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--muted)" />
        </marker>
        <marker id="sar-arrow-insight" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--insight)" />
        </marker>
        <marker id="sar-arrow-bad" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--bad)" />
        </marker>
        <pattern id="sar-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <linearGradient id="sar-fade-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="sar-fade-bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Zones. The gutter between them is deliberately unfilled: it is the
          network, not a place where code lives. */}
      <rect x={lBandX} y={BAND_TOP} width={bandW} height={BAND_BOTTOM - BAND_TOP} rx={14} fill="var(--accent)" fillOpacity={0.05} />
      <rect x={lBandX} y={BAND_TOP} width={bandW} height={BAND_BOTTOM - BAND_TOP} rx={14} fill="url(#sar-dots)" fillOpacity={0.5} />
      <rect x={rBandX} y={BAND_TOP} width={bandW} height={BAND_BOTTOM - BAND_TOP} rx={14} fill="var(--surface)" />
      <rect x={rBandX} y={BAND_TOP} width={bandW} height={BAND_BOTTOM - BAND_TOP} rx={14} fill="url(#sar-dots)" fillOpacity={0.5} />

      <Browser x={hBrowser.iconX} y={HEADER_BASE - 11} size={13} color="var(--muted)" />
      <text x={hBrowser.textX} y={HEADER_BASE} fontSize={10} fontWeight={600} fill="var(--muted)" fontFamily="var(--font-sans), system-ui" letterSpacing={1.2}>
        {T_BROWSER}
      </text>
      <text x={hNetwork.textX} y={HEADER_BASE} fontSize={10} fontWeight={600} fill="var(--muted)" fontFamily="var(--font-sans), system-ui" letterSpacing={1.2}>
        {T_NETWORK}
      </text>
      <HardDrives x={hServer.iconX} y={HEADER_BASE - 11} size={13} color="var(--muted)" />
      <text x={hServer.textX} y={HEADER_BASE} fontSize={10} fontWeight={600} fill="var(--muted)" fontFamily="var(--font-sans), system-ui" letterSpacing={1.2}>
        {T_SERVER}
      </text>

      {/* The boundary, faded at both ends rather than hard-cut */}
      <line x1={boundaryX} y1={BAND_TOP} x2={boundaryX} y2={BAND_TOP + 30} stroke="url(#sar-fade-top)" strokeWidth={1.5} strokeDasharray="1 4" strokeLinecap="round" />
      <line x1={boundaryX} y1={BAND_TOP + 30} x2={boundaryX} y2={BAND_BOTTOM - 30} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="1 4" strokeLinecap="round" />
      <line x1={boundaryX} y1={BAND_BOTTOM - 30} x2={boundaryX} y2={BAND_BOTTOM} stroke="url(#sar-fade-bottom)" strokeWidth={1.5} strokeDasharray="1 4" strokeLinecap="round" />

      {/* The request, crossing the boundary: browser -> card -> endpoint */}
      <line x1={lNodeR} y1={rowMid} x2={cardX - 4} y2={rowMid} stroke="var(--accent)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#sar-arrow-accent)" />
      <line x1={cardX + cardW} y1={rowMid} x2={rNodeX - 4} y2={rowMid} stroke="var(--accent)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#sar-arrow-accent)" />

      {/* Return trip, crossing the same boundary the other way */}
      <path d={returnPath} fill="none" stroke="var(--insight)" strokeWidth={1.25} strokeDasharray="1 4" strokeLinecap="round" markerEnd="url(#sar-arrow-insight)" />

      {/* L1 — the form as written */}
      <rect x={lNodeX} y={ROW1_Y} width={nodeW} height={ROW1_H} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <text x={lNodeX + NODE_PAD} y={ROW1_Y + 22} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
        {L1_TITLE}
      </text>
      <text x={lNodeX + NODE_PAD} y={ROW1_Y + 44} fontSize={10} fill="var(--foreground)" fontFamily="var(--font-mono), monospace">
        {l1Mono}
      </text>
      <text x={lNodeX + NODE_PAD} y={ROW1_Y + 61} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {L1_CAP}
      </text>

      {/* L2 — what actually ships. The id is the whole payload of this node. */}
      <rect x={lNodeX} y={ROW2_Y} width={nodeW} height={ROW2_H} rx={12} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1.5} />
      <Cube x={lNodeX + NODE_PAD} y={ROW2_Y + 12} size={13} color="var(--accent)" />
      <text x={lNodeX + NODE_PAD + ICON_GAP} y={ROW2_Y + 22} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
        {L2_TITLE}
      </text>
      <text x={lNodeX + NODE_PAD} y={ROW2_Y + 44} fontSize={10} fill="var(--foreground)" fontFamily="var(--font-mono), monospace">
        {`${actionName} = ref("`}
        <tspan fill="var(--mark)" fontWeight={600}>{actionId}</tspan>
        {'")'}
      </text>
      <text x={lNodeX + NODE_PAD} y={ROW2_Y + 61} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {L2_CAP_A}
      </text>
      <text x={lNodeX + NODE_PAD} y={ROW2_Y + 75} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {L2_CAP_B}
      </text>

      {/* L3 — where the return trip lands. No icon: the width formula measures
          this title without one, so adding one would overflow the node. */}
      <rect x={lNodeX} y={ROW3_Y} width={nodeW} height={ROW3_H} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <text x={lNodeX + NODE_PAD} y={ROW3_Y + 22} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
        {L3_TITLE}
      </text>
      <text x={lNodeX + NODE_PAD} y={ROW3_Y + 39} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {L3_CAP}
      </text>

      {/* The wire itself */}
      <rect x={boundaryX - wirePillW / 2} y={CARD_Y - 24} width={wirePillW} height={16} rx={8} fill="var(--elevated)" stroke="var(--accent)" strokeOpacity={0.4} strokeWidth={1} />
      <text x={boundaryX} y={CARD_Y - 13} fontSize={9} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {WIRE_PILL}
      </text>
      <rect x={cardX} y={CARD_Y} width={cardW} height={CARD_H} rx={12} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1.5} />
      <text x={cardX + NODE_PAD} y={CARD_Y + 18} fontSize={9} fill="var(--foreground)" fontFamily="var(--font-mono), monospace">
        {cardPost}
      </text>
      <text x={cardX + NODE_PAD} y={CARD_Y + 35} fontSize={9} fill="var(--foreground)" fontFamily="var(--font-mono), monospace">
        {"Next-Action: "}
        <tspan fill="var(--mark)" fontWeight={600}>{actionId}</tspan>
      </text>
      <text x={cardX + NODE_PAD} y={CARD_Y + 52} fontSize={9} fill="var(--muted)" fontFamily="var(--font-mono), monospace">
        {CARD_BODY}
      </text>

      {/* The return pill rides on the dashed line so it stays legible. It sits
          on the horizontal run back into the browser — centred on that run, not
          on the boundary, so it clears the vertical leg's corner at both ends. */}
      <rect x={returnPillCX - returnPillW / 2} y={returnY - 8} width={returnPillW} height={16} rx={8} fill="var(--elevated)" stroke="var(--insight)" strokeOpacity={0.4} strokeWidth={1} />
      <text x={returnPillCX} y={returnY + 3} fontSize={9} fontWeight={600} fill="var(--insight)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {RETURN_PILL}
      </text>

      {/* The endpoint is public — this arrow deliberately does not come from
          the browser column, because its reachability has nothing to do with
          the form. */}
      <Globe x={secPillX - 20} y={SEC_PILL_Y + 1} size={13} color="var(--bad)" />
      <rect x={secPillX} y={SEC_PILL_Y} width={secPillW} height={16} rx={8} fill="var(--elevated)" stroke="var(--bad)" strokeOpacity={0.45} strokeWidth={1} />
      <text x={secPillX + secPillW / 2} y={SEC_PILL_Y + 11} fontSize={9} fontWeight={600} fill="var(--bad)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {SEC_PILL}
      </text>
      <line x1={secArrowX} y1={SEC_PILL_Y + 20} x2={secArrowX} y2={ROW1_Y - 4} stroke="var(--bad)" strokeWidth={1.25} strokeDasharray="1 4" strokeLinecap="round" markerEnd="url(#sar-arrow-bad)" />

      {/* R1 — the generated endpoint */}
      <rect x={rNodeX} y={ROW1_Y} width={nodeW} height={ROW1_H} rx={12} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1.5} />
      <text x={rNodeX + NODE_PAD} y={ROW1_Y + 22} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
        {R1_TITLE}
      </text>
      <text x={rNodeX + NODE_PAD} y={ROW1_Y + 44} fontSize={10} fill="var(--foreground)" fontFamily="var(--font-mono), monospace">
        {r1Mono}
      </text>
      <text x={rNodeX + NODE_PAD} y={ROW1_Y + 61} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {r1CapHead}
        <tspan fill="var(--mark)" fontWeight={600} fontFamily="var(--font-mono), monospace">{actionId}</tspan>
        {r1CapTail}
      </text>

      {/* endpoint -> body */}
      <line x1={vArrowX} y1={ROW1_Y + ROW1_H + 2} x2={vArrowX} y2={ROW2_Y - 4} stroke="var(--muted)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#sar-arrow-muted)" />
      <rect x={pillX} y={ROW1_Y + ROW1_H + 4} width={INVOKE_PILL.length * CH_PILL + 18} height={16} rx={8} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <text x={pillX + (INVOKE_PILL.length * CH_PILL + 18) / 2} y={ROW1_Y + ROW1_H + 15} fontSize={9} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {INVOKE_PILL}
      </text>

      {/* R2 — the real function body, only ever here */}
      <rect x={rNodeX} y={ROW2_Y} width={nodeW} height={ROW2_H} rx={12} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1.5} />
      <FunctionIcon x={rNodeX + NODE_PAD} y={ROW2_Y + 12} size={13} color="var(--accent)" />
      <text x={rNodeX + NODE_PAD + ICON_GAP} y={ROW2_Y + 22} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
        {r2Title}
      </text>
      <text x={rNodeX + NODE_PAD} y={ROW2_Y + 44} fontSize={10} fill="var(--foreground)" fontFamily="var(--font-mono), monospace">
        {mutationLine}
      </text>
      <text x={rNodeX + NODE_PAD} y={ROW2_Y + 61} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {R2_CAP_A}
      </text>
      <text x={rNodeX + NODE_PAD} y={ROW2_Y + 75} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {R2_CAP_B}
      </text>

      {/* body -> database */}
      <line x1={vArrowX} y1={ROW2_Y + ROW2_H + 2} x2={vArrowX} y2={ROW3_Y - 4} stroke="var(--muted)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#sar-arrow-muted)" />
      <rect x={pillX} y={ROW2_Y + ROW2_H + 4} width={WRITE_PILL.length * CH_PILL + 18} height={16} rx={8} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <text x={pillX + (WRITE_PILL.length * CH_PILL + 18) / 2} y={ROW2_Y + ROW2_H + 15} fontSize={9} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {WRITE_PILL}
      </text>

      {/* R3 — what the body can reach and the bundle cannot */}
      <rect x={rNodeX} y={ROW3_Y} width={nodeW} height={ROW3_H} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <Database x={rNodeX + NODE_PAD} y={ROW3_Y + 12} size={13} color="var(--muted)" />
      <text x={rNodeX + NODE_PAD + ICON_GAP} y={ROW3_Y + 22} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
        {R3_TITLE}
      </text>
      <text x={rNodeX + NODE_PAD} y={ROW3_Y + 39} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {R3_CAP}
      </text>

      <text x={width / 2} y={HEIGHT - 26} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {caption[0]}
      </text>
      <text x={width / 2} y={HEIGHT - 12} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {caption[1]}
      </text>
    </svg>
  );
}
