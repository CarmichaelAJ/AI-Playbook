"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SignatureArtwork } from "@/content/memo";
import styles from "./SignatureDraw.module.css";

type Phase = "static" | "armed" | "drawing";

// The markup always renders the COMPLETE signature, so no-JavaScript and reduced-motion
// visitors see the finished artwork. Only after hydration, and only if the user has not
// asked for reduced motion, do we "arm" it (hide it), then play the draw-on once when it
// scrolls into view.
export default function SignatureDraw({ artwork }: { artwork: SignatureArtwork }) {
  const maskId = useId();
  const root = useRef<SVGSVGElement>(null);
  const [phase, setPhase] = useState<Phase>("static");

  useEffect(() => {
    const element = root.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    setPhase("armed");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setPhase("drawing");
        observer.disconnect();
      }
    }, { threshold: 0.6 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const [, , width, height] = artwork.viewBox.split(/\s+/).map(Number);
  const pen = artwork.pen?.length ? artwork.pen : null;

  return (
    <svg
      ref={root}
      className={styles.signature}
      data-phase={phase}
      data-mode={pen ? "pen" : "wipe"}
      viewBox={artwork.viewBox}
      role="img"
      aria-label={artwork.alt}
      focusable="false"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
          {pen ? (
            pen.map((d, index) => (
              <path
                key={index}
                className={styles.pen}
                d={d}
                pathLength={1}
                fill="none"
                stroke="#fff"
                strokeWidth={artwork.penWidth ?? 8}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animationDelay: `${index * 450}ms` }}
              />
            ))
          ) : (
            <rect className={styles.wipe} x="0" y="0" width={width} height={height} fill="#fff" />
          )}
        </mask>
      </defs>
      <g mask={`url(#${maskId})`} fill="currentColor">
        {artwork.outline.map((d, index) => <path key={index} d={d} />)}
      </g>
    </svg>
  );
}
