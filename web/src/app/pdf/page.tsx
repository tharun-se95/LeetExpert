"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Convenience alias: /pdf → full printable handbook. */
export default function PdfRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/print");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
      Opening printable handbook…
    </div>
  );
}
