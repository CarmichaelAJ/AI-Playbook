"use client";

import { useEffect, useRef } from "react";
import {
  Layers, Wrench, GraduationCap, X, Lightbulb, ExternalLink, Link2, ShieldCheck, PenLine,
} from "lucide-react";
import { SUGGEST_PLAY_FORM_URL } from "@/lib/links";

// The three intent doors — the app routes by intent (Doctrine §4).
const doors = [
  { icon: Layers, label: "Execute a task", role: "Get a vetted starter prompt for the situation in front of you." },
  { icon: Wrench, label: "Find tools & data", role: "See what's approved and the full path to get in." },
  { icon: GraduationCap, label: "Learn how this works", role: "Short reads on working with AI, and where to go deeper." },
];

export default function GuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Esc to dismiss + body scroll-lock while open. Move focus to the close button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="User Guide"
    >
      {/* Backdrop — click-outside to dismiss */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-primary-dark/60 animate-fade-in cursor-default"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-lg max-h-[88vh] overflow-y-auto bg-background rounded-t-card sm:rounded-card shadow-modal animate-fade-up"
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 hero-af text-white px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/af-symbol-white.svg" alt="U.S. Air Force" className="h-6 flex-shrink-0" draggable={false} />
                <div className="w-px h-5 bg-silver/40 flex-shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-on-dark-dim">Airman&apos;s Playbook</span>
              </div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wider">User Guide</h2>
              <p className="text-sm text-on-dark mt-0.5">What the Playbook is, what it isn&apos;t, and where it points you.</p>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              className="flex-shrink-0 p-2 -mr-1 -mt-1 rounded-inner text-on-dark hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 pt-5 flex flex-col gap-5 pb-7">
          {/* What this app is — the conduit identity */}
          <div className="flex gap-3 p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting">
            <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Link2 size={17} className="text-primary" />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              The Playbook is a <span className="font-semibold text-primary-dark">conduit</span> — a single layer over what
              already exists. It connects you to the right play, the right approved tool with the path to get in, and a clear
              way to think about AI. It <span className="font-semibold text-primary-dark">never runs a model, holds your
              data, or replaces a system of record</span> — it points you to GenAI.mil, Ask Sage, Envision, and the official
              resources, and gets out of your way.
            </p>
          </div>

          {/* How to use it — the three doors */}
          <div>
            <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">How to use it</p>
            <div className="flex flex-col gap-2">
              {doors.map(({ icon: Icon, label, role }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting">
                  <div className="w-9 h-9 rounded-inner bg-silver-tint flex items-center justify-center flex-shrink-0">
                    <Icon size={17} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-primary-dark leading-tight">{label}</p>
                    <p className="text-xs text-gray-500 leading-snug">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accountability — plain language */}
          <div className="flex gap-3 p-4 rounded-card bg-primary/5 border border-primary/20">
            <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center flex-shrink-0">
              <PenLine size={17} className="text-primary" />
            </div>
            <p className="text-xs text-primary-dark leading-relaxed">
              <span className="font-bold">AI drafts; you sign.</span> The app hands you a starting move — you own the result.
              Check the work before your name goes on it.
            </p>
          </div>

          {/* Suggest a play — SME contribution door */}
          {/* FLAGGED: suggest-a-play mechanism endorsed in spirit; placement + wording unratified (Doctrine appendix). */}
          <div>
            <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">Help build the Playbook</p>
            {SUGGEST_PLAY_FORM_URL ? (
              <a
                href={SUGGEST_PLAY_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-card bg-primary text-white shadow-resting active:scale-[0.99] transition-transform"
              >
                <div className="w-9 h-9 rounded-inner bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={18} className="text-warm" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-tight">Suggest a play</p>
                  <p className="text-xs text-on-dark leading-snug">Know a task AI could speed up? Propose it for the shelf.</p>
                </div>
                <ExternalLink size={16} className="flex-shrink-0 text-white/70" />
              </a>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting">
                <div className="w-9 h-9 rounded-inner bg-silver-tint flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={18} className="text-silver" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-primary-dark leading-tight">Suggest a play</p>
                  <p className="text-xs text-gray-500 leading-snug">Contribution form opening soon.</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-badge bg-gray-100 text-gray-500 flex-shrink-0">
                  Coming soon
                </span>
              </div>
            )}
          </div>

          {/* OPSEC line */}
          <div className="flex gap-3 p-4 rounded-card bg-warm/10 border border-warm/30">
            <div className="w-9 h-9 rounded-inner bg-warm/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={17} className="text-caution" />
            </div>
            <p className="text-xs text-primary-dark leading-relaxed">
              <span className="font-bold">Stay clean.</span> Never enter classified, CUI, or PII into any AI tool. Use
              generic, unclassified examples, and check every output before your name goes on it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
