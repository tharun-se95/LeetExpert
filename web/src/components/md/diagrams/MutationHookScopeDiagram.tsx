"use client";

import {
  CursorClick,
  Function as FunctionIcon,
  Heart,
  SpinnerGap,
  TreeStructure,
  Warning,
} from "@phosphor-icons/react";

import { BrowserMockup } from "@/components/md/diagrams/BrowserMockup";

/**
 * Which React 19 mutation hook you reach for is decided by WHERE the component
 * sits, so this is drawn as one annotated screen rather than three fact cards.
 *
 * A single page holds two regions. The accent-bordered region is the `<form>`
 * that `NewPostForm` renders: `useActionState` is called in that component, so
 * its scope is the whole rectangle — the error line and the pending button both
 * come out of the one hook call. Nested inside it is a separately-composed
 * child, `SubmitButton`, drawn as its own box because that is the entire reason
 * `useFormStatus` exists: an arrow runs from the child UP to the form's own
 * boundary, the "nearest parent `<form>`" it reads through context, with no
 * prop crossing that boundary. Below a divider, outside every form, sits
 * `LikeButton` — the same arrow cannot be drawn for it (there is no `<form>`
 * above it to point at), which is exactly why it needs `useTransition` and an
 * event handler instead.
 *
 * The three annotations on the right are anchored by leader lines to the UI
 * region each hook governs, so the answer to "which hook here?" is read off
 * position, not off a list.
 */
export interface MutationHookScopeDiagramProps {
  /** Validation error the action returned in `state` and the form re-renders. */
  errorMessage?: string;
  /** Label the child submit button shows while its parent form is submitting. */
  submitPendingLabel?: string;
}

/**
 * Conservative advance-width estimates. Every piece of text below feeds the
 * viewBox through these, so a longer prop widens the canvas instead of
 * clipping off the right edge.
 */
const sansW = (s: string, size: number) => s.length * size * 0.55;
const monoW = (s: string, size: number) => s.length * size * 0.6;

