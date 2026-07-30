"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, MessageSquareWarning, RefreshCw, ShieldAlert, X } from "lucide-react";
import { fetchModerationQueue, moderateSubmission, type CommunitySubmission, type SubmissionStatus } from "@/lib/platformApi";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";

export default function ModerationPage() {
  const identity = usePlatformIdentity();
  const [status, setStatus] = useState<SubmissionStatus>("pending");
  const [items, setItems] = useState<CommunitySubmission[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const allowed = identity?.role === "moderator" || identity?.role === "admin";
  const load = useCallback(async () => {
    if (!allowed) return;
    setError("");
    try {
      setItems(await fetchModerationQueue(status));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load moderation queue.");
    }
  }, [allowed, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (id: string, decision: "approved" | "rejected" | "changes_requested") => {
    setBusyId(id);
    setError("");
    try {
      await moderateSubmission(id, decision, notes[id] ?? "");
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : "Moderation action failed.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="hero-af rounded-b-[24px] px-5 pb-5 pt-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-dark-dim">Moderator workspace</p>
        <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wider">Moderation</h1>
        <p className="mt-1 text-sm text-on-dark">Review community Tools, Plays, and Communities before publication.</p>
      </div>

      {!allowed ? (
        <div className="px-4 py-10">
          <div className="mx-auto max-w-lg rounded-card border border-silver-mid/60 bg-white p-6 text-center shadow-resting">
            <ShieldAlert size={24} className="mx-auto text-caution-mid" />
            <h2 className="mt-3 text-sm font-bold text-primary-dark">Moderator or admin role required</h2>
            <button type="button" onClick={openPlatformAccount} className="mt-4 rounded-inner bg-primary px-4 py-2.5 text-xs font-bold text-white">Open simulated identity</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 border-b border-silver-mid/50 bg-white px-4 py-3">
            {(["pending", "changes_requested", "approved", "rejected", "removed"] as SubmissionStatus[]).map((option) => (
              <button key={option} type="button" onClick={() => setStatus(option)} aria-pressed={status === option} className={`rounded-inner px-3 py-2 text-xs font-bold capitalize ${status === option ? "bg-primary text-white" : "text-gray-500 hover:bg-primary-ghost"}`}>{option}</button>
            ))}
            <button type="button" onClick={() => void load()} aria-label="Refresh queue" className="ml-auto flex h-9 w-9 items-center justify-center rounded-inner text-primary hover:bg-primary-ghost"><RefreshCw size={16} /></button>
          </div>

          {error && <p role="alert" className="mx-4 mt-4 rounded-inner bg-danger-tint px-3 py-2 text-xs font-semibold text-danger-mid">{error}</p>}

          <div className="grid gap-3 px-4 py-5">
            {items.length === 0 ? (
              <div className="rounded-card border border-silver-mid/60 bg-white p-8 text-center shadow-resting">
                <p className="text-sm font-bold text-primary-dark">Queue clear</p>
                <p className="mt-1 text-xs text-gray-500">No {status} submissions.</p>
              </div>
            ) : items.map((item) => (
              <article key={item.id} className="rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
                <div className="flex flex-wrap items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{item.kind} · {item.dataLevel}</p>
                    <h2 className="mt-1 text-sm font-bold text-primary-dark">{item.title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">{item.summary}</p>
                  </div>
                  <span className="rounded-badge bg-primary-ghost px-2 py-1 text-[10px] font-bold text-primary">{item.authorAfsc} | {item.authorRank} · @{item.authorUsername}</span>
                </div>
                {item.content && <p className="mt-3 whitespace-pre-wrap rounded-inner bg-silver-tint px-3 py-2 text-xs leading-relaxed text-gray-700">{item.content}</p>}
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-xs font-semibold text-primary underline">{item.url}</a>}
                {status === "pending" && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
                    <input value={notes[item.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Moderator note" className="rounded-input border border-silver-mid px-3 py-2 text-xs focus:border-primary focus:outline-none" />
                    <button type="button" disabled={busyId === item.id} onClick={() => void decide(item.id, "rejected")} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-inner border border-danger/30 px-3 text-xs font-bold text-danger-mid"><X size={14} /> Reject</button>
                    <button type="button" disabled={busyId === item.id} onClick={() => void decide(item.id, "changes_requested")} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-inner border border-caution/30 px-3 text-xs font-bold text-caution-mid"><MessageSquareWarning size={14} /> Revise</button>
                    <button type="button" disabled={busyId === item.id} onClick={() => void decide(item.id, "approved")} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-inner bg-success-mid px-3 text-xs font-bold text-white"><Check size={14} /> Approve</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
