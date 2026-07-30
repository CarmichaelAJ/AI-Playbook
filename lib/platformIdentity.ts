"use client";

import { useEffect, useState } from "react";
import { APP_MODE } from "@/lib/features";

export type PlatformRole = "contributor" | "moderator" | "admin";

export type PlatformIdentity = {
  email: string;
  username: string;
  afsc: string;
  rank: string;
  role: PlatformRole;
};

const STORAGE_KEY = "ap.platformIdentity";
const CHANGE_EVENT = "ap:platform-identity";
const OPEN_EVENT = "ap:open-platform-account";

export function getPlatformIdentity(): PlatformIdentity | null {
  if (APP_MODE === "static") return null;
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as PlatformIdentity) : null;
  } catch {
    return null;
  }
}

export function savePlatformIdentity(identity: PlatformIdentity): void {
  if (APP_MODE === "static") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearPlatformIdentity(): void {
  if (APP_MODE === "static") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function openPlatformAccount(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function usePlatformIdentity(): PlatformIdentity | null {
  const [identity, setIdentity] = useState<PlatformIdentity | null>(null);

  useEffect(() => {
    const update = () => setIdentity(getPlatformIdentity());
    update();
    window.addEventListener(CHANGE_EVENT, update);
    return () => window.removeEventListener(CHANGE_EVENT, update);
  }, []);

  return identity;
}

export const PLATFORM_ACCOUNT_OPEN_EVENT = OPEN_EVENT;
