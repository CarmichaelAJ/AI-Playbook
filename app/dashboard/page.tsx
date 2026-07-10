"use client";

import Link from "next/link";
import { Layers, Wrench, Clock, Zap, X, Star, ExternalLink, Rocket } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useFavorites, usePlaysRun } from "@/lib/favorites";
import { useTimeBack, formatTimeBack } from "@/lib/timeBack";

// Quick-launch — the second purpose of the dashboard: a fast front door to the
// approved AI tools (Doctrine §4). Envision has no public URL yet (workstation login).
const QUICK_LAUNCH = [
  { name: "GenAI.mil", url: "https://genai.mil", icon: "🛡️", note: "Start here" },
  { name: "Ask Sage", url: "https://chat.asksage.ai", icon: "🧭", note: "Advanced" },
  { name: "Envision", url: "", icon: "🔭", note: "Workstation" },
];

// Play-type mix is mock data this pass — real breakdown lands with Inc 2 analytics.
const PLAY_TYPES = [
  { label: "Admin", value: 9, color: "bg-primary" },
  { label: "AFC", value: 5, color: "bg-tech" },
  { label: "Program", value: 3, color: "bg-warm-dark" },
  { label: "MFR", value: 2, color: "bg-silver" },
];

function PlayTypeBars() {
  const total = PLAY_TYPES.reduce((s, t) => s + t.value, 0) || 1;
  return (
    <div className="flex flex-col gap-2">
      {PLAY_TYPES.map((t) => (
        <div key={t.label} className="flex items-center gap-2">
          <span className="w-16 flex-shrink-0 text-[11px] font-semibold text-gray-600">{t.label}</span>
          <div className="flex-1 h-2.5 rounded-badge bg-silver-tint overflow-hidden">
            <div
              className={`h-full rounded-badge ${t.color}`}
              style={{ width: `${(t.value / total) * 100}%` }}
            />
          </div>
          <span className="w-5 flex-shrink-0 text-right text-[11px] font-bold text-primary-dark">{t.value}</span>
        </div>
      ))}
    </div>
  );
}

function QuickLaunch() {
  return (
    <ScrollReveal>
      <div>
        <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Rocket size={12} className="text-primary" /> Launch a tool
        </p>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_LAUNCH.map(({ name, url, icon, note }) => {
            const inner = (
              <>
                <span className="text-2xl leading-none">{icon}</span>
                <span className="text-xs font-bold text-primary-dark leading-tight text-center">{name}</span>
                <span className="text-[9px] font-semibold uppercase tracking-wide text-silver">{note}</span>
              </>
            );
            const cls =
              "flex flex-col items-center justify-center gap-1 p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting text-center";
            return url ? (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cls} active:bg-primary/5 transition-colors relative`}
              >
                <ExternalLink size={11} className="absolute top-2 right-2 text-silver" />
                {inner}
              </a>
            ) : (
              <div key={name} className={`${cls} opacity-80`}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function DashboardPage() {
  const { items, remove } = useFavorites();
  const playsRun = usePlaysRun();
  const { minutes } = useTimeBack();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="hero-af text-white px-5 pt-5 pb-5 overflow-hidden rounded-b-[24px]">
        <div className="flex items-center gap-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/af-symbol-white.svg" alt="U.S. Air Force" className="h-6 flex-shrink-0" draggable={false} />
          <div className="w-px h-5 bg-silver/40 flex-shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-on-dark-dim">Airman&apos;s Playbook</span>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider mb-1">Dashboard</h1>
        <p className="text-sm text-on-dark">
          Save plays and tools for later, and launch the approved AI tools fast — your front door on any device.
        </p>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-5 pb-6">
        {/* Quick-launch the approved AI tools */}
        <QuickLaunch />

        {/* Local-only tradeoff, stated honestly */}
        <ScrollReveal>
          <p className="text-[11px] text-gray-500 leading-snug px-1">
            Everything here is saved on <span className="font-semibold text-primary-dark">this device only</span> — no account,
            and nothing leaves the device. That&apos;s the safety promise, and the limit: your saves won&apos;t follow you to another phone or computer yet.
          </p>
        </ScrollReveal>

        {/* Metrics tiles */}
        <ScrollReveal>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-inner bg-primary/10">
                  <Zap size={14} className="text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-silver">Plays run</span>
              </div>
              <p className="text-2xl font-display font-bold text-primary-dark leading-none">{playsRun}</p>
            </div>
            <div className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-inner bg-primary/10">
                  <Clock size={14} className="text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-silver">Minutes saved</span>
              </div>
              <p className="text-2xl font-display font-bold text-primary-dark leading-none">{minutes}</p>
              <p className="text-[10px] text-gray-400 mt-1 leading-tight">{formatTimeBack(minutes)}</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Play types breakdown */}
        <ScrollReveal>
          <div className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-silver">Play types</span>
              <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-badge bg-gray-100 text-gray-500">
                Sample data
              </span>
            </div>
            <PlayTypeBars />
          </div>
        </ScrollReveal>

        {/* Pinned links */}
        <ScrollReveal>
          <div>
            <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">Pinned shortcuts</p>
            {items.length === 0 ? (
              <div className="p-5 rounded-card bg-white border border-dashed border-silver-mid/70 text-center">
                <div className="inline-flex p-2.5 rounded-inner bg-silver-tint mb-2">
                  <Star size={18} className="text-silver" />
                </div>
                <p className="text-xs text-gray-500 leading-snug">
                  Star plays and tools to add them here — discover on your phone, run them at your workstation.
                </p>
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {items.map((item) => {
                  const Icon = item.type === "play" ? Layers : Wrench;
                  const isExternal = item.url.startsWith("http");
                  const Inner = (
                    <div className="flex items-center gap-3 p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-primary-dark leading-tight truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                          {item.type === "play" ? "Play" : "Tool"}
                        </p>
                      </div>
                    </div>
                  );
                  return (
                    <div key={item.id} className="flex items-stretch gap-2">
                      {item.url ? (
                        isExternal ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex flex-1 min-w-0">
                            {Inner}
                          </a>
                        ) : (
                          <Link href={item.url} className="flex flex-1 min-w-0">
                            {Inner}
                          </Link>
                        )
                      ) : (
                        Inner
                      )}
                      <button
                        onClick={() => remove(item.id)}
                        aria-label={`Remove ${item.title}`}
                        className="flex-shrink-0 w-9 flex items-center justify-center rounded-card bg-white border border-silver-mid/40 text-gray-400 hover:text-danger hover:border-danger/30 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
