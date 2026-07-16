"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown, ChevronUp, Copy, Check, Zap, Clock, ShieldAlert,
  ArrowUpRight, Info, Plug, TrendingUp,
} from "lucide-react";
import { assemblePrompt, type ContentItem } from "@/content/schema";
import { categoryLabel } from "@/content/categories";
import { markPlayRun } from "@/lib/favorites";
import StarToggle from "@/components/StarToggle";

// ─── The five anatomy segments, color-coded from the app's own tokens ─────────
// (Not the mockup's raw hexes — these are the existing #003087 / tech / caution /
// success / af-red semantic tokens, so the card stays on-palette.)
const SEGMENTS = [
  { key: "persona", label: "WHO THE AI IS", color: "var(--color-primary)" },
  { key: "task", label: "THE JOB", color: "var(--color-tech-dim)" },
  { key: "feed", label: "WHAT YOU FEED IT", color: "var(--color-caution)" },
  { key: "format", label: "WHAT COMES BACK", color: "var(--color-success-mid)" },
  { key: "verify", label: "PROVE IT", color: "var(--color-af-red)" },
] as const;

function ConnectorChips({ connectors }: { connectors: string[] }) {
  if (connectors.length === 0) return null;
  return (
    <>
      {connectors.map((c) => (
        <span
          key={c}
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-badge bg-success-tint text-success-mid border border-success/30"
        >
          <Plug size={9} /> {c}
        </span>
      ))}
    </>
  );
}

// One anatomy segment: a colored, tappable label bar reveals the plain-language
// "why"; the body renders the segment's content (text, inputs, or checkboxes).
function Segment({
  color,
  label,
  why,
  children,
}: {
  color: string;
  label: string;
  why?: string;
  children: React.ReactNode;
}) {
  const [showWhy, setShowWhy] = useState(false);
  return (
    <div className="rounded-inner overflow-hidden border border-silver-mid/40 mb-2">
      <button
        type="button"
        onClick={() => why && setShowWhy((v) => !v)}
        className="w-full flex items-center justify-between px-2.5 py-1 text-left"
        style={{ background: color }}
        aria-expanded={why ? showWhy : undefined}
      >
        <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white">{label}</span>
        {why && (
          <span className="text-[9px] font-bold uppercase tracking-wide text-white/80 flex items-center gap-0.5">
            <Info size={10} /> why
          </span>
        )}
      </button>
      {why && showWhy && (
        <p className="text-[11px] leading-snug text-white px-2.5 py-2" style={{ background: color }}>
          <span className="font-bold">WHY: </span>
          {why}
        </p>
      )}
      <div className="text-xs leading-relaxed text-gray-700 px-3 py-2.5 bg-white">{children}</div>
    </div>
  );
}

