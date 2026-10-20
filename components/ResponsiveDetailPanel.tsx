"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";

const DESKTOP_QUERY = "(min-width: 1024px)";

function useDesktopLayout(): boolean {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return desktop;
}

export default function ResponsiveDetailPanel({
  open,
  onClose,
  title,
  eyebrow,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  const desktop = useDesktopLayout();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !desktop) return;

    const previousOverflow = document.body.style.overflow;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [desktop, open]);

  if (!open) return null;

  if (!desktop) {
    return <>{children}</>;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-6 lg:p-10"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-primary-deeper/45 backdrop-blur-[2px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${title} details`}
        className="relative flex max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-silver-mid/70 bg-background shadow-2xl lg:max-h-[calc(100vh-5rem)]"
      >
        <header className="sticky top-0 z-10 flex min-h-[72px] items-center gap-3 border-b border-silver-mid/60 bg-white px-5 py-3">
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-silver">{eyebrow}</p>
            )}
            <h2 className="truncate text-lg font-bold text-primary-dark">{title}</h2>
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close details"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-inner text-gray-500 transition-colors hover:bg-primary-ghost hover:text-primary"
          >
            <X size={20} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">{children}</div>
      </aside>
    </div>
  );
}
