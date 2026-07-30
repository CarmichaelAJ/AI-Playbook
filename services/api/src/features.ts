import { envBool } from "./config.js";

export type FeatureMode = "static" | "local-only" | "platform";
export type DataLevel = "public" | "official-use" | "cui" | "il4" | "il5" | "classified-not-supported" | "tbd";

export type FeatureDefinition = {
  id: string;
  label: string;
  enabled: boolean;
  mode: FeatureMode;
  requiresAuth: boolean;
  requiresDatabase: boolean;
  dataLevel: DataLevel;
  staticFallback: string;
};

const baseFeatures: Record<string, Omit<FeatureDefinition, "id" | "enabled"> & { env?: string; defaultEnabled: boolean }> = {
  staticSearch: {
    label: "Static search",
    defaultEnabled: true,
    mode: "static",
    requiresAuth: false,
    requiresDatabase: false,
    dataLevel: "public",
    staticFallback: "Hide search navigation and keep content browsable by page.",
  },
  communities: {
    label: "Source communities",
    defaultEnabled: true,
    mode: "static",
    requiresAuth: false,
    requiresDatabase: false,
    dataLevel: "public",
    staticFallback: "Remove AFSC/community sourcing pages from navigation and search.",
  },
  learningPaths: {
    label: "AFSC learning paths",
    defaultEnabled: true,
    mode: "static",
    requiresAuth: false,
    requiresDatabase: false,
    dataLevel: "public",
    staticFallback: "Show general learning cards instead of personalized recommendations.",
  },
  auth: {
    label: ".mil sign-in",
    defaultEnabled: false,
    env: "FEATURE_AUTH",
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: false,
    dataLevel: "official-use",
    staticFallback: "Keep public content open without accounts.",
  },
  adminConsole: {
    label: "Admin console",
    defaultEnabled: false,
    env: "FEATURE_ADMIN_CONSOLE",
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Use build-time feature configuration.",
  },
  toolSubmissions: {
    label: "AI tool submissions",
    defaultEnabled: false,
    env: "FEATURE_TOOL_SUBMISSIONS",
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "cui",
    staticFallback: "Link to the current Google Form.",
  },
  communitySubmissions: {
    label: "Community submissions",
    defaultEnabled: true,
    env: "FEATURE_COMMUNITY_SUBMISSIONS",
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: false,
    dataLevel: "official-use",
    staticFallback: "Hide community feeds and contribution controls.",
  },
  platformDiscoveryFeeds: {
    label: "Community discovery feeds",
    defaultEnabled: true,
    env: "FEATURE_PLATFORM_DISCOVERY_FEEDS",
    mode: "platform",
    requiresAuth: false,
    requiresDatabase: false,
    dataLevel: "official-use",
    staticFallback: "Show the curated category order without ranking tabs.",
  },
  personalizedLearning: {
    label: "Personalized learning",
    defaultEnabled: false,
    env: "FEATURE_PERSONALIZED_LEARNING",
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Use static AFSC learning paths.",
  },
  firstPartyVideos: {
    label: "First-party learning videos",
    defaultEnabled: false,
    env: "FEATURE_FIRST_PARTY_VIDEOS",
    mode: "platform",
    requiresAuth: false,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Use curated embedded videos or static links.",
  },
  voting: {
    label: "Tool voting",
    defaultEnabled: true,
    env: "FEATURE_VOTING",
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Sort tools with editorial labels only.",
  },
  comments: {
    label: "Comments",
    defaultEnabled: true,
    env: "FEATURE_COMMENTS",
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Do not show comment threads.",
  },
  analytics: {
    label: "Admin analytics",
    defaultEnabled: false,
    env: "FEATURE_ANALYTICS",
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "No event collection.",
  },
  messaging: {
    label: "Messaging",
    defaultEnabled: true,
    env: "FEATURE_MESSAGING",
    mode: "platform",
    requiresAuth: true,
    requiresDatabase: true,
    dataLevel: "official-use",
    staticFallback: "Use published contact links only.",
  },
};

export function getFeatureRegistry(): Record<string, FeatureDefinition> {
  return Object.fromEntries(
    Object.entries(baseFeatures).map(([id, feature]) => {
      const { env, defaultEnabled, ...definition } = feature;
      return [
        id,
        {
          id,
          enabled: env ? envBool(env, defaultEnabled) : defaultEnabled,
          ...definition,
        },
      ];
    }),
  );
}

export function isFeatureEnabled(id: string): boolean {
  return getFeatureRegistry()[id]?.enabled ?? false;
}
