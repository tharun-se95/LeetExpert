"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth/client";

export function SignedOutLine() {
  const { data, isPending } = authClient.useSession();
  // Blank while pending: a signed-in learner must never see it flash.
  if (isPending || data) return null;
  return (
    <p className="mt-2 text-sm text-muted">
      Progress is saved on this device.{" "}
      <Link href="/sign-in?next=%2Fcourses%2Fdsa" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
        Sign in to keep it everywhere.
      </Link>
    </p>
  );
}
