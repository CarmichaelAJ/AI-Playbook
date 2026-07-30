"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Filter, GraduationCap, Layers, Search, Users, Wrench } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { FEATURES } from "@/lib/features";
import { searchCommunityContent, trackAnalyticsEvent, type CommunitySubmission } from "@/lib/platformApi";
import { SEARCH_KINDS, SOURCE_COMMUNITIES, searchItems, type SearchKind, type SearchItem } from "@/lib/search";

const KIND_ICON: Record<SearchKind, typeof Layers> = {
  play: Layers,
  tool: Wrench,
  source: BookOpen,
  community: Users,
  learning: GraduationCap,
};

function ResultCard({ item }: { item: SearchItem }) {
  const Icon = KIND_ICON[item.kind];
  const external = item.url.startsWith("http");
  const body = (
    <div className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting h-full">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon size={17} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{item.kind}</p>
          <h2 className="text-sm font-bold text-primary-dark leading-tight mt-0.5">{item.title}</h2>
          <p className="text-xs text-gray-600 leading-snug mt-1">{item.description}</p>
        </div>
        <ArrowRight size={15} className="text-silver flex-shrink-0 mt-1" />
      </div>
      <div className="flex gap-1.5 flex-wrap mt-3">
        {item.tags.slice(0, 6).map((tag) => (
          <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-badge bg-primary-ghost text-primary">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  return external ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer">{body}</a>
  ) : (
    <Link href={item.url}>{body}</Link>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind | "all">("all");
  const [community, setCommunity] = useState("all");
  const [communityResults, setCommunityResults] = useState<CommunitySubmission[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextQuery = params.get("q") ?? "";
    const nextKind = params.get("kind");
    const nextCommunity = params.get("community");

    setQuery(nextQuery);
    if (nextKind === "play" || nextKind === "tool" || nextKind === "source" || nextKind === "community" || nextKind === "learning" || nextKind === "all") {
      setKind(nextKind);
    }
    if (nextCommunity) setCommunity(nextCommunity);
  }, []);

  useEffect(() => {
    if (!FEATURES.platformDiscoveryFeeds) {
      setCommunityResults([]);
      return;
    }
    if (query.trim().length < 2) {
      setCommunityResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      searchCommunityContent(query).then(setCommunityResults).catch(() => setCommunityResults([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const kindOptions = useMemo(
    () => SEARCH_KINDS
      .filter((option) => FEATURES.communities || option.id !== "community")
      .filter((option) => FEATURES.learningPaths || option.id !== "learning"),
    [],
  );
  const results = useMemo(() => {
    const effectiveKind = !FEATURES.communities && kind === "community" ? "all" : kind;
    const staticResults = searchItems(query, {
      kind: effectiveKind,
      community: FEATURES.communities ? community : "all",
    })
      .filter((item) => FEATURES.communities || item.kind !== "community")
      .filter((item) => FEATURES.learningPaths || item.kind !== "learning");
    const platformResults: SearchItem[] = communityResults
      .filter((item) => kind === "all" || item.kind === kind)
      .map((item) => ({
        id: `community-${item.id}`,
        kind: item.kind,
        title: item.title,
        description: item.summary,
        tags: [item.category || "Community", item.authorAfsc, item.dataLevel],
        url: item.kind === "community" ? `/community?id=${item.id}` : `/post?id=${item.id}`,
        keywords: [item.title, item.summary, item.content, item.category, item.authorAfsc].join(" "),
      }));
    return [...platformResults, ...staticResults].slice(0, 40);
  }, [community, communityResults, kind, query]);
  const starter = "Try: awards, MFR, 2A, dashboard, CUI, GenAI, process map, commander, cyber";

  useEffect(() => {
    if (!FEATURES.analytics || query.trim().length < 2 || results.length > 0) return;
    const timer = window.setTimeout(() => {
      void trackAnalyticsEvent("search_no_results", "search", undefined, { query: query.trim().slice(0, 120), kind });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [kind, query, results.length]);

  if (!FEATURES.staticSearch) {
    return (
      <div className="px-4 pt-8 pb-8">
        <div className="p-5 rounded-card bg-white border border-silver-mid/40 shadow-resting">
          <h1 className="text-lg font-bold text-primary-dark">Search is disabled in this build</h1>
          <p className="text-sm text-gray-600 mt-1">This static configuration can ship without the search surface.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="hero-af text-white px-5 pt-5 pb-5 overflow-hidden rounded-b-[24px]">
        <div className="flex items-center gap-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/af-symbol-white.svg" alt="U.S. Air Force" className="h-6 flex-shrink-0" draggable={false} />
          <div className="w-px h-5 bg-silver/40 flex-shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-on-dark-dim">Airman&apos;s Playbook</span>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider mb-1">Search</h1>
        <p className="text-sm text-on-dark">
          Find plays, approved tools, official sources, and source communities from one box.
        </p>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-4 pb-6">
        <ScrollReveal>
          <div className="p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting">
            <label className="flex items-center gap-2 rounded-inner bg-silver-tint px-3 py-2">
              <Search size={18} className="text-primary flex-shrink-0" />
              <span className="sr-only">Search the Playbook</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search plays, tools, AFSCs, sources..."
                className="w-full bg-transparent text-sm font-semibold text-primary-dark placeholder:text-gray-400 outline-none"
                autoComplete="off"
              />
            </label>
            <p className="text-[10px] text-gray-400 leading-snug mt-2 px-1">{starter}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting">
            <div className="flex items-center gap-1.5 mb-2">
              <Filter size={13} className="text-silver" />
              <p className="text-[10px] font-bold text-silver uppercase tracking-wider">Filters</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {kindOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setKind(option.id)}
                  aria-pressed={kind === option.id}
                  className={`flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-badge border ${
                    kind === option.id ? "bg-primary border-primary text-white" : "bg-white border-silver-mid/60 text-primary-dark"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {FEATURES.communities && (
              <select
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                className="w-full mt-1 rounded-inner border border-silver-mid/60 bg-white px-3 py-2 text-xs font-semibold text-primary-dark"
                aria-label="Filter by source community"
              >
                <option value="all">All source communities</option>
                {SOURCE_COMMUNITIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        </ScrollReveal>

        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{results.length} results</p>
          {FEATURES.communities && (
            <Link href="/communities" className="text-[11px] font-bold text-primary underline underline-offset-2">
              Source communities
            </Link>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => (
            <ScrollReveal key={item.id}>
              <ResultCard item={item} />
            </ScrollReveal>
          ))}
        </div>

        {results.length === 0 && (
          <div className="p-5 rounded-card bg-white border border-dashed border-silver-mid/70 text-center">
            <p className="text-sm font-bold text-primary-dark">No match yet</p>
            <p className="text-xs text-gray-500 mt-1">Try a task, AFSC prefix, tool name, or source type.</p>
          </div>
        )}
      </div>
    </div>
  );
}
