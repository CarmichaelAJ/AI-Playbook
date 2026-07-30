"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, FilePlus2, GraduationCap, MessageSquare, Settings2, ShieldCheck, UserRound } from "lucide-react";
import {
  fetchMySubmissions,
  fetchNotifications,
  markNotificationRead,
  type CommunitySubmission,
  type UserNotification,
} from "@/lib/platformApi";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";

export default function ProfilePage() {
  const identity = usePlatformIdentity();
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!identity) {
      setSubmissions([]);
      setNotifications([]);
      return;
    }
    setLoading(true);
    fetchMySubmissions()
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
    fetchNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, [identity]);

  const openNotification = async (notification: UserNotification) => {
    if (!notification.readAt) {
      await markNotificationRead(notification.id);
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item));
    }
    if (notification.targetUrl) window.location.assign(notification.targetUrl);
  };

  const counts = useMemo(
    () => ({
      pending: submissions.filter((item) => item.status === "pending").length,
      approved: submissions.filter((item) => item.status === "approved").length,
      rejected: submissions.filter((item) => item.status === "rejected").length,
    }),
    [submissions],
  );

  return (
    <div className="flex flex-col">
      <div className="hero-af rounded-b-[24px] px-5 pb-5 pt-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-dark-dim">Platform account</p>
        <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wider">Profile</h1>
        <p className="mt-1 text-sm text-on-dark">Your identity, contributions, and platform access.</p>
      </div>

      {!identity ? (
        <div className="px-4 py-10">
          <div className="mx-auto max-w-lg rounded-card border border-silver-mid/60 bg-white p-7 text-center shadow-resting">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-inner bg-primary-ghost text-primary">
              <UserRound size={23} />
            </div>
            <h2 className="mt-3 text-base font-bold text-primary-dark">Sign in to create your profile</h2>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">Use the simulated .mil identity now. Microsoft Entra can replace it later.</p>
            <button type="button" onClick={openPlatformAccount} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-inner bg-primary px-4 text-sm font-bold text-white">
              <ShieldCheck size={17} /> Simulated sign-in
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 px-4 py-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <aside className="self-start rounded-card border border-silver-mid/60 bg-white p-5 shadow-resting">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-inner bg-primary text-white">
                <UserRound size={21} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-bold text-primary-dark">@{identity.username}</h2>
                <p className="text-xs font-semibold text-gray-500">{identity.afsc} | {identity.rank}</p>
              </div>
              <button type="button" onClick={openPlatformAccount} aria-label="Edit profile" title="Edit profile" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-inner text-primary hover:bg-primary-ghost">
                <Settings2 size={17} />
              </button>
            </div>
            <dl className="mt-4 grid gap-2 border-t border-silver-mid/50 pt-4 text-xs">
              <div className="flex items-center justify-between gap-3"><dt className="text-gray-500">Email</dt><dd className="truncate font-semibold text-primary-dark">{identity.email}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-gray-500">Role</dt><dd className="font-semibold capitalize text-primary-dark">{identity.role}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-gray-500">Provider</dt><dd className="font-semibold text-primary-dark">Simulated Entra</dd></div>
            </dl>
            <div className="mt-4 grid gap-2">
              <Link href="/submit" className="flex min-h-10 items-center justify-center gap-2 rounded-inner bg-primary px-3 text-xs font-bold text-white">
                <FilePlus2 size={15} /> Create submission
              </Link>
              <Link href="/learn" className="flex min-h-10 items-center justify-center gap-2 rounded-inner border border-primary/25 bg-primary-ghost px-3 text-xs font-bold text-primary">
                <GraduationCap size={15} /> Continue learning
              </Link>
              <Link href="/settings" className="flex min-h-10 items-center justify-center gap-2 rounded-inner border border-silver-mid px-3 text-xs font-bold text-primary-dark">
                <Settings2 size={15} /> Settings
              </Link>
              <Link href="/messages" className="flex min-h-10 items-center justify-center gap-2 rounded-inner border border-silver-mid px-3 text-xs font-bold text-primary-dark">
                <MessageSquare size={15} /> Messages
              </Link>
              {(identity.role === "moderator" || identity.role === "admin") && (
                <Link href="/moderation" className="flex min-h-10 items-center justify-center gap-2 rounded-inner border border-primary/25 bg-primary-ghost px-3 text-xs font-bold text-primary">
                  <ShieldCheck size={15} /> Open moderation
                </Link>
              )}
              {identity.role === "admin" && (
                <Link href="/admin" className="flex min-h-10 items-center justify-center gap-2 rounded-inner border border-primary/25 px-3 text-xs font-bold text-primary-dark">
                  <Settings2 size={15} /> Admin controls
                </Link>
              )}
            </div>
          </aside>

          <section>
            <div className="mb-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-primary-dark"><Bell size={16} /> Notifications</h2>
                <span className="text-[10px] font-bold uppercase text-primary">{notifications.filter((item) => !item.readAt).length} unread</span>
              </div>
              <div className="mt-3 grid gap-2">
                {notifications.length === 0 ? (
                  <p className="rounded-card border border-dashed border-silver-mid/70 bg-white p-4 text-center text-xs text-gray-500">No notifications.</p>
                ) : notifications.slice(0, 8).map((notification) => (
                  <button key={notification.id} type="button" onClick={() => void openNotification(notification)} className={`rounded-card border p-3 text-left shadow-resting ${notification.readAt ? "border-silver-mid/60 bg-white" : "border-primary/30 bg-primary-ghost"}`}>
                    <p className="text-xs font-bold text-primary-dark">{notification.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-gray-600">{notification.body}</p>
                    <p className="mt-1 text-[10px] text-gray-400">{new Date(notification.createdAt).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>
            <h2 className="text-sm font-bold text-primary-dark">Your submissions</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {([
                ["Pending", counts.pending, "text-caution-mid"],
                ["Approved", counts.approved, "text-success-mid"],
                ["Rejected", counts.rejected, "text-danger-mid"],
              ] as const).map(([label, count, color]) => (
                <div key={label} className="rounded-card border border-silver-mid/60 bg-white p-3 text-center shadow-resting">
                  <p className={`text-xl font-extrabold ${color}`}>{count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-2">
              {loading ? (
                <p className="rounded-card border border-silver-mid/60 bg-white p-5 text-xs text-gray-500">Loading submissions...</p>
              ) : submissions.length === 0 ? (
                <div className="rounded-card border border-dashed border-silver-mid/70 bg-white p-6 text-center">
                  <p className="text-sm font-bold text-primary-dark">No submissions yet</p>
                  <p className="mt-1 text-xs text-gray-500">Tools, Plays, and Communities you submit will appear here.</p>
                </div>
              ) : submissions.map((item) => (
                <Link href={`/post?id=${item.id}`} key={item.id} className="rounded-card border border-silver-mid/60 bg-white p-4 shadow-resting hover:border-primary/30">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{item.kind}</p>
                      <h3 className="mt-0.5 text-sm font-bold text-primary-dark">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.summary}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${item.status === "approved" ? "text-success-mid" : item.status === "rejected" ? "text-danger-mid" : "text-caution-mid"}`}>{item.status}</span>
                  </div>
                  {item.moderationNote && <p className="mt-2 rounded-inner bg-silver-tint px-3 py-2 text-[11px] text-gray-600">{item.moderationNote}</p>}
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
