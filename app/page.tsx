"use client";

import Link from "next/link";
import {
  Clock, ArrowRight, Layers, Wrench, GraduationCap,
  Zap, Repeat, TrendingUp, ShieldCheck, Lightbulb, ExternalLink, BookOpen,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useTimeBack, formatTimeBack } from "@/lib/timeBack";
import { SUGGEST_PLAY_FORM_URL } from "@/lib/links";

// ─── Where do you want to start? — the intent doors (route by intent, not device) ─
const paths = [
  {
    href: "/plays",
    icon: Layers,
    title: "Execute a task",
    body: "Get the safe starting move for the situation in front of you — evaluations, awards, emails, tough conversations, and more. Copy a vetted starter prompt and go.",
    primary: true,
  },
  {
    href: "/tools",
    icon: Wrench,
    title: "Find tools & data",
    body: "Browse the approved AI, automation, and data tools — from GenAI.mil to SharePoint — with the full access path to get in. If it's listed, it's approved.",
    primary: false,
  },
  {
    href: "/ai-101",
    icon: GraduationCap,
    title: "Learn how this works",
    body: "Short reads on what AI is, how to work with it, and how to go deeper. You can't break anything here.",
    primary: false,
  },
];

// ─── The Three Levels of Engagement — the depth ladder, before you open a play ───
const levels = [
  {
    n: 1,
    icon: Zap,
    title: "Execute",
    body: "Team with AI to finish today's task faster. One play, one prompt, minutes back.",
  },
  {
    n: 2,
    icon: Repeat,
    title: "Systematize",
    body: "The task repeats? Build a reusable agent with saved context and templates, so the result is consistent every time.",
  },
  {
    n: 3,
    icon: TrendingUp,
    title: "Improve & Optimize",
    body: "Question the process itself. Map the flow, find the waste, and build the case to make it better.",
  },
];

// ─── Local, self-reported time-back tally (returning user only) ─────────────────
function TimeReclaimed() {
  const { minutes } = useTimeBack();
  if (minutes <= 0) return null;
  return (
    <ScrollReveal>
      <div className="flex items-center gap-3 p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting">
        <div className="p-2.5 rounded-inner bg-primary/10 flex-shrink-0">
          <Clock size={18} className="text-primary" />
        </div>
        <div className="min-w-0 text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-silver">Time reclaimed so far</p>
          <p className="text-base font-bold text-primary-dark leading-tight">{formatTimeBack(minutes)}</p>
          <p className="text-[10px] text-gray-400 leading-tight">Self-reported estimate, on this device only.</p>
        </div>
      </div>
    </ScrollReveal>
  );
}

function openGuide() {
  window.dispatchEvent(new Event("ap:open-guide"));
}

