"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Buildings,
  Check,
  CreditCard,
  Globe,
  Lock,
  ShieldCheck,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ReviewerAvatar } from "@/components/landing/ReviewerAvatar";
import { cn } from "@/lib/utils";

const SOCIAL_PROOF_ENGINEERS = [
  "Sarah Chen",
  "Marcus Webb",
  "Elena Rostova",
  "Priya Raman",
];

type Currency = "USD" | "INR" | "EUR" | "GBP";

interface PricingPlan {
  id: "free" | "pro" | "team";
  name: string;
  badge?: string;
  popular?: boolean;
  tagline: string;
  prices: Record<Currency, { amount: string; original?: string; period: string }>;
  features: { text: string; included: boolean; highlight?: boolean }[];
  cta: string;
  ctaHref?: string;
  ctaVariant: "secondary" | "primary" | "outline";
}

const CURRENCIES: { code: Currency; symbol: string; label: string; pppBadge?: string }[] = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "INR", symbol: "₹", label: "INR (₹)", pppBadge: "62% Regional PPP Applied" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
];

const PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free Starter",
    tagline: "Essential foundations to experience zero-install interactive learning.",
    prices: {
      USD: { amount: "$0", period: "forever free" },
      INR: { amount: "₹0", period: "forever free" },
      EUR: { amount: "€0", period: "forever free" },
      GBP: { amount: "£0", period: "forever free" },
    },
    features: [
      { text: "Stage 0 Foundations (3 full modules)", included: true },
      { text: "10 curated starter problems", included: true },
      { text: "In-browser Pyodide Python & Node JS execution", included: true },
      { text: "Socratic AI Coach (3 inquiries / day)", included: true },
      { text: "Interactive Concept Mind Maps", included: true },
      { text: "All 24 Modules & 220+ Lessons", included: false },
      { text: "116+ Curated Interview Problems", included: false },
      { text: "Memory Visualizers (VizPlayer)", included: false },
      { text: "Full Algorithmic Cheatsheets & Pattern Traps", included: false },
      { text: "Timed Mock Interview Mode", included: false },
    ],
    cta: "Start Free Now",
    ctaHref: "/courses/dsa/getting-started/course-introduction",
    ctaVariant: "secondary",
  },
  {
    id: "pro",
    name: "Pro Lifetime",
    badge: "MOST POPULAR · LAUNCH SPECIAL",
    popular: true,
    tagline: "One payment, unrestricted lifetime access to every module, problem, visualizer, and AI coaching.",
    prices: {
      USD: { amount: "$79", original: "$149", period: "one-time payment" },
      INR: { amount: "₹2,999", original: "₹7,999", period: "one-time payment" },
      EUR: { amount: "€75", original: "€139", period: "one-time payment" },
      GBP: { amount: "£65", original: "£119", period: "one-time payment" },
    },
    features: [
      { text: "All 24 Modules & 220+ Lessons", included: true, highlight: true },
      { text: "116+ Curated Interview Problems (Blind 75, NeetCode 150)", included: true, highlight: true },
      { text: "Unlimited Socratic AI Coach (no solution spoilers)", included: true, highlight: true },
      { text: "Interactive Memory Visualizers (VizPlayer)", included: true },
      { text: "Complete Cheatsheets with 60+ Pattern Traps", included: true },
      { text: "5-Stage Interactive Progression Roadmap", included: true },
      { text: "Dual In-Browser Runtimes (Python WASM & Node JS)", included: true },
      { text: "All Future Modules Included (Next.js, System Design)", included: true, highlight: true },
      { text: "Challenge Peers with Custom Complexity Limits", included: true },
      { text: "Timed Mock Interview Mode", included: false },
    ],
    cta: "Get Pro Lifetime Access",
    ctaVariant: "primary",
  },
  {
    id: "team",
    name: "Interview Accelerator",
    badge: "FOR ACTIVE CANDIDATES",
    tagline: "For engineers preparing for upcoming technical screen loops at Tier-1 & FAANG companies.",
    prices: {
      USD: { amount: "$199", original: "$299", period: "one-time payment" },
      INR: { amount: "₹7,499", original: "₹14,999", period: "one-time payment" },
      EUR: { amount: "€185", original: "€279", period: "one-time payment" },
      GBP: { amount: "£160", original: "£240", period: "one-time payment" },
    },
    features: [
      { text: "Everything included in Pro Lifetime", included: true, highlight: true },
      { text: "Timed Mock Interview Mode with strict asymptotic checks", included: true, highlight: true },
      { text: "Sub-500ms AI Reasoning Latency", included: true },
      { text: "Printable PDF Algorithmic Battlecards (24 modules)", included: true },
      { text: "Expensify & Concur Compliant Corporate Invoice", included: true },
      { text: "1-on-1 Code Review feedback on 5 target solutions", included: true, highlight: true },
      { text: "Priority Feature Requests & Roadmap input", included: true },
      { text: "Shared workspace progress tracking (up to 3 seats)", included: true },
    ],
    cta: "Join Interview Accelerator",
    ctaVariant: "outline",
  },
];

