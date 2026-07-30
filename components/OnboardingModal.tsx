"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Building2, Check, GraduationCap, Layers, Wrench, X } from "lucide-react";
import {
  DEPTH_COPY,
  INTENT_COPY,
  type OnboardingDepth,
  type OnboardingIntent,
  useOnboarding,
} from "@/lib/onboarding";

const intentOptions: Array<{ id: OnboardingIntent; icon: typeof Layers }> = [
  { id: "execute", icon: Layers },
  { id: "tool", icon: Wrench },
  { id: "learn", icon: GraduationCap },
  { id: "hq", icon: Building2 },
];

const depthOptions: Array<{ id: OnboardingDepth; icon: typeof Layers }> = [
  { id: "run", icon: Check },
  { id: "systematize", icon: BookOpen },
  { id: "improve", icon: Layers },
];

export default function OnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { save, dismiss } = useOnboarding();
  const [intent, setIntent] = useState<OnboardingIntent>("execute");
  const [depth, setDepth] = useState<OnboardingDepth>("run");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [dismiss, onClose, open]);

  if (!open) return null;

  const skip = () => {
    dismiss();
    onClose();
  };

  const finish = () => {
    save(intent, depth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Set up Home">
      <button type="button" aria-label="Close setup" tabIndex={-1} onClick={skip} className="absolute inset-0 bg-primary-dark/60 animate-fade-in cursor-default" />

      <div className="relative z-10 w-full max-w-lg max-h-[88vh] overflow-y-auto bg-background rounded-t-card sm:rounded-card shadow-modal animate-fade-up">
        <div className="sticky top-0 z-10 hero-af text-white px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold tracking-widest uppercase text-on-dark-dim">Airman&apos;s Playbook</span>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wider mt-2">Set up Home</h2>
              <p className="text-sm text-on-dark mt-0.5">Two taps. Saved only on this device.</p>
            </div>
            <button
              ref={closeRef}
              onClick={skip}
              aria-label="Skip setup"
              className="flex-shrink-0 p-2 -mr-1 -mt-1 rounded-inner text-on-dark hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 pt-5 flex flex-col gap-5 pb-7">
          <section>
            <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">What are you here to do?</p>
            <div className="grid gap-2">
              {intentOptions.map(({ id, icon: Icon }) => {
                const selected = intent === id;
                const copy = INTENT_COPY[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setIntent(id)}
                    aria-pressed={selected}
                    className={`flex items-center gap-3 p-3 rounded-card border text-left shadow-resting transition-colors ${
                      selected ? "bg-primary text-white border-primary" : "bg-white border-silver-mid/40 text-primary-dark"
                    }`}
                  >
                    <span className={`w-9 h-9 rounded-inner flex items-center justify-center flex-shrink-0 ${selected ? "bg-white/20" : "bg-primary/10"}`}>
                      <Icon size={17} className={selected ? "text-warm" : "text-primary"} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold leading-tight">{copy.label}</span>
                      <span className={`block text-xs leading-snug mt-0.5 ${selected ? "text-on-dark" : "text-gray-500"}`}>{copy.line}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">How deep are you going?</p>
            <div className="grid grid-cols-3 gap-2">
              {depthOptions.map(({ id, icon: Icon }) => {
                const selected = depth === id;
                const copy = DEPTH_COPY[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDepth(id)}
                    aria-pressed={selected}
                    className={`min-h-28 p-3 rounded-card border text-left shadow-resting transition-colors ${
                      selected ? "bg-primary text-white border-primary" : "bg-white border-silver-mid/40 text-primary-dark"
                    }`}
                  >
                    <Icon size={17} className={selected ? "text-warm" : "text-primary"} />
                    <span className="block text-xs font-bold leading-tight mt-2">{copy.label}</span>
                    <span className={`block text-[10px] leading-snug mt-1 ${selected ? "text-on-dark" : "text-gray-500"}`}>{copy.line}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="flex gap-2">
            <button type="button" onClick={skip} className="flex-1 rounded-badge border border-silver-mid/60 bg-white px-4 py-2.5 text-sm font-bold text-primary-dark">
              Skip
            </button>
            <button type="button" onClick={finish} className="flex-1 rounded-badge bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-resting">
              Save setup
            </button>
          </div>

          <p className="text-[10px] text-gray-500 leading-snug text-center">
            This does not create an account or send data anywhere. It only changes what this device shows first.
          </p>
        </div>
      </div>
    </div>
  );
}
