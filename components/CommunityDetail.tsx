"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Layers, Wrench } from "lucide-react";
import PageHero from "@/components/PageHero";
import PlayCard2 from "@/components/PlayCard2";
import { COMMUNITY_LEVEL_LABEL } from "@/content/communities";
import { PLAYS } from "@/content/plays";
import {
  adaptationsIn,
  ancestorsOf,
  breadcrumbFor,
  childrenOf,
  getCommunity,
  inheritedPlaysFor,
  playHref,
  playIdsIn,
} from "@/lib/communityGraph";
import { TOOLS } from "@/lib/mock/tools";

const PLAY_BY_ID = new Map(PLAYS.map((play) => [play.id, play]));
const TOOL_NAME = new Map(TOOLS.map((tool) => [tool.id, tool.name]));

export default function CommunityDetail({ id }: { id: string }) {
  const community = getCommunity(id);
  if (!community) return null;

  const trail = breadcrumbFor(id);
  const otherParents = community.parentIds
    .slice(1)
    .map((parentId) => getCommunity(parentId))
    .filter((parent) => parent !== undefined);
  const narrower = childrenOf(id);
  const plays = playIdsIn(id).map((playId) => PLAY_BY_ID.get(playId)).filter((play) => play !== undefined);
  const inherited = inheritedPlaysFor(id).filter(({ playId }) => PLAY_BY_ID.has(playId));
  const adaptations = adaptationsIn(id);
  const broader = ancestorsOf(id);

  return (
    <div className="editorial-page bleed flex flex-col">
      <PageHero eyebrow={COMMUNITY_LEVEL_LABEL[community.level]} title={community.name}>
        <p>{community.mission}</p>
      </PageHero>

      <div className="pt-5 pb-8 flex flex-col gap-8">
        <nav aria-label="Community path" className="text-xs font-semibold text-gray-600">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/communities" className="inline-flex min-h-8 items-center text-primary underline underline-offset-2">Communities</Link></li>
            {trail.map((step, index) => (
              <li key={step.id} className="flex items-center gap-1">
                <ChevronRight size={13} aria-hidden="true" />
                {index === trail.length - 1 ? (
                  <span aria-current="page" className="font-bold text-primary-dark">{step.name}</span>
                ) : (
                  <Link href={`/communities/${step.id}`} className="inline-flex min-h-8 items-center text-primary underline underline-offset-2">{step.name}</Link>
                )}
              </li>
            ))}
          </ol>
          {otherParents.length > 0 && (
            <p className="mt-1">
              Also under:{" "}
              {otherParents.map((parent, index) => (
                <span key={parent.id}>
                  {index > 0 && ", "}
                  <Link href={`/communities/${parent.id}`} className="text-primary underline underline-offset-2">{parent.name}</Link>
                </span>
              ))}
            </p>
          )}
        </nav>

        <section aria-label="About this community" className="grid gap-3">
          <div className="flex flex-wrap gap-1.5">
            {community.aliases.map((alias) => (
              <span key={alias} className="text-[11px] font-semibold px-2 py-0.5 rounded-badge bg-primary-ghost text-primary">{alias}</span>
            ))}
          </div>
          <p className="text-xs text-gray-600"><strong>Common work:</strong> {community.commonWork.join(", ")}</p>
          <p className="text-xs text-gray-500">{community.notes} Communities are a working vocabulary, not an authoritative AFSC mapping.</p>
        </section>

        {narrower.length > 0 && (
          <section aria-labelledby="narrower-title">
            <h2 id="narrower-title" className="text-xs font-bold uppercase tracking-wider text-primary-dark">Narrower communities</h2>
            <ul className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {narrower.map((child) => (
                <li key={child.id}>
                  <Link href={`/communities/${child.id}`} className="flex min-h-14 items-center justify-between gap-3 rounded-card border border-silver-mid/50 bg-white p-3 shadow-resting hover:border-primary/30">
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-silver">{COMMUNITY_LEVEL_LABEL[child.level]}</span>
                      <span className="block text-sm font-bold text-primary-dark">{child.name}</span>
                    </span>
                    <ArrowRight size={16} aria-hidden="true" className="text-silver" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="plays-title">
          <h2 id="plays-title" className="text-xs font-bold uppercase tracking-wider text-primary-dark">Plays in this community</h2>
          {plays.length > 0 ? (
            <div className="mt-2 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {plays.map((play) => <PlayCard2 key={play.id} play={play} communityId={id} />)}
            </div>
          ) : (
            <p className="mt-2 rounded-card border border-dashed border-silver-mid/70 bg-white p-4 text-xs text-gray-600">
              No plays have been added to {community.name} yet.
              {inherited.length > 0 ? " Plays from broader communities are listed below." : ""}
            </p>
          )}
          <p className="mt-3 text-[11px] text-gray-500">
            Time figures are self-reported estimates. Check every draft before your name goes on it.
          </p>
        </section>

        {adaptations.length > 0 && (
          <section aria-labelledby="adaptations-title">
            <h2 id="adaptations-title" className="text-xs font-bold uppercase tracking-wider text-primary-dark">Adapted for {community.name}</h2>
            <ul className="mt-2 grid gap-3 md:grid-cols-2">
              {adaptations.map((adaptation) => {
                const base = PLAY_BY_ID.get(adaptation.basePlayId);
                return (
                  <li key={adaptation.id} className="rounded-card border border-silver-mid/50 bg-white p-4 shadow-resting">
                    <h3 className="text-sm font-bold text-primary-dark">{adaptation.title}</h3>
                    <p className="mt-1 text-xs text-gray-600">{adaptation.summary}</p>
                    {base && (
                      <Link href={playHref(base.id)} className="mt-2 inline-flex min-h-9 items-center gap-1 text-xs font-bold text-primary">
                        <Layers size={13} aria-hidden="true" /> Based on {base.title}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {inherited.length > 0 && (
          <section aria-labelledby="broader-title">
            <h2 id="broader-title" className="text-xs font-bold uppercase tracking-wider text-primary-dark">
              Plays from broader communities
            </h2>
            <p className="mt-1 text-[11px] text-gray-500">
              These live in {broader.map((b) => b.name).join(", ")}. Each opens in the community it belongs to.
            </p>
            <ul className="mt-2 grid gap-2 md:grid-cols-2">
              {inherited.map(({ playId, via }) => {
                const play = PLAY_BY_ID.get(playId);
                if (!play) return null;
                return (
                  <li key={playId} className="rounded-card border border-silver-mid/50 bg-white p-3 shadow-resting">
                    <Link href={playHref(playId, via.id)} className="block text-sm font-bold text-primary-dark hover:underline">{play.title}</Link>
                    <p className="mt-1 text-[11px] text-gray-500">
                      In <Link href={`/communities/${via.id}`} className="font-semibold text-primary underline underline-offset-2">{via.name}</Link>
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {community.startingToolIds.length > 0 && (
          <section aria-labelledby="tools-title">
            <h2 id="tools-title" className="text-xs font-bold uppercase tracking-wider text-primary-dark">Starter tools</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {community.startingToolIds.map((toolId) => (
                <li key={toolId}>
                  <Link href="/tools" className="inline-flex min-h-9 items-center gap-1.5 rounded-badge border border-silver-mid/50 bg-silver-tint px-3 text-xs font-semibold text-primary-dark">
                    <Wrench size={12} aria-hidden="true" /> {TOOL_NAME.get(toolId) ?? toolId}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
