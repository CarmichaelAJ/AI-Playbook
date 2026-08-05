"use client";

import Link from "next/link";
import { Clock3, Flame, Library, Plus, TrendingUp } from "lucide-react";
import { APP_MODE } from "@/lib/features";
import type { PlatformFeedSort } from "@/lib/platformFeed";

const OPTIONS = [
  { id: "core", label: "Core", icon: Library },
  { id: "top", label: "Top", icon: TrendingUp },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "recent", label: "Recent", icon: Clock3 },
] as const;

export default function PlatformFeedTabs({
  value,
  onChange,
  label,
}: {
  value: PlatformFeedSort;
  onChange: (value: PlatformFeedSort) => void;
  label: string;
}) {
  if (APP_MODE === "static") return null;

  return (
    <div className="relative z-10 -mt-2 px-4 pt-3">
      <div className="mx-auto flex h-12 max-w-2xl items-stretch gap-1 rounded-inner border border-silver-mid/60 bg-white p-1 shadow-resting">
        <div className="flex min-w-0 flex-1 items-stretch gap-1" role="tablist" aria-label={label}>
          {OPTIONS.map(({ id, label: optionLabel, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={value === id}
            onClick={() => onChange(id)}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-inner px-1 text-xs font-bold transition-colors ${
              value === id
                ? "bg-primary text-white shadow-resting"
                : "text-gray-500 hover:bg-primary-ghost hover:text-primary-dark"
            }`}
          >
            <Icon size={14} />
            {optionLabel}
          </button>
          ))}
        </div>
        <div className="my-1 w-px flex-shrink-0 bg-silver-mid/60" aria-hidden="true" />
        <Link href="/submit" aria-label="Submit community content" title="Submit" className="flex w-10 flex-shrink-0 items-center justify-center rounded-inner text-primary hover:bg-primary-ghost">
          <Plus size={17} />
        </Link>
      </div>
    </div>
  );
}
