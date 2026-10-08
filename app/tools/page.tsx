"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight, ExternalLink, ChevronDown, ChevronUp, CreditCard, Clock, Check,
  CheckCircle2, Hourglass, Copy, Layers, Search, ShieldAlert, X,
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
import PageHero from "@/components/PageHero";
import { playHref } from "@/lib/communityGraph";
import styles from "./tools.module.css";

const PLAY_TITLES: Record<string, string> = Object.fromEntries(
  PLAYS.map((p) => [p.id, p.title]),
);

// LEXICON §6 blessed line, verbatim.
const NEVER_PASTE_LINE =
  "Never paste: names you haven't sanitized, anything sensitive you haven't cleared, anything classified. When in doubt, leave it out.";

const CHANGED_WINDOW_DAYS = 60;
const LIVE_TOOLS = TOOLS.filter((tool) => tool.status === "live");
const VERIFIED_TOOLS = LIVE_TOOLS.filter((tool) => !tool.path_pending_verification);
const LATEST_VERIFICATION = VERIFIED_TOOLS.map((tool) => tool.path_verified_on).sort().at(-1);
const PENDING_COUNT = LIVE_TOOLS.filter((tool) => tool.path_pending_verification).length;

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

function PathStatus({ tool }: { tool: Tool }) {
  return (
    <span className={styles.pathStatus}>
      {tool.path_pending_verification ? (
        <><Hourglass size={14} aria-hidden="true" /> Exact steps pending verification</>
      ) : (
        <><CheckCircle2 size={14} aria-hidden="true" /> Path verified <time dateTime={tool.path_verified_on}>{formatDate(tool.path_verified_on)}</time></>
      )}
    </span>
  );
}

function PathMetaChips({ tool }: { tool: Tool }) {
  const chips: { icon: ReactNode; label: string }[] = [];
  if (tool.cac_required) chips.push({ icon: <CreditCard size={14} />, label: "CAC sign-in" });
  if (tool.wait_class === "none") chips.push({ icon: <Check size={14} />, label: "nothing to request" });
  if (tool.wait_class === "minutes") chips.push({ icon: <Clock size={14} />, label: "access in minutes" });
  if (tool.wait_class === "days") chips.push({ icon: <Clock size={14} />, label: "access can take days" });
  return (
    <div className={styles.pathMeta}>
      {chips.map((chip) => (
        <span key={chip.label}><span aria-hidden="true">{chip.icon}</span>{chip.label}</span>
      ))}
    </div>
  );
}

