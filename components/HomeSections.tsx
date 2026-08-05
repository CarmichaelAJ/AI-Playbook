"use client";

// Route stays /dashboard for link stability; everything user-facing is "HQ" (D13).
// HQ is the Airman's headquarters: saved plays + approved launchpads (the personal
// shelf), plus the official picture — strategy stack and dated, translated shelves.
// No metrics, no analytics, nothing tracked.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Layers, Wrench, X, Star, ExternalLink, ShieldCheck, BookOpen, Settings2, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useFavorites } from "@/lib/favorites";
import { FEATURES } from "@/lib/features";
import { DEPTH_COPY, INTENT_COPY, openOnboarding, useOnboarding } from "@/lib/onboarding";
import { STRATEGY_STACK, ALL_LIBRARY, SHELF_FILTERS, LATEST_IDS } from "@/content/library";
import { PLAY_COUNT, SOURCE_COUNT } from "@/content/counts";
import type { ContentItem } from "@/content/schema";

// Approved AI launchpads — the fast front door (Envision has no public URL yet).
const LAUNCHPADS = [
  { name: "GenAI.mil", url: "https://genai.mil", icon: "🛡️", note: "Start here" },
  { name: "Ask Sage", url: "https://chat.asksage.ai", icon: "🧭", note: "Advanced" },
  { name: "Envision", url: "", icon: "🔭", note: "Workstation" },
];

function verifiedLabel(iso?: string): string {
  if (!iso) return "verified";
  const [y, m, d] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `verified ${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}

function PersonalizedBrief() {
  const { profile } = useOnboarding();
  const intent = profile.intent ? INTENT_COPY[profile.intent] : null;
  const depth = profile.depth ? DEPTH_COPY[profile.depth] : null;

  if (!FEATURES.onboarding) return null;

  return (
    <ScrollReveal>
      <div className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-silver uppercase tracking-wider">Your Setup</p>
            <h2 className="text-sm font-bold text-primary-dark mt-1">
              {intent ? intent.label : "Tell Home what to show first"}
            </h2>
            <p className="text-xs text-gray-500 leading-snug mt-1">
              {intent && depth ? `${intent.line} ${depth.line}` : "Pick a starting lane and depth. It stays on this device only."}
            </p>
          </div>
          <button
            type="button"
            onClick={openOnboarding}
            className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-inner bg-primary/10 text-primary"
            aria-label="Change Home setup"
            title="Change Home setup"
          >
            <Settings2 size={17} />
          </button>
        </div>

        {intent ? (
          <Link href={intent.href} className="mt-3 inline-flex items-center gap-2 rounded-badge bg-primary px-3 py-2 text-xs font-bold text-white">
            Start here <ArrowRight size={14} />
          </Link>
        ) : (
          <button type="button" onClick={openOnboarding} className="mt-3 inline-flex items-center gap-2 rounded-badge bg-primary px-3 py-2 text-xs font-bold text-white">
            Set up Home <ArrowRight size={14} />
          </button>
        )}
      </div>
    </ScrollReveal>
  );
}

// ── Zone 1: My Shelf — saved plays/tools + approved launchpads ──
function MyShelf() {
  const { items, remove } = useFavorites();
  return (
    <ScrollReveal>
      <div>
        <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">My Shelf</p>

        {/* Launchpads */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {LAUNCHPADS.map(({ name, url, icon, note }) => {
            const inner = (
              <>
                <span className="text-2xl leading-none">{icon}</span>
                <span className="text-xs font-bold text-primary-dark leading-tight text-center">{name}</span>
                <span className="text-[9px] font-semibold uppercase tracking-wide text-silver">{note}</span>
              </>
            );
            const cls =
              "flex flex-col items-center justify-center gap-1 p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting text-center";
            return url ? (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" className={`${cls} active:bg-primary/5 transition-colors relative`}>
                <ExternalLink size={11} className="absolute top-2 right-2 text-silver" />
                {inner}
              </a>
            ) : (
              <div key={name} className={`${cls} opacity-80`}>{inner}</div>
            );
          })}
        </div>

        {/* Saved plays / tools */}
        {items.length === 0 ? (
          <div className="p-5 rounded-card bg-white border border-dashed border-silver-mid/70 text-center">
            <div className="inline-flex p-2.5 rounded-inner bg-silver-tint mb-2">
              <Star size={18} className="text-silver" />
            </div>
            <p className="text-xs text-gray-500 leading-snug">
              Star a play or tool to pin it here — discover on your phone, run it at your workstation.
            </p>
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {items.map((item) => {
              const Icon = item.type === "play" ? Layers : Wrench;
              const isExternal = item.url.startsWith("http");
              const Inner = (
                <div className="flex items-center gap-3 p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-primary-dark leading-tight truncate">{item.title}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                      {item.type === "play" ? "Play" : "Tool"}
                    </p>
                  </div>
                </div>
              );
              return (
                <div key={item.id} className="flex items-stretch gap-2">
                  {item.url ? (
                    isExternal ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex flex-1 min-w-0">{Inner}</a>
                    ) : (
                      <Link href={item.url} className="flex flex-1 min-w-0">{Inner}</Link>
                    )
                  ) : (
                    Inner
                  )}
                  <button
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${item.title}`}
                    className="flex-shrink-0 w-9 flex items-center justify-center rounded-card bg-white border border-silver-mid/40 text-gray-400 hover:text-danger hover:border-danger/30 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-gray-500 leading-snug px-1 mt-2">
          Saves live on <span className="font-semibold text-primary-dark">this device</span>. No account, nothing leaves your phone.
        </p>
      </div>
    </ScrollReveal>
  );
}