const FAQS = [
  {
    question: "Is this really a one-time purchase, or is there a recurring subscription?",
    answer:
      "leetExpert Pro and Accelerator are 100% one-time purchases. You pay once and own permanent lifetime access to all 24 current modules, future module expansions, problem updates, and runtime enhancements with zero recurring fees.",
  },
  {
    question: "How does the Socratic AI Coach work without spoiling solutions?",
    answer:
      "Unlike generic chatbots that output full code, our coach isolates the failing invariant or mathematical edge case (e.g. 'Notice what happens when k > len(nums)'). It guides your mental model toward the optimal time/space bounds without giving away the answer.",
  },
  {
    question: "Can I get this reimbursed by my employer's learning budget?",
    answer:
      "Yes. Most software engineers expense leetExpert using their annual education, conference, or professional development stipends. We provide itemized, VAT/GST compliant receipts with company name details.",
  },
  {
    question: "How do Python and JavaScript run in the browser without setup?",
    answer:
      "We compile real Python 3.12 via WebAssembly (Pyodide WASM) and execute modern JavaScript/TypeScript in isolated V8 browser workers. Unit tests execute client-side in milliseconds with zero servers, zero Docker containers, and zero latency.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "We offer an unconditional 7-day money-back guarantee. If leetExpert does not noticeably elevate your algorithmic confidence and problem-solving speed, simply email us for a prompt, courteous full refund.",
  },
];

