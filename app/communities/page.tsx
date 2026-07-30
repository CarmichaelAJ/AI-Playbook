"use client";

import Link from "next/link";
import { useState } from "react";
import { Layers, Search, Users, Wrench } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { SOURCE_COMMUNITIES } from "@/content/communities";
import { PLAYS } from "@/content/plays";
import { FEATURES } from "@/lib/features";
import { TOOLS } from "@/lib/mock/tools";
import PlatformFeedTabs from "@/components/PlatformFeedTabs";
import CommunitySubmissionFeed from "@/components/CommunitySubmissionFeed";
import type { PlatformFeedSort } from "@/lib/platformFeed";

const playTitle = new Map(PLAYS.map((p) => [p.id, p.title]));
const toolTitle = new Map(TOOLS.map((t) => [t.id, t.name]));

export default function CommunitiesPage() {
  const [feedSort, setFeedSort] = useState<PlatformFeedSort>("core");
  if (!FEATURES.communities) {
    return (
      <div className="px-4 pt-8 pb-8">
        <div className="p-5 rounded-card bg-white border border-silver-mid/40 shadow-resting">
          <h1 className="text-lg font-bold text-primary-dark">Communities are disabled in this build</h1>
          <p className="text-sm text-gray-600 mt-1">This static configuration can ship without community sourcing pages.</p>
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
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider mb-1">Communities</h1>
        <p className="text-sm text-on-dark">
          Source communities for feedback, AFSC language, and practical use cases. These are starting points pending SME validation.
        </p>
      </div>

      {FEATURES.platformDiscoveryFeeds && (
        <PlatformFeedTabs value={feedSort} onChange={setFeedSort} label="Browse communities" />
      )}

      {feedSort === "core" || !FEATURES.platformDiscoveryFeeds ? (
      <div className="px-4 pt-5 flex flex-col gap-4 pb-6">
        <ScrollReveal>
          <form action="/search" className="p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting">
            <input type="hidden" name="kind" value="community" />
            <label className="flex items-center gap-2 rounded-inner bg-silver-tint px-3 py-2">
              <Search size={18} className="text-primary flex-shrink-0" />
              <span className="sr-only">Search source communities</span>
              <input
                name="q"
                placeholder="Search AFSCs, roles, work types..."
                className="w-full bg-transparent text-sm font-semibold text-primary-dark placeholder:text-gray-400 outline-none"
                autoComplete="off"
              />
              <button type="submit" className="flex-shrink-0 rounded-badge bg-primary px-3 py-1.5 text-[11px] font-bold text-white">
                Search
              </button>
            </label>
            <p className="text-[10px] text-gray-400 leading-snug mt-2 px-1">Try: 2A, 1D7, medical, maintenance, instructor, commander</p>
          </form>
        </ScrollReveal>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SOURCE_COMMUNITIES.map((community) => (
            <ScrollReveal key={community.id}>
              <section id={community.id} className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting scroll-mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users size={17} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{community.kind}</p>
                    <h2 className="text-sm font-bold text-primary-dark leading-tight mt-0.5">{community.name}</h2>
                    <p className="text-xs text-gray-600 leading-snug mt-1">{community.mission}</p>
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap mt-3">
                  {community.aliases.slice(0, 7).map((alias) => (
                    <span key={alias} className="text-[10px] font-semibold px-2 py-0.5 rounded-badge bg-primary-ghost text-primary">
                      {alias}
                    </span>
                  ))}
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-silver mb-1.5">Common work</p>
                  <p className="text-xs text-gray-600 leading-snug">{community.commonWork.join(", ")}</p>
                </div>

                <div className="mt-3 grid gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-silver mb-1.5">Starter plays</p>
                    <div className="flex flex-wrap gap-1.5">
                      {community.startingPlayIds.map((id) => (
                        <Link key={id} href={`/plays#${id}`} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-badge bg-primary-ghost text-primary border border-primary/20">
                          <Layers size={10} /> {playTitle.get(id) ?? id}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-silver mb-1.5">Starter tools</p>
                    <div className="flex flex-wrap gap-1.5">
                      {community.startingToolIds.map((id) => (
                        <Link key={id} href="/tools" className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-badge bg-silver-tint text-primary-dark border border-silver-mid/40">
                          <Wrench size={10} /> {toolTitle.get(id) ?? id}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-gray-500 leading-snug">{community.notes}</p>
              </section>
            </ScrollReveal>
          ))}
        </div>
      </div>
      ) : (
        <CommunitySubmissionFeed kind="community" sort={feedSort} />
      )}
    </div>
  );
}
