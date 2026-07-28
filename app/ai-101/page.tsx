"use client";

// ─── Legacy route stub ────────────────────────────────────────────────────────
// The tab was renamed AI 101 → "AI & Automation" (Q4, 26 Jul) and the route moved
// to /ai-automation. Anything already printed, bookmarked, or linked at /ai-101
// still has to land somewhere, and a static export has no server-side redirects —
// so this page forwards on the client and offers a manual link if JS is off.
// Safe to delete once no external material points at /ai-101.

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AI101RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ai-automation");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <p className="text-sm font-bold text-primary-dark">This tab is now AI &amp; Automation</p>
      <p className="text-xs text-gray-500 leading-relaxed">
        Taking you there now.
      </p>
      <Link
        href="/ai-automation"
        className="text-xs font-semibold text-primary underline underline-offset-2"
      >
        Go to AI &amp; Automation
      </Link>
    </div>
  );
}
