"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Flag, MessageSquare, Pencil, Send } from "lucide-react";
import {
  addComment,
  fetchComments,
  fetchSubmission,
  reportSubmission,
  voteOnSubmission,
  type CommunityComment,
  type CommunitySubmission,
} from "@/lib/platformApi";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";

export default function PostPage() {
  const [id, setId] = useState("");
  const identity = usePlatformIdentity();
  const [submission, setSubmission] = useState<CommunitySubmission | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [body, setBody] = useState("");
  const [vote, setVote] = useState<-1 | 0 | 1>(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("id") ?? "");
  }, []);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchSubmission(id), fetchComments(id)])
      .then(([nextSubmission, nextComments]) => {
        setSubmission(nextSubmission);
        setComments(nextComments);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Post unavailable."));
  }, [id]);

  const castVote = async (next: -1 | 1) => {
    if (!identity) return openPlatformAccount();
    if (!submission) return;
    const value = vote === next ? 0 : next;
    try {
      const score = await voteOnSubmission(id, value);
      setVote(value);
      setSubmission({ ...submission, score });
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : "Vote failed.");
    }
  };

  const comment = async (event: FormEvent) => {
    event.preventDefault();
    if (!identity) return openPlatformAccount();
    if (!body.trim()) return;
    try {
      const created = await addComment(id, body, identity);
      setComments((current) => [...current, created]);
      setBody("");
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : "Comment failed.");
    }
  };

  const report = async () => {
    if (!identity) return openPlatformAccount();
    try {
      await reportSubmission(id, "other", "Flagged from the post page for moderator review.");
      setMessage("Report sent to the moderation team.");
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : "Report failed.");
    }
  };

  if (error && !submission) {
    return <div className="p-6"><p className="rounded-card bg-white p-6 text-sm font-semibold text-danger-mid shadow-resting">{error}</p></div>;
  }
  if (!submission) return <div className="p-6 text-sm text-gray-500">Loading post...</div>;

  const mine = identity?.email.toLowerCase() === submission.authorEmail.toLowerCase();
  const editable = mine && ["draft", "pending", "changes_requested"].includes(submission.status);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link href={submission.kind === "community" ? "/communities" : `/${submission.kind}s`} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
          <ArrowLeft size={15} /> Back
        </Link>
        <div className="flex items-center gap-2">
          {editable && (
            <Link href={`/submit?edit=${submission.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-inner border border-primary/25 px-3 text-xs font-bold text-primary">
              <Pencil size={14} /> Edit
            </Link>
          )}
          {submission.status === "approved" && (
            <button type="button" onClick={() => void report()} title="Report post" className="flex h-9 w-9 items-center justify-center rounded-inner text-gray-500 hover:bg-danger-tint hover:text-danger-mid">
              <Flag size={15} />
            </button>
          )}
        </div>
      </div>

      <article className="overflow-hidden rounded-card border border-silver-mid/60 bg-white shadow-resting">
        <div className="flex">
          <div className="flex w-14 flex-shrink-0 flex-col items-center border-r border-silver-mid/50 bg-silver-tint/60 py-4">
            <button type="button" onClick={() => void castVote(1)} aria-label="Upvote" className={`flex h-9 w-9 items-center justify-center rounded-inner ${vote === 1 ? "bg-primary text-white" : "text-gray-400 hover:bg-white hover:text-primary"}`}><ArrowUp size={18} /></button>
            <span className="py-1.5 text-sm font-extrabold text-primary-dark">{submission.score}</span>
            <button type="button" onClick={() => void castVote(-1)} aria-label="Downvote" className={`flex h-9 w-9 items-center justify-center rounded-inner ${vote === -1 ? "bg-danger-mid text-white" : "text-gray-400 hover:bg-white hover:text-danger-mid"}`}><ArrowDown size={18} /></button>
          </div>
          <div className="min-w-0 flex-1 p-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-silver">
              <span>{submission.kind}</span><span>{submission.status.replace("_", " ")}</span><span>{submission.dataLevel}</span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-primary-dark">{submission.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{submission.summary}</p>
            {submission.content && <div className="mt-4 whitespace-pre-wrap border-t border-silver-mid/50 pt-4 text-sm leading-relaxed text-gray-700">{submission.content}</div>}
            {submission.url && (
              <a href={submission.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                Open resource <ExternalLink size={14} />
              </a>
            )}
            <p className="mt-5 text-xs font-semibold text-gray-500">{submission.authorAfsc} | {submission.authorRank} · @{submission.authorUsername}</p>
            {submission.moderationNote && <p className="mt-3 rounded-inner bg-caution-tint px-3 py-2 text-xs text-gray-700">Moderator note: {submission.moderationNote}</p>}
          </div>
        </div>
      </article>

      {message && <p className="mt-3 rounded-inner bg-success-tint px-3 py-2 text-xs font-semibold text-success-mid">{message}</p>}
      {error && <p className="mt-3 rounded-inner bg-danger-tint px-3 py-2 text-xs font-semibold text-danger-mid">{error}</p>}

      <section className="mt-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-primary-dark"><MessageSquare size={16} /> Discussion ({comments.length})</h2>
        <div className="mt-3 grid gap-2">
          {comments.map((item) => (
            <article key={item.id} className="rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
              <p className="text-[11px] font-bold text-primary-dark">{item.authorAfsc} | {item.authorRank} · @{item.authorUsername}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.body}</p>
            </article>
          ))}
          {comments.length === 0 && <p className="rounded-card border border-dashed border-silver-mid/70 bg-white p-5 text-center text-xs text-gray-500">Start the discussion.</p>}
        </div>
        <form onSubmit={comment} className="mt-3 flex gap-2">
          <input value={body} onChange={(event) => setBody(event.target.value)} placeholder={identity ? "Add a comment" : "Sign in to comment"} className="min-w-0 flex-1 rounded-input border border-silver-mid bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
          <button type="submit" aria-label="Post comment" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-inner bg-primary text-white"><Send size={16} /></button>
        </form>
      </section>
    </div>
  );
}