// ── Zone 3: Strategy Stack ──
function StackRung({ doc }: { doc: ContentItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex gap-3 text-left" aria-expanded={open}>
        <div className="w-3 h-3 rounded-full bg-primary mt-1 flex-shrink-0" />
        <div className="min-w-0 flex-1 pb-1">
          <p className="text-xs font-bold text-primary-dark leading-tight">{doc.title}</p>
          <p className="text-[10px] text-silver mt-0.5">
            {doc.issuer} · <span className="text-success-mid font-semibold">✓ {verifiedLabel(doc.verified_as_of)}</span>
          </p>
          {open && (
            <div className="text-[11px] text-primary-dark leading-snug bg-primary-ghost rounded-inner px-2.5 py-2 mt-1.5">
              {doc.translation_line}
              {doc.doc_class === "milestone" && doc.hosted_path ? (
                <Link href={`/reader/${doc.id}`} className="ml-1 font-semibold text-primary underline underline-offset-2 whitespace-nowrap">
                  Read it →
                </Link>
              ) : doc.official_url ? (
                <a href={doc.official_url} target="_blank" rel="noopener noreferrer" className="ml-1 font-semibold text-primary underline underline-offset-2 whitespace-nowrap">
                  Read it →
                </a>
              ) : null}
            </div>
          )}
        </div>
      </button>
      <div className="w-px h-3 bg-silver-mid/60 ml-1.5" aria-hidden="true" />
    </div>
  );
}