export default function PlayCard2({ play }: { play: ContentItem }) {
  const [expanded, setExpanded] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [assembled, setAssembled] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showProv, setShowProv] = useState(false);

  const seg = play.body_segments;
  const why = play.segment_why ?? {};

  const handleAssemble = () => setAssembled(assemblePrompt(play, values));

  const handleCopy = async () => {
    const text = assembled ?? assemblePrompt(play, values);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard blocked — the assembled text is on screen to copy by hand */
    }
    markPlayRun(play.id); // lightweight "this play was used" signal (device-local)
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runOn = play.run_on;

  return (
    <div className="rounded-card shadow-resting overflow-hidden bg-white border border-silver-mid/50 transition-all duration-base ease-smooth hover:shadow-hover hover:border-primary/25">
      {/* ── Collapsed header ── */}
      <div className="flex items-start gap-2 p-4">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex-1 min-w-0 text-left"
          aria-expanded={expanded}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-silver">{categoryLabel(play.category)}</p>
          <h3 className="text-sm font-bold text-primary-dark leading-tight mt-0.5">{play.title}</h3>
          {play.situation && (
            <p className="text-[11px] text-gray-500 italic leading-snug mt-1">{play.situation}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-badge bg-primary-tint text-primary">
              {play.level === 3 ? <><TrendingUp size={9} /> Level 3</> : `Level ${play.level ?? 1}`}
            </span>
            {play.time_back && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-badge bg-gray-100 text-gray-500">
                <Clock size={9} /> {play.time_back}
              </span>
            )}
            <ConnectorChips connectors={play.connectors} />
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-badge bg-warm-tint text-warm-dark border border-warm/40">
              ⭐ battle-tested
            </span>
          </div>
        </button>

        <div className="flex items-center gap-0.5 flex-shrink-0 -mr-1.5">
          <StarToggle item={{ type: "play", id: play.id, title: play.title, url: "/plays" }} />
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? "Collapse play" : "Expand play"}
            aria-expanded={expanded}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* ── Expanded body ── */}
      {expanded && seg && (
        <div className="px-4 pb-4 border-t border-silver-mid/40">
          {/* Sensitive plays: CUI caution + disclaimer up top */}
          {play.sensitive && (
            <div className="mt-3 flex items-start gap-2 rounded-inner bg-caution-tint border border-caution/40 px-3 py-2.5">
              <ShieldAlert size={15} className="flex-shrink-0 mt-0.5 text-caution-mid" />
              <p className="text-[11px] font-semibold text-caution-mid leading-snug">
                Higher-sensitivity play. This structures your writing — it is not legal advice. The Area Defense
                Counsel is free, confidential, and outside your chain; seeing them first is always fair.
              </p>
            </div>
          )}

          {/* 1 · Contract line */}
          {play.contract && (
            <div className="mt-3 rounded-r-inner border-l-[3px] border-primary bg-primary-ghost px-3 py-2">
              <p className="text-[11px] text-primary-dark leading-snug">
                <span className="font-bold text-primary">You walk away with: </span>
                {play.contract.replace(/^You walk away with:\s*/i, "")}
              </p>
            </div>
          )}

          {/* 2 · Anatomy segments */}
          <div className="mt-3">
            <Segment color={SEGMENTS[0].color} label={SEGMENTS[0].label} why={why.persona}>
              {seg.persona}
            </Segment>
            <Segment color={SEGMENTS[1].color} label={SEGMENTS[1].label} why={why.task}>
              {seg.task}
            </Segment>

            {/* 3 · FEED — real, device-local inputs */}
            <Segment color={SEGMENTS[2].color} label={SEGMENTS[2].label} why={why.feed}>
              <div className="flex flex-col gap-2">
                {seg.feed_slots.map((slot) => (
                  <label key={slot.key} className="block">
                    <span className="text-[10px] font-semibold text-caution-mid">{slot.label}</span>
                    {slot.multiline ? (
                      <textarea
                        value={values[slot.key] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [slot.key]: e.target.value }))}
                        placeholder={slot.placeholder}
                        rows={2}
                        className="mt-1 w-full rounded-input border border-dashed border-caution/60 bg-caution-tint/40 px-2.5 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-caution focus:bg-white resize-y"
                      />
                    ) : (
                      <input
                        value={values[slot.key] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [slot.key]: e.target.value }))}
                        placeholder={slot.placeholder}
                        className="mt-1 w-full rounded-input border border-dashed border-caution/60 bg-caution-tint/40 px-2.5 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-caution focus:bg-white"
                      />
                    )}
                  </label>
                ))}
                <p className="text-[10px] font-semibold text-caution-mid flex items-center gap-1">
                  🔒 Nothing you type leaves this phone.
                </p>
              </div>
            </Segment>

            <Segment color={SEGMENTS[3].color} label={SEGMENTS[3].label} why={why.format}>
              {seg.format}
            </Segment>

            {/* PROVE IT — the Airman's own checklist (local, not part of the prompt) */}
            <Segment color={SEGMENTS[4].color} label={SEGMENTS[4].label}>
              <div className="flex flex-col gap-1.5">
                {seg.verify.map((item, idx) => (
                  <label key={idx} className="flex items-start gap-2 text-[11px] text-gray-700 leading-snug cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-[color:var(--color-af-red)]" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </Segment>
          </div>

          {/* 4 · See the whole play → assemble verbatim + copy */}
          <button
            onClick={handleAssemble}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-inner text-sm font-bold bg-primary text-white active:bg-primary-dark transition-colors"
          >
            <Zap size={15} /> See the whole play
          </button>
          {assembled && (
            <>
              <pre className="mt-2 rounded-inner bg-primary-deeper text-on-dark text-[11px] leading-relaxed whitespace-pre-wrap font-mono px-3 py-3 max-h-64 overflow-y-auto">
                {assembled}
              </pre>
              <button
                onClick={handleCopy}
                className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-inner text-sm font-bold transition-colors ${
                  copied ? "bg-success text-white" : "bg-success-mid text-white active:opacity-90"
                }`}
              >
                {copied ? <><Check size={15} /> Copied — go run it</> : <><Copy size={15} /> Copy the play</>}
              </button>
            </>
          )}

          {/* 5 · Where to run it + connector setup */}
          {runOn && (
            <div className="mt-3 rounded-inner bg-success-tint border border-success/30 px-3 py-2.5">
              <p className="text-[11px] text-success-mid leading-snug">
                <span className="font-bold">Run it: </span>
                {runOn.surfaces.join(" · ")}
                {runOn.connector_note ? ` — ${runOn.connector_note}` : ""}
              </p>
            </div>
          )}

          {/* 6 · Never-paste bar */}
          {play.never_paste && (
            <div className="mt-3 flex items-start gap-2 rounded-inner bg-danger-tint border border-danger/30 px-3 py-2.5">
              <ShieldAlert size={15} className="flex-shrink-0 mt-0.5 text-danger-mid" />
              <p className="text-[11px] font-semibold text-danger-mid leading-snug">{play.never_paste}</p>
            </div>
          )}

          {/* 8 · Deeper bridge link(s) */}
          {play.deeper_links?.map((d) => (
            <div key={d.label} className="mt-3 rounded-inner bg-primary-ghost border border-primary/20 px-3 py-2.5">
              <p className="text-[11px] font-bold text-primary flex items-center gap-1">
                <ArrowUpRight size={13} /> {d.label}
              </p>
              {d.note && <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{d.note}</p>}
            </div>
          ))}

          {/* 9 · Provenance drawer */}
          <button
            onClick={() => setShowProv((v) => !v)}
            className="mt-3 text-[10px] font-bold uppercase tracking-wide text-silver flex items-center gap-1"
            aria-expanded={showProv}
          >
            <Info size={11} /> Where this play comes from
          </button>
          {showProv && (
            <p className="mt-1.5 rounded-inner bg-warm-tint/50 border border-warm/40 px-3 py-2.5 text-[11px] text-gray-600 leading-snug">
              Adapted from open prompt frameworks proven by tens of thousands of practitioners, plus the community
              workflows Airmen already trust — rebuilt to current guidance and verified 14 Jul 2026. The app shows
              its work; it never asserts authorization or mirrors official document text.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
