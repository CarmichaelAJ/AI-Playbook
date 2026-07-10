"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";
import {
  ExternalLink, Shield, Clock, Monitor, ChevronDown, ChevronUp, ArrowUpRight, ListChecks, CalendarClock,
} from "lucide-react";
import { TOOLS, USE_CASES, SECTIONS, type UseCase, type Section, type Tool } from "@/lib/mock/tools";
import StarToggle from "@/components/StarToggle";

// Every tool on this page is approved for official use. One badge, one meaning.
const APPROVED_BADGE = {
  label: "Approved for official use — confirm locally",
  color: "bg-success-tint text-success-mid",
};

const sectionFilterLabel: Record<Section | "All", string> = {
  All:        "All",
  ai:         "AI",
  automation: "Automation",
  data:       "Data",
  platforms:  "Platforms",
  soon:       "Coming Soon",
};

const USE_CASE_OPTIONS = (["All", ...USE_CASES] as (UseCase | "All")[]);
const SECTION_OPTIONS = (["All", ...SECTIONS.map((s) => s.id)] as (Section | "All")[]);

function SegmentedFilter<T extends string>({
  options,
  labels,
  active,
  onChange,
  pillColor = "bg-primary-dark",
  activeTextColor = "text-white",
}: {
  options: T[];
  labels?: Record<T, string>;
  active: T;
  onChange: (v: T) => void;
  pillColor?: string;
  activeTextColor?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState({ left: 0, width: 0 });

  const updatePill = useCallback(() => {
    const idx = options.indexOf(active);
    const btn = btnRefs.current[idx];
    const track = trackRef.current;
    if (!btn || !track) return;
    const trackRect = track.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setPill({ left: btnRect.left - trackRect.left, width: btnRect.width });
  }, [active, options]);

  useLayoutEffect(() => { updatePill(); }, [updatePill]);

  return (
    <div ref={trackRef} className="seg-track">
      <div
        className={`seg-pill ${pillColor}`}
        style={{ left: pill.left, width: pill.width }}
      />
      {options.map((opt, i) => (
        <button
          key={opt}
          ref={el => { btnRefs.current[i] = el; }}
          onClick={() => onChange(opt)}
          className={`seg-btn ${active === opt ? activeTextColor : "text-gray-500"}`}
        >
          {labels ? labels[opt] : opt}
        </button>
      ))}
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const [expanded, setExpanded] = useState(false);

  const live = !tool.inDevelopment && !!tool.url;
  const workstationOnly = !tool.accessibleMobile;

  return (
    <div className="bg-white rounded-card shadow-resting border border-silver-mid/50 hover:shadow-hover hover:border-primary/25 overflow-hidden transition-all duration-base ease-smooth">
      {/* Collapsed header — name, tagline, badge; content toggles expand */}
      <div className="flex items-start gap-2 p-5">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-start gap-3 flex-1 min-w-0 text-left"
          aria-expanded={expanded}
        >
          <span className="text-2xl leading-none mt-0.5">{tool.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="text-sm font-bold text-primary-dark">{tool.name}</h3>
              {tool.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-white uppercase tracking-wide">
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-primary font-semibold">{tool.tagline}</p>
          </div>
        </button>

        <div className="flex items-center gap-0.5 flex-shrink-0 -mr-1.5">
          <StarToggle item={{ type: "tool", id: tool.id, title: tool.name, url: tool.url }} />
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? "Collapse tool" : "Expand tool"}
            aria-expanded={expanded}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-silver-mid/40">
          {/* What it is */}
          <p className="text-xs text-gray-600 mt-3 leading-relaxed">{tool.whatItIs}</p>

          {/* Authorization — linked to source, never asserted */}
          <div className="mt-3 flex items-start gap-2">
            <Shield size={14} className="flex-shrink-0 mt-0.5 text-success-mid" />
            <p className="text-xs text-primary-dark leading-snug">
              {tool.authorization.label}{" "}
              {tool.authorization.sourceUrl ? (
                <a
                  href={tool.authorization.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-primary font-semibold underline underline-offset-2"
                >
                  Source <ArrowUpRight size={11} />
                </a>
              ) : (
                <span className="text-gray-400">Confirm with your local guidance.</span>
              )}
            </p>
          </div>

          {/* Use cases */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-badge ${APPROVED_BADGE.color}`}>
              <Shield size={10} />
              {APPROVED_BADGE.label}
            </span>
            {tool.useCases.map((uc) => (
              <span key={uc} className="text-[10px] font-medium px-2 py-1 rounded-badge bg-gray-100 text-gray-500">
                {uc}
              </span>
            ))}
          </div>

          {/* The full access path */}
          <div className="mt-4">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-silver mb-1.5">
              <ListChecks size={12} /> How to get in
            </p>
            <ol className="flex flex-col gap-1.5">
              {tool.accessPath.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-600 leading-snug">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-2">
              <CalendarClock size={11} /> Access path — draft, pending verification · updated {tool.accessVerified}
            </p>
          </div>

          {workstationOnly && (
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 mt-3">
              <Monitor size={11} /> Open this one from your government workstation.
            </p>
          )}

          {/* Open the tool */}
          <div className="mt-3">
            {live ? (
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-inner text-sm font-semibold bg-primary text-white active:bg-primary-dark transition-colors"
              >
                <ExternalLink size={15} /> Open tool
              </a>
            ) : (
              <span className="w-full flex items-center justify-center gap-2 py-2.5 rounded-inner text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">
                <Clock size={15} /> Coming soon
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ToolsPage() {
  const [activeSection, setActiveSection] = useState<Section | "All">("All");
  const [activeUseCase, setActiveUseCase] = useState<UseCase | "All">("All");
  const [fading, setFading] = useState(false);
  const [displaySection, setDisplaySection] = useState<Section | "All">("All");
  const [displayUseCase, setDisplayUseCase] = useState<UseCase | "All">("All");

  const applyFilter = useCallback((sec: Section | "All", uc: UseCase | "All") => {
    setFading(true);
    setTimeout(() => {
      setDisplaySection(sec);
      setDisplayUseCase(uc);
      setFading(false);
    }, 130);
  }, []);

  const handleSection = (s: Section | "All") => {
    setActiveSection(s);
    applyFilter(s, activeUseCase);
  };

  const handleUseCase = (u: UseCase | "All") => {
    setActiveUseCase(u);
    applyFilter(activeSection, u);
  };

  const matchesFilters = (t: Tool) => {
    const matchesSection = displaySection === "All" || t.section === displaySection;
    const matchesUseCase = displayUseCase === "All" || t.useCases.includes(displayUseCase);
    return matchesSection && matchesUseCase;
  };

  const filtered = TOOLS.filter(matchesFilters);

  // Group surviving tools by section, preserving SECTIONS order and dropping empties.
  const groupedSections = SECTIONS
    .map((s) => ({ ...s, tools: filtered.filter((t) => t.section === s.id) }))
    .filter((s) => s.tools.length > 0);

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
          Every tool here is approved for official use. Open one to see what it is, who it&apos;s cleared for, and the full path to get in.
        </p>
      </div>

      {/* Category filter */}
      <div className="px-4 pt-4">
        <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">Filter by category</p>
        <div className="overflow-x-auto">
          <SegmentedFilter
            options={SECTION_OPTIONS}
            labels={sectionFilterLabel}
            active={activeSection}
            onChange={handleSection}
            pillColor="bg-primary"
            activeTextColor="text-white"
          />
        </div>
      </div>

      {/* Use case filter */}
      <div className="px-4 pt-3">
        <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">Filter by use case</p>
        <div className="overflow-x-auto pb-1">
          <SegmentedFilter
            options={USE_CASE_OPTIONS}
            active={activeUseCase}
            onChange={handleUseCase}
            pillColor="bg-warm"
            activeTextColor="text-primary-dark"
          />
        </div>
      </div>

      {/* Count */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs text-gray-500 font-medium">{filtered.length} tool{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Tool cards, grouped by section */}
      <div className={`px-4 flex flex-col gap-5 pb-4 filter-grid ${fading ? "fading" : ""}`}>
        {groupedSections.map((section) => (
          <div key={section.id}>
            <div className="mb-2">
              <h2 className="text-xs font-bold text-primary-dark uppercase tracking-wider">{section.label}</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">{section.blurb}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {section.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm font-medium">No tools match your filters</p>
            <button
              onClick={() => { handleSection("All"); handleUseCase("All"); }}
              className="text-xs text-primary font-semibold mt-2"
            >
              Clear filters
            </button>
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
    </div>
  );
}
