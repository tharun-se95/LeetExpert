"use client";

import { Browser, CursorClick, HardDrives, Prohibit, XCircle } from "@phosphor-icons/react";

/**
 * The one `<form>` element, forking into what actually happens at submit
 * time depending on whether JavaScript has loaded — not a two-card list of
 * facts about each state.
 *
 * The lesson's real claim is causal, not descriptive: the SAME
 * `<form action={createPost}>` produces two different code paths at
 * submit time, and one of those paths (JS disabled or not yet loaded) only
 * reaches the server if `action` was wired as a real prop — independent of
 * whatever `onSubmit` does, because `onSubmit` never runs at all without
 * JS. So this is drawn as a decision tree with a real dead end, not a
 * flat comparison: the root form forks on "did JS load", the no-JS branch
 * forks again on "is `action` actually wired", and only two of the three
 * resulting leaves reach the shared "createPost() runs on the server"
 * node. The third leaf — the broken pattern from the lesson's own
 * `preventDefault()`-unconditionally example — visibly terminates at a
 * Prohibit glyph instead of an arrowhead, because that pattern has nothing
 * to hand off to.
 */

const CH_TITLE = 7.0; // 13px sans, weight 600
const CH_MONO = 6.05; // 10px mono
const CH_CAPTION = 5.0; // 9.5px sans
const CH_PILL = 4.85; // 9px sans inside a pill

const NODE_PAD = 14;
const ICON_GAP = 20;
const SAFETY = 10; // small buffer against font-metric variance, per node

interface NodeSpec {
  title: string;
  icon?: boolean;
  mono?: string;
  captions?: string[];
}

function nodeWidth({ title, icon, mono, captions = [] }: NodeSpec): number {
  const candidates = [title.length * CH_TITLE + (icon ? ICON_GAP : 0)];
  if (mono) candidates.push(mono.length * CH_MONO);
  for (const c of captions) candidates.push(c.length * CH_CAPTION);
  return NODE_PAD * 2 + Math.max(...candidates) + SAFETY;
}

function pillWidth(label: string): number {
  return label.length * CH_PILL + 20;
}

// ---- Copy -------------------------------------------------------------

const FORM_TITLE = "The form, as written";
const FORM_MONO = "<form action={createPost}>";
const FORM_CAP = "one element, two real paths below";

const A1_TITLE = "onSubmit intercepts";
const A1_CAP = "this handler only exists because JS already ran";

const A2_TITLE = "Client validation runs";
const A2_CAP = "isValid(data) checked before the action is called";

const B_TITLE = "Native HTML POST";
const B_CAP1 = "browser submits directly to";
const B_CAP2 = "the action's generated endpoint";

const C_TITLE = "No native fallback";
const C_CAP1 = "onSubmit never ran — there was no JS to run it";
const C_CAP2 = "and action isn't wired to anything real either";

const MERGE_TITLE = "createPost() runs on the server";
const MERGE_CAP = "identical server code — reached correctly, either path";

const TERMINAL_TEXT = "Nothing happens on submit";

const PILL_JS_YES = "JS loaded before submit";
const PILL_JS_NO = "JS disabled or not loaded yet";
const FORK2_Q = "Is action wired as a real prop?";
const PILL_WIRED = "wired correctly";
const PILL_BROKEN = "only wired to onSubmit";
const PILL_STILL_CALLS = "still calls the real action";
const PILL_FALLBACK_INTACT = "native fallback intact";

const CAPTION_1 =
  "Both correct paths converge on the same server code. The broken pattern — preventDefault() always, action never wired — dead-ends instead.";
const CAPTION_2 = "Client-side validation is a non-blocking enhancement layered on top, never the only path to a working submission.";

