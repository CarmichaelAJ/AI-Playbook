"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Save, Send, ShieldCheck } from "lucide-react";
import { createSubmission, fetchMySubmissions, fetchSubmission, updateSubmission, type CommunitySubmission, type SubmissionKind } from "@/lib/platformApi";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";

const KIND_LABELS: Record<SubmissionKind, string> = {
  tool: "Tool",
  play: "Play",
  community: "Community",
};

export default function SubmitPage() {
  const identity = usePlatformIdentity();
  const [kind, setKind] = useState<SubmissionKind>("tool");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [dataLevel, setDataLevel] = useState("tbd");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CommunitySubmission | null>(null);
  const [mine, setMine] = useState<CommunitySubmission[]>([]);
  const [editId, setEditId] = useState("");
  const [communityId, setCommunityId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextEditId = params.get("edit") ?? "";
    setCommunityId(params.get("community") ?? "");
    if (!nextEditId) return;
    setEditId(nextEditId);
    fetchSubmission(nextEditId)
      .then((item) => {
        setKind(item.kind);
        setTitle(item.title);
        setSummary(item.summary);
        setContent(item.content);
        setUrl(item.url ?? "");
        setCategory(item.category ?? "");
        setDataLevel(item.dataLevel === "il4" ? "impact-level-4" : item.dataLevel === "il5" ? "impact-level-5" : item.dataLevel);
        setCommunityId(item.communityId ?? "");
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load submission."));
  }, []);

  useEffect(() => {
    if (!identity) {
      setMine([]);
      return;
    }
    fetchMySubmissions().then(setMine).catch(() => setMine([]));
  }, [identity, created]);

  const save = async (submitMode: "draft" | "review") => {
    if (!identity) {
      openPlatformAccount();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const input = {
        kind,
        title,
        summary,
        content,
        url: kind === "tool" ? url : "",
        category,
        dataLevel,
        authorUsername: identity.username,
        authorAfsc: identity.afsc,
        authorRank: identity.rank,
        communityId,
        submitMode,
      };
      const submission = editId
        ? await updateSubmission(editId, input)
        : await createSubmission(input);
      setCreated(submission);
      setEditId(submission.id);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Submission failed.");
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void save("review");
  };

  return (
    <div className="flex flex-col">
      <div className="hero-af rounded-b-[24px] px-5 pb-5 pt-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-dark-dim">Community platform</p>
        <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wider">Submit</h1>
        <p className="mt-1 text-sm text-on-dark">{editId ? "Revise your submission and return it for review." : "Share a Tool, Play, or Community for moderator review."}</p>
      </div>

      <div className="grid gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)]">
        <form onSubmit={submit} className="rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
          <div className="grid grid-cols-3 gap-1 rounded-inner bg-silver-tint p-1" role="tablist" aria-label="Submission type">
            {(Object.keys(KIND_LABELS) as SubmissionKind[]).map((option) => (
              <button key={option} type="button" role="tab" aria-selected={kind === option} onClick={() => setKind(option)} className={`min-h-10 rounded-inner px-2 text-xs font-bold ${kind === option ? "bg-white text-primary shadow-resting" : "text-gray-500"}`}>
                {KIND_LABELS[option]}
              </button>
            ))}
          </div>

          {!identity && (
            <button type="button" onClick={openPlatformAccount} className="mt-4 flex w-full items-center justify-center gap-2 rounded-inner border border-primary/30 bg-primary-ghost px-4 py-3 text-sm font-bold text-primary">
              <ShieldCheck size={17} /> Sign in with simulated Entra
            </button>
          )}

          <div className="mt-4 grid gap-3">
            <label className="text-xs font-semibold text-gray-700">
              {kind} name
              <input required minLength={3} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 text-sm font-normal focus:border-primary focus:outline-none" />
            </label>
            <label className="text-xs font-semibold text-gray-700">
              Short summary
              <textarea required minLength={10} maxLength={500} rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} className="mt-1 w-full resize-y rounded-input border border-silver-mid px-3 py-2.5 text-sm font-normal focus:border-primary focus:outline-none" />
            </label>
            {kind === "tool" && (
              <label className="text-xs font-semibold text-gray-700">
                Tool URL
                <input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://" className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 text-sm font-normal focus:border-primary focus:outline-none" />
              </label>
            )}
            <label className="text-xs font-semibold text-gray-700">
              {kind === "play" ? "Play instructions or prompt" : kind === "community" ? "Community purpose and membership" : "What it does and how Airmen use it"}
              <textarea maxLength={10000} rows={6} value={content} onChange={(event) => setContent(event.target.value)} className="mt-1 w-full resize-y rounded-input border border-silver-mid px-3 py-2.5 text-sm font-normal focus:border-primary focus:outline-none" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-gray-700">
                {kind === "community" ? "AFSC or audience" : "Category"}
                <input value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full rounded-input border border-silver-mid px-3 py-2.5 text-sm font-normal focus:border-primary focus:outline-none" />
              </label>
              <label className="text-xs font-semibold text-gray-700">
                Data level
                <select value={dataLevel} onChange={(event) => setDataLevel(event.target.value)} className="mt-1 w-full rounded-input border border-silver-mid bg-white px-3 py-2.5 text-sm font-normal focus:border-primary focus:outline-none">
                  <option value="tbd">Needs review</option>
                  <option value="public">Public</option>
                  <option value="official-use">Official use</option>
                  <option value="cui">CUI</option>
                  <option value="impact-level-4">Impact Level 4</option>
                  <option value="impact-level-5">Impact Level 5</option>
                </select>
              </label>
            </div>
          </div>

          {error && <p role="alert" className="mt-3 text-xs font-semibold text-danger-mid">{error}</p>}
          {created && (
            <div className="mt-3 flex items-start gap-2 rounded-inner border border-success/30 bg-success-tint px-3 py-2.5 text-xs text-success-mid">
              <CheckCircle2 size={16} className="mt-px flex-shrink-0" />
              <span><strong>{created.title}</strong> was {created.status === "draft" ? "saved as a draft" : "sent to the moderation queue"}.</span>
            </div>
          )}

          <div className="mt-4 grid grid-cols-[auto_1fr] gap-2">
            <button type="button" onClick={() => void save("draft")} disabled={busy || !identity} className="flex min-h-11 items-center justify-center gap-2 rounded-inner border border-primary/25 px-4 text-sm font-bold text-primary disabled:text-gray-400">
              <Save size={16} /> Save draft
            </button>
            <button type="submit" disabled={busy || !identity} className="flex min-h-11 items-center justify-center gap-2 rounded-inner bg-primary px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">
              <Send size={16} /> {busy ? "Saving..." : editId ? "Resubmit for review" : "Submit for review"}
            </button>
          </div>
        </form>

        <aside className="self-start rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
          <h2 className="text-sm font-bold text-primary-dark">Your submissions</h2>
          {!identity ? (
            <p className="mt-2 text-xs text-gray-500">Sign in to view your submission status.</p>
          ) : mine.length === 0 ? (
            <p className="mt-2 text-xs text-gray-500">Nothing submitted yet.</p>
          ) : (
            <div className="mt-3 grid gap-2">
              {mine.map((item) => (
                <Link key={item.id} href={`/post?id=${item.id}`} className="block rounded-inner border border-silver-mid/50 px-3 py-2 hover:border-primary/30">
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-xs font-bold text-primary-dark">{item.title}</p>
                    <span className={`text-[9px] font-bold uppercase ${item.status === "approved" ? "text-success-mid" : item.status === "rejected" ? "text-danger-mid" : "text-caution-mid"}`}>{item.status}</span>
                  </div>
                  {item.moderationNote && <p className="mt-1 text-[11px] text-gray-500">{item.moderationNote}</p>}
                </Link>
              ))}
            </div>
          )}
          <Link href="/plays" className="mt-4 inline-flex text-xs font-bold text-primary">Back to community feeds</Link>
        </aside>
      </div>
    </div>
  );
}
