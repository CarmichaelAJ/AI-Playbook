import { expect, test } from "@playwright/test";
import { COMMUNITIES } from "../../content/communities";
import { PLAYS } from "../../content/plays";
import {
  ancestorsOf,
  breadcrumbFor,
  communitiesForPlay,
  descendantsOf,
  homeCommunityForPlay,
  inheritedPlaysFor,
  playHref,
  relatedCommunityIds,
  validateCommunityData,
  type CommunityData,
} from "../../lib/communityGraph";
import { searchItems } from "../../lib/search";

test("the shipped community data is sound and every play is inside a community", () => {
  expect(validateCommunityData()).toEqual([]);
  for (const play of PLAYS) expect(communitiesForPlay(play.id).length, play.id).toBeGreaterThan(0);
});

test("broad to narrow: community, career field, AFSC", () => {
  expect(breadcrumbFor("afsc-2a6x1").map((c) => c.id)).toEqual(["maintainers", "afsc-2a", "afsc-2a6x1"]);
  expect(ancestorsOf("afsc-2a6x1").map((c) => c.id)).toEqual(["afsc-2a", "maintainers"]);
  expect(descendantsOf("maintainers").map((c) => c.id)).toEqual(["afsc-2a", "afsc-2a6x1"]);
});

test("a community can have several parents", () => {
  const udm = COMMUNITIES.find((c) => c.id === "udm")!;
  expect(udm.parentIds.length).toBeGreaterThan(1);
  expect(ancestorsOf("udm").map((c) => c.id)).toEqual(expect.arrayContaining(["unit-programs", "logistics"]));
});

test("one play belongs to several communities and keeps one home", () => {
  const ids = communitiesForPlay("epb-forge").map((c) => c.id);
  expect(ids).toEqual(expect.arrayContaining(["front-office-admin", "epb-narratives"]));
  expect(homeCommunityForPlay("epb-forge")!.id).toBe("front-office-admin");
  expect(playHref("epb-forge")).toBe("/communities/front-office-admin#epb-forge");
  expect(playHref("epb-forge", "epb-narratives")).toBe("/communities/epb-narratives#epb-forge");
});

test("narrow communities link to broader plays instead of copying them", () => {
  const inherited = inheritedPlaysFor("afsc-2a6x1");
  expect(inherited.length).toBeGreaterThan(0);
  for (const { via } of inherited) expect(["maintainers", "afsc-2a"]).toContain(via.id);
});

test("the validator rejects cycles, orphans, unknown ids, and unreachable plays", () => {
  const base = { access: "public" as const, aliases: [], mission: "", commonWork: [], startingToolIds: [], notes: "" };
  const data: CommunityData = {
    communities: [
      { ...base, id: "a", name: "A", level: "role", parentIds: ["b"] },
      { ...base, id: "b", name: "B", level: "role", parentIds: ["a"] },
      { ...base, id: "c", name: "C", level: "afsc", parentIds: [] },
      { ...base, id: "d", name: "D", level: "community", parentIds: ["missing"] },
    ],
    playLists: { a: ["p1", "nope"], ghost: ["p1"] },
    adaptations: [{ id: "x", basePlayId: "zzz", communityId: "nowhere", title: "", summary: "", access: "public" }],
  };
  const problems = validateCommunityData(data, ["p1", "p2"]).join("\n");
  expect(problems).toContain("cycle in hierarchy");
  expect(problems).toContain("c: a afsc needs a broader parent");
  expect(problems).toContain("d: unknown parent missing");
  expect(problems).toContain("d: a broad community must be top level");
  expect(problems).toContain("unknown play nope");
  expect(problems).toContain("play list for unknown community ghost");
  expect(problems).toContain("play p2 is in no community");
  expect(problems).toContain("x: unknown base play");
  expect(problems).toContain("x: unknown community");
});

test("search understands aliases, task language, and the community a play lives in", () => {
  expect(searchItems("UDM")[0].id).toBe("community:udm");
  expect(searchItems("unit deployment manager")[0].id).toBe("community:udm");
  expect(searchItems("2A6X1")[0].id).toBe("community:afsc-2a6x1");
  expect(searchItems("performance statements").slice(0, 3).map((i) => i.id)).toContain("play:epb-forge");
  const play = searchItems("EPB").find((item) => item.id === "play:epb-forge")!;
  expect(play.communities!.map((c) => c.id)).toEqual(expect.arrayContaining(["front-office-admin", "epb-narratives"]));
  expect(play.url).toBe("/communities/front-office-admin#epb-forge");
  // A play is found through the alias of the community it lives in.
  expect(searchItems("flightline", { kind: "play" }).map((i) => i.id)).toContain("play:process-map-constraint");
});

test("the community filter keeps broader, narrower, and the community itself", () => {
  expect([...relatedCommunityIds("afsc-2a")].sort()).toEqual(["afsc-2a", "afsc-2a6x1", "maintainers"]);
  const filtered = searchItems("", { community: "epb-narratives", kind: "play" }).map((i) => i.id);
  expect(filtered).toContain("play:epb-forge");
  expect(filtered).toContain("play:mfr-one-pass");
  expect(filtered).not.toContain("play:deep-research-brief");
});