export function PricingClient() {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [checkoutModal, setCheckoutModal] = useState<PricingPlan | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"checkout" | "success">("checkout");

  const currentCurrency = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]!;

  const handleOpenCheckout = (plan: PricingPlan) => {
    if (plan.ctaHref) return;
    setCheckoutModal(plan);
    setCheckoutStep("checkout");
  };

  return (
    <div className="relative min-h-screen py-10 lg:py-16">
      {/* Ambient background glow to eliminate washed-out flat canvas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[650px] overflow-hidden opacity-70 dark:opacity-35"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% -10%, color-mix(in srgb, var(--good) 20%, transparent), color-mix(in srgb, var(--info) 14%, transparent) 55%, transparent 85%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Pricing" },
          ]}
        />

        {/* Hero Header */}
        <div className="mt-8 text-center sm:mt-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-good/40 bg-good-surface/40 px-3.5 py-1 text-xs font-mono font-medium tracking-wide text-good">
            <Sparkle className="h-3.5 w-3.5" weight="fill" />
            <span>TRANSPARENT VALUE · NO RECURRING SUBSCRIPTIONS</span>
          </div>

          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground uppercase">
            Invest in Algorithmic Mastery.
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg sm:text-xl leading-relaxed text-muted">
            Master asymptotic analysis, data structures, and LeetCode-grade problem solving with zero-install browser execution, real-time memory visualizers, and non-leaking Socratic guidance.
          </p>

          {/* Regional Currency & PPP Selector */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center rounded-[length:var(--radius-md)] border border-border bg-surface p-1">
              <Globe className="ml-2.5 mr-2 h-4 w-4 text-muted" aria-hidden />
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={cn(
                    "rounded-[length:var(--radius-xs)] px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer",
                    currency === c.code
                      ? "bg-pop/15 font-semibold text-mark"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {c.code}
                </button>
              ))}
            </div>

            {currentCurrency.pppBadge ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-good/40 bg-good-surface/40 px-3 py-1 text-[11px] font-mono font-medium text-good">
                <Check className="h-3 w-3" weight="bold" />
                <span>{currentCurrency.pppBadge}</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {PLANS.map((plan) => {
            const price = plan.prices[currency];

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col justify-between rounded-[length:var(--radius-lg)] border p-8 sm:p-10 lg:p-12 transition-all duration-[var(--dur)]",
                  plan.popular
                    ? "border-good/60 bg-gradient-to-b from-elevated via-elevated to-good-surface/15 shadow-elevation ring-1 ring-good/40"
                    : plan.id === "team"
                      ? "border-warn/40 bg-gradient-to-b from-elevated via-elevated to-warn-surface/10 hover:border-warn/70"
                      : "border-border bg-elevated/70 hover:border-border/90",
                )}
              >
                {plan.badge ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase shadow-elevation",
                        plan.popular
                          ? "border border-good-line/60 bg-good text-on-pop badge-glow-good"
                          : "border border-warn-line/60 bg-warn-surface text-warn badge-glow-warn",
                      )}
                    >
                      {plan.badge}
                    </span>
                  </div>
                ) : null}

                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground uppercase">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted min-h-[2.5rem]">
                    {plan.tagline}
                  </p>

                  <div className="mt-6 flex items-baseline gap-2 border-b border-border/80 pb-6">
                    <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
                      {price.amount}
                    </span>
                    {price.original ? (
                      <span className="font-mono text-base line-through text-muted">
                        {price.original}
                      </span>
                    ) : null}
                    <span className="text-sm font-mono text-muted">/ {price.period}</span>
                  </div>

                  <ul className="mt-8 space-y-4 text-sm">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feat.included ? (
                          <Check
                            className="h-4 w-4 shrink-0 mt-0.5 text-good"
                            weight="bold"
                          />
                        ) : (
                          <X className="h-4 w-4 shrink-0 mt-0.5 text-muted/30" />
                        )}
                        <span
                          className={cn(
                            feat.included
                              ? feat.highlight
                                ? "font-medium text-foreground"
                                : "text-muted"
                              : "text-muted/30 line-through",
                          )}
                        >
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  {plan.ctaHref ? (
                    <Link
                      href={plan.ctaHref}
                      className={cn(
                        "inline-flex w-full items-center justify-center gap-2 rounded-[length:var(--radius-md)] px-4 py-3.5 text-sm sm:text-base font-semibold tracking-wide transition-all cursor-pointer",
                        plan.ctaVariant === "primary"
                          ? "bg-accent text-on-pop hover:opacity-95"
                          : "border border-border bg-surface text-foreground hover:bg-pop/15",
                      )}
                    >
                      <span>{plan.cta}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(plan)}
                      className={cn(
                        "inline-flex w-full items-center justify-center gap-2 rounded-[length:var(--radius-md)] px-4 py-3.5 text-sm sm:text-base font-semibold tracking-wide transition-all cursor-pointer shadow-elevation",
                        plan.popular
                          ? "bg-good text-on-pop hover:brightness-105 hover:scale-[1.01]"
                          : "border border-border bg-surface text-foreground hover:bg-pop/15",
                      )}
                    >
                      <span>{plan.cta}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  {plan.popular ? (
                    <div className="mt-4 flex items-center justify-center gap-2.5">
                      <div className="flex -space-x-2 overflow-hidden">
                        {SOCIAL_PROOF_ENGINEERS.map((name) => (
                          <div
                            key={name}
                            className="inline-block rounded-full ring-2 ring-elevated overflow-hidden"
                            title={name}
                          >
                            <ReviewerAvatar name={name} size={28} />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-muted">
                        Joined by 10,000+ senior engineers
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* 7-Day Money-Back Guarantee Seal */}
        <div className="mt-14 rounded-[length:var(--radius-lg)] border border-good/40 bg-good-surface/30 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-good/50 bg-good-surface text-good shadow-elevation">
              <ShieldCheck className="h-6 w-6" weight="fill" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-display text-base font-bold tracking-tight text-foreground uppercase">
                100% Risk-Free 7-Day Money-Back Guarantee
              </h4>
              <p className="text-xs leading-relaxed text-muted">
                Experience the interactive tracers, problem sandboxes, and Socratic coach. If your algorithmic intuition and problem-solving speed don&apos;t noticeably level up in 7 days, get a full, prompt refund with no questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Corporate Reimbursement Note */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-[length:var(--radius-md)] border border-info/40 bg-info-surface/30 px-6 py-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <Buildings className="h-5 w-5 text-info" aria-hidden />
            <p className="text-xs text-muted">
              <strong className="text-foreground">Expensable with your learning stipend:</strong> Most engineers expense leetExpert via Concur, Expensify, or corporate educational budgets.
            </p>
          </div>
          <span className="font-mono text-[11px] font-semibold text-info">
            Receipts with Tax IDs Included
          </span>
        </div>

        {/* FAQs */}
        <div className="mt-16 sm:mt-24 border-t border-border pt-12">
          <div className="text-center">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-mark uppercase">
              Common Questions
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground uppercase sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl divide-y divide-border">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="py-6">
                <h3 className="font-display text-sm font-bold tracking-tight text-foreground uppercase sm:text-base">
                  {faq.question}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulated Instant Checkout Modal */}
      {checkoutModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-[length:var(--radius-lg)] border border-border bg-background p-6 shadow-elevation">
            <button
              type="button"
              onClick={() => setCheckoutModal(null)}
              className="absolute right-4 top-4 rounded-[length:var(--radius-xs)] p-1 text-muted transition hover:bg-surface hover:text-foreground cursor-pointer"
              aria-label="Close checkout"
            >
              <X className="h-5 w-5" />
            </button>

            {checkoutStep === "checkout" ? (
              <>
                <div className="flex items-center gap-2 text-mark font-mono text-xs font-semibold uppercase">
                  <CreditCard className="h-4 w-4" />
                  <span>Secure 256-bit Checkout</span>
                </div>

                <h3 id="checkout-title" className="mt-3 font-display text-xl font-bold tracking-tight text-foreground uppercase">
                  {checkoutModal.name}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {checkoutModal.tagline}
                </p>

                <div className="mt-5 rounded-[length:var(--radius-md)] border border-border bg-surface/50 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-foreground">Total Due:</span>
                    <span className="font-mono text-2xl font-bold text-foreground">
                      {checkoutModal.prices[currency].amount}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                    <span>One-time purchase · Lifetime access</span>
                    <span>No recurring charges</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("success")}
                    className="flex w-full items-center justify-center gap-2 rounded-[length:var(--radius-md)] bg-accent px-4 py-3 text-xs font-semibold text-on-pop transition hover:opacity-95 cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Pay {checkoutModal.prices[currency].amount} &amp; Unlock Instantly</span>
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-mark" />
                    <span>Protected by 7-Day Money-Back Guarantee</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pop/20 text-mark">
                  <Check className="h-6 w-6" weight="bold" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground uppercase">
                  Welcome to {checkoutModal.name}!
                </h3>
                <p className="mt-2 text-xs text-muted">
                  Your lifetime access has been provisioned. All 24 modules, 116 problems, and unlimited Socratic AI coaching are now active.
                </p>
                <div className="mt-6">
                  <Link
                    href="/courses/dsa"
                    onClick={() => setCheckoutModal(null)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[length:var(--radius-md)] bg-accent px-4 py-2.5 text-xs font-semibold text-on-pop hover:opacity-95"
                  >
                    <span>Enter Curriculum Hub</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