// Shared eyebrow label for each front-door section.
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">{children}</p>;
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero: what this is (mission statement) + the User Guide door ── */}
      <div className="relative hero-af text-white px-5 pt-8 pb-10 overflow-hidden rounded-b-[24px]">
        <div aria-hidden="true" className="pointer-events-none select-none">
          <div className="hero-blob-1 absolute -top-20 -right-20 w-72 h-72 rounded-full" />
          <div className="hero-blob-2 absolute top-8 -left-24 w-56 h-56 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* AF Symbol — authorized white version */}
          <div className="mb-5 mt-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/af-symbol-white.svg" alt="U.S. Air Force" className="h-16 mx-auto" draggable={false} />
          </div>

          <div className="w-12 h-px bg-warm mb-5" aria-hidden="true" />

          <h1 className="font-display text-4xl font-black uppercase tracking-wider leading-tight mb-2">
            Airman&apos;s<br />Playbook
          </h1>

          {/* FLAGGED: "Built for Airmen, by Airmen" tagline pending product-owner adjudication (Doctrine appendix) */}
          <p className="text-caption font-bold uppercase tracking-widest text-warm mb-4">
            Built for Airmen, by Airmen
          </p>

          <p className="text-base text-white font-semibold leading-snug max-w-[22rem]">
            Your front door to AI at work. Find the move for your situation, the right approved tool,
            and the safe way to run it.
          </p>

          {/* How do I use it — one clearly visible User Guide door (first-visit value, no repeat tax) */}
          <button
            onClick={openGuide}
            className="mt-6 inline-flex items-center gap-2 rounded-badge border border-white/40 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition-colors"
          >
            <BookOpen size={15} /> User Guide
          </button>
        </div>
      </div>

      {/* ── Front-door content — one rhythm for every section ── */}
      <div className="px-4 pt-5 pb-8 flex flex-col gap-7">
        {/* Returning-user tally (only renders once something is logged) */}
        <TimeReclaimed />

        {/* Where do you want to start? — the intent doors */}
        <section>
          <ScrollReveal>
            <SectionLabel>Where do you want to start?</SectionLabel>
          </ScrollReveal>
          <div className="grid gap-3 md:grid-cols-3">
            {paths.map(({ href, icon: Icon, title, body, primary }) => (
              <ScrollReveal key={href}>
                <Link
                  href={href}
                  className={`flex md:flex-col items-center md:items-start gap-3 h-full p-4 rounded-card shadow-resting active:scale-[0.99] transition-transform ${
                    primary
                      ? "bg-primary text-white"
                      : "bg-white border border-silver-mid/40"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-inner flex items-center justify-center flex-shrink-0 ${
                      primary ? "bg-white/20" : "bg-primary/10"
                    }`}
                  >
                    <Icon size={18} className={primary ? "text-warm" : "text-primary"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold leading-tight ${primary ? "text-white" : "text-primary-dark"}`}>
                      {title}
                    </p>
                    <p className={`text-xs leading-snug mt-0.5 ${primary ? "text-on-dark" : "text-gray-500"}`}>
                      {body}
                    </p>
                  </div>
                  <ArrowRight size={16} className={`flex-shrink-0 md:hidden ${primary ? "text-white/70" : "text-silver"}`} />
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Three Levels of Engagement — the depth ladder exists before you open a play */}
        <section>
          <ScrollReveal>
            <SectionLabel>How deep do you want to go?</SectionLabel>
          </ScrollReveal>
          <div className="grid gap-3 md:grid-cols-3">
            {levels.map(({ n, icon: Icon, title, body }) => (
              <ScrollReveal key={n}>
                <div className="flex md:flex-col gap-3 h-full p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting">
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center relative">
                      <Icon size={18} className="text-primary" />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                        {n}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-silver leading-none">Level {n}</p>
                    <h2 className="text-sm font-bold text-primary-dark mt-0.5">{title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal>
            <p className="text-[11px] text-gray-500 mt-2 leading-snug">
              You choose how deep to go — every play runs today at Level 1. See the depth ladder in{" "}
              <Link href="/ai-101" className="text-primary font-semibold underline underline-offset-2">AI 101</Link>.
            </p>
          </ScrollReveal>
        </section>

        {/* Built to be safe by design — security reframed as a trust signal */}
        {/* FLAGGED: safety-by-design block wording pending product-owner adjudication (Doctrine appendix).
            Underlying posture (no CUI/PII/classified, local-only, check your output) is consistent with intent;
            the phrasing — including "verify every output before official use" — is unratified. Left verbatim. */}
        <section>
          <ScrollReveal>
            <SectionLabel>Built to be safe by design</SectionLabel>
          </ScrollReveal>
          <ScrollReveal>
            <div className="flex gap-3 p-4 rounded-card bg-warm/10 border border-warm/30">
              <div className="w-9 h-9 rounded-inner bg-warm/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={18} className="text-caution" />
              </div>
              <p className="text-xs text-primary-dark leading-relaxed">
                Nothing you type is sent, stored, or generated here. The app points you to approved tools and
                reminds you never to paste classified, CUI, or PII — and to verify every output before official use.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Suggest a play — SME contribution door */}
        {/* FLAGGED: suggest-a-play mechanism endorsed in spirit; placement + wording unratified (Doctrine appendix). */}
        <section>
          <ScrollReveal>
            <SectionLabel>Help build the Playbook</SectionLabel>
          </ScrollReveal>
          <ScrollReveal>
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
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
}
