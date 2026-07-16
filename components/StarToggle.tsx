"use client";

import { Star } from "lucide-react";
import { useIsStarred, toggleStar, type StarredItem } from "@/lib/favorites";

// Hollow-star favorite toggle. Fills warm when starred, reads its state live from
// localStorage so it re-fills on load and stays in sync with HQ.
export default function StarToggle({
  item,
  size = 18,
  className = "",
}: {
  item: StarredItem;
  size?: number;
  className?: string;
}) {
  const starred = useIsStarred(item.id);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStar(item);
  };

  return (
    <button
      type="button"
      onClick={handle}
      aria-pressed={starred}
      aria-label={starred ? `Remove ${item.title} from HQ` : `Add ${item.title} to HQ`}
      title={starred ? "Starred — on your HQ" : "Star to add to HQ"}
      className={`flex-shrink-0 flex items-center justify-center rounded-full p-1.5 transition-colors ${
        starred ? "text-warm-dark hover:bg-warm/10" : "text-silver hover:text-warm-dark hover:bg-warm/10"
      } ${className}`}
    >
      <Star size={size} className={starred ? "fill-warm text-warm-dark" : ""} strokeWidth={2} />
    </button>
  );
}
