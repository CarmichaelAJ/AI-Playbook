"use client";

import { useCallback, useSyncExternalStore } from "react";

// ─── Time-back capture (device-local measurement layer) ───────────────────────
// Self-reported, local only. We store a single running total of minutes in
// localStorage. No play content, no task detail, nothing identifying is stored —
// just an honest, user-owned estimate of time reclaimed.

const STORAGE_KEY = "ap.timeBackMinutes";
const EVENT = "ap:timeback-change";

function readMinutes(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function addMinutes(minutes: number): void {
  if (typeof window === "undefined") return;
  const next = readMinutes() + minutes;
  window.localStorage.setItem(STORAGE_KEY, String(next));
  window.dispatchEvent(new Event(EVENT));
}

export function resetMinutes(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT));
}

// Format a minute total as an honest, rounded estimate string.
export function formatTimeBack(minutes: number): string {
  if (minutes <= 0) return "about 0 hrs";
  if (minutes < 60) return `about ${minutes} min`;
  const hrs = minutes / 60;
  const rounded = Math.round(hrs * 2) / 2; // nearest half hour
  return `about ${rounded % 1 === 0 ? rounded : rounded.toFixed(1)} hr${rounded === 1 ? "" : "s"}`;
}

// Subscribe to changes from our custom in-tab event and cross-tab storage events.
function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Live-updating tally via useSyncExternalStore — localStorage is the external store.
// Server snapshot is 0 so static prerender and first client paint agree.
export function useTimeBack(): { minutes: number; add: (m: number) => void; reset: () => void } {
  const minutes = useSyncExternalStore(subscribe, readMinutes, () => 0);
  const add = useCallback((m: number) => addMinutes(m), []);
  const reset = useCallback(() => resetMinutes(), []);
  return { minutes, add, reset };
}
