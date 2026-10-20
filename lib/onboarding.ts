"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "ap.onboarding";
const EVENT = "ap:onboarding-change";

export type OnboardingIntent = "execute" | "tool" | "learn" | "hq";
export type OnboardingDepth = "run" | "systematize" | "improve";

export interface OnboardingProfile {
  seen: boolean;
  intent?: OnboardingIntent;
  depth?: OnboardingDepth;
}

const EMPTY: OnboardingProfile = { seen: false };

let cacheRaw: string | null | undefined;
let cache: OnboardingProfile = EMPTY;

function read(): OnboardingProfile {
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
    cache = parsed && typeof parsed === "object" ? { seen: !!parsed.seen, intent: parsed.intent, depth: parsed.depth } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: OnboardingProfile): void {
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

export function saveOnboarding(intent: OnboardingIntent, depth: OnboardingDepth): void {
  if (typeof window === "undefined") return;
  write({ seen: true, intent, depth });
}

export function dismissOnboarding(): void {
  if (typeof window === "undefined") return;
  write({ ...read(), seen: true });
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  write(EMPTY);
}

export function openOnboarding(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("ap:open-onboarding"));
}

export function useOnboarding(): {
  profile: OnboardingProfile;
  save: (intent: OnboardingIntent, depth: OnboardingDepth) => void;
  dismiss: () => void;
  reset: () => void;
} {
  const profile = useSyncExternalStore(subscribe, read, () => EMPTY);
  const save = useCallback((intent: OnboardingIntent, depth: OnboardingDepth) => saveOnboarding(intent, depth), []);
  const dismiss = useCallback(() => dismissOnboarding(), []);
  const reset = useCallback(() => resetOnboarding(), []);
  return { profile, save, dismiss, reset };
}

export const INTENT_COPY: Record<OnboardingIntent, { label: string; line: string; href: string }> = {
  execute: { label: "Execute a task", line: "Start with a play and run it in an approved tool.", href: "/plays" },
  tool: { label: "Find a tool", line: "Open the approved door and follow the access path.", href: "/tools" },
  learn: { label: "Learn the system", line: "Get oriented before choosing chat, agents, automation, or process work.", href: "/ai-automation" },
  hq: { label: "Set up Home", line: "Use your shelf, launchpads, and official sources first.", href: "/" },
};

export const DEPTH_COPY: Record<OnboardingDepth, { label: string; line: string }> = {
  run: { label: "Run today", line: "Use Level 1 plays to finish the task in front of you." },
  systematize: { label: "Make it repeatable", line: "Save the pattern and turn repeat work into a system." },
  improve: { label: "Fix the process", line: "Map the workflow and decide whether AI belongs there." },
};
