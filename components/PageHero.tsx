import type { CSSProperties, ReactNode } from "react";
import { Photo, PhotoCredit } from "@/components/Photograph";
import type { PhotographId } from "@/content/photography";

export default function PageHero({
  eyebrow, title, children, photo, position, as: Heading = "h1",
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  photo?: PhotographId;
  position?: string;
  as?: "h1" | "h2";
}) {
  return (
    <header
      className={`page-hero${photo ? " has-photo" : ""}`}
      data-tone="dark"
      style={position ? ({ "--photo-position": position } as CSSProperties) : undefined}
    >
      {photo && (
        <div className="page-hero-media" aria-hidden="true">
          <Photo id={photo} decorative priority sizes="100vw" />
        </div>
      )}
      <div className="page-hero-grade" aria-hidden="true" />
      <div className="page-hero-colonnade" aria-hidden="true" />
      <div className="page-hero-inner">
        <div>
          <p className="page-hero-eyebrow">{eyebrow}</p>
          <Heading>{title}</Heading>
        </div>
        {children && <div className="page-hero-intro">{children}</div>}
      </div>
      {photo && <PhotoCredit id={photo} className="page-hero-credit" />}
    </header>
  );
}
