"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, ShieldCheck, UserRound, X } from "lucide-react";
import { APP_MODE } from "@/lib/features";
import { syncPlatformProfile } from "@/lib/platformApi";
import {
  clearPlatformIdentity,
  PLATFORM_ACCOUNT_OPEN_EVENT,
  savePlatformIdentity,
  usePlatformIdentity,
  type PlatformIdentity,
  type PlatformRole,
} from "@/lib/platformIdentity";

const EMPTY: PlatformIdentity = {
  email: "",
  username: "",
  afsc: "",
  rank: "",
  role: "contributor",
};

export default function PlatformAccount() {
  const identity = usePlatformIdentity();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PlatformIdentity>(EMPTY);
  const [error, setError] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(PLATFORM_ACCOUNT_OPEN_EVENT, show);
    return () => window.removeEventListener(PLATFORM_ACCOUNT_OPEN_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    setDraft(identity ?? EMPTY);
    setError("");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [identity, open]);

  const signIn = async () => {
    if (!/^[^@\s]+@[^@\s]+\.mil$/i.test(draft.email)) {
      setError("Use a .mil email address.");
      return;
    }
    if (!draft.username.trim() || !draft.afsc.trim() || !draft.rank.trim()) {
      setError("Username, AFSC, and rank are required.");
      return;
    }
    const normalized = {
      ...draft,
      email: draft.email.trim().toLowerCase(),
      username: draft.username.trim(),
      afsc: draft.afsc.trim().toUpperCase(),
      rank: draft.rank.trim(),
    };
    try {
      await syncPlatformProfile(normalized);
      savePlatformIdentity(normalized);
      setOpen(false);
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Could not register this identity.");
    }
  };

  if (APP_MODE === "static") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-3 top-9 z-40 flex h-9 max-w-[150px] items-center gap-1.5 rounded-inner border border-silver-mid/70 bg-white px-2.5 text-xs font-bold text-primary-dark shadow-resting transition-colors hover:border-primary/40 hover:bg-primary-ghost"
      >
        <UserRound size={15} className="flex-shrink-0 text-primary" />
        <span className="truncate">{identity ? `@${identity.username}` : "Simulated sign-in"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Platform account">
          <button type="button" aria-label="Close account" onClick={() => setOpen(false)} className="absolute inset-0 bg-primary-deeper/55 backdrop-blur-[2px]" />
          <div className="relative w-full max-w-lg overflow-hidden rounded-card border border-silver-mid/60 bg-background shadow-modal">
            <header className="hero-af flex items-start gap-3 px-5 py-4 text-white">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-dark-dim">Identity provider</p>
                <h2 className="mt-1 text-lg font-bold">Simulated Entra</h2>
                <p className="mt-0.5 text-xs text-on-dark">Local development identity. Replaceable with Microsoft Entra.</p>
              </div>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close account" className="flex h-9 w-9 items-center justify-center rounded-inner hover:bg-white/10">
                <X size={19} />
              </button>
            </header>

            <div className="grid gap-3 p-5">
              <label className="text-xs font-semibold text-gray-700">
                .mil email
                <input value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="first.last@us.af.mil" className="mt-1 w-full rounded-input border border-silver-mid bg-white px-3 py-2.5 text-sm font-normal focus:border-primary focus:outline-none" />
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="text-xs font-semibold text-gray-700">
                  Username
                  <input value={draft.username} onChange={(event) => setDraft((current) => ({ ...current, username: event.target.value }))} placeholder="callsign" className="mt-1 w-full rounded-input border border-silver-mid bg-white px-3 py-2.5 text-sm font-normal focus:border-primary focus:outline-none" />
                </label>
                <label className="text-xs font-semibold text-gray-700">
                  AFSC
                  <input value={draft.afsc} onChange={(event) => setDraft((current) => ({ ...current, afsc: event.target.value }))} placeholder="1D7X1" className="mt-1 w-full rounded-input border border-silver-mid bg-white px-3 py-2.5 text-sm font-normal focus:border-primary focus:outline-none" />
                </label>
                <label className="text-xs font-semibold text-gray-700">
                  Rank
                  <input value={draft.rank} onChange={(event) => setDraft((current) => ({ ...current, rank: event.target.value }))} placeholder="SSgt" className="mt-1 w-full rounded-input border border-silver-mid bg-white px-3 py-2.5 text-sm font-normal focus:border-primary focus:outline-none" />
                </label>
              </div>

              <fieldset>
                <legend className="text-xs font-semibold text-gray-700">Simulated role</legend>
                <div className="mt-1 grid grid-cols-3 gap-1 rounded-inner bg-silver-tint p-1">
                  {(["contributor", "moderator", "admin"] as PlatformRole[]).map((role) => (
                    <button key={role} type="button" onClick={() => setDraft((current) => ({ ...current, role }))} aria-pressed={draft.role === role} className={`min-h-9 rounded-inner px-2 text-xs font-bold capitalize ${draft.role === role ? "bg-white text-primary shadow-resting" : "text-gray-500"}`}>
                      {role}
                    </button>
                  ))}
                </div>
              </fieldset>

              {error && <p role="alert" className="text-xs font-semibold text-danger-mid">{error}</p>}

              <button type="button" onClick={() => void signIn()} className="flex min-h-11 items-center justify-center gap-2 rounded-inner bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark">
                <ShieldCheck size={17} /> {identity ? "Update identity" : "Sign in"}
              </button>

              {identity && (
                <div className="flex flex-wrap items-center gap-2 border-t border-silver-mid/60 pt-3">
                  <Link href="/submit" onClick={() => setOpen(false)} className="rounded-inner bg-primary-ghost px-3 py-2 text-xs font-bold text-primary">Submit</Link>
                  {(identity.role === "moderator" || identity.role === "admin") && (
                    <Link href="/moderation" onClick={() => setOpen(false)} className="rounded-inner bg-primary-ghost px-3 py-2 text-xs font-bold text-primary">Moderation</Link>
                  )}
                  <button type="button" onClick={() => { clearPlatformIdentity(); setOpen(false); }} className="ml-auto inline-flex items-center gap-1.5 px-2 py-2 text-xs font-bold text-danger-mid">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
