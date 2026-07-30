"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, LogOut, Plus, Users } from "lucide-react";
import {
  fetchCommunityFeed,
  fetchMembership,
  fetchSubmission,
  joinCommunity,
  leaveCommunity,
  type CommunitySubmission,
} from "@/lib/platformApi";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";

export default function CommunityPage() {
  const [id, setId] = useState("");
  const identity = usePlatformIdentity();
  const [community, setCommunity] = useState<CommunitySubmission | null>(null);
  const [posts, setPosts] = useState<CommunitySubmission[]>([]);
  const [membership, setMembership] = useState<{ count: number; role?: string }>({ count: 0 });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [nextCommunity, nextMembership, plays, tools] = await Promise.all([
        fetchSubmission(id),
        fetchMembership(id, identity),
        fetchCommunityFeed("play", "recent", id),
        fetchCommunityFeed("tool", "recent", id),
      ]);
      if (nextCommunity.kind !== "community") throw new Error("Community not found.");
      setCommunity(nextCommunity);
      setMembership(nextMembership);
      setPosts([...plays, ...tools].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Community unavailable.");
    }
  }, [id, identity]);

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("id") ?? "");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleMembership = async () => {
    if (!identity) return openPlatformAccount();
    try {
      if (membership.role) {
        await leaveCommunity(id);
        setMembership({ count: Math.max(0, membership.count - 1) });
      } else {
        setMembership(await joinCommunity(id));
      }
    } catch (membershipError) {
      setError(membershipError instanceof Error ? membershipError.message : "Membership update failed.");
    }
  };

  if (error && !community) return <div className="p-6 text-sm font-semibold text-danger-mid">{error}</div>;
  if (!community) return <div className="p-6 text-sm text-gray-500">Loading community...</div>;

  return (
    <div className="flex flex-col">
      <div className="hero-af rounded-b-[24px] px-5 pb-5 pt-5 text-white">
        <Link href="/communities" className="inline-flex items-center gap-1.5 text-xs font-bold text-on-dark"><ArrowLeft size={15} /> Communities</Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-dark-dim">{community.category || "Air Force community"}</p>
            <h1 className="mt-1 text-2xl font-bold">{community.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-dark">{community.summary}</p>
          </div>
          <button type="button" onClick={() => void toggleMembership()} className="inline-flex min-h-11 items-center gap-2 rounded-inner bg-white px-4 text-sm font-bold text-primary-dark">
            {membership.role ? <LogOut size={16} /> : <Users size={16} />}
            {membership.role ? "Leave" : "Join"} · {membership.count}
          </button>
        </div>
      </div>

      <div className="grid gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-primary-dark">Community posts</h2>
            <Link href={`/submit?community=${id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-inner bg-primary px-3 text-xs font-bold text-white"><Plus size={14} /> Add post</Link>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {posts.map((post) => (
              <Link key={post.id} href={`/post?id=${post.id}`} className="rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting hover:border-primary/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{post.kind} · {post.score} points</p>
                <h3 className="mt-1 text-sm font-bold text-primary-dark">{post.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{post.summary}</p>
              </Link>
            ))}
            {posts.length === 0 && <p className="rounded-card border border-dashed border-silver-mid/70 bg-white p-6 text-center text-xs text-gray-500 md:col-span-2">No approved posts in this community yet.</p>}
          </div>
        </section>
        <aside className="self-start rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting">
          <h2 className="text-sm font-bold text-primary-dark">About</h2>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-gray-600">{community.content || community.summary}</p>
          <dl className="mt-4 grid gap-2 border-t border-silver-mid/50 pt-3 text-xs">
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Members</dt><dd className="font-bold text-primary-dark">{membership.count}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Owner</dt><dd className="font-bold text-primary-dark">@{community.authorUsername}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Data</dt><dd className="font-bold text-primary-dark">{community.dataLevel}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
