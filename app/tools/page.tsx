"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  ExternalLink, ChevronDown, ChevronUp, CreditCard, Clock, Check, CheckCircle2,
  Hourglass, Copy, Layers, PanelRightOpen, ShieldAlert,
} from "lucide-react";
import { TOOLS, SECTIONS, INTENTS, type Tool } from "@/lib/mock/tools";
import { PLAYS } from "@/content/plays";
import { SUGGEST_PLAY_FORM_URL } from "@/lib/links";
import { useToolProgress } from "@/lib/toolProgress";
import StarToggle from "@/components/StarToggle";
import ResponsiveDetailPanel from "@/components/ResponsiveDetailPanel";
import ReportAccessButton from "@/components/ReportAccessButton";
import PlatformFeedTabs from "@/components/PlatformFeedTabs";
import CommunitySubmissionFeed from "@/components/CommunitySubmissionFeed";
import { FEATURES } from "@/lib/features";
import type { PlatformFeedSort } from "@/lib/platformFeed";

// A play card is a lesson; a tool card is a door. Collapsed rows are the shelf,
// the expanded card is the door: one Open CTA, cleared-for line, checkable path
// in, first move, and the plays that run on it.

const PLAY_TITLES: Record<string, string> = Object.fromEntries(
  PLAYS.map((p) => [p.id, p.title]),
);

// Standing safety bar for AI-category doors only — LEXICON §6 blessed line, verbatim.
const NEVER_PASTE_LINE =
  "Never paste: names you haven't sanitized, anything sensitive you haven't cleared, anything classified. When in doubt, leave it out.";

const CHANGED_WINDOW_DAYS = 60;

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]} ${y}`;
}

function isRecentChange(tool: Tool): boolean {
  if (!tool.changed_note) return false;
  const age = Date.now() - new Date(tool.changed_note.date).getTime();
  return age >= 0 && age <= CHANGED_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

// ── Meta chips for THE PATH IN ────────────────────────────────────────────────
function PathMetaChips({ tool }: { tool: Tool }) {
  const chips: { icon: ReactNode; label: string }[] = [];
  if (tool.cac_required) chips.push({ icon: <CreditCard size={10} />, label: "CAC sign-in" });
  if (tool.wait_class === "none") chips.push({ icon: <Check size={10} />, label: "nothing to request" });
  if (tool.wait_class === "minutes") chips.push({ icon: <Clock size={10} />, label: "access in minutes" });
  if (tool.wait_class === "days") chips.push({ icon: <Clock size={10} />, label: "access can take days" });
  return (
    <div className="flex items-center gap-1.5 flex-wrap mb-2">
      {chips.map((c) => (
        <span
          key={c.label}
          className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-badge bg-caution-tint text-caution-mid"
        >
          {c.icon} {c.label}
        </span>
      ))}
    </div>
  );
}

// ── THE PATH IN — checkable steps with persisted state ───────────────────────
function PathIn({
  tool,
  checkedSteps,
  onToggleStep,
}: {
  tool: Tool;
  checkedSteps: number[];
  onToggleStep: (i: number) => void;
}) {
  return (
    <div className="mt-3 rounded-inner border border-caution/30 bg-caution-tint/30 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-caution-mid mb-2">The path in</p>
      <PathMetaChips tool={tool} />
      <ol className="flex flex-col gap-1.5">
        {tool.access_path.map((s, i) => {
          const checked = checkedSteps.includes(i);
          return (
            <li key={i}>
              <button
                onClick={() => onToggleStep(i)}
                className="flex items-start gap-2 text-left w-full min-h-[28px]"
                aria-pressed={checked}
              >
                <span
                  className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center mt-0.5 transition-colors ${
                    checked ? "bg-success border-success text-white" : "bg-white border-silver-mid text-transparent"
                  }`}
                >
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className={`text-xs leading-snug ${checked ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  {s.step}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
        {tool.path_pending_verification ? (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-badge bg-caution-tint text-caution-mid">
            <Hourglass size={10} /> exact steps pending verification
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-badge bg-success-tint text-success-mid">
            <CheckCircle2 size={10} /> path verified {formatDate(tool.path_verified_on)}
          </span>
        )}
        <a
          href={SUGGEST_PLAY_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-semibold text-primary underline underline-offset-2"
        >
          Door moved on you? Report it →
        </a>
      </div>
    </div>
  );
}

// ── FIRST MOVE — neutral, with optional copyable starter prompt ──────────────
function FirstMove({ tool }: { tool: Tool }) {
  const [copied, setCopied] = useState(false);
  if (!tool.first_move) return null;
  const { text, copyable } = tool.first_move;

  const copy = async () => {
    if (!copyable) return;
    try {
      await navigator.clipboard.writeText(copyable);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no feedback */
    }
  };

  return (
    <div className="mt-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-silver mb-1.5">First move</p>
      <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
      {copyable && (
        <div className="mt-2 rounded-inner bg-primary-deeper text-white p-3">
          <p className="text-[11px] leading-relaxed font-mono">{copyable}</p>
          <button
            onClick={copy}
            className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-badge transition-colors ${
              copied ? "bg-success text-white" : "bg-white/15 text-white active:bg-white/25"
            }`}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy prompt"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── RUNS THESE PLAYS — deep-link chips into /plays ───────────────────────────
