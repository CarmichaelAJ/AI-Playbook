"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Copy, Check, Clock, ChevronDown, ChevronUp, ShieldAlert, CheckSquare, Wrench, Timer,
  Lightbulb, ExternalLink, Sparkles, TrendingUp, HeartPulse,
} from "lucide-react";
import {
  AFSC_TILES, playsByCategory, ADVANCED_PLAYS, renderStarter, TIME_BACK_OPTIONS, type Play,
} from "@/lib/plays";
import { addMinutes } from "@/lib/timeBack";
import { markPlayRun } from "@/lib/favorites";
import { SUGGEST_PLAY_FORM_URL } from "@/lib/links";
import RunItRouting from "@/components/RunItRouting";
import StarToggle from "@/components/StarToggle";

// The selected AFSC is persisted in localStorage (the external store) and read via
// useSyncExternalStore so static prerender (null) and the client agree on first paint.
// It is now an OPTIONAL filter, not the entry point (Doctrine §4).
const AFSC_STORAGE_KEY = "ap.selectedAfsc";
const AFSC_EVENT = "ap:afsc-change";

function subscribeAfsc(onChange: () => void): () => void {
  window.addEventListener(AFSC_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(AFSC_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readAfsc(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AFSC_STORAGE_KEY);
}

function writeAfsc(code: string | null): void {
  if (code) window.localStorage.setItem(AFSC_STORAGE_KEY, code);
  else window.localStorage.removeItem(AFSC_STORAGE_KEY);
  window.dispatchEvent(new Event(AFSC_EVENT));
}

function PlayCard({ play }: { play: Play }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logged, setLogged] = useState(false);

  const starter = useMemo(() => renderStarter(play), [play]);
  const advanced = !!play.advanced;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(starter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTimeBack = (minutes: number) => {
    addMinutes(minutes);
    markPlayRun(play.id);
    setLogged(true);
    setTimeout(() => setLogged(false), 2500);
  };

  return (
    <div
      className={`rounded-card shadow-resting overflow-hidden transition-all duration-base ease-smooth ${
        advanced
          ? "bg-primary-dark text-white border border-warm/50 hover:shadow-hover"
          : "bg-white border border-silver-mid/50 hover:shadow-hover hover:border-primary/25"
      }`}
    >
      {/* 1. Title + one-line task — content toggles expand; star + chevron are siblings */}
      <div className="flex items-start gap-2 p-5">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex-1 min-w-0 text-left"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {advanced && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-badge bg-warm text-primary-dark uppercase tracking-wide">
                <Sparkles size={9} /> Advanced
              </span>
            )}
            {play.level === 3 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-badge bg-tech-tint text-tech-dim">
                <TrendingUp size={9} /> Level 3
              </span>
            )}
            {play.lifeGuardrail && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-badge bg-primary-tint text-primary">
                <HeartPulse size={9} /> Prep, not advice
              </span>
            )}
            {play.afsc && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-badge bg-primary-tint text-primary">
                {play.afsc}
              </span>
            )}
            <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-badge ${advanced ? "bg-white/15 text-on-dark" : "bg-gray-100 text-gray-500"}`}>
              <Clock size={9} />
              {play.timeBack}
            </span>
          </div>
          <h3 className={`text-sm font-bold leading-tight ${advanced ? "text-white" : "text-primary-dark"}`}>{play.title}</h3>
          <p className={`text-xs mt-0.5 leading-snug ${advanced ? "text-on-dark" : "text-gray-500"}`}>{play.task}</p>
        </button>

        <div className="flex items-center gap-0.5 flex-shrink-0 -mr-1.5">
          <StarToggle item={{ type: "play", id: play.id, title: play.title, url: "/plays" }} />
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? "Collapse play" : "Expand play"}
            aria-expanded={expanded}
            className={`p-1.5 transition-colors ${advanced ? "text-on-dark hover:text-white" : "text-gray-400 hover:text-primary"}`}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className={`px-5 pb-5 border-t ${advanced ? "border-white/15" : "border-silver-mid/40"}`}>
          {/* Advanced-tier note — the bridge from Level 1 to Levels 2/3 */}
          {advanced && (
            <p className="text-[11px] text-on-dark leading-snug mt-3">
              This is what &ldquo;build a system&rdquo; looks like: an orchestrator that runs several expert lenses at once.
              It&apos;s the on-ramp from a single play to <span className="font-semibold text-white">AI 101</span> depth.
            </p>
          )}

          {/* 2. Copyable starter prompt */}
          <p className={`text-[10px] font-bold uppercase tracking-wider mt-3 mb-1.5 ${advanced ? "text-on-dark-dim" : "text-silver"}`}>
            Starter prompt
          </p>
          <div className={`rounded-inner p-3 border ${advanced ? "bg-primary-deeper border-white/15" : "bg-background border-silver-mid/40"}`}>
            <p className={`text-xs leading-relaxed whitespace-pre-wrap font-mono ${advanced ? "text-on-dark" : "text-gray-700"}`}>{starter}</p>
          </div>
          <button
            onClick={handleCopy}
            className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-inner text-sm font-semibold transition-all ${
              copied ? "bg-success text-white" : advanced ? "bg-warm text-primary-dark active:bg-warm-dark" : "bg-primary text-white active:bg-primary-dark"
            }`}
          >
            {copied ? (
              <><Check size={15} /> Copied to clipboard</>
            ) : (
              <><Copy size={15} /> Copy starter prompt</>
            )}
          </button>

          {/* 3. Approved tool line */}
          <div className={`mt-3 flex items-start gap-2 text-xs ${advanced ? "text-on-dark" : "text-primary-dark"}`}>
            <Wrench size={14} className={`flex-shrink-0 mt-0.5 ${advanced ? "text-warm" : "text-primary"}`} />
            <span className="leading-snug">{play.approvedTool}</span>
          </div>

          {/* 4. Never-paste safety bar */}
          <div className="mt-3 flex items-start gap-2 rounded-inner bg-danger-tint border border-danger/30 px-3 py-2.5">
            <ShieldAlert size={15} className="flex-shrink-0 mt-0.5 text-danger-mid" />
            <p className="text-xs font-semibold text-danger-mid leading-snug">{play.neverPaste}</p>
          </div>

          {/* 5. Check-before-you-sign step */}
          <div className="mt-3 flex items-start gap-2 rounded-inner bg-warm/10 border border-warm/40 px-3 py-2.5">
            <CheckSquare size={15} className="flex-shrink-0 mt-0.5 text-warm-dark" />
            <p className="text-xs font-semibold text-primary-dark leading-snug">
              <span className="uppercase tracking-wide text-[10px] text-warm-dark block">Before you sign</span>
              {play.verify}
            </p>
          </div>

          {/* 6. Where to run it */}
          <RunItRouting />

          {/* 7. Time-back capture */}
          <div className={`mt-4 pt-3 border-t ${advanced ? "border-white/15" : "border-silver-mid/40"}`}>
            {logged ? (
              <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-success py-1.5">
                <Check size={14} /> Logged. See your tally on Home.
              </p>
            ) : (
              <>
                <p className={`flex items-center gap-1.5 text-[11px] font-semibold mb-2 ${advanced ? "text-on-dark" : "text-gray-500"}`}>
                  <Timer size={12} /> This saved me about
                </p>
                <div className="flex gap-2">
                  {TIME_BACK_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleTimeBack(opt.minutes)}
                      className={`flex-1 py-2 rounded-inner text-xs font-bold transition-colors ${
                        advanced
                          ? "bg-white/10 border border-white/25 text-white active:bg-white/20"
                          : "bg-white border border-primary/40 text-primary active:bg-primary/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className={`text-[10px] mt-1.5 text-center ${advanced ? "text-on-dark-dim" : "text-gray-400"}`}>
                  Self-reported estimate, saved on this device only.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlaysPage() {
  const selectedAfsc = useSyncExternalStore(subscribeAfsc, readAfsc, () => null);

  const selectAfsc = (code: string) => {
    writeAfsc(selectedAfsc === code ? null : code);
  };

  const groups = useMemo(() => playsByCategory(selectedAfsc), [selectedAfsc]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="hero-af text-white px-5 pt-5 pb-5 overflow-hidden rounded-b-[24px]">
        <div className="flex items-center gap-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/af-symbol-white.svg" alt="U.S. Air Force" className="h-6 flex-shrink-0" draggable={false} />
          <div className="w-px h-5 bg-silver/40 flex-shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-on-dark-dim">Airman&apos;s Playbook</span>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider mb-1">Plays</h1>
        <p className="text-sm text-on-dark">
          Pick your situation, copy the safe starting move, and go run it.
        </p>
      </div>

      {/* Scope note */}
      <div className="px-4 pt-4">
        <p className="text-xs text-gray-500 font-medium leading-snug">
          v1 covers the situations every Airman meets, E-1 through E-7. Filter by job to add your AFSC&apos;s plays.
        </p>
      </div>

      {/* Optional AFSC filter */}
      <div className="px-4 pt-4">
        <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">Filter by job — optional</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [mask-image:linear-gradient(to_right,black_85%,transparent)]">
          {AFSC_TILES.map((tile) => {
            const active = selectedAfsc === tile.code;
            return (
              <button
                key={tile.code}
                onClick={() => selectAfsc(tile.code)}
                aria-pressed={active}
                className={`flex-shrink-0 min-w-[88px] rounded-card px-3 py-2.5 border text-center transition-all duration-base ease-smooth ${
                  active
                    ? "bg-primary border-primary text-white shadow-resting"
                    : "bg-white border-silver-mid/60 text-primary-dark active:bg-primary/5"
                }`}
              >
                <span className="block font-display font-bold tracking-wider text-sm leading-tight">{tile.code}</span>
                <span className={`block text-[10px] font-semibold leading-tight ${active ? "text-on-dark" : "text-gray-500"}`}>
                  {tile.nickname}
                </span>
              </button>
            );
          })}
        </div>
        {selectedAfsc && (
          <div className="flex items-center gap-3 mt-2">
            <p className="text-[11px] text-gray-500 font-medium">Showing {selectedAfsc} plays alongside the universal set.</p>
            <button onClick={() => selectAfsc(selectedAfsc)} className="text-[11px] text-primary font-semibold">
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Category sections */}
      <div className="px-4 pt-4 flex flex-col gap-6 pb-4">
        {groups.map(({ category, plays }) => (
          <section key={category.id}>
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-primary-dark uppercase tracking-wider">{category.label}</h2>
                {category.level === 3 && (
                  <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-badge bg-tech-tint text-tech-dim uppercase tracking-wide">
                    <TrendingUp size={9} /> Level 3
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">{category.blurb}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {plays.map((play) => (
                <PlayCard key={play.id} play={play} />
              ))}
            </div>
          </section>
        ))}

        {/* Advanced tier — the Council, kept visually distinct */}
        {ADVANCED_PLAYS.length > 0 && (
          <section>
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-primary-dark uppercase tracking-wider">Advanced</h2>
                <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-badge bg-warm text-primary-dark uppercase tracking-wide">
                  <Sparkles size={9} /> Bridges to AI 101
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">Orchestrate several AI experts at once. A step past copy-and-run.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {ADVANCED_PLAYS.map((play) => (
                <PlayCard key={play.id} play={play} />
              ))}
            </div>
          </section>
        )}

        {/* Suggest a play — SME contribution door */}
        {/* FLAGGED: suggest-a-play placement + wording pending product-owner adjudication (Doctrine appendix). */}
        {SUGGEST_PLAY_FORM_URL ? (
          <a
            href={SUGGEST_PLAY_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-card bg-white border border-primary/30 shadow-resting active:bg-primary/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lightbulb size={18} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-primary-dark leading-tight">Suggest a play</p>
              <p className="text-xs text-gray-500 leading-snug">Know a task AI could speed up? Propose it for the shelf.</p>
            </div>
            <ExternalLink size={16} className="flex-shrink-0 text-primary/60" />
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

        <p className="text-[10px] text-gray-400 text-center leading-relaxed px-4 pt-1 pb-2">
          Plays are examples for a concept demonstration. Time figures are self-reported estimates. Check every draft
          before your name goes on it.
        </p>
      </div>
    </div>
  );
}
