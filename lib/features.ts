export type FeatureMode = "static" | "local-only" | "platform";
export type AppMode = "static" | "platform";
export type DataLevel = "public" | "official-use" | "cui" | "il4" | "il5" | "classified-not-supported" | "tbd";

type FeatureDefinition = {
  label: string;
  enabled: boolean;
  mode: FeatureMode;
  requiresAuth: boolean;
  requiresDatabase: boolean;
  dataLevel: DataLevel;
  staticFallback: string;
};

// Central feature registry. Static/sellable builds should be able to turn off
// platform or experimental modules without changing page code in many places.
export const FEATURE_REGISTRY = {
  onboarding: {
    label: "Local onboarding",
    enabled: true,
    mode: "local-only",
    requiresAuth: false,
    requiresDatabase: false,
    dataLevel: "public",
    staticFallback: "Show the standard Home page with no personal setup card.",
  },
  staticSearch: {
    label: "Static search",
    enabled: true,
    mode: "static",
    requiresAuth: false,
    requiresDatabase: false,
    dataLevel: "public",
    staticFallback: "Hide search navigation and keep content browsable by page.",
  },
  communities: {
    label: "Source communities",
    enabled: true,
    mode: "static",
    requiresAuth: false,
    requiresDatabase: false,
    dataLevel: "public",
    staticFallback: "Remove AFSC/community sourcing pages from navigation and search.",
  },
  learningPaths: {
    label: "AFSC learning paths",
    enabled: true,
    mode: "static",
    requiresAuth: false,
    requiresDatabase: false,
    dataLevel: "public",
    staticFallback: "Show general learning cards instead of personalized recommendations.",
  },
  settings: {
    label: "Settings page",
    enabled: true,
    mode: "local-only",
    requiresAuth: false,
    requiresDatabase: false,
    dataLevel: "public",
    staticFallback: "No settings page in static sellable builds.",
  },
  auth: {
    label: ".mil sign-in",
    enabled: true,
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: false,
    dataLevel: "official-use",
    staticFallback: "Keep public content open without accounts.",
  },
  requireMilEmail: {
    label: "Require .mil email",
    enabled: true,
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: false,
    dataLevel: "official-use",
    staticFallback: "No identity gate.",
  },
  adminConsole: {
    label: "Admin console",
    enabled: true,
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Use build-time feature configuration.",
  },
  toolSubmissions: {
    label: "AI tool submissions",
    enabled: true,
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "cui",
    staticFallback: "Link to the current Google Form.",
  },
  communitySubmissions: {
    label: "Community submissions",
    enabled: true,
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: false,
    dataLevel: "official-use",
    staticFallback: "Hide community feeds and contribution controls.",
  },
  platformDiscoveryFeeds: {
    label: "Community discovery feeds",
    enabled: process.env.NEXT_PUBLIC_FEATURE_PLATFORM_DISCOVERY_FEEDS !== "false",
    mode: "platform",
    requiresAuth: false,
    requiresDatabase: false,
    dataLevel: "official-use",
    staticFallback: "Show the curated category order without ranking tabs.",
  },
  personalizedLearning: {
    label: "Personalized learning",
    enabled: true,
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Use static AFSC learning paths.",
  },
  dataLevelFilters: {
    label: "Data level labels",
    enabled: true,
    mode: "static",
    requiresAuth: false,
    requiresDatabase: false,
    dataLevel: "public",
    staticFallback: "Show static labels only.",
  },
  firstPartyVideos: {
    label: "First-party learning videos",
    enabled: true,
    mode: "platform",
    requiresAuth: false,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Use curated embedded videos or static links.",
  },
  voting: {
    label: "Tool voting",
    enabled: true,
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Sort tools with editorial labels only.",
  },
  comments: {
    label: "Comments",
    enabled: true,
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Do not show comment threads.",
  },
  analytics: {
    label: "Admin analytics",
    enabled: true,
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "No event collection.",
  },
  messaging: {
    label: "Messaging",
    enabled: true,
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Use published contact links only.",
  },
} as const satisfies Record<string, FeatureDefinition>;

export type FeatureId = keyof typeof FEATURE_REGISTRY;

export const APP_MODE: AppMode =
  process.env.NEXT_PUBLIC_APP_MODE === "static" ? "static" : "platform";

function availableInBuild(mode: FeatureMode): boolean {
  return APP_MODE === "platform" || mode !== "platform";
}

export const FEATURES = Object.fromEntries(
  Object.entries(FEATURE_REGISTRY).map(([id, feature]) => [
    id,
    feature.enabled && availableInBuild(feature.mode),
  ]),
) as Record<FeatureId, boolean>;

export function isFeatureEnabled(feature: FeatureId): boolean {
  return FEATURES[feature];
}
