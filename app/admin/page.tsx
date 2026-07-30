"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Activity, Archive, Bell, FileCheck2, Flag, Lock, RefreshCw, ShieldAlert, SlidersHorizontal, Unlock, Users, Video } from "lucide-react";
import {
  broadcastNotification,
  createLearningAsset,
  fetchAdminFeatures,
  fetchAdminUsers,
  fetchAuditEvents,
  fetchMetrics,
  fetchReports,
  fetchAccessReports,
  fetchManagedContent,
  fetchLearningAssets,
  resolveAccessReport,
  resolveReport,
  resolvePlatformMediaUrl,
  setAdminFeature,
  setUserSuspension,
  updateLearningAsset,
  updateManagedContent,
  uploadMediaFile,
  type AccessReport,
  type ContentReport,
  type ManagedContent,
  type PlatformFeature,
  type LearningAsset,
  type UserProfile,
} from "@/lib/platformApi";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";

type AdminTab = "features" | "content" | "media" | "reports" | "users" | "audit";

export default function AdminPage() {
  const identity = usePlatformIdentity();
  const [tab, setTab] = useState<AdminTab>("features");
  const [features, setFeatures] = useState<PlatformFeature[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [accessReports, setAccessReports] = useState<AccessReport[]>([]);
  const [content, setContent] = useState<ManagedContent[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [events, setEvents] = useState<Array<{ id: string; action: string; actorEmail?: string; targetType: string; targetId?: string; createdAt: string }>>([]);
  const [metrics, setMetrics] = useState<Record<string, number | string>>({});
  const [assets, setAssets] = useState<LearningAsset[]>([]);
  const [mediaDraft, setMediaDraft] = useState({
    id: "",
    title: "",
    summary: "",
    playbackUrl: "",
    captionUrl: "",
    durationMinutes: "5",
    audience: "All Airmen",
  });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [announcement, setAnnouncement] = useState({ title: "", body: "", targetUrl: "" });

  const load = useCallback(async () => {
    if (identity?.role !== "admin") return;
    setError("");
    try {
      const [nextFeatures, nextReports, nextAccessReports, nextContent, nextUsers, nextEvents, nextMetrics, nextAssets] = await Promise.all([
        fetchAdminFeatures(), fetchReports(), fetchAccessReports(), fetchManagedContent(), fetchAdminUsers(), fetchAuditEvents(), fetchMetrics(), fetchLearningAssets(true),
      ]);
      setFeatures(nextFeatures);
      setReports(nextReports);
      setAccessReports(nextAccessReports);
      setContent(nextContent);
      setUsers(nextUsers);
      setEvents(nextEvents);
      setMetrics(nextMetrics);
      setAssets(nextAssets);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Admin data unavailable.");
    }
  }, [identity?.role]);

  useEffect(() => { void load(); }, [load]);

  const toggleFeature = async (feature: PlatformFeature) => {
    await setAdminFeature(feature.id, !feature.enabled);
    setFeatures((current) => current.map((item) => item.id === feature.id ? { ...item, enabled: !item.enabled, overridden: true } : item));
  };

  const toggleUser = async (user: UserProfile) => {
    const updated = await setUserSuspension(user.email, !user.suspended, user.suspended ? "" : "Suspended by platform administrator.");
    setUsers((current) => current.map((item) => item.email === user.email ? updated : item));
  };

  const closeReport = async (report: ContentReport, status: "resolved" | "dismissed") => {
    await resolveReport(report.id, status);
    setReports((current) => current.filter((item) => item.id !== report.id));
  };

  const closeAccessReport = async (report: AccessReport, status: "resolved" | "dismissed") => {
    await resolveAccessReport(report.id, status);
    setAccessReports((current) => current.filter((item) => item.id !== report.id));
  };

  const changeContent = async (item: ManagedContent, patch: Parameters<typeof updateManagedContent>[1]) => {
    const updated = await updateManagedContent(item.id, patch);
    setContent((current) => current.map((entry) => entry.id === item.id ? updated : entry));
  };

  const sendAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const recipients = await broadcastNotification(announcement.title, announcement.body, announcement.targetUrl);
      setAnnouncement({ title: "", body: "", targetUrl: "" });
      setError(`Announcement queued for ${recipients} active users.`);
    } catch (announcementError) {
      setError(announcementError instanceof Error ? announcementError.message : "Could not send announcement.");
    }
  };

  const addAsset = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const asset = await createLearningAsset({
        id: mediaDraft.id,
        title: mediaDraft.title,
        summary: mediaDraft.summary,
        playbackUrl: mediaDraft.playbackUrl,
        captionUrl: mediaDraft.captionUrl,
        durationSeconds: Math.max(0, Number(mediaDraft.durationMinutes) * 60),
        audience: mediaDraft.audience,
        status: "draft",
        dataLevel: "public",
      });
      setAssets((current) => [asset, ...current]);
      setMediaDraft({ id: "", title: "", summary: "", playbackUrl: "", captionUrl: "", durationMinutes: "5", audience: "All Airmen" });
    } catch (assetError) {
      setError(assetError instanceof Error ? assetError.message : "Could not create learning asset.");
    }
  };

  const uploadMedia = async (file: File, field: "playbackUrl" | "captionUrl") => {
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadMediaFile(file);
      setMediaDraft((current) => ({ ...current, [field]: uploaded.url }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Media upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const changeAssetStatus = async (asset: LearningAsset, status: LearningAsset["status"]) => {
    const updated = await updateLearningAsset(asset.id, { status });
    setAssets((current) => current.map((item) => item.id === asset.id ? updated : item));
  };

  if (identity?.role !== "admin") {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-lg rounded-card border border-silver-mid/60 bg-white p-7 text-center shadow-resting">
          <ShieldAlert className="mx-auto text-caution-mid" size={25} />
          <h1 className="mt-3 text-base font-bold text-primary-dark">Admin role required</h1>
          <button type="button" onClick={openPlatformAccount} className="mt-4 rounded-inner bg-primary px-4 py-2.5 text-xs font-bold text-white">Open simulated identity</button>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string; icon: typeof Activity }> = [
    { id: "features", label: "Features", icon: SlidersHorizontal },
    { id: "content", label: "Content", icon: FileCheck2 },
    { id: "media", label: "Media", icon: Video },
    { id: "reports", label: "Reports", icon: Flag },
    { id: "users", label: "Users", icon: Users },
    { id: "audit", label: "Audit", icon: Activity },
  ];

  return (
    <div className="flex flex-col">
      <div className="hero-af rounded-b-[24px] px-5 pb-5 pt-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-dark-dim">Platform control plane</p>
        <h1 className="mt-2 text-2xl font-bold">Admin</h1>
        <p className="mt-1 text-sm text-on-dark">Control platform capabilities, safety actions, and deployment posture.</p>
        <div className="mt-4 grid max-w-xl grid-cols-3 gap-2">
          {Object.entries(metrics).slice(0, 3).map(([name, count]) => (
            <div key={name} className="rounded-inner bg-white/10 px-3 py-2">
              <p className="text-lg font-extrabold">{count}</p>
              <p className="truncate text-[9px] font-bold uppercase text-on-dark-dim">{name.replaceAll("_", " ")}</p>
            </div>
          ))}
          {Object.keys(metrics).length === 0 && <p className="col-span-3 text-xs text-on-dark-dim">Metrics appear as platform activity is recorded.</p>}
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto border-b border-silver-mid/50 bg-white px-4 py-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`inline-flex min-h-10 items-center gap-1.5 rounded-inner px-3 text-xs font-bold ${tab === id ? "bg-primary text-white" : "text-gray-500 hover:bg-primary-ghost"}`}><Icon size={14} /> {label}</button>
        ))}
        <button type="button" onClick={() => void load()} aria-label="Refresh admin data" className="ml-auto flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-inner text-primary hover:bg-primary-ghost"><RefreshCw size={15} /></button>
      </div>

      {error && <p className="mx-4 mt-4 rounded-inner bg-danger-tint px-3 py-2 text-xs font-semibold text-danger-mid">{error}</p>}
      <div className="grid gap-3 px-4 py-5">
        {tab === "features" && features.map((feature) => (
          <div key={feature.id} className="flex items-center gap-4 rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-primary-dark">{feature.label}</h2>{feature.overridden && <span className="text-[9px] font-bold uppercase text-caution-mid">Override</span>}</div>
              <p className="mt-1 text-xs text-gray-500">{feature.mode} · Static fallback: {feature.staticFallback}</p>
            </div>
            <button type="button" role="switch" aria-checked={feature.enabled} onClick={() => void toggleFeature(feature)} className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${feature.enabled ? "bg-success-mid" : "bg-gray-300"}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${feature.enabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        ))}

        {tab === "content" && (
          <form onSubmit={sendAnnouncement} className="grid gap-3 rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting md:grid-cols-2">
            <div className="md:col-span-2"><h2 className="flex items-center gap-2 text-sm font-bold text-primary-dark"><Bell size={16} /> Platform announcement</h2><p className="mt-1 text-xs text-gray-500">Send an in-app notice to active users.</p></div>
            <label className="text-xs font-bold text-gray-700">Title<input required minLength={3} value={announcement.title} onChange={(event) => setAnnouncement({ ...announcement, title: event.target.value })} className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 font-normal" /></label>
            <label className="text-xs font-bold text-gray-700">Target URL<input value={announcement.targetUrl} onChange={(event) => setAnnouncement({ ...announcement, targetUrl: event.target.value })} placeholder="/learn" className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 font-normal" /></label>
            <label className="text-xs font-bold text-gray-700 md:col-span-2">Message<textarea required minLength={3} rows={3} value={announcement.body} onChange={(event) => setAnnouncement({ ...announcement, body: event.target.value })} className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 font-normal" /></label>
            <button type="submit" className="min-h-10 rounded-inner bg-primary px-4 text-xs font-bold text-white md:col-span-2">Send announcement</button>
          </form>
        )}

        {tab === "content" && content.map((item) => (
          <article key={item.id} className="rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{item.kind} · {item.status}</p>
                <h2 className="mt-1 text-sm font-bold text-primary-dark">{item.title}</h2>
                <p className="mt-1 text-[10px] text-gray-500">
                  Verified {item.verifiedAt ? new Date(item.verifiedAt).toLocaleDateString() : "not recorded"} · Review {item.reviewDueAt ? new Date(item.reviewDueAt).toLocaleDateString() : "not scheduled"}
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => void changeContent(item, { threadLocked: !item.threadLocked })} aria-label={item.threadLocked ? "Unlock discussion" : "Lock discussion"} title={item.threadLocked ? "Unlock discussion" : "Lock discussion"} className="flex h-9 w-9 items-center justify-center rounded-inner border border-silver-mid text-primary">
                  {item.threadLocked ? <Unlock size={15} /> : <Lock size={15} />}
                </button>
                <button type="button" onClick={() => void changeContent(item, { retired: !item.retiredAt })} aria-label={item.retiredAt ? "Restore content" : "Retire content"} title={item.retiredAt ? "Restore content" : "Retire content"} className="flex h-9 w-9 items-center justify-center rounded-inner border border-silver-mid text-danger-mid">
                  <Archive size={15} />
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <label className="text-[10px] font-bold uppercase text-gray-500">Authority URL<input type="url" defaultValue={item.authorityUrl ?? ""} onBlur={(event) => void changeContent(item, { authorityUrl: event.target.value })} className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2 text-xs font-normal normal-case" /></label>
              <label className="text-[10px] font-bold uppercase text-gray-500">Review due<input type="date" defaultValue={item.reviewDueAt?.slice(0, 10) ?? ""} onChange={(event) => void changeContent(item, { reviewDueAt: event.target.value ? new Date(`${event.target.value}T00:00:00Z`).toISOString() : "" })} className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2 text-xs font-normal normal-case" /></label>
            </div>
            <button type="button" onClick={() => void changeContent(item, { verifiedAt: new Date().toISOString() })} className="mt-3 min-h-9 rounded-inner bg-primary-ghost px-3 text-xs font-bold text-primary">Mark verified now</button>
          </article>
        ))}
        {tab === "content" && content.length === 0 && <p className="rounded-card border border-dashed border-silver-mid/70 bg-white p-7 text-center text-xs text-gray-500">No approved platform content to manage.</p>}

        {tab === "media" && (
          <>
            <form onSubmit={addAsset} className="grid gap-3 rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting lg:grid-cols-2">
              <div className="lg:col-span-2">
                <h2 className="text-sm font-bold text-primary-dark">Register first-party video</h2>
                <p className="mt-1 text-xs text-gray-500">Upload approved media or register an approved HTTPS URL. New assets remain drafts until published.</p>
              </div>
              <label className="text-xs font-bold text-gray-700">Asset ID<input required pattern="[a-z0-9-]+" value={mediaDraft.id} onChange={(event) => setMediaDraft({ ...mediaDraft, id: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="prompt-brief-101" className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 font-normal" /></label>
              <label className="text-xs font-bold text-gray-700">Title<input required minLength={3} value={mediaDraft.title} onChange={(event) => setMediaDraft({ ...mediaDraft, title: event.target.value })} className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 font-normal" /></label>
              <label className="text-xs font-bold text-gray-700 lg:col-span-2">Summary<textarea required minLength={10} rows={3} value={mediaDraft.summary} onChange={(event) => setMediaDraft({ ...mediaDraft, summary: event.target.value })} className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 font-normal" /></label>
              <label className="text-xs font-bold text-gray-700">Video file<input type="file" accept="video/mp4,video/webm" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadMedia(file, "playbackUrl"); }} className="mt-1 block w-full text-xs font-normal text-gray-500 file:mr-3 file:rounded-inner file:border-0 file:bg-primary-ghost file:px-3 file:py-2 file:font-bold file:text-primary" /></label>
              <label className="text-xs font-bold text-gray-700">Caption file<input type="file" accept=".vtt,text/vtt" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadMedia(file, "captionUrl"); }} className="mt-1 block w-full text-xs font-normal text-gray-500 file:mr-3 file:rounded-inner file:border-0 file:bg-primary-ghost file:px-3 file:py-2 file:font-bold file:text-primary" /></label>
              <label className="text-xs font-bold text-gray-700 lg:col-span-2">Playback URL<input required type="text" value={mediaDraft.playbackUrl} onChange={(event) => setMediaDraft({ ...mediaDraft, playbackUrl: event.target.value })} placeholder="https://media.example.mil/training/video.mp4 or uploaded file" className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 font-normal" /></label>
              {mediaDraft.captionUrl && <p className="text-xs font-semibold text-success-mid lg:col-span-2">Caption file ready: {mediaDraft.captionUrl}</p>}
              <label className="text-xs font-bold text-gray-700">Audience<input value={mediaDraft.audience} onChange={(event) => setMediaDraft({ ...mediaDraft, audience: event.target.value })} className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 font-normal" /></label>
              <label className="text-xs font-bold text-gray-700">Duration in minutes<input required type="number" min="0" max="1440" value={mediaDraft.durationMinutes} onChange={(event) => setMediaDraft({ ...mediaDraft, durationMinutes: event.target.value })} className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 font-normal" /></label>
              <button type="submit" disabled={uploading} className="min-h-11 rounded-inner bg-primary px-4 text-sm font-bold text-white disabled:opacity-50 lg:col-span-2">{uploading ? "Uploading..." : "Save draft asset"}</button>
            </form>
            {assets.map((asset) => (
              <article key={asset.id} className="rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-silver">{asset.status} · {Math.ceil(asset.durationSeconds / 60)} min</p><h2 className="mt-1 text-sm font-bold text-primary-dark">{asset.title}</h2><p className="mt-1 text-xs text-gray-500">{asset.summary}</p></div>
                  <select value={asset.status} onChange={(event) => void changeAssetStatus(asset, event.target.value as LearningAsset["status"])} aria-label={`Status for ${asset.title}`} className="rounded-inner border border-silver-mid bg-white px-3 py-2 text-xs font-bold text-primary-dark">
                    <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                  </select>
                </div>
                <a href={resolvePlatformMediaUrl(asset.playbackUrl)} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-xs font-semibold text-primary underline">{asset.playbackUrl}</a>
              </article>
            ))}
            {assets.length === 0 && <p className="rounded-card border border-dashed border-silver-mid/70 bg-white p-7 text-center text-xs text-gray-500">No first-party media registered.</p>}
          </>
        )}

        {tab === "reports" && accessReports.map((report) => (
          <div key={report.id} className="rounded-card border border-danger/20 bg-white p-4 shadow-resting">
            <p className="text-[10px] font-bold uppercase tracking-wider text-danger-mid">{report.targetType} · {report.reason}</p>
            <h2 className="mt-1 text-sm font-bold text-primary-dark">{report.targetTitle}</h2>
            <p className="mt-1 text-xs text-gray-600">{report.details || "No additional details."}</p>
            <p className="mt-2 text-[10px] text-gray-400">{report.reporterEmail}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void closeAccessReport(report, "dismissed")} className="min-h-9 rounded-inner border border-silver-mid px-3 text-xs font-bold text-gray-600">Dismiss</button>
              <button type="button" onClick={() => void closeAccessReport(report, "resolved")} className="min-h-9 rounded-inner bg-primary px-3 text-xs font-bold text-white">Resolve</button>
            </div>
          </div>
        ))}

        {tab === "reports" && reports.map((report) => (
          <div key={report.id} className="rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
            <p className="text-[10px] font-bold uppercase tracking-wider text-danger-mid">{report.reason}</p>
            <p className="mt-1 text-xs text-gray-600">{report.details || "No additional details."}</p>
            <p className="mt-2 text-[10px] text-gray-400">Submission {report.submissionId} · {report.reporterEmail}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void closeReport(report, "dismissed")} className="min-h-9 rounded-inner border border-silver-mid px-3 text-xs font-bold text-gray-600">Dismiss</button>
              <button type="button" onClick={() => void closeReport(report, "resolved")} className="min-h-9 rounded-inner bg-primary px-3 text-xs font-bold text-white">Resolve</button>
            </div>
          </div>
        ))}

        {tab === "users" && users.map((user) => (
          <div key={user.email} className="flex items-center gap-4 rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
            <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-bold text-primary-dark">@{user.username} · {user.afsc} | {user.rank}</h2><p className="truncate text-xs text-gray-500">{user.email}</p></div>
            <button type="button" onClick={() => void toggleUser(user)} className={`min-h-9 rounded-inner px-3 text-xs font-bold ${user.suspended ? "bg-success-mid text-white" : "border border-danger/30 text-danger-mid"}`}>{user.suspended ? "Reinstate" : "Suspend"}</button>
          </div>
        ))}

        {tab === "audit" && events.map((event) => (
          <div key={event.id} className="rounded-inner border-b border-silver-mid/60 bg-white px-4 py-3">
            <p className="text-xs font-bold text-primary-dark">{event.action}</p>
            <p className="mt-0.5 text-[10px] text-gray-500">{event.actorEmail ?? "system"} · {event.targetType} {event.targetId ?? ""} · {new Date(event.createdAt).toLocaleString()}</p>
          </div>
        ))}

        {((tab === "reports" && reports.length === 0 && accessReports.length === 0) || (tab === "users" && users.length === 0) || (tab === "audit" && events.length === 0)) && (
          <p className="rounded-card border border-dashed border-silver-mid/70 bg-white p-7 text-center text-xs text-gray-500">No records in this view.</p>
        )}
      </div>
    </div>
  );
}
