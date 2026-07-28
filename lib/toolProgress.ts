"use client";

import { useCallback, useSyncExternalStore } from "react";

// ─── Tool access-path progress (device-local, launcher-mode memory) ───────────
// Mirrors lib/favorites.ts exactly: localStorage is the external store, reads go
// through useSyncExternalStore, and changes broadcast via a custom in-tab event
// plus the native cross-tab storage event. Nothing identifying is stored — just
// which path steps this device has checked off and which tool doors it has opened.

const KEY = "ap.toolProgress";
const EVENT = "ap:toolprogress-change";

interface ToolProgressState {
  // toolId → indexes of checked access-path steps
  steps: Record<string, number[]>;
  // toolId → true once every step was checked at least once (sticky)
  pathDone: Record<string, boolean>;
  // toolId → true once the Open CTA has been tapped at least once
  opened: Record<string, boolean>;
}

const EMPTY: ToolProgressState = { steps: {}, pathDone: {}, opened: {} };

// getSnapshot must return a stable reference while the underlying data is
// unchanged (see favorites.ts) — cache keyed on the raw localStorage string.
let cacheRaw: string | null | undefined;
let cache: ToolProgressState = EMPTY;

function read(): ToolProgressState {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    cache =
      parsed && typeof parsed === "object"
        ? {
            steps: parsed.steps ?? {},
            pathDone: parsed.pathDone ?? {},
            opened: parsed.opened ?? {},
          }
        : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: ToolProgressState): void {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Toggle one access-path step. `totalSteps` lets us stamp the sticky pathDone
// flag the moment every step has been checked.
export function toggleStep(toolId: string, stepIndex: number, totalSteps: number): void {
  if (typeof window === "undefined") return;
  const state = read();
  const current = state.steps[toolId] ?? [];
  const checked = current.includes(stepIndex)
    ? current.filter((i) => i !== stepIndex)
    : [...current, stepIndex];
  const pathDone = state.pathDone[toolId] || checked.length >= totalSteps;
  write({
    steps: { ...state.steps, [toolId]: checked },
    pathDone: { ...state.pathDone, [toolId]: pathDone },
    opened: state.opened,
  });
}

// Record that the tool's Open CTA was tapped — flips the card to launcher mode.
export function markOpened(toolId: string): void {
  if (typeof window === "undefined") return;
  const state = read();
  if (state.opened[toolId]) return;
  write({ ...state, opened: { ...state.opened, [toolId]: true } });
}

export interface ToolProgress {
  checkedSteps: number[];
  // Launcher mode: path was ever fully checked, or the door was ever opened.
  launcherMode: boolean;
  toggleStep: (stepIndex: number, totalSteps: number) => void;
  markOpened: () => void;
}

export function useToolProgress(toolId: string): ToolProgress {
  const state = useSyncExternalStore(subscribe, read, () => EMPTY);
  const doToggle = useCallback(
    (stepIndex: number, totalSteps: number) => toggleStep(toolId, stepIndex, totalSteps),
    [toolId],
  );
  const doOpen = useCallback(() => markOpened(toolId), [toolId]);
  return {
    checkedSteps: state.steps[toolId] ?? [],
    launcherMode: !!state.pathDone[toolId] || !!state.opened[toolId],
    toggleStep: doToggle,
    markOpened: doOpen,
  };
}