function PathIn({
  tool, checkedSteps, onToggleStep,
}: {
  tool: Tool;
  checkedSteps: number[];
  onToggleStep: (i: number) => void;
}) {
  return (
    <section className={styles.pathSection}>
      <h3 className={styles.detailLabel}>The path in</h3>
      <PathMetaChips tool={tool} />
      <p className={styles.progress} role="status">{checkedSteps.length} of {tool.access_path.length} steps complete on this device</p>
      <ol className={styles.steps}>
        {tool.access_path.map((step, i) => {
          const checked = checkedSteps.includes(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onToggleStep(i)}
                className={styles.step}
                aria-pressed={checked}
              >
                <span className={styles.checkbox} aria-hidden="true">{checked && <Check size={14} />}</span>
                <span>{step.step}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className={styles.pathFooter}>
        <PathStatus tool={tool} />
        <a href={SUGGEST_PLAY_FORM_URL} target="_blank" rel="noopener noreferrer">
          Door moved on you? Report it →
        </a>
      </div>
    </section>
  );
}

function FirstMove({ tool }: { tool: Tool }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  if (!tool.first_move) return null;
  const { text, copyable } = tool.first_move;

  const copy = async () => {
    if (!copyable) return;
    try {
      await navigator.clipboard.writeText(copyable);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <section className={styles.detailSection}>
      <h3 className={styles.detailLabel}>First move</h3>
      <p>{text}</p>
      {copyable && (
        <div className={styles.prompt}>
          <p>{copyable}</p>
          <button type="button" onClick={copy} className={styles.copyButton}>
            {copyState === "copied" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {copyState === "copied" ? "Copied" : "Copy prompt"}
          </button>
          <p role="status" className={styles.copyStatus}>
            {copyState === "error" ? "Could not copy. Select the prompt above and copy it manually." : copyState === "copied" ? "Prompt copied to clipboard." : ""}
          </p>
        </div>
      )}
    </section>
  );
}

function RunsThesePlays({ tool }: { tool: Tool }) {
  return (
    <section className={styles.detailSection}>
      <h3 className={styles.detailLabel}>Runs these plays</h3>
      {tool.play_ids.length > 0 ? (
        <div className={styles.playLinks}>
          {tool.play_ids.map((pid) => (
            <a key={pid} href={playHref(pid)}>
              <Layers size={14} aria-hidden="true" /> {PLAY_TITLES[pid] ?? pid}
            </a>
          ))}
        </div>
      ) : <p>{tool.no_plays_line}</p>}
    </section>
  );
}

function ExpandedTool({ tool }: { tool: Tool }) {
  const { checkedSteps, launcherMode, toggleStep, markOpened } = useToolProgress(tool.id);
  const [pathOpen, setPathOpen] = useState(false);
  const showPath = !launcherMode || pathOpen;
  const onToggleStep = useCallback(
    (i: number) => toggleStep(i, tool.access_path.length),
    [toggleStep, tool.access_path.length],
  );

  return (
    <div className={styles.detail}>
      <p className={styles.detailIntro}>{tool.one_liner}</p>
      <p>{tool.description}</p>
      {tool.changed_note && isRecentChange(tool) && (
        <p className={styles.changedNote}>
          <strong>Changed {formatDate(tool.changed_note.date)}:</strong> {tool.changed_note.text}
        </p>
      )}

      {tool.launch_url ? (
        <a href={tool.launch_url} target="_blank" rel="noopener noreferrer" onClick={markOpened} className={styles.launchButton}>
          <ExternalLink size={17} aria-hidden="true" /> Open {tool.name} →
        </a>
      ) : (
        <p className={styles.unavailable}><Hourglass size={17} aria-hidden="true" /> Link being verified — check back</p>
      )}

      <section className={styles.cleared}>
        <h3 className={styles.detailLabel}>Cleared for</h3>
        <p>{tool.cleared_line}</p>
      </section>

      {launcherMode && (
        <button
          type="button"
          onClick={() => setPathOpen((open) => !open)}
          className={styles.pathToggle}
          aria-expanded={pathOpen}
          aria-controls={`tool-path-${tool.id}`}
        >
          {pathOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          First time here? See the path in
        </button>
      )}
      <div id={`tool-path-${tool.id}`} hidden={!showPath}>
        <PathIn tool={tool} checkedSteps={checkedSteps} onToggleStep={onToggleStep} />
      </div>
      <FirstMove tool={tool} />
      <RunsThesePlays tool={tool} />
      {tool.section === "ai" && (
        <p className={styles.safetyLine}><ShieldAlert size={18} aria-hidden="true" />{NEVER_PASTE_LINE}</p>
      )}
      <div className={styles.report}>
        <ReportAccessButton targetType="tool" targetId={tool.id} targetTitle={tool.name} targetUrl={tool.launch_url} />
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const [expanded, setExpanded] = useState(false);
  const comingSoon = tool.status === "coming_soon";
  return (
    <article id={`tool-row-${tool.id}`} className={`${styles.card} ${comingSoon ? styles.soonCard : ""}`}>
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={styles.badge}>{comingSoon ? "Coming Soon" : tool.badge ?? "Live tool"}</span>
          {!comingSoon && (
            <StarToggle item={{ type: "tool", id: tool.id, title: tool.name, url: tool.launch_url }} className={styles.star} />
          )}
        </div>
        <h3>{tool.name}</h3>
        <p className={styles.oneLiner}>{tool.one_liner}</p>
        <div className={styles.cardBottom}>
          {comingSoon ? <p className={styles.pathStatus}><Hourglass size={14} aria-hidden="true" /> Verify availability locally</p> : <PathStatus tool={tool} />}
          {isRecentChange(tool) && <p className={styles.recentChange}>Recent change · {formatDate(tool.changed_note!.date)}</p>}
          <button
            type="button"
            className={styles.viewButton}
            onClick={() => setExpanded((open) => !open)}
            aria-label={`${expanded ? "Close" : "View"} ${tool.name} ${comingSoon ? "details" : "access and details"}`}
            aria-expanded={expanded}
            aria-controls={`tool-details-${tool.id}`}
          >
            <span>{expanded ? "Close details" : comingSoon ? "View details" : "View tool"}<span className={styles.actionContext}>{!expanded && !comingSoon ? "Access & details" : ""}</span></span>
            {expanded ? <ChevronUp size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div id={`tool-details-${tool.id}`} hidden={!expanded} className={styles.detailHost}>
        {expanded && (
          <ResponsiveDetailPanel open={expanded} onClose={() => setExpanded(false)} title={tool.name} eyebrow={comingSoon ? "Coming soon" : "Tool"}>
            {comingSoon ? (
              <div className={styles.detail}>
                <p className={styles.detailIntro}>{tool.one_liner}</p>
                <p>{tool.description}</p>
                <p className={styles.soonNote}>{tool.soon_note}</p>
              </div>
            ) : <ExpandedTool tool={tool} />}
          </ResponsiveDetailPanel>
        )}
      </div>
    </article>
  );
}

export default function ToolsPage() {
  const [activeIntent, setActiveIntent] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [feedSort, setFeedSort] = useState<PlatformFeedSort>("core");
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredTools = useMemo(() => {
    const intent = INTENTS.find((item) => item.id === activeIntent);
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return TOOLS.filter((tool) => {
      if (intent && !intent.toolIds.includes(tool.id)) return false;
      const category = SECTIONS.find((section) => section.id === tool.section);
      const keywords = INTENTS.filter((item) => item.toolIds.includes(tool.id)).map((item) => `${item.id} ${item.label}`);
      const searchable = [tool.name, category?.label, tool.description, tool.one_liner, tool.badge, ...keywords].join(" ").toLocaleLowerCase();
      return words.every((word) => searchable.includes(word));
    });
  }, [activeIntent, query]);

  const resetFilters = () => {
    setActiveIntent(null);
    setQuery("");
  };
  const hasFilters = activeIntent !== null || query.trim().length > 0;

  return (
    <div className="bleed">
      <PageHero eyebrow="The tool directory" title="Tools" photo="cyber-operator" position="60% 38%">
        <p>Every tool here is approved for official use. Each card is a door: open it, see what it&apos;s cleared for, and walk the path in.</p>
        <dl className={styles.metadata}>
          <div><dt>Live tools</dt><dd>{LIVE_TOOLS.length}</dd></div>
          <div><dt>Coming soon</dt><dd>{TOOLS.length - LIVE_TOOLS.length}</dd></div>
          {LATEST_VERIFICATION && <div><dt>Latest path verification</dt><dd><time dateTime={LATEST_VERIFICATION}>{formatDate(LATEST_VERIFICATION)}</time></dd></div>}
        </dl>
        <p className={styles.verificationNote}>{VERIFIED_TOOLS.length} verified paths · {PENDING_COUNT} pending verification. Check each tool for its dated access guidance.</p>
      </PageHero>
      <div className={styles.page}>

      {FEATURES.platformDiscoveryFeeds && (
        <div className={styles.feedTabs}><PlatformFeedTabs value={feedSort} onChange={setFeedSort} label="Sort tools" /></div>
      )}

      {feedSort === "core" || !FEATURES.platformDiscoveryFeeds ? (
        <>
          <section className={styles.discovery} aria-label="Find a tool">
            <div className={styles.searchHeading}>
              <label htmlFor="tools-search">Find your next tool</label>
              <p id="tools-search-help">Search by name, category, or task.</p>
            </div>
            <div className={styles.searchBox}>
              <Search size={21} aria-hidden="true" />
              <input
                ref={searchRef}
                id="tools-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “research” or “Power Automate”"
                aria-describedby="tools-search-help"
                aria-controls="tool-directory"
              />
              {query && (
                <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); searchRef.current?.focus(); }}>
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </div>
            <fieldset className={styles.intents}>
              <legend>I want to…</legend>
              <div className={styles.intentButtons}>
                <button type="button" aria-pressed={activeIntent === null} aria-controls="tool-directory" onClick={() => setActiveIntent(null)}>All tools</button>
                {INTENTS.map((intent) => (
                  <button
                    key={intent.id}
                    type="button"
                    aria-pressed={activeIntent === intent.id}
                    aria-controls="tool-directory"
                    onClick={() => setActiveIntent((current) => current === intent.id ? null : intent.id)}
                  >{intent.label}</button>
                ))}
              </div>
            </fieldset>
          </section>

          <div className={styles.resultsBar}>
            <p id="tools-result-count" role="status" aria-live="polite" aria-atomic="true">
              <strong>{filteredTools.length}</strong> of {TOOLS.length} tools{hasFilters ? " match your filters" : " in the directory"}
            </p>
            {hasFilters && <button type="button" className={styles.resetButton} onClick={resetFilters}>Reset filters <X size={14} aria-hidden="true" /></button>}
          </div>

          <div id="tool-directory" className={styles.directory} aria-describedby="tools-result-count">
            {SECTIONS.map((section, index) => {
              const tools = filteredTools.filter((tool) => tool.section === section.id);
              if (!tools.length) return null;
              return (
                <section key={section.id} className={styles.category} aria-labelledby={`category-${section.id}`}>
                  <header className={styles.categoryHeader}>
                    <p className={styles.sectionNumber}>{String(index + 1).padStart(2, "0")} <span aria-hidden="true">/</span></p>
                    <h2 id={`category-${section.id}`}>{section.label}</h2>
                    <p>{section.blurb}</p>
                    <span className={styles.categoryCount}>{tools.length} {tools.length === 1 ? "tool" : "tools"}</span>
                  </header>
                  <div className={styles.toolGrid}>{tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
                </section>
              );
            })}
            {filteredTools.length === 0 && (
              <section className={styles.emptyState}>
                <h2>No tools found</h2>
                <p>Try a different name or task, or reset your search and task filter to see every tool.</p>
                <button type="button" className={styles.primaryButton} onClick={() => { resetFilters(); searchRef.current?.focus(); }}>Show all tools <ArrowRight size={17} aria-hidden="true" /></button>
              </section>
            )}
          </div>

          <section className={styles.workflow} aria-labelledby="workflow-title">
            <div className={styles.workflowIntro}>
              <p className={styles.eyebrow}>The M365 workflow</p>
              <h2 id="workflow-title">Reclaim hours</h2>
              <p>The M365 tools chain together to automate the admin work you do by hand today.</p>
            </div>
            <ol className={styles.workflowChain} aria-label="Form → List → Power Automate → Power App / Power BI dashboard">
              {["Form", "List", "Power Automate", "Power App / Power BI dashboard"].map((step, index) => (
                <li key={step}>
                  <span className={styles.workflowNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                  {index < 3 && <ArrowRight size={19} className={styles.workflowArrow} aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </section>

          <aside className={styles.opsec} aria-labelledby="opsec-title">
            <ShieldAlert size={24} aria-hidden="true" />
            <div>
              <h2 id="opsec-title">OPSEC reminder</h2>
              <p>Approved does not mean anything goes. Never enter classified information, and follow your local guidance on CUI and PII, even in approved tools.</p>
            </div>
          </aside>
        </>
      ) : (
        <CommunitySubmissionFeed kind="tool" sort={feedSort} />
      )}
      </div>
    </div>
  );
}