export function MutationHookScopeDiagram({
  errorMessage = "Title is required",
  submitPendingLabel = "Saving…",
}: MutationHookScopeDiagramProps) {
  const PAD = 26;
  const CH = 18; // BrowserMockup chrome height

  // ---- Copy that drives the geometry ----
  const compName = "NewPostForm";
  const compTag = '"use client"';
  const formTag = "<form action={formAction}>";
  const fieldLabel = "title";
  const fieldValue = "Hello world";
  const errorSource = "state.error";
  const childName = "SubmitButton";
  const childNote = "separate child component";
  const upPill = "nearest <form>";
  const dividerLabel = "elsewhere on the same page — no form involved";
  const likeName = "LikeButton";
  const likeLabel = "Like";
  const likeNoForm = "no <form> ancestor";
  const likeHandler = "onClick={() => startTransition(...)}";
  const footer =
    "The hook is decided by where the component sits: form owner, form child, or no form at all.";

  const cards = [
    {
      title: "useActionState",
      sig: "[state, formAction, isPending]",
      lines: ["Called in the component that renders", "the form; owns error + pending."],
    },
    {
      title: "useFormStatus",
      sig: "{ pending }",
      lines: ["Called in the child; reads the nearest", "parent <form> — nothing passed down."],
    },
    {
      title: "useTransition",
      sig: "[isPending, startTransition]",
      lines: ["No form to read: wraps the action call", "from an event handler instead."],
    },
  ];

  // ---- Inside the browser viewport (BrowserMockup translates children) ----
  const formX = 16;
  const formY = 34;
  const formH = 176;

  const inputX = 40;
  const inputY = 64;
  const inputW = 170;
  const inputH = 26;

  const errY = 106;
  const errTextX = 58;
  const errPillW = monoW(errorSource, 8) + 14;
  const errPillX = errTextX + sansW(errorMessage, 9.5) + 12;
  const errPillRight = errPillX + errPillW;

  const sbX = 32;
  const sbY = 124;
  const sbH = 72;
  const btnY = 158;
  const btnH = 26;
  const btnW = 18 + 11 + 6 + sansW(submitPendingLabel, 9.5) + 16;
  const sbW = Math.max(
    24 + monoW(childName, 9.5),
    24 + sansW(childNote, 8.5),
    24 + btnW,
  );

  // The "reads its nearest parent form" edge: right out of the child box, then
  // straight up to the form's own top border. Placed clear of every field.
  const upPillW = monoW(upPill, 8.5) + 20;
  const arrowX =
    Math.max(inputX + inputW, errPillRight, sbX + sbW) + 14 + upPillW / 2;

  const dividerY = 228;
  const likeY = 244;
  const likeH = 68;
  const likeBtnY = 276;
  const likeBtnW = 18 + 11 + 6 + sansW(likeLabel, 9.5) + 16;
  const likeCapX = sbX + likeBtnW + 18;
  const likeCapRight = likeCapX + monoW(likeHandler, 8.5);
  const noFormPillW = monoW(likeNoForm, 8.5) + 18;

  const legendW = monoW(formTag, 8.5) + 18;
  const dividerPillW = sansW(dividerLabel, 9) + 20;
  const childNoteRight = 44 + sansW(childNote, 8.5);

  // Form width is the widest thing that has to live inside it, plus padding —
  // never a guessed constant.
  const formContentRight = Math.max(
    30 + legendW,
    inputX + inputW,
    errPillRight,
    arrowX + upPillW / 2,
    sbX + sbW,
    childNoteRight,
    likeCapRight,
    sbX + noFormPillW + 60,
    formX + dividerPillW,
  );
  const formW = formContentRight + 14 - formX;
  const formRight = formX + formW;
  const viewportW = formRight + 16;
  const viewportH = likeY + likeH + 14;

  const mx = PAD;
  const my = 34;
  const mockupW = viewportW;
  const mockupH = viewportH + CH;
  const mockupRight = mx + mockupW;
  // Viewport-relative -> canvas coordinates.
  const ax = (rx: number) => mx + rx;
  const ay = (ry: number) => my + CH + ry;

  // ---- Annotation column ----
  const cardX = mockupRight + 44;
  const cardH = 76;
  const cardTextW = Math.max(
    ...cards.map((c) =>
      Math.max(
        20 + monoW(c.title, 12.5),
        monoW(c.sig, 8.5),
        ...c.lines.map((l) => sansW(l, 9.5)),
      ),
    ),
  );
  const cardW = Math.ceil(cardTextW + 28);

  // Each card is vertically centred on the UI region it annotates, so the
  // leader line runs dead straight from region to annotation.
  const cardYs = [ay(58), ay(186), ay(278)].map((y) => y - cardH / 2);
  const anchors = [
    { x: ax(formRight), y: ay(58), tone: "var(--accent)", text: "var(--mark)" },
    { x: ax(sbX + sbW), y: ay(186), tone: "var(--insight)", text: "var(--insight)" },
    { x: ax(formRight), y: ay(278), tone: "var(--info)", text: "var(--info)" },
  ];

  const width = Math.ceil(
    Math.max(cardX + cardW + PAD, PAD * 2 + sansW(footer, 9.5)),
  );
  const height = Math.ceil(my + mockupH + 42);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        "One page, split into the two places a mutation can live, with each React 19 hook labelled by the region it " +
        "governs rather than listed as an API. The upper region is the form that NewPostForm renders: because " +
        "useActionState is called in that component, its scope is the entire form rectangle — the validation error " +
        "line under the input and the button's pending label both come from that single hook call, which returns state, " +
        "formAction and isPending together. Nested inside the form is a separately composed child component, " +
        "SubmitButton, drawn as its own box; an arrow runs from that child up to the form's own boundary, standing for " +
        "useFormStatus reading the pending state of its nearest parent form through context, with no prop passed down " +
        "across that boundary. Below a divider, outside every form, sits a standalone LikeButton: no form rectangle " +
        "encloses it, so the upward arrow cannot be drawn at all, and it instead calls the Server Action from an " +
        "onClick handler wrapped in startTransition from useTransition."
      }
    >
      <defs>
        <marker id="mhs-arrow-insight" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--insight)" />
        </marker>
        <pattern id="mhs-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <linearGradient id="mhs-rule" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ---- Leader lines: each annotation is tied to a region, not floating ---- */}
      {anchors.map((a) => (
        <g key={a.y}>
          <line
            x1={a.x}
            y1={a.y}
            x2={cardX}
            y2={a.y}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="1 4"
            strokeLinecap="round"
          />
          <circle cx={a.x} cy={a.y} r={2.5} fill={a.tone} />
        </g>
      ))}

      {/* ---- The page itself ---- */}
      <BrowserMockup x={mx} y={my} width={mockupW} height={mockupH} url="app.com/new">
        {/* Component that owns the form */}
        <text x={formX} y={16} fontSize={10} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-mono), monospace">
          {compName}
        </text>
        <text
          x={formX + monoW(compName, 10) + 10}
          y={16}
          fontSize={8.5}
          fill="var(--muted)"
          fontFamily="var(--font-mono), monospace"
        >
          {compTag}
        </text>

        {/* useActionState's scope: the whole form */}
        <rect x={formX} y={formY} width={formW} height={formH} rx={12} fill="var(--accent)" fillOpacity={0.05} />
        <rect x={formX} y={formY} width={formW} height={formH} rx={12} fill="url(#mhs-dots)" fillOpacity={0.5} />
        <rect
          x={formX}
          y={formY}
          width={formW}
          height={formH}
          rx={12}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
        />
        <rect x={30} y={formY - 8} width={legendW} height={16} rx={8} fill="var(--elevated)" stroke="var(--accent)" strokeWidth={1} />
        <text
          x={30 + legendW / 2}
          y={formY}
          fontSize={8.5}
          fontWeight={600}
          fill="var(--mark)"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-mono), monospace"
        >
          {formTag}
        </text>

        {/* The input */}
        <text x={inputX} y={inputY - 8} fontSize={8.5} fill="var(--muted)" fontFamily="var(--font-mono), monospace">
          {fieldLabel}
        </text>
        <rect x={inputX} y={inputY} width={inputW} height={inputH} rx={8} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
        <text
          x={inputX + 12}
          y={inputY + inputH / 2}
          fontSize={9.5}
          fill="var(--foreground)"
          dominantBaseline="central"
          fontFamily="var(--font-mono), monospace"
        >
          {fieldValue}
        </text>

        {/* The error the action returned — rendered by the form, from `state` */}
        <Warning x={40} y={errY - 5.5} size={11} color="var(--bad)" />
        <text
          x={errTextX}
          y={errY}
          fontSize={9.5}
          fill="var(--bad)"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui"
        >
          {errorMessage}
        </text>
        <rect x={errPillX} y={errY - 7} width={errPillW} height={14} rx={7} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />
        <text
          x={errPillX + errPillW / 2}
          y={errY}
          fontSize={8}
          fill="var(--muted)"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-mono), monospace"
        >
          {errorSource}
        </text>

        {/* The child component — the whole reason useFormStatus exists */}
        <rect
          x={sbX}
          y={sbY}
          width={sbW}
          height={sbH}
          rx={12}
          fill="var(--elevated)"
          stroke="var(--insight)"
          strokeWidth={1.25}
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
        <text x={sbX + 12} y={sbY + 20} fontSize={9.5} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-mono), monospace">
          {childName}
        </text>
        <text x={sbX + 12} y={sbY + 33} fontSize={8.5} fill="var(--muted)" fontFamily="var(--font-sans), system-ui">
          {childNote}
        </text>
        <rect x={sbX + 12} y={btnY} width={btnW} height={btnH} rx={btnH / 2} fill="var(--insight)" fillOpacity={0.12} stroke="var(--insight)" strokeWidth={1} />
        <SpinnerGap x={sbX + 24} y={btnY + btnH / 2 - 5.5} size={11} color="var(--insight)" />
        <text
          x={sbX + 41}
          y={btnY + btnH / 2}
          fontSize={9.5}
          fontWeight={600}
          fill="var(--insight)"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui"
        >
          {submitPendingLabel}
        </text>

        {/* The upward read: child -> its nearest parent <form>, via context */}
        <path
          d={`M ${sbX + sbW} ${btnY + btnH / 2} H ${arrowX} V ${formY + 2}`}
          fill="none"
          stroke="var(--insight)"
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeDasharray="1 4"
          markerEnd="url(#mhs-arrow-insight)"
        />
        <rect
          x={arrowX - upPillW / 2}
          y={formY + 18}
          width={upPillW}
          height={16}
          rx={8}
          fill="var(--elevated)"
          stroke="var(--insight)"
          strokeWidth={1}
        />
        <text
          x={arrowX}
          y={formY + 26}
          fontSize={8.5}
          fontWeight={600}
          fill="var(--insight)"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-mono), monospace"
        >
          {upPill}
        </text>

        {/* ---- Divider: everything below is outside every form ---- */}
        <line x1={formX} y1={dividerY} x2={formRight} y2={dividerY} stroke="url(#mhs-rule)" strokeWidth={1} strokeLinecap="round" />
        <rect
          x={formX + (formW - dividerPillW) / 2}
          y={dividerY - 8}
          width={dividerPillW}
          height={16}
          rx={8}
          fill="var(--elevated)"
          stroke="var(--border)"
          strokeWidth={1}
        />
        <text
          x={formX + formW / 2}
          y={dividerY}
          fontSize={9}
          fill="var(--muted)"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui"
        >
          {dividerLabel}
        </text>

        {/* The standalone button: no form above it at all */}
        <rect
          x={formX}
          y={likeY}
          width={formW}
          height={likeH}
          rx={12}
          fill="var(--info)"
          fillOpacity={0.05}
        />
        <rect x={formX} y={likeY} width={formW} height={likeH} rx={12} fill="url(#mhs-dots)" fillOpacity={0.5} />
        <rect
          x={formX}
          y={likeY}
          width={formW}
          height={likeH}
          rx={12}
          fill="none"
          stroke="var(--info)"
          strokeWidth={1.5}
        />
        <text x={sbX} y={likeY + 22} fontSize={9.5} fontWeight={600} fill="var(--foreground)" fontFamily="var(--font-mono), monospace">
          {likeName}
        </text>
        <rect
          x={formRight - 14 - noFormPillW}
          y={likeY + 8}
          width={noFormPillW}
          height={16}
          rx={8}
          fill="var(--elevated)"
          stroke="var(--info)"
          strokeWidth={1}
        />
        <text
          x={formRight - 14 - noFormPillW / 2}
          y={likeY + 16}
          fontSize={8.5}
          fontWeight={600}
          fill="var(--info)"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-mono), monospace"
        >
          {likeNoForm}
        </text>
        <rect x={sbX} y={likeBtnY} width={likeBtnW} height={btnH} rx={btnH / 2} fill="var(--info)" fillOpacity={0.12} stroke="var(--info)" strokeWidth={1} />
        <Heart x={sbX + 12} y={likeBtnY + btnH / 2 - 5.5} size={11} color="var(--info)" />
        <text
          x={sbX + 29}
          y={likeBtnY + btnH / 2}
          fontSize={9.5}
          fontWeight={600}
          fill="var(--info)"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui"
        >
          {likeLabel}
        </text>
        <text
          x={likeCapX}
          y={likeBtnY + btnH / 2}
          fontSize={8.5}
          fill="var(--muted)"
          dominantBaseline="central"
          fontFamily="var(--font-mono), monospace"
        >
          {likeHandler}
        </text>
      </BrowserMockup>

      {/* ---- Annotations, each anchored to its region by a leader line ---- */}
      {cards.map((card, i) => {
        const cy = cardYs[i]!;
        const tone = anchors[i]!.tone;
        const textTone = anchors[i]!.text;
        const Icon = [FunctionIcon, TreeStructure, CursorClick][i]!;
        return (
          <g key={card.title}>
            <rect x={cardX} y={cy} width={cardW} height={cardH} rx={12} fill="var(--elevated)" stroke={tone} strokeWidth={1.25} />
            <Icon x={cardX + 14} y={cy + 12} size={13} color={tone} />
            <text
              x={cardX + 34}
              y={cy + 19}
              fontSize={12.5}
              fontWeight={600}
              fill={textTone}
              dominantBaseline="central"
              fontFamily="var(--font-mono), monospace"
            >
              {card.title}
            </text>
            <text x={cardX + 14} y={cy + 40} fontSize={8.5} fill="var(--muted)" fontFamily="var(--font-mono), monospace">
              {card.sig}
            </text>
            {card.lines.map((line, j) => (
              <text
                key={line}
                x={cardX + 14}
                y={cy + 56 + j * 12}
                fontSize={9.5}
                fill="var(--muted)"
                fontFamily="var(--font-sans), system-ui"
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}

      <text
        x={width / 2}
        y={height - 14}
        fontSize={9.5}
        fill="var(--muted)"
        textAnchor="middle"
        fontFamily="var(--font-sans), system-ui"
      >
        {footer}
      </text>
    </svg>
  );
}
