"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CirclePlay, LockKeyhole, Play, RotateCcw } from "lucide-react";
import { LEARNING_PATHS } from "@/content/learningPaths";
import { fetchLearningAssets, fetchLearningProgress, resolvePlatformMediaUrl, setLearningProgress, type LearningAsset, type LearningProgress } from "@/lib/platformApi";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";
import { FEATURES } from "@/lib/features";

const LESSONS = [
  { id: "ai-basics", title: "AI basics for Airmen", duration: "6 min", description: "What generative AI can do, where it fails, and how to stay accountable for the result." },
  { id: "data-boundaries", title: "Know your data boundary", duration: "8 min", description: "Match the information in front of you to an approved environment before you begin." },
  { id: "prompt-brief", title: "Build a useful prompt brief", duration: "9 min", description: "Give the model a role, task, context, constraints, and an output format." },
  { id: "review-output", title: "Review before you release", duration: "7 min", description: "Check claims, sources, tone, classification, and mission impact before using an output." },
];

export default function LearnPage() {
  const identity = usePlatformIdentity();
  const [progress, setProgress] = useState<Record<string, LearningProgress>>({});
  const [assets, setAssets] = useState<LearningAsset[]>([]);

  useEffect(() => {
    if (!FEATURES.firstPartyVideos) return setAssets([]);
    fetchLearningAssets().then(setAssets).catch(() => setAssets([]));
  }, []);

  useEffect(() => {
    if (!FEATURES.personalizedLearning) return setProgress({});
    if (!identity) return setProgress({});
    fetchLearningProgress()
      .then((items) => setProgress(Object.fromEntries(items.map((item) => [item.assetId, item]))))
      .catch(() => setProgress({}));
  }, [identity]);

  const lessons = useMemo(
    () => assets.length > 0
      ? assets.map((asset) => ({
          id: asset.id,
          title: asset.title,
          duration: `${Math.max(1, Math.ceil(asset.durationSeconds / 60))} min`,
          description: asset.summary,
          playbackUrl: resolvePlatformMediaUrl(asset.playbackUrl),
          thumbnailUrl: asset.thumbnailUrl,
          captionUrl: asset.captionUrl ? resolvePlatformMediaUrl(asset.captionUrl) : "",
          audience: asset.audience,
        }))
      : LESSONS.map((lesson) => ({ ...lesson, playbackUrl: "", thumbnailUrl: "", captionUrl: "", audience: "" })),
    [assets],
  );
  const completed = useMemo(() => lessons.filter((lesson) => progress[lesson.id]?.status === "completed").length, [lessons, progress]);

  const mark = async (assetId: string, value: number) => {
    if (!FEATURES.personalizedLearning) return;
    if (!identity) return openPlatformAccount();
    await setLearningProgress(assetId, value);
    setProgress((current) => ({
      ...current,
      [assetId]: { assetId, progressPercent: value, status: value >= 100 ? "completed" : value > 0 ? "in_progress" : "not_started" },
    }));
  };

  return (
    <div className="flex flex-col">
      <div className="hero-af rounded-b-[24px] px-5 pb-5 pt-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-dark-dim">Airmen to expert</p>
        <h1 className="mt-2 text-2xl font-bold">Learning</h1>
        <p className="mt-1 max-w-2xl text-sm text-on-dark">First-party lessons and role-based paths built for Air Force work.</p>
        <div className="mt-4 h-2 max-w-sm overflow-hidden rounded-full bg-white/15">
          <div className="h-full bg-success" style={{ width: `${(completed / lessons.length) * 100}%` }} />
        </div>
        <p className="mt-1 text-[10px] font-bold uppercase text-on-dark-dim">{completed} of {lessons.length} foundations complete</p>
      </div>

      <div className="grid gap-6 px-4 py-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <section>
          <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-primary-dark">Foundation series</h2><span className="text-[10px] font-bold uppercase text-primary">First-party curriculum</span></div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {lessons.map((lesson, index) => {
              const item = progress[lesson.id];
              const done = item?.status === "completed";
              return (
                <article key={lesson.id} className="rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-inner ${done ? "bg-success-tint text-success-mid" : "bg-primary-ghost text-primary"}`}>
                      {done ? <CheckCircle2 size={19} /> : <CirclePlay size={19} />}
                    </div>
                    <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-silver">Lesson {index + 1} · {lesson.duration}</p><h3 className="mt-0.5 text-sm font-bold text-primary-dark">{lesson.title}</h3></div>
                  </div>
                  {lesson.playbackUrl && (
                    <video controls preload="metadata" poster={lesson.thumbnailUrl || undefined} className="mt-3 aspect-video w-full rounded-inner bg-primary-dark" aria-label={lesson.title}>
                      <source src={lesson.playbackUrl} />
                      {lesson.captionUrl && <track kind="captions" src={lesson.captionUrl} srcLang="en" label="English" default />}
                      Your browser cannot play this training video.
                    </video>
                  )}
                  <p className="mt-3 text-xs leading-relaxed text-gray-600">{lesson.description}</p>
                  {lesson.audience && <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary">{lesson.audience}</p>}
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => void mark(lesson.id, done ? 0 : 100)} className={`inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-inner text-xs font-bold ${done ? "border border-silver-mid text-gray-600" : "bg-primary text-white"}`}>
                      {done ? <RotateCcw size={14} /> : <Play size={14} />} {done ? "Reset" : "Complete lesson"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-inner bg-silver-tint px-3 py-2 text-[11px] text-gray-600"><LockKeyhole size={14} className="mt-px flex-shrink-0 text-primary" /> Training media uses the platform learning catalog. Administrators can publish approved first-party video URLs without changing paths or progress.</div>
        </section>

        <aside>
          <h2 className="text-sm font-bold text-primary-dark">Role-based paths</h2>
          <div className="mt-3 grid gap-2">
            {LEARNING_PATHS.map((path) => (
              <article key={path.id} className="rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{path.audience}</p>
                <h3 className="mt-1 text-sm font-bold text-primary-dark">{path.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{path.focus}</p>
                <ol className="mt-3 grid gap-1 text-[11px] text-gray-500">{path.steps.map((step, index) => <li key={step}>{index + 1}. {step}</li>)}</ol>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