function StrategyStack() {
  const rungs = useMemo(() => [...STRATEGY_STACK].sort((a, b) => (a.stack_order ?? 0) - (b.stack_order ?? 0)), []);
  return (
    <ScrollReveal>
      <div className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting">
        <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-3">⛓ The Strategy Stack — where you fit</p>
        {rungs.map((doc) => (
          <StackRung key={doc.id} doc={doc} />
        ))}
        {/* YOU rung — green accent */}
        <div className="flex gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-success mt-1 flex-shrink-0 ring-4 ring-success-tint" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-success-mid leading-tight">YOU — this AI Playbook in your pocket</p>
            <p className="text-[10px] text-silver mt-0.5">Built by Airmen · CSAF-endorsed · no CAC, no account</p>
            <p className="text-[11px] text-gray-500 leading-snug mt-1">
              Everything above lands here: the safe starting move for the task in front of you, today.
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

// ── Zone 4: The Shelves ──
function DocCard({ doc }: { doc: ContentItem }) {
  const latest = LATEST_IDS.includes(doc.id);
  return (
    <div className="p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting">
      {latest && <p className="text-[9px] font-extrabold uppercase tracking-widest text-af-red mb-1">● Latest</p>}
      <p className="text-sm font-bold text-primary-dark leading-tight">{doc.title}</p>
      <p className="text-[10px] text-silver mt-0.5">
        {doc.issuer} · <span className="text-success-mid font-semibold">✓ {verifiedLabel(doc.verified_as_of)}</span>
      </p>
      <p className="text-[11px] text-gray-600 leading-snug mt-1.5">{doc.translation_line}</p>
      {doc.doc_class === "milestone" && doc.hosted_path ? (
        <span className="flex items-center gap-3 mt-1.5">
          <Link href={`/reader/${doc.id}`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
            Read it here <BookOpen size={11} />
          </Link>
          <a href={doc.official_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500">
            Official source <ExternalLink size={11} />
          </a>
        </span>
      ) : doc.official_url ? (
        <a href={doc.official_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-1.5">
          Open official source <ExternalLink size={11} />
        </a>
      ) : null}
    </div>
  );
}

function Shelves() {
  const [filter, setFilter] = useState("all");
  const docs = useMemo(
    () => (filter === "all" ? ALL_LIBRARY : ALL_LIBRARY.filter((d) => d.category === filter)),
    [filter],
  );
  return (
    <ScrollReveal>
      <div>
        <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">The Shelves</p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {SHELF_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-badge border transition-colors ${
                filter === f.id
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-silver-mid/60 text-primary-dark active:bg-primary/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="grid gap-2 md:grid-cols-2 mt-1">
          {docs.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </div>
        <p className="text-[10px] text-gray-400 text-center leading-snug mt-3">
          Curated, translated, dated — a common operating picture, not another SharePoint.
        </p>
      </div>
    </ScrollReveal>
  );
}

export default function HomeSections() {
  const [section, setSection] = useState<"home" | "strategy" | "sources">("home");
  return (
    <section aria-label="Your home setup" className="flex flex-col gap-5">
      <div>
        <p className="text-[10px] font-bold text-silver uppercase tracking-wider">Your Home</p>
        <h2 className="mt-1 text-lg font-bold text-primary-dark">Saved work and official launchpads</h2>
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-inner border border-silver-mid/50 bg-white p-1 shadow-resting" role="tablist" aria-label="Home views">
        {([["home", "My Home"], ["strategy", "Strategy"], ["sources", "Sources"]] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={section === id} onClick={() => setSection(id)} className={`min-h-10 rounded-inner px-2 text-xs font-bold ${section === id ? "bg-primary text-white" : "text-gray-500 hover:bg-primary-ghost"}`}>
            {label}
          </button>
        ))}
      </div>
        {section === "home" && FEATURES.onboarding && <PersonalizedBrief />}
        {section === "home" && <MyShelf />}

        {/* Zone 2: Receipts strip — live counts from the content layer (not user metrics) */}
        <ScrollReveal>
          <div className="rounded-card bg-primary-dark text-white px-4 py-3 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck size={15} className="text-warm flex-shrink-0" />
            <p className="text-[11px] leading-snug">
              <span className="font-bold text-warm">{PLAY_COUNT}</span> deep plays ·{" "}
              <span className="font-bold text-warm">{SOURCE_COUNT}</span>{" "}official sources — every link verified &amp; dated.
            </p>
          </div>
        </ScrollReveal>

        {section === "strategy" && <StrategyStack />}
        {section === "sources" && <Shelves />}
    </section>
  );
}
