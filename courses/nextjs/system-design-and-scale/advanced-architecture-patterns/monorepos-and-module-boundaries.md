---
title: "Monorepos and Enterprise Module Boundaries"
practiceFormat: pr-review
depth: advanced
---

## Why a single Next.js app eventually needs repo-level structure

A growing product rarely stays a single app for long — a design system
shared across a marketing site and a dashboard, an internal admin tool
sharing domain logic with the customer-facing app. A monorepo (managed
with tooling like Turborepo) lets multiple apps and shared packages live
in one repository with coordinated builds and dependency graphs, instead
of duplicating shared code across separate repos or publishing internal
packages to a private registry just to share a button component.

## The boundary that actually matters: shared vs. domain-specific

```
packages/
  ui/              — shared, domain-agnostic design system components
  utils/           — shared, domain-agnostic helpers
apps/
  marketing/       — imports from packages/ui, packages/utils
  dashboard/       — imports from packages/ui, packages/utils
```

The architectural rule a monorepo is supposed to enforce: `packages/ui`
should have **no knowledge of** any specific app's domain logic. A button
component is legitimately shared; a component that already knows about
"orders" or "invoices" is domain-specific and belongs inside the
`dashboard` app itself, not in a package other apps also depend on.

## Why this specific violation is easy to introduce and hard to notice

The violation this lesson's drill is built around: a developer working
inside `packages/ui`, under time pressure, imports a domain-specific
utility from `apps/dashboard` directly — maybe to reuse a formatting
function that happens to already exist there — creating a dependency
that flows the *wrong direction*. Shared packages are supposed to be
depended upon, never to depend on the specific apps that consume them.
This kind of violation typically doesn't break anything immediately; it
breaks the moment a second, unrelated app also tries to depend on
`packages/ui` and pulls in dashboard-specific logic it has no business
needing, or when `dashboard`'s internal code changes and unexpectedly
breaks the supposedly-independent shared package.

## What the practice drill is testing

**Practice (Pull Request Code Review):** you'll review a monorepo
structure where a shared `packages/ui` component has an import reaching
into an app-specific package, correctly identify this as an inverted
dependency direction, and refactor the import boundary to remove the
violation.

## Try it

Review this import inside `packages/ui/Button.tsx`:

```ts
import { formatInvoiceNumber } from "@/apps/dashboard/lib/invoices";
```

Is this a problem?

````reveal Work through the review
Yes — `packages/ui` is meant to be a shared, domain-agnostic design
system that any app can depend on. Reaching into
`apps/dashboard/lib/invoices` inverts that: now `packages/ui` depends on
`dashboard`-specific logic, meaning any *other* app depending on
`packages/ui` transitively pulls in dashboard-specific code it has no
business needing, and any change inside `dashboard` risks silently
breaking a component every app relies on.

The fix: move `formatInvoiceNumber` (or a generic version of whatever
formatting it actually does) into a genuinely shared package like
`packages/utils`, and have both `packages/ui` and `apps/dashboard`
depend on that instead — restoring the correct dependency direction
where shared packages are depended upon, never the reverse.
````
