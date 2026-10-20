"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import PageHero from "@/components/PageHero";
import { FEATURES } from "@/lib/features";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";

// This page does not contain a second sign-in. The platform build reuses the existing account
// dialog (components/PlatformAccount.tsx); the static build has no account system, so it says so.
export default function SignInPage() {
  const identity = usePlatformIdentity();

  useEffect(() => {
    if (!FEATURES.auth) return;
    const timer = window.setTimeout(openPlatformAccount, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="editorial-page bleed flex flex-col">
      <PageHero eyebrow="Account" title="Sign in">
        <p>
          {FEATURES.auth
            ? "Signing in lets you join communities and save what you use."
            : "This build of the Playbook is public and has no accounts."}
        </p>
      </PageHero>

      <div className="pt-6 pb-10 flex max-w-2xl flex-col gap-5">
        {FEATURES.auth ? (
          identity ? (
            <>
              <p className="text-sm text-gray-700">You are signed in as <strong>@{identity.username}</strong>.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/communities" className="inline-flex min-h-11 items-center rounded-inner bg-primary px-4 text-sm font-bold text-white">Go to Communities</Link>
                <Link href="/profile" className="inline-flex min-h-11 items-center rounded-inner border border-primary/40 px-4 text-sm font-bold text-primary">Open your profile</Link>
              </div>
            </>
          ) : (
            <button type="button" onClick={openPlatformAccount} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-inner bg-primary px-4 text-sm font-bold text-white">
              <ShieldCheck size={17} aria-hidden="true" /> Open sign-in
            </button>
          )
        ) : (
          <>
            <p className="text-sm text-gray-700">
              Communities, plays, tools, and search all work without signing in. Sign-in, membership, and cloud saving are
              part of the platform edition only.
            </p>
            <Link href="/communities" className="inline-flex min-h-11 w-fit items-center rounded-inner bg-primary px-4 text-sm font-bold text-white">Browse Communities</Link>
          </>
        )}

        <p className="rounded-card border border-silver-mid/60 bg-white p-4 text-xs leading-relaxed text-gray-600">
          Sign-in here is for the unclassified Playbook only. The current identity is a development simulation, not an
          approved identity provider, and nothing in this application is approved to handle restricted or classified information.
        </p>
      </div>
    </div>
  );
}
