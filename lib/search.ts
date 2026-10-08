import { PLAY_CATEGORIES, categoryLabel } from "@/content/categories";
import { PLAYS } from "@/content/plays";
import { ALL_LIBRARY } from "@/content/library";
import { COMMUNITIES, COMMUNITY_LEVEL_LABEL } from "@/content/communities";
import { ancestorsOf, communitiesForPlay, playHref, relatedCommunityIds } from "@/lib/communityGraph";
import { LEARNING_PATHS } from "@/content/learningPaths";
import { SECTIONS, TOOLS } from "@/lib/mock/tools";

export type SearchKind = "play" | "tool" | "source" | "community" | "learning";

export interface SearchItem {
  id: string;
  kind: SearchKind;
  title: string;
  description: string;
  url: string;
  tags: string[];
  keywords: string;
  // Communities a play belongs to, so a result always shows where the play lives.
  communities?: Array<{ id: string; name: string }>;
  // Present on community results so an exact alias ("UDM", "2A6X1") can outrank looser matches.
  aliases?: string[];
}

// Everything in this index ships to the browser. It must only ever contain public content;
// restricted content has to come from an authenticated backend, never from this file.

const sectionLabel = (id: string) => SECTIONS.find((s) => s.id === id)?.label ?? id;

export const SEARCH_ITEMS: SearchItem[] = [
  ...PLAYS.map((play): SearchItem => {
    const homes = communitiesForPlay(play.id);
    // Search by a community name, an alias, or a broader community's alias and still find the play.
    const communityWords = homes.flatMap((community) => [
      community.name,
      ...community.aliases,
      ...ancestorsOf(community.id).flatMap((ancestor) => [ancestor.name, ...ancestor.aliases]),
    ]);
    return {
      id: `play:${play.id}`,
      kind: "play",
      title: play.title,
      description: play.situation ?? play.contract ?? categoryLabel(play.category),
      url: playHref(play.id),
      communities: homes.map(({ id, name }) => ({ id, name })),
      tags: [
        categoryLabel(play.category),
        `Level ${play.level ?? 1}`,
        ...play.connectors,
        ...(play.run_on?.surfaces ?? []),
      ],
      keywords: [
        play.title,
        play.situation,
        play.contract,
        play.category,
        categoryLabel(play.category),
        play.time_back,
        play.body_segments?.persona,
        play.body_segments?.task,
        play.body_segments?.format,
        play.body_segments?.feed_slots.map((s) => `${s.label} ${s.placeholder}`).join(" "),
        play.body_segments?.verify.join(" "),
        play.connectors.join(" "),
        play.run_on?.surfaces.join(" "),
        communityWords.join(" "),
      ].filter(Boolean).join(" "),
    };
  }),
  ...TOOLS.map((tool): SearchItem => ({
    id: `tool:${tool.id}`,
    kind: "tool",
    title: tool.name,
    description: tool.one_liner,
    url: tool.launch_url || "/tools",
    tags: [sectionLabel(tool.section), tool.status === "live" ? "Live" : "Coming soon", tool.cac_required ? "CAC" : "No CAC request"],
    keywords: [
      tool.name,
      tool.one_liner,
      tool.description,
      tool.section,
      sectionLabel(tool.section),
      tool.badge,
      tool.cleared_line,
      tool.access_path.map((s) => s.step).join(" "),
      tool.first_move?.text,
      tool.first_move?.copyable,
      tool.play_ids.join(" "),
      tool.no_plays_line,
    ].filter(Boolean).join(" "),
  })),
  ...ALL_LIBRARY.map((doc): SearchItem => ({
    id: `source:${doc.id}`,
    kind: "source",
    title: doc.title,
    description: doc.translation_line ?? doc.issuer ?? "Official source",
    url: doc.doc_class === "milestone" && doc.hosted_path ? `/reader/${doc.id}` : doc.official_url ?? "/",
    tags: [doc.category, doc.issuer ?? "Source", doc.doc_class ?? "source"].filter(Boolean),
    keywords: [
      doc.title,
      doc.translation_line,
      doc.issuer,
      doc.category,
      doc.issued,
      doc.official_url,
      doc.provenance?.map((p) => p.label).join(" "),
    ].filter(Boolean).join(" "),
  })),
  ...COMMUNITIES.map((community): SearchItem => {
    const broader = ancestorsOf(community.id);
    return {
      id: `community:${community.id}`,
      kind: "community",
      title: community.name,
      description: community.mission,
      url: `/communities/${community.id}`,
      aliases: community.aliases,
      tags: [
        COMMUNITY_LEVEL_LABEL[community.level],
        ...community.aliases.slice(0, 5),
        ...(broader.length > 0 ? [`Under ${broader[broader.length - 1].name}`] : []),
      ],
      keywords: [
        community.name,
        COMMUNITY_LEVEL_LABEL[community.level],
        community.aliases.join(" "),
        community.mission,
        community.commonWork.join(" "),
        broader.map((b) => `${b.name} ${b.aliases.join(" ")}`).join(" "),
      ].join(" "),
    };
  }),
  ...LEARNING_PATHS.map((path): SearchItem => ({
    id: `learning:${path.id}`,
    kind: "learning",
    title: path.label,
    description: path.focus,
    url: path.href,
    tags: ["Learning path", path.audience, ...path.tags],
    keywords: [
      path.label,
      path.audience,
      path.focus,
      path.steps.join(" "),
      path.tags.join(" "),
    ].join(" "),
  })),
];

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const tokens = (query: string) => normalize(query).split(" ").filter((t) => t.length > 1);

