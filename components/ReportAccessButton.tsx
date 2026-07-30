"use client";

import { useState } from "react";
import { Flag, Send, X } from "lucide-react";
import { FEATURES } from "@/lib/features";
import { SUGGEST_PLAY_FORM_URL } from "@/lib/links";
import { createAccessReport, type AccessReport } from "@/lib/platformApi";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";

export default function ReportAccessButton({
  targetType,
  targetId,
  targetTitle,
  targetUrl = "",
}: {
  targetType: AccessReport["targetType"];
  targetId: string;
  targetTitle: string;
  targetUrl?: string;
}) {
  const identity = usePlatformIdentity();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("broken-link");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!FEATURES.auth) {
    return (
      <a href={SUGGEST_PLAY_FORM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 px-2 text-[11px] font-bold text-gray-500 hover:text-primary">
        <Flag size={13} /> Report an issue
      </a>
    );
  }

  const submit = async () => {
    if (!identity) {
      setOpen(false);
      return openPlatformAccount();
    }
    setSending(true);
    setMessage("");
    try {
      await createAccessReport({ targetType, targetId, targetTitle, targetUrl, reason, details });
      setMessage("Report sent to the sustainment queue.");
      setDetails("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send the report.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-9 items-center gap-1.5 px-2 text-[11px] font-bold text-gray-500 hover:text-primary">
        <Flag size={13} /> Report an issue
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Report an issue with ${targetTitle}`}>
          <button type="button" aria-label="Close report" onClick={() => setOpen(false)} className="absolute inset-0 bg-primary-deeper/55 backdrop-blur-[2px]" />
          <div className="relative w-full max-w-md rounded-card border border-silver-mid/60 bg-white p-5 shadow-modal">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-silver">Sustainment report</p>
                <h2 className="mt-1 text-base font-bold text-primary-dark">{targetTitle}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close report" className="flex h-9 w-9 items-center justify-center rounded-inner text-gray-500 hover:bg-primary-ghost"><X size={18} /></button>
            </div>
            <label className="mt-4 block text-xs font-semibold text-gray-700">
              Issue
              <select value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full rounded-input border border-silver-mid bg-white px-3 py-2.5 text-sm">
                <option value="broken-link">Broken link</option>
                <option value="access-denied">Access denied</option>
                <option value="outdated">Outdated information</option>
                <option value="data-label">Incorrect data label</option>
                <option value="accessibility">Accessibility problem</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="mt-3 block text-xs font-semibold text-gray-700">
              Details
              <textarea value={details} onChange={(event) => setDetails(event.target.value)} rows={4} maxLength={2000} className="mt-1 w-full resize-y rounded-input border border-silver-mid px-3 py-2.5 text-sm" />
            </label>
            {message && <p role="status" className="mt-3 text-xs font-semibold text-primary">{message}</p>}
            <button type="button" disabled={sending} onClick={() => void submit()} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-inner bg-primary px-4 text-sm font-bold text-white disabled:opacity-50">
              <Send size={16} /> {sending ? "Sending..." : "Send report"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
