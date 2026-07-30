"use client";

import Link from "next/link";
import {
  ArrowRight, Layers, Wrench, GraduationCap,
  Zap, Repeat, TrendingUp, ShieldCheck, Lightbulb, ExternalLink, BookOpen, Search,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { LEARNING_PATHS } from "@/content/learningPaths";
import { FEATURES } from "@/lib/features";
import { SUGGEST_PLAY_FORM_URL } from "@/lib/links";
import HomeSections from "@/components/HomeSections";

// ─── Where do you want to start? — the intent doors (route by intent, not device) ─
const paths = [
  {
    href: "/plays",
    icon: Layers,
    title: "Execute a task",
    body: "Get the safe starting move for the situation in front of you. Every play shows its moving parts — fill it in, run it, and check it before your name goes on it.",
  },
  {
    href: "/tools",
    icon: Wrench,
    title: "Find tools & data",
    body: "Browse the approved AI, automation, and data tools — from GenAI.mil to SharePoint — with the full access path to get in. If it's listed, it's approved.",
  },
  {
    href: "/ai-automation",
    icon: GraduationCap,
    title: "Decide how to attack it",
    body: "Twenty seconds to the right move — chat session, agent, automation, or fix the process first. Then go as deep as you have time for.",
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
        <section>
          <ScrollReveal>
            <form action="/search" className="p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting">
              <label className="flex items-center gap-2 rounded-inner bg-silver-tint px-3 py-2">
                <Search size={18} className="text-primary flex-shrink-0" />
                <span className="sr-only">Search the Playbook</span>
                <input
                  name="q"
                  placeholder="Search tasks, tools, AFSCs, sources..."
                  className="w-full bg-transparent text-sm font-semibold text-primary-dark placeholder:text-gray-400 outline-none"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 rounded-badge bg-primary px-3 py-1.5 text-[11px] font-bold text-white"
                >
                  Search
                </button>
              </label>
              <div className="mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1">
                {[
                  ["2A", "2A"],
                  ["Awards", "awards"],
                  ["MFR", "MFR"],
                  ["Tools", "kind=tool"],
                  ["Communities", "kind=community"],
                ].map(([label, value]) => (
                  <Link
                    key={label}
                    href={value.startsWith("kind=") ? `/search?${value}` : `/search?q=${encodeURIComponent(value)}`}
                    className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-badge bg-primary-ghost text-primary"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </form>
          </ScrollReveal>
        </section>

        {/* Where do you want to start? — the intent doors */}
        <section>
          <ScrollReveal>
            <SectionLabel>Where do you want to start?</SectionLabel>
          </ScrollReveal>
          <div className="grid gap-3 md:grid-cols-3">
            {paths.map(({ href, icon: Icon, title, body }) => (
              <ScrollReveal key={href}>
                <Link
                  href={href}
                  className="flex md:flex-col items-center md:items-start gap-3 h-full p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting transition-[transform,border-color,box-shadow] hover:border-primary/30 hover:shadow-raised active:scale-[0.99]"
                >
                  <div className="w-9 h-9 rounded-inner flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-tight text-primary-dark">{title}</p>
                    <p className="text-xs leading-snug mt-0.5 text-gray-500">{body}</p>
                  </div>
                  <ArrowRight size={16} className="flex-shrink-0 md:hidden text-silver" />
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <HomeSections />

        {FEATURES.learningPaths && (
          <section>
            <ScrollReveal>
              <div className="flex items-center justify-between gap-3 mb-2">
                <SectionLabel>Learn what fits your work</SectionLabel>
                <Link href="/communities" className="text-[11px] font-bold text-primary underline underline-offset-2">
                  See all
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {LEARNING_PATHS.map((path) => (
                <ScrollReveal key={path.id}>
                  <Link href={path.href} className="flex flex-col h-full p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting active:scale-[0.99] transition-transform">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <GraduationCap size={18} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{path.audience}</p>
                        <h2 className="text-sm font-bold text-primary-dark leading-tight mt-0.5">{path.label}</h2>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-snug mt-3">{path.focus}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {path.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-badge bg-primary-ghost text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-silver-mid/30">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-silver mb-1">First moves</p>
                      <p className="text-xs text-gray-500 leading-snug">{path.steps.join(", ")}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

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
              <Link href="/ai-automation" className="text-primary font-semibold underline underline-offset-2">AI &amp; Automation</Link>.
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
