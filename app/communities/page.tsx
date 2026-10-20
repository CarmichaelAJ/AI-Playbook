"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Search, Users } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { COMMUNITY_LEVEL_LABEL } from "@/content/communities";
import { FEATURES } from "@/lib/features";
import PageHero from "@/components/PageHero";
import PlatformFeedTabs from "@/components/PlatformFeedTabs";
import CommunitySubmissionFeed from "@/components/CommunitySubmissionFeed";
import { childrenOf, playIdsIn, topLevelCommunities } from "@/lib/communityGraph";
import type { PlatformFeedSort } from "@/lib/platformFeed";

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
    <div className="editorial-page bleed flex flex-col">
      <PageHero eyebrow="Airman adoption" title="Communities" photo="hangar-t6" position="50% 70%">
        <p>
          Start with a broad community, then narrow to a career field, AFSC, special duty, or role. Plays live inside
          communities. These are working groups pending SME validation, not an authoritative AFSC mapping.
        </p>
      </PageHero>

      {FEATURES.platformDiscoveryFeeds && (
        <PlatformFeedTabs value={feedSort} onChange={setFeedSort} label="Browse communities" />
      )}

      {feedSort === "core" || !FEATURES.platformDiscoveryFeeds ? (
      <div className="pt-5 flex flex-col gap-4 pb-6">
        <ScrollReveal>
          <form action="/search" className="p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting">
            <input type="hidden" name="kind" value="community" />
            <label className="flex items-center gap-2 rounded-inner bg-silver-tint px-3 py-2">
              <Search size={18} className="text-primary flex-shrink-0" />
              <span className="sr-only">Search source communities</span>
              <input
                name="q"
                placeholder="Search communities, AFSCs, roles, tasks..."
                className="w-full bg-transparent text-sm font-semibold text-primary-dark placeholder:text-gray-400 outline-none"
                autoComplete="off"
              />
              <button type="submit" className="flex-shrink-0 rounded-badge bg-primary px-3 py-1.5 text-[11px] font-bold text-white">
                Search
              </button>
            </label>
            <p className="text-[10px] text-gray-500 leading-snug mt-2 px-1">Try: 2A6X1, UDM, UTM, EPB, 1D7, medical, instructor, commander</p>
          </form>
        </ScrollReveal>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {topLevelCommunities().map((community) => {
            const narrower = childrenOf(community.id);
            return (
              <ScrollReveal key={community.id}>
                <section id={community.id} className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting scroll-mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users size={17} className="text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{COMMUNITY_LEVEL_LABEL[community.level]}</p>
                      <h2 className="text-sm font-bold text-primary-dark leading-tight mt-0.5">
                        <Link href={`/communities/${community.id}`} className="hover:underline">{community.name}</Link>
                      </h2>
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

                  {narrower.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-silver mb-1.5">Narrower</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {narrower.map((child) => (
                          <li key={child.id}>
                            <Link href={`/communities/${child.id}`} className="inline-flex min-h-8 items-center rounded-badge border border-primary/25 px-2.5 text-[11px] font-semibold text-primary hover:bg-primary-ghost">
                              {child.name}
                              <span className="ml-1 text-[9px] font-bold uppercase tracking-wide text-silver">{COMMUNITY_LEVEL_LABEL[child.level]}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link href={`/communities/${community.id}`} className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-primary">
                    Open community · {playIdsIn(community.id).length} {playIdsIn(community.id).length === 1 ? "play" : "plays"} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </section>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
      ) : (
        <CommunitySubmissionFeed kind="community" sort={feedSort} />
      )}
    </div>
  );
}