function RunsThesePlays({ tool }: { tool: Tool }) {
  return (
    <div className="mt-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-silver mb-1.5">Runs these plays</p>
      {tool.play_ids.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tool.play_ids.map((pid) => (
            <a
              key={pid}
              href={`/plays#${pid}`}
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-badge bg-primary-ghost text-primary border border-primary/20 active:bg-primary-tint transition-colors"
            >
              <Layers size={10} /> {PLAY_TITLES[pid] ?? pid}
            </a>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic leading-snug">{tool.no_plays_line}</p>
      )}
    </div>
  );
}

// ── Expanded card — the door ─────────────────────────────────────────────────
function ExpandedTool({ tool }: { tool: Tool }) {
  const { checkedSteps, launcherMode, toggleStep, markOpened } = useToolProgress(tool.id);
  // Launcher mode: returning users get CTA + cleared-for; path folds away.
  const [pathOpen, setPathOpen] = useState(false);
  const showPath = !launcherMode || pathOpen;

  const onToggleStep = useCallback(
    (i: number) => toggleStep(i, tool.access_path.length),
    [toggleStep, tool.access_path.length],
  );

  return (
    <div className="px-4 pb-4 border-t border-silver-mid/40">
      <p className="text-xs text-gray-600 mt-3 leading-relaxed">{tool.description}</p>

      {tool.changed_note && isRecentChange(tool) && (
        <p className="mt-2 text-[11px] leading-snug text-caution-mid">
          <span className="font-bold">Changed {formatDate(tool.changed_note.date)}:</span> {tool.changed_note.text}
        </p>
      )}

      {/* Primary CTA — the biggest element on the card */}
      {tool.launch_url ? (
        <a
          href={tool.launch_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={markOpened}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-inner text-base font-bold bg-primary text-white active:bg-primary-dark transition-colors"
        >
          <ExternalLink size={17} /> Open {tool.name} →
        </a>
      ) : (
        <span className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-inner text-base font-bold bg-gray-100 text-gray-400 cursor-not-allowed">
          <Hourglass size={17} /> Link being verified — check back
        </span>
      )}

      {/* CLEARED FOR — the red accent */}
      <div className="mt-3 rounded-inner border-l-[3px] border-danger bg-danger-tint/30 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-danger-mid mb-1">Cleared for</p>
        <p className="text-xs text-gray-700 leading-snug">{tool.cleared_line}</p>
      </div>

      {/* THE PATH IN — folded behind an accordion once this device knows the way */}
      {launcherMode ? (
        <div className="mt-3">
          <button
            onClick={() => setPathOpen((o) => !o)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-caution-mid min-h-[32px]"
            aria-expanded={pathOpen}
          >
            {pathOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            First time here? See the path in
          </button>
          {showPath && <PathIn tool={tool} checkedSteps={checkedSteps} onToggleStep={onToggleStep} />}
        </div>
      ) : (
        <PathIn tool={tool} checkedSteps={checkedSteps} onToggleStep={onToggleStep} />
      )}

      <FirstMove tool={tool} />
      <RunsThesePlays tool={tool} />

      {/* AI doors only: the standing safety bar */}
      {tool.section === "ai" && (
        <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-snug text-danger-mid bg-danger-tint/40 rounded-inner px-2.5 py-2">
          <ShieldAlert size={12} className="flex-shrink-0 mt-px" /> {NEVER_PASTE_LINE}
        </p>
      )}
    </div>
  );
}

// ── One tool — collapsed dense row, expandable to the door ───────────────────
function ToolRow({ tool, highlighted }: { tool: Tool; highlighted: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      id={`tool-row-${tool.id}`}
      className={`bg-white rounded-card shadow-resting border overflow-hidden transition-all duration-base ease-smooth scroll-mt-4 ${
        highlighted ? "border-warm ring-2 ring-warm/50" : "border-silver-mid/50 hover:border-primary/25 hover:shadow-hover"
      }`}
    >
      <div className="flex items-center gap-2 pl-4 pr-2.5">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left py-3 min-h-[48px]"
          aria-expanded={expanded}
        >
          <span className="text-xl leading-none">{tool.icon}</span>
          <span className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-sm font-bold text-primary-dark">{tool.name}</span>
            {tool.badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-white uppercase tracking-wide">
                {tool.badge}
              </span>
            )}
            {isRecentChange(tool) && (
              <span
                className="w-2 h-2 rounded-full bg-caution flex-shrink-0"
                title={`Changed ${formatDate(tool.changed_note!.date)}`}
                aria-label="Recently changed"
              />
            )}
          </span>
        </button>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <StarToggle item={{ type: "tool", id: tool.id, title: tool.name, url: tool.launch_url }} />
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? "Collapse tool" : "Expand tool"}
            aria-expanded={expanded}
            className="p-2.5 text-gray-400 hover:text-primary transition-colors"
          >
            <span className="lg:hidden">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
            <PanelRightOpen size={16} className="hidden lg:block" />
          </button>
        </div>
      </div>

      {expanded && (
        <ResponsiveDetailPanel
          open={expanded}
          onClose={() => setExpanded(false)}
          title={tool.name}
          eyebrow="Tool"
        >
          {/* Expanded header carries the one-liner the row no longer shows */}
          <p className="px-4 pt-4 pb-2 text-[11px] text-primary font-semibold lg:px-6">{tool.one_liner}</p>
          <ExpandedTool tool={tool} />
          <div className="flex justify-end border-t border-silver-mid/50 px-4 py-2 lg:px-6">
            <ReportAccessButton targetType="tool" targetId={tool.id} targetTitle={tool.name} targetUrl={tool.launch_url} />
          </div>
        </ResponsiveDetailPanel>
      )}
    </div>
  );
}

// ── Coming Soon — muted rows, no stars, expandable honest note ───────────────
function SoonRow({ tool }: { tool: Tool }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-silver-tint/60 rounded-card border border-silver-mid/40 overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 pl-4 pr-2.5 py-3 min-h-[48px] text-left"
        aria-expanded={expanded}
      >
        <span className="text-xl leading-none opacity-60">{tool.icon}</span>
        <span className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span className="text-sm font-bold text-gray-500">{tool.name}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 uppercase tracking-wide">
            Coming Soon
          </span>
        </span>
        <span className="p-2 text-gray-400">
          <span className="lg:hidden">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
          <PanelRightOpen size={16} className="hidden lg:block" />
        </span>
      </button>
      {expanded && (
        <ResponsiveDetailPanel
          open={expanded}
          onClose={() => setExpanded(false)}
          title={tool.name}
          eyebrow="Coming soon"
        >
        <div className="px-4 pb-3 border-t border-silver-mid/40 lg:px-6">
          <p className="text-[11px] text-gray-500 font-semibold mt-2.5">{tool.one_liner}</p>
          <p className="text-xs text-gray-600 leading-relaxed mt-1.5">{tool.description}</p>
          <p className="text-xs text-gray-700 leading-relaxed mt-2 font-medium">{tool.soon_note}</p>
        </div>
        </ResponsiveDetailPanel>
      )}
    </div>
  );
}

export default function ToolsPage() {
  const [activeIntent, setActiveIntent] = useState<string | null>(null);
  const [feedSort, setFeedSort] = useState<PlatformFeedSort>("core");

  const highlightedIds = useMemo(() => {
    if (!activeIntent) return new Set<string>();
    return new Set(INTENTS.find((i) => i.id === activeIntent)?.toolIds ?? []);
  }, [activeIntent]);

  const handleIntent = (id: string) => {
    if (activeIntent === id) {
      setActiveIntent(null);
      return;
    }
    setActiveIntent(id);
    // Scroll to the first matching live row, in section render order.
    const toolIds = INTENTS.find((i) => i.id === id)?.toolIds ?? [];
    const ordered = SECTIONS.flatMap((s) => TOOLS.filter((t) => t.section === s.id));
    const first = ordered.find((t) => toolIds.includes(t.id));
    if (first) {
      document.getElementById(`tool-row-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const liveSections = SECTIONS.filter((s) => s.id !== "soon").map((s) => ({
    ...s,
    tools: TOOLS.filter((t) => t.section === s.id && t.status === "live"),
  }));
  const soonTools = TOOLS.filter((t) => t.status === "coming_soon");

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
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider mb-1">
          Tools
        </h1>
        <p className="text-sm text-on-dark">
          Every tool here is approved for official use. Each card is a door: open it, see what it&apos;s cleared for,
          and walk the path in.
        </p>
      </div>

      {FEATURES.platformDiscoveryFeeds && (
        <PlatformFeedTabs value={feedSort} onChange={setFeedSort} label="Sort tools" />
      )}

      {feedSort === "core" || !FEATURES.platformDiscoveryFeeds ? (
      <>
      {/* Router — "I want to…" intent chips (replaces both filter rows) */}
      <div className="px-4 pt-4">
        <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">I want to…</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
          {INTENTS.map((intent) => (
            <button
              key={intent.id}
              onClick={() => handleIntent(intent.id)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-full border transition-colors min-h-[44px] ${
                activeIntent === intent.id
                  ? "bg-warm border-warm text-primary-dark"
                  : "bg-white border-silver-mid/60 text-gray-600 active:bg-warm-tint"
              }`}
            >
              {intent.label}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts line — counts computed from data */}
      <div className="px-4 pt-2 pb-1">
        <p className="text-xs text-gray-500 font-medium">
          {TOOLS.length} tools · every path dated · re-checked monthly
        </p>
      </div>

      {/* Tool rows, grouped by section */}
      <div className="px-4 flex flex-col gap-5 pb-4 pt-1">
        {liveSections.map((section) => (
          <div key={section.id}>
            <div className="mb-2">
              <h2 className="text-xs font-bold text-primary-dark uppercase tracking-wider">{section.label}</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">{section.blurb}</p>
            </div>
            <div className="flex flex-col gap-2">
              {section.tools.map((tool) => (
                <ToolRow key={tool.id} tool={tool} highlighted={highlightedIds.has(tool.id)} />
              ))}
            </div>
          </div>
        ))}

        {/* Coming Soon — compressed, muted, honest */}
        {soonTools.length > 0 && (
          <div>
            <div className="mb-2">
              <h2 className="text-xs font-bold text-primary-dark uppercase tracking-wider">Coming Soon</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Announced and on the way. Verify availability locally.</p>
            </div>
            <div className="flex flex-col gap-2">
              {soonTools.map((tool) => (
                <SoonRow key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-1 p-3 rounded-inner bg-primary/5 border border-primary/20">
          <p className="text-[10px] text-primary-dark leading-relaxed">
            <span className="font-bold">Reclaim hours:</span> the M365 tools chain together — <span className="font-semibold">Form → List → Power Automate → Power App / Power BI dashboard</span> — to automate the admin work you do by hand today.
          </p>
        </div>

        <div className="mt-1 p-3 rounded-inner bg-warm/10 border border-warm/30">
          <p className="text-[10px] text-primary-dark leading-relaxed">
            <span className="font-bold">OPSEC reminder:</span> Approved does not mean anything goes. Never enter classified information, and follow your local guidance on CUI and PII, even in approved tools.
          </p>
        </div>
      </div>
      </>
      ) : (
        <CommunitySubmissionFeed kind="tool" sort={feedSort} />
      )}
    </div>
  );
}