export function ProgressiveEnhancementForkDiagram() {
  // --- Node widths, each measured from its own real text -----------------
  const formW = nodeWidth({ title: FORM_TITLE, mono: FORM_MONO, captions: [FORM_CAP] });
  const a1W = nodeWidth({ title: A1_TITLE, icon: true, captions: [A1_CAP] });
  const a2W = nodeWidth({ title: A2_TITLE, captions: [A2_CAP] });
  const bW = nodeWidth({ title: B_TITLE, icon: true, captions: [B_CAP1, B_CAP2] });
  const cW = nodeWidth({ title: C_TITLE, icon: true, captions: [C_CAP1, C_CAP2] });
  const mergeW = nodeWidth({ title: MERGE_TITLE, icon: true, captions: [MERGE_CAP] });
  const colLW = Math.max(a1W, a2W);
  const terminalW = pillWidth(TERMINAL_TEXT) + 22; // + Prohibit icon column

  // --- Vertical rhythm -----------------------------------------------------
  const EDGE = 20;
  const FORM_Y = 26;
  const FORM_H = 76;
  const ROW1_Y = FORM_Y + FORM_H + 62; // room for the JS-loaded / JS-disabled pills + arrows
  const A1_H = 56;
  const FORK2_PILL_H = 24;
  const ROW2_Y = ROW1_Y + A1_H + 40; // room for A1->A2 arrow and fork2's split arrows
  const A2_H = 56;
  const BC_H = 92;
  const MERGE_Y = ROW2_Y + BC_H + 58; // room for the converging "still calls" / "fallback intact" pills
  const MERGE_H = 58;
  const TERMINAL_Y = ROW2_Y + BC_H + 26;
  const TERMINAL_H = 34;
  const contentBottom = Math.max(MERGE_Y + MERGE_H, TERMINAL_Y + TERMINAL_H);
  const height = contentBottom + 56; // + two footer caption lines

  // --- Horizontal layout ---------------------------------------------------
  const GAP_COLS = 46;
  const centerL = EDGE + colLW / 2;
  const centerM = centerL + colLW / 2 + GAP_COLS + bW / 2;
  const centerR = centerM + bW / 2 + GAP_COLS + cW / 2;
  const contentRight = centerR + cW / 2 + EDGE;
  const fork2X = (centerM + centerR) / 2;

  const rootX = (centerL + centerR) / 2;
  const mergeX = (centerL + centerM) / 2;
  // Guard against a pathologically wide merge node, or a footer caption
  // longer than the tree itself, overrunning the canvas.
  const captionW = Math.max(CAPTION_1.length, CAPTION_2.length) * CH_CAPTION + 2 * EDGE;
  const width = Math.max(contentRight, mergeX + mergeW / 2 + EDGE, rootX + formW / 2 + EDGE, captionW);

  const fork2PillW = pillWidth(FORK2_Q);
  const fork2PillY = ROW1_Y + (A1_H - FORK2_PILL_H) / 2;

  // Midpoints used to place inline edge-label pills without a dedicated
  // layout pass — each pill sits on the line it annotates, elevated fill
  // over the line so it stays legible per the repo's pill convention.
  const mid = (ax: number, ay: number, bx: number, by: number) => ({ x: (ax + bx) / 2, y: (ay + by) / 2 });

  const jsYesMid = mid(rootX, FORM_Y + FORM_H, centerL, ROW1_Y);
  const jsNoMid = mid(rootX, FORM_Y + FORM_H, fork2X, fork2PillY);
  const wiredMid = mid(fork2X, fork2PillY + FORK2_PILL_H, centerM, ROW2_Y);
  const brokenMid = mid(fork2X, fork2PillY + FORK2_PILL_H, centerR, ROW2_Y);

  // Curved return-style legs bringing the two correct paths into the shared
  // merge node, mirroring the routing convention used elsewhere in this
  // course's diagrams (a controlled bend rather than a straight diagonal).
  const a2BottomY = ROW2_Y + A2_H;
  const bBottomY = ROW2_Y + BC_H;
  const stillCallsMid = mid(centerL, a2BottomY, mergeX - mergeW / 4, MERGE_Y);
  const fallbackMid = mid(centerM, bBottomY, mergeX + mergeW / 4, MERGE_Y);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        "A decision tree starting from one form element, <form action={createPost}>, with no onSubmit shown yet. " +
        "It forks on whether JavaScript loaded before submit. On the JS-loaded branch, onSubmit intercepts the " +
        "submission, client-side validation runs, and the handler still calls the real action afterward. On the " +
        "JS-disabled-or-not-loaded branch, there is no onSubmit handler to run at all, so the outcome depends " +
        "entirely on a second fork: whether action was wired as a real prop. If it was, the browser performs a " +
        "genuine native POST straight to the action's generated endpoint. If it was not — the lesson's own broken " +
        "example, where onSubmit calls preventDefault unconditionally and action is never wired — that branch " +
        "dead-ends at a prohibited-sign icon captioned 'nothing happens on submit', because there is no JavaScript " +
        "to run the handler and no working action prop to fall back to. Both of the two working branches converge " +
        "on the same bottom node, createPost executes on the server, showing that either correct path reaches " +
        "identical server code; only the broken pattern fails to reach it."
      }
    >
      <defs>
        <marker id="pef-arrow-muted" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--muted)" />
        </marker>
        <marker id="pef-arrow-accent" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--accent)" />
        </marker>
      </defs>

      {/* The form as written — the single root both branches share */}
      <rect x={rootX - formW / 2} y={FORM_Y} width={formW} height={FORM_H} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <text x={rootX} y={FORM_Y + 22} fontSize={13} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {FORM_TITLE}
      </text>
      <text x={rootX} y={FORM_Y + 44} fontSize={10} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-mono), monospace">
        {FORM_MONO}
      </text>
      <text x={rootX} y={FORM_Y + 61} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {FORM_CAP}
      </text>

      {/* Fork 1: did JS load before submit? */}
      <line x1={rootX} y1={FORM_Y + FORM_H} x2={centerL + 5} y2={ROW1_Y - 3} stroke="var(--accent)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#pef-arrow-accent)" />
      <line x1={rootX} y1={FORM_Y + FORM_H} x2={fork2X - 5} y2={fork2PillY - 3} stroke="var(--muted)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#pef-arrow-muted)" />

      <rect x={jsYesMid.x - pillWidth(PILL_JS_YES) / 2} y={jsYesMid.y - 9} width={pillWidth(PILL_JS_YES)} height={17} rx={8.5} fill="var(--elevated)" stroke="var(--accent)" strokeOpacity={0.45} strokeWidth={1} />
      <text x={jsYesMid.x} y={jsYesMid.y + 3} fontSize={9} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {PILL_JS_YES}
      </text>
      <rect x={jsNoMid.x - pillWidth(PILL_JS_NO) / 2} y={jsNoMid.y - 9} width={pillWidth(PILL_JS_NO)} height={17} rx={8.5} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <text x={jsNoMid.x} y={jsNoMid.y + 3} fontSize={9} fontWeight={600} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {PILL_JS_NO}
      </text>

      {/* Left branch: JS loaded — onSubmit intercepts, then validates */}
      <rect x={centerL - a1W / 2} y={ROW1_Y} width={a1W} height={A1_H} rx={12} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1.5} />
      <CursorClick x={centerL - a1W / 2 + NODE_PAD} y={ROW1_Y + 11} size={13} color="var(--accent)" />
      <text x={centerL - a1W / 2 + NODE_PAD + ICON_GAP} y={ROW1_Y + 21} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
        {A1_TITLE}
      </text>
      <text x={centerL - a1W / 2 + NODE_PAD} y={ROW1_Y + 39} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {A1_CAP}
      </text>

      <line x1={centerL} y1={ROW1_Y + A1_H} x2={centerL} y2={ROW2_Y - 3} stroke="var(--muted)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#pef-arrow-muted)" />

      <rect x={centerL - a2W / 2} y={ROW2_Y} width={a2W} height={A2_H} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
      <text x={centerL} y={ROW2_Y + 21} fontSize={13} fontWeight={600} fill="var(--foreground)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {A2_TITLE}
      </text>
      <text x={centerL} y={ROW2_Y + 39} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {A2_CAP}
      </text>

      {/* Right branch: JS disabled/slow — forks again on whether action is wired */}
      <rect x={fork2X - fork2PillW / 2} y={fork2PillY} width={fork2PillW} height={FORK2_PILL_H} rx={FORK2_PILL_H / 2} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
      <text x={fork2X} y={fork2PillY + FORK2_PILL_H / 2 + 3} fontSize={9} fontWeight={600} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {FORK2_Q}
      </text>

      <line x1={fork2X} y1={fork2PillY + FORK2_PILL_H} x2={centerM + 5} y2={ROW2_Y - 3} stroke="var(--accent)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#pef-arrow-accent)" />
      <line x1={fork2X} y1={fork2PillY + FORK2_PILL_H} x2={centerR - 5} y2={ROW2_Y - 3} stroke="var(--bad)" strokeWidth={1.25} strokeLinecap="round" markerEnd="url(#pef-arrow-muted)" />

      <rect x={wiredMid.x - pillWidth(PILL_WIRED) / 2} y={wiredMid.y - 9} width={pillWidth(PILL_WIRED)} height={17} rx={8.5} fill="var(--elevated)" stroke="var(--accent)" strokeOpacity={0.45} strokeWidth={1} />
      <text x={wiredMid.x} y={wiredMid.y + 3} fontSize={9} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {PILL_WIRED}
      </text>
      <rect x={brokenMid.x - pillWidth(PILL_BROKEN) / 2} y={brokenMid.y - 9} width={pillWidth(PILL_BROKEN)} height={17} rx={8.5} fill="var(--elevated)" stroke="var(--bad)" strokeOpacity={0.5} strokeWidth={1} />
      <text x={brokenMid.x} y={brokenMid.y + 3} fontSize={9} fontWeight={600} fill="var(--bad)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {PILL_BROKEN}
      </text>

      {/* B: wired correctly -> a real native POST */}
      <rect x={centerM - bW / 2} y={ROW2_Y} width={bW} height={BC_H} rx={12} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1.5} />
      <Browser x={centerM - bW / 2 + NODE_PAD} y={ROW2_Y + 11} size={13} color="var(--accent)" />
      <text x={centerM - bW / 2 + NODE_PAD + ICON_GAP} y={ROW2_Y + 21} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
        {B_TITLE}
      </text>
      <text x={centerM - bW / 2 + NODE_PAD} y={ROW2_Y + 39} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {B_CAP1}
      </text>
      <text x={centerM - bW / 2 + NODE_PAD} y={ROW2_Y + 53} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {B_CAP2}
      </text>

      {/* C: never wired -> dead end */}
      <rect x={centerR - cW / 2} y={ROW2_Y} width={cW} height={BC_H} rx={12} fill="var(--elevated)" stroke="var(--bad)" strokeWidth={1.5} strokeDasharray="4 3" />
      <XCircle x={centerR - cW / 2 + NODE_PAD} y={ROW2_Y + 11} size={13} color="var(--bad)" />
      <text x={centerR - cW / 2 + NODE_PAD + ICON_GAP} y={ROW2_Y + 21} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
        {C_TITLE}
      </text>
      <text x={centerR - cW / 2 + NODE_PAD} y={ROW2_Y + 39} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {C_CAP1}
      </text>
      <text x={centerR - cW / 2 + NODE_PAD} y={ROW2_Y + 53} fontSize={9.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
        {C_CAP2}
      </text>

      {/* B -> merge, and A2 -> merge: the two correct paths converge */}
      <path
        d={`M ${centerL} ${a2BottomY} Q ${centerL} ${stillCallsMid.y} ${mergeX - mergeW / 4} ${MERGE_Y - 4}`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.25}
        strokeLinecap="round"
        markerEnd="url(#pef-arrow-accent)"
      />
      <rect x={stillCallsMid.x - pillWidth(PILL_STILL_CALLS) / 2} y={stillCallsMid.y - 17} width={pillWidth(PILL_STILL_CALLS)} height={17} rx={8.5} fill="var(--elevated)" stroke="var(--accent)" strokeOpacity={0.45} strokeWidth={1} />
      <text x={stillCallsMid.x} y={stillCallsMid.y - 5} fontSize={9} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {PILL_STILL_CALLS}
      </text>

      <path
        d={`M ${centerM} ${bBottomY} Q ${centerM} ${fallbackMid.y} ${mergeX + mergeW / 4} ${MERGE_Y - 4}`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.25}
        strokeLinecap="round"
        markerEnd="url(#pef-arrow-accent)"
      />
      <rect x={fallbackMid.x - pillWidth(PILL_FALLBACK_INTACT) / 2} y={fallbackMid.y - 9} width={pillWidth(PILL_FALLBACK_INTACT)} height={17} rx={8.5} fill="var(--elevated)" stroke="var(--accent)" strokeOpacity={0.45} strokeWidth={1} />
      <text x={fallbackMid.x} y={fallbackMid.y + 3} fontSize={9} fontWeight={600} fill="var(--mark)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {PILL_FALLBACK_INTACT}
      </text>

      {/* C -> a real dead end: line ends in a Prohibit glyph, not an arrowhead */}
      <line x1={centerR} y1={bBottomY} x2={centerR} y2={TERMINAL_Y - 2} stroke="var(--bad)" strokeWidth={1.25} strokeDasharray="1 4" strokeLinecap="round" />
      <rect x={centerR - terminalW / 2} y={TERMINAL_Y} width={terminalW} height={TERMINAL_H} rx={TERMINAL_H / 2} fill="var(--elevated)" stroke="var(--bad)" strokeWidth={1.5} />
      <Prohibit x={centerR - terminalW / 2 + 10} y={TERMINAL_Y + TERMINAL_H / 2 - 7} size={14} color="var(--bad)" weight="bold" />
      <text x={centerR + 10} y={TERMINAL_Y + TERMINAL_H / 2 + 3} fontSize={9} fontWeight={600} fill="var(--bad)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {TERMINAL_TEXT}
      </text>

      {/* Merge: both correct paths reach identical server code */}
      <rect x={mergeX - mergeW / 2} y={MERGE_Y} width={mergeW} height={MERGE_H} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1.5} />
      <HardDrives x={mergeX - mergeW / 2 + NODE_PAD} y={MERGE_Y + 12} size={13} color="var(--muted)" />
      <text x={mergeX - mergeW / 2 + NODE_PAD + ICON_GAP} y={MERGE_Y + 22} fontSize={13} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-sans), system-ui">
        {MERGE_TITLE}
      </text>
      <text x={mergeX} y={MERGE_Y + 42} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {MERGE_CAP}
      </text>

      <text x={width / 2} y={height - 34} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {CAPTION_1}
      </text>
      <text x={width / 2} y={height - 20} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily="var(--font-sans), system-ui">
        {CAPTION_2}
      </text>
    </svg>
  );
}
