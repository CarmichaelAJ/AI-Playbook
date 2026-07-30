// ─── Milestone document reader ────────────────────────────────────────────────
// Serves the hosted copy of a milestone doc (static, signed, historic — see the
// Milestone vs. Living rule in content/schema.ts) with the official source linked
// prominently ABOVE the viewer. Living documents never route here.
// Static-export safe: generateStaticParams pre-renders one page per milestone.

import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { MILESTONE_DOCS } from "@/content/library";

export function generateStaticParams() {
  return MILESTONE_DOCS.map((d) => ({ docId: d.id }));
}

export default async function ReaderPage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params;
  const doc = MILESTONE_DOCS.find((d) => d.id === docId);
  if (!doc) return null; // unreachable: params come from MILESTONE_DOCS

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="hero-af text-white px-5 pt-5 pb-5 overflow-hidden rounded-b-[24px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-badge bg-white text-primary text-sm font-bold shadow-resting active:scale-[0.98] hover:bg-primary-ghost transition-all"
        >
          <ArrowLeft size={16} strokeWidth={2.6} /> Back to Home
        </Link>
        <h1 className="font-display text-xl font-bold uppercase tracking-wider leading-tight mb-1">{doc.title}</h1>
        <p className="text-[11px] text-on-dark">
          {doc.issuer} · ✓ verified {doc.verified_as_of}
        </p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3 pb-6">
        {/* Official source — prominent, above the viewer */}
        <a
          href={doc.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 p-3.5 rounded-card bg-primary text-white shadow-resting active:bg-primary-dark transition-colors"
        >
          <span className="text-sm font-bold flex items-center gap-2">
            <ExternalLink size={16} className="text-warm" /> Official source
          </span>
          <span className="text-[10px] text-on-dark uppercase tracking-wide font-semibold">opens the original</span>
        </a>
        <p className="text-[11px] text-gray-500 leading-snug px-1">
          Below is a convenience copy of this milestone document, hosted by the Playbook exactly as published. The
          official source above is always the authority.
        </p>

        {/* Hosted viewer */}
        <div className="rounded-card overflow-hidden border border-silver-mid/40 shadow-resting bg-white">
          <iframe
            src={doc.hosted_path}
            title={doc.title}
            className="w-full h-[70vh] block"
          />
        </div>

        {/* Fallback for browsers that won't render PDFs inline (common on iOS) */}
        <a
          href={doc.hosted_path}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 rounded-inner text-sm font-semibold bg-white border border-primary/40 text-primary active:bg-primary/5 transition-colors"
        >
          <FileText size={15} /> Open the PDF full-screen
        </a>
      </div>
    </div>
  );
}
