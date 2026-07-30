"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, LoaderCircle, MessageSquare, Send, Users } from "lucide-react";
import {
  addComment,
  fetchComments,
  fetchCommunityFeed,
  voteOnSubmission,
  type CommunityComment,
  type CommunitySubmission,
} from "@/lib/platformApi";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";
import type { PlatformFeedSort } from "@/lib/platformFeed";

function CommentThread({ submission }: { submission: CommunitySubmission }) {
  const identity = usePlatformIdentity();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentCount, setCommentCount] = useState(submission.commentCount);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        const loadedComments = await fetchComments(submission.id);
        setComments(loadedComments);
        setCommentCount(loadedComments.length);
      } catch {
        setComments([]);
      }
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!identity) {
      openPlatformAccount();
      return;
    }
    if (!body.trim()) return;
    setBusy(true);
    try {
      const comment = await addComment(submission.id, body, identity);
      setComments((current) => [...current, comment]);
      setCommentCount((current) => current + 1);
      setBody("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-silver-mid/50">
      <button type="button" onClick={() => void toggle()} aria-expanded={open} className="flex min-h-10 w-full items-center gap-1.5 px-4 text-[11px] font-semibold text-gray-500 hover:bg-primary-ghost hover:text-primary">
        <MessageSquare size={13} /> {commentCount} {commentCount === 1 ? "comment" : "comments"}
      </button>
      {open && (
        <div className="grid gap-2 bg-silver-tint/50 px-4 pb-4 pt-2">
          {comments.length === 0 ? (
            <p className="text-[11px] text-gray-500">No comments yet.</p>
          ) : comments.map((comment) => (
            <div key={comment.id} className="rounded-inner bg-white px-3 py-2">
              <p className="text-[10px] font-bold text-primary-dark">{comment.authorAfsc} | {comment.authorRank} · @{comment.authorUsername}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">{comment.body}</p>
            </div>
          ))}
          <form onSubmit={submit} className="flex gap-2">
            <input value={body} onChange={(event) => setBody(event.target.value)} placeholder={identity ? "Add a comment" : "Sign in to comment"} className="min-w-0 flex-1 rounded-input border border-silver-mid bg-white px-3 py-2 text-xs focus:border-primary focus:outline-none" />
            <button type="submit" disabled={busy} aria-label="Post comment" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-inner bg-primary text-white disabled:bg-gray-300"><Send size={14} /></button>
          </form>
        </div>
      )}
    </div>
  );
}

function SubmissionCard({ submission }: { submission: CommunitySubmission }) {
  const identity = usePlatformIdentity();
  const [score, setScore] = useState(submission.score);
  const [vote, setVote] = useState<-1 | 0 | 1>(0);

  const castVote = async (nextVote: -1 | 1) => {
    if (!identity) {
      openPlatformAccount();
      return;
    }
    const value = vote === nextVote ? 0 : nextVote;
    try {
      setScore(await voteOnSubmission(submission.id, value));
      setVote(value);
    } catch {
      // Keep the server score authoritative when a vote is rejected.
    }
  };

  return (
    <article className="overflow-hidden rounded-card border border-silver-mid/60 bg-white shadow-resting">
      <div className="flex">
        <div className="flex w-11 flex-shrink-0 flex-col items-center border-r border-silver-mid/50 bg-silver-tint/60 py-3">
          <button type="button" onClick={() => void castVote(1)} aria-label={`Upvote ${submission.title}`} aria-pressed={vote === 1} className={`flex h-8 w-8 items-center justify-center rounded-inner ${vote === 1 ? "bg-primary text-white" : "text-gray-400 hover:bg-white hover:text-primary"}`}><ArrowUp size={16} /></button>
          <span className="py-1 text-xs font-extrabold text-primary-dark">{score}</span>
          <button type="button" onClick={() => void castVote(-1)} aria-label={`Downvote ${submission.title}`} aria-pressed={vote === -1} className={`flex h-8 w-8 items-center justify-center rounded-inner ${vote === -1 ? "bg-danger-mid text-white" : "text-gray-400 hover:bg-white hover:text-danger-mid"}`}><ArrowDown size={16} /></button>
        </div>
        <div className="min-w-0 flex-1 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-silver">{submission.kind}</span>
            <span className="text-[9px] text-gray-400">·</span>
            <span className="text-[10px] font-semibold text-gray-500">{submission.authorAfsc} | {submission.authorRank} · @{submission.authorUsername}</span>
          </div>
          <h2 className="mt-1 text-sm font-bold text-primary-dark">
            <Link href={submission.kind === "community" ? `/community?id=${submission.id}` : `/post?id=${submission.id}`} className="hover:text-primary">
              {submission.title}
            </Link>
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">{submission.summary}</p>
          {submission.category && <span className="mt-2 inline-flex rounded-badge bg-primary-ghost px-2 py-0.5 text-[10px] font-bold text-primary">{submission.category}</span>}
          {submission.url && <a href={submission.url} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-[11px] font-semibold text-primary underline">{submission.url}</a>}
        </div>
      </div>
      <CommentThread submission={{ ...submission, score }} />
    </article>
  );
}

export default function CommunitySubmissionFeed({
  kind,
  sort,
}: {
  kind: "play" | "tool" | "community";
  sort: Exclude<PlatformFeedSort, "core">;
}) {
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchCommunityFeed(kind, sort)
      .then((items) => {
        if (active) setSubmissions(items);
      })
      .catch((feedError) => {
        if (active) {
          setSubmissions([]);
          setError(feedError instanceof Error ? feedError.message : "Community feed unavailable.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kind, sort]);

  if (loading) {
    return <div className="flex justify-center px-4 py-16"><LoaderCircle className="animate-spin text-primary" size={24} /></div>;
  }

  if (error) {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-lg rounded-card border border-danger/20 bg-white px-6 py-8 text-center shadow-resting">
          <p className="text-sm font-bold text-primary-dark">Platform service unavailable</p>
          <p className="mt-1 text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="px-4 py-12">
        <div className="mx-auto max-w-lg rounded-card border border-silver-mid/60 bg-white px-6 py-10 text-center shadow-resting">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-inner bg-primary-ghost text-primary">
            <Users size={21} />
          </div>
          <h2 className="mt-3 text-sm font-bold text-primary-dark">No approved community {kind === "community" ? "communities" : `${kind}s`} yet</h2>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">Reviewed submissions will appear here.</p>
          <Link href="/submit" className="mt-4 inline-flex min-h-10 items-center rounded-inner bg-primary px-4 text-xs font-bold text-white">Create a submission</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 px-4 py-5 md:grid-cols-2">
      {submissions.map((submission) => <SubmissionCard key={submission.id} submission={submission} />)}
    </div>
  );
}