const SEARCH_SYNONYMS: Record<string, string[]> = {
  ai: ["artificial intelligence", "genai"],
  mfr: ["memorandum for record", "memo"],
  epb: ["enlisted performance brief", "evaluation"],
  opb: ["officer performance brief", "evaluation"],
  cui: ["controlled unclassified information", "data handling"],
  mx: ["maintenance"],
  comm: ["communications", "cyber", "1d7"],
  award: ["decoration", "citation"],
  tasker: ["staff work", "action item"],
};

function editDistanceAtMostOne(left: string, right: string): boolean {
  if (Math.abs(left.length - right.length) > 1) return false;
  let edits = 0;
  for (let i = 0, j = 0; i < left.length && j < right.length;) {
    if (left[i] === right[j]) {
      i += 1;
      j += 1;
    } else if (++edits > 1) {
      return false;
    } else if (left.length > right.length) {
      i += 1;
    } else if (right.length > left.length) {
      j += 1;
    } else {
      i += 1;
      j += 1;
    }
  }
  return edits + Math.abs((left.length) - (right.length)) <= 1;
}

export function searchItems(query: string, filters: { kind?: SearchKind | "all"; community?: string } = {}): SearchItem[] {
  const q = normalize(query);
  const parts = tokens(query);
  const expandedParts = [
    ...new Set(
      parts.flatMap((part) => [
        part,
        ...tokens((SEARCH_SYNONYMS[part] ?? []).join(" ")),
      ]),
    ),
  ];
  const kind = filters.kind ?? "all";
  const community = filters.community && filters.community !== "all"
    ? COMMUNITIES.find((c) => c.id === filters.community)
    : null;
  // Plays and communities are limited to the chosen community, the ones above it, and the ones below it.
  const related = community ? relatedCommunityIds(community.id) : null;
  const communityTerms = community
    ? tokens([community.name, community.aliases.join(" "), community.commonWork.join(" ")].join(" "))
    : [];

  return SEARCH_ITEMS
    .filter((item) => kind === "all" || item.kind === kind)
    .filter((item) => {
      if (!related) return true;
      if (item.kind === "community") return related.has(item.id.replace("community:", ""));
      if (item.kind === "play") return (item.communities ?? []).some((c) => related.has(c.id));
      return true;
    })
    .map((item) => {
      const title = normalize(item.title);
      const haystack = normalize(`${item.title} ${item.description} ${item.tags.join(" ")} ${item.keywords}`);
      const haystackWords = new Set(haystack.split(" "));
      let score = query.trim() ? 0 : 1;

      if (q && title === q) score += 100;
      // An exact alias ("UDM", "2A6X1") should put its community first.
      if (q && item.aliases?.some((alias) => normalize(alias) === q)) score += 90;
      if (q && title.includes(q)) score += 45;
      if (q && haystack.includes(q)) score += 20;
      for (const part of expandedParts) {
        if (title.includes(part)) score += 18;
        if (haystack.includes(part)) score += 7;
        else if (part.length >= 4 && [...haystackWords].some((word) => editDistanceAtMostOne(part, word))) score += 3;
      }
      for (const term of communityTerms) {
        if (haystack.includes(term)) score += 4;
      }
      if (item.kind === "play") score += 3;
      if (item.kind === "tool") score += 2;

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .map(({ item }) => item);
}

export const SEARCH_KINDS: Array<{ id: SearchKind | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "play", label: "Plays" },
  { id: "tool", label: "Tools" },
  { id: "source", label: "Sources" },
  { id: "community", label: "Communities" },
  { id: "learning", label: "Learning" },
];

export { PLAY_CATEGORIES, COMMUNITIES };
