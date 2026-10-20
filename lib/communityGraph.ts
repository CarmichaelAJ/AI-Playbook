import { COMMUNITIES, type Community } from "@/content/communities";
import { PLAY_ADAPTATIONS, PLAY_COMMUNITY_LISTS, type PlayAdaptation } from "@/content/playCommunities";
import { PLAYS } from "@/content/plays";

// Pure helpers over the community hierarchy. Every function takes its data as an optional
// argument so tests can exercise the rules with small synthetic graphs.

export interface CommunityData {
  communities: Community[];
  playLists: Record<string, string[]>;
  adaptations: PlayAdaptation[];
}

export const DEFAULT_DATA: CommunityData = {
  communities: COMMUNITIES,
  playLists: PLAY_COMMUNITY_LISTS,
  adaptations: PLAY_ADAPTATIONS,
};

const byId = (data: CommunityData) => new Map(data.communities.map((c) => [c.id, c]));

export function getCommunity(id: string, data = DEFAULT_DATA): Community | undefined {
  return byId(data).get(id);
}

export function topLevelCommunities(data = DEFAULT_DATA): Community[] {
  return data.communities.filter((c) => c.parentIds.length === 0);
}

export function childrenOf(id: string, data = DEFAULT_DATA): Community[] {
  return data.communities.filter((c) => c.parentIds.includes(id));
}

// Every broader community, nearest first, each listed once even if reachable by two routes.
export function ancestorsOf(id: string, data = DEFAULT_DATA): Community[] {
  const index = byId(data);
  const seen = new Set<string>([id]);
  const result: Community[] = [];
  let frontier = [id];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const current of frontier) {
      for (const parentId of index.get(current)?.parentIds ?? []) {
        const parent = index.get(parentId);
        if (!parent || seen.has(parentId)) continue;
        seen.add(parentId);
        result.push(parent);
        next.push(parentId);
      }
    }
    frontier = next;
  }
  return result;
}

export function descendantsOf(id: string, data = DEFAULT_DATA): Community[] {
  const seen = new Set<string>([id]);
  const result: Community[] = [];
  let frontier = [id];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const current of frontier) {
      for (const child of childrenOf(current, data)) {
        if (seen.has(child.id)) continue;
        seen.add(child.id);
        result.push(child);
        next.push(child.id);
      }
    }
    frontier = next;
  }
  return result;
}

// One breadcrumb trail, following each community's first parent. Other parents are
// shown separately as "also under".
export function breadcrumbFor(id: string, data = DEFAULT_DATA): Community[] {
  const index = byId(data);
  const trail: Community[] = [];
  const seen = new Set<string>();
  let current = index.get(id);
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    trail.unshift(current);
    current = current.parentIds[0] ? index.get(current.parentIds[0]) : undefined;
  }
  return trail;
}

export function playIdsIn(communityId: string, data = DEFAULT_DATA): string[] {
  return data.playLists[communityId] ?? [];
}

// Communities that list a play, in the order PLAY_COMMUNITY_LISTS declares them.
export function communitiesForPlay(playId: string, data = DEFAULT_DATA): Community[] {
  const index = byId(data);
  return Object.entries(data.playLists)
    .filter(([, ids]) => ids.includes(playId))
    .map(([communityId]) => index.get(communityId))
    .filter((c): c is Community => Boolean(c));
}

export function homeCommunityForPlay(playId: string, data = DEFAULT_DATA): Community | undefined {
  return communitiesForPlay(playId, data)[0];
}

// Where a play opens. Plays have no page of their own; they open inside a community.
export function playHref(playId: string, communityId?: string, data = DEFAULT_DATA): string {
  const community = communityId ?? homeCommunityForPlay(playId, data)?.id;
  return community ? `/communities/${community}#${playId}` : "/communities";
}

export interface InheritedPlay {
  playId: string;
  via: Community;
}

// Plays from broader communities that also help here. Shown as links into the broader
// community, so the play is never duplicated and its source community stays visible.
export function inheritedPlaysFor(communityId: string, data = DEFAULT_DATA): InheritedPlay[] {
  const direct = new Set(playIdsIn(communityId, data));
  const seen = new Set<string>();
  const result: InheritedPlay[] = [];
  for (const ancestor of ancestorsOf(communityId, data)) {
    for (const playId of playIdsIn(ancestor.id, data)) {
      if (direct.has(playId) || seen.has(playId)) continue;
      seen.add(playId);
      result.push({ playId, via: ancestor });
    }
  }
  return result;
}

export function adaptationsIn(communityId: string, data = DEFAULT_DATA): PlayAdaptation[] {
  return data.adaptations.filter((a) => a.communityId === communityId);
}

// Self, broader, and narrower communities: the set a search filter should match.
export function relatedCommunityIds(communityId: string, data = DEFAULT_DATA): Set<string> {
  return new Set([
    communityId,
    ...ancestorsOf(communityId, data).map((c) => c.id),
    ...descendantsOf(communityId, data).map((c) => c.id),
  ]);
}

// True when following parent links from `id` leads back to `id`. ancestorsOf() cannot answer this
// because it deliberately never lists the starting community.
function reachesItself(id: string, data: CommunityData): boolean {
  const index = byId(data);
  const seen = new Set<string>();
  const stack = [...(index.get(id)?.parentIds ?? [])];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === id) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    stack.push(...(index.get(current)?.parentIds ?? []));
  }
  return false;
}

// Data checks run by tests/unit/communities.spec.ts. An empty list means the graph is sound.
export function validateCommunityData(data = DEFAULT_DATA, playIds: string[] = PLAYS.map((p) => p.id)): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const community of data.communities) {
    if (ids.has(community.id)) problems.push(`duplicate community id: ${community.id}`);
    ids.add(community.id);
  }
  for (const community of data.communities) {
    for (const parentId of community.parentIds) {
      if (!ids.has(parentId)) problems.push(`${community.id}: unknown parent ${parentId}`);
      if (parentId === community.id) problems.push(`${community.id}: is its own parent`);
    }
    if (community.level === "community" && community.parentIds.length > 0) {
      problems.push(`${community.id}: a broad community must be top level`);
    }
    if (community.level !== "community" && community.parentIds.length === 0) {
      problems.push(`${community.id}: a ${community.level} needs a broader parent`);
    }
    if (reachesItself(community.id, data)) problems.push(`${community.id}: cycle in hierarchy`);
  }
  const known = new Set(playIds);
  for (const [communityId, list] of Object.entries(data.playLists)) {
    if (!ids.has(communityId)) problems.push(`play list for unknown community ${communityId}`);
    for (const playId of list) if (!known.has(playId)) problems.push(`${communityId}: unknown play ${playId}`);
    if (new Set(list).size !== list.length) problems.push(`${communityId}: play listed twice`);
  }
  // Plays are only reachable through communities, so a play with no community is unreachable.
  for (const playId of playIds) {
    if (communitiesForPlay(playId, data).length === 0) problems.push(`play ${playId} is in no community`);
  }
  for (const adaptation of data.adaptations) {
    if (!ids.has(adaptation.communityId)) problems.push(`${adaptation.id}: unknown community`);
    if (!known.has(adaptation.basePlayId)) problems.push(`${adaptation.id}: unknown base play`);
  }
  return [...new Set(problems)];
}
