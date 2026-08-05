import { CheckCircle2, Database, LockKeyhole, Power, PowerOff, ShieldCheck, SlidersHorizontal } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { APP_MODE, FEATURES, FEATURE_REGISTRY, type FeatureMode } from "@/lib/features";
import { PRODUCT_NAME } from "@/lib/branding";

const MODE_COPY: Record<FeatureMode, { label: string; description: string }> = {
  static: {
    label: "Static",
    description: "Ships without identity, server storage, or user collection.",
  },
  "local-only": {
    label: "Local-only",
    description: "Personal settings stay in the browser on the user's device.",
  },
  platform: {
    label: "Platform",
    description: "Needs identity, roles, storage, moderation, or admin review.",
  },
};

const buildGroups = [
  {
    title: "Static sellable build",
    description: "Content, tools, plays, sources, static search, learning paths, and optional local personalization.",
    features: ["staticSearch", "communities", "learningPaths", "dataLevelFilters", "onboarding"],
  },
  {
    title: "Authenticated contributor build",
    description: ".mil sign-in, tool submissions, moderation queue, and role-based settings.",
    features: ["auth", "requireMilEmail", "toolSubmissions", "adminConsole"],
  },
  {
    title: "Full ecosystem build",
    description: "First-party video learning, voting, comments, analytics, messaging, and admin controls.",
    features: ["personalizedLearning", "firstPartyVideos", "voting", "comments", "analytics", "messaging"],
  },
];

export default function FeatureMapPage() {
  const modes = (Object.entries(MODE_COPY) as Array<[FeatureMode, (typeof MODE_COPY)[FeatureMode]]>).filter(
    ([mode]) => APP_MODE === "platform" || mode !== "platform",
  );
  const visibleBuildGroups = APP_MODE === "platform" ? buildGroups : buildGroups.filter((group) => group.title === "Static sellable build");
  const entries = Object.entries(FEATURE_REGISTRY).filter(([, feature]) => APP_MODE === "platform" || feature.mode !== "platform");

  return (
    <div className="flex flex-col">
      <div className="hero-af text-white px-5 pt-5 pb-5 overflow-hidden rounded-b-[24px]">
        <div className="flex items-center gap-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/af-symbol-white.svg" alt="U.S. Air Force" className="h-6 flex-shrink-0" draggable={false} />
          <div className="w-px h-5 bg-silver/40 flex-shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-on-dark-dim">{PRODUCT_NAME}</span>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider mb-1">Feature Map</h1>
        <p className="text-sm text-on-dark">
          {APP_MODE === "static" ? "Static content edition" : "Platform edition"} with explicit module boundaries and fallbacks.
        </p>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-4 pb-6">
        <ScrollReveal>
          <section className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-inner bg-primary/10 flex items-center justify-center flex-shrink-0">
                <SlidersHorizontal size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-silver">Product rule</p>
                <h2 className="text-sm font-bold text-primary-dark mt-0.5">
                  {APP_MODE === "static" ? "A focused, static content edition" : "Every platform feature gets a static fallback"}
                </h2>
                <p className="text-xs text-gray-600 leading-snug mt-1">
                  {APP_MODE === "static"
                    ? "No account, server storage, or user collection. Content and local preferences stay on this device."
                    : "Data environment labels are treated as hosting and handling constraints, not personal clearance claims. Classified workflows stay unsupported until the hosting and authority path says otherwise."}
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <div className="grid gap-3 lg:grid-cols-3">
          {modes.map(([mode, copy]) => (
            <ScrollReveal key={mode}>
              <section className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting h-full">
                <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{mode}</p>
                <h2 className="text-sm font-bold text-primary-dark mt-0.5">{copy.label}</h2>
                <p className="text-xs text-gray-600 leading-snug mt-1">{copy.description}</p>
              </section>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-3">
          {visibleBuildGroups.map((group) => (
            <ScrollReveal key={group.title}>
              <section className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting h-full">
                <p className="text-[10px] font-bold uppercase tracking-wider text-silver">Build option</p>
                <h2 className="text-sm font-bold text-primary-dark mt-0.5">{group.title}</h2>
                <p className="text-xs text-gray-600 leading-snug mt-1">{group.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {group.features.map((featureId) => {
                    const feature = FEATURE_REGISTRY[featureId as keyof typeof FEATURE_REGISTRY];
                    return (
                      <span key={featureId} className="text-[10px] font-semibold px-2 py-1 rounded-badge bg-primary-ghost text-primary">
                        {feature.label}
                      </span>
                    );
                  })}
                </div>
              </section>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {entries.map(([id, feature]) => {
            const active = FEATURES[id as keyof typeof FEATURES];
            const StatusIcon = active ? Power : PowerOff;
            return (
              <ScrollReveal key={id}>
                <section className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{id}</p>
                      <h2 className="text-sm font-bold text-primary-dark leading-tight mt-0.5">{feature.label}</h2>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-badge px-2 py-1 text-[10px] font-bold ${
                        active ? "bg-green-50 text-green-700" : "bg-silver-tint text-gray-500"
                      }`}
                    >
                      <StatusIcon size={12} />
                      {active ? "On" : "Off"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-badge bg-primary-ghost text-primary">
                      <CheckCircle2 size={11} /> {MODE_COPY[feature.mode].label}
                    </span>
                    {feature.requiresAuth && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-badge bg-silver-tint text-primary-dark">
                        <LockKeyhole size={11} /> Auth
                      </span>
                    )}
                    {feature.requiresDatabase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-badge bg-silver-tint text-primary-dark">
                        <Database size={11} /> Database
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-badge bg-silver-tint text-primary-dark">
                      <ShieldCheck size={11} /> {feature.dataLevel}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-silver">Static fallback</p>
                    <p className="text-xs text-gray-600 leading-snug mt-1">{feature.staticFallback}</p>
                  </div>
                </section>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
