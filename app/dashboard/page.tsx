"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardCompatibilityPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="px-4 py-12 text-center">
      <p className="text-sm font-bold text-primary-dark">This page has moved into Home.</p>
      <Link href="/" className="mt-3 inline-flex rounded-inner bg-primary px-4 py-2.5 text-xs font-bold text-white">
        Open Home
      </Link>
    </div>
  );
}
