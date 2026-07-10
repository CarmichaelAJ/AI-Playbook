"use client";

import { ExternalLink, Bot } from "lucide-react";
import { GENAIMIL_URL } from "@/lib/links";

// "Where to run it" block for a play card. GenAI.mil is the live primary
// destination; other approved tools live on the Tools tab. (Replaces the retired
// four-surfaces routing — the app is a conduit, not a multi-surface product.)
export default function RunItRouting() {
  return (
    <div className="mt-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-silver mb-2">Where to run it</p>
      <a
        href={GENAIMIL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center gap-2 rounded-inner text-sm font-bold py-2.5 px-3 bg-primary text-white active:bg-primary-dark transition-all duration-base ease-smooth justify-between"
      >
        <span className="flex items-center gap-2">
          <Bot size={15} className="flex-shrink-0" /> Run it in GenAI.mil
        </span>
        <ExternalLink size={14} className="flex-shrink-0 opacity-80" />
      </a>
      <p className="text-[10px] text-gray-400 mt-1.5">Or use another approved tool — see the Tools tab.</p>
    </div>
  );
}
