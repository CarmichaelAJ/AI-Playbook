import Link from "next/link";
import { PHOTOGRAPHS, type PhotographId } from "@/content/photography";

export function Photo({
  id,
  sizes = "100vw",
  priority = false,
  decorative = false,
  className,
  style,
}: {
  id: PhotographId;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const photo = PHOTOGRAPHS[id];
  const base = `/assets/photography/${id}`;
  return (
    // Static export: responsive WebP renditions are generated ahead of time.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${base}-2400.webp`}
      srcSet={`${base}-1200.webp 1200w, ${base}-2400.webp 2400w`}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={decorative ? "" : photo.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      draggable={false}
      className={className}
      style={style}
    />
  );
}

export function PhotoCredit({ id, className }: { id: PhotographId; className?: string }) {
  const photo = PHOTOGRAPHS[id];
  return (
    <span className={className}>
      {photo.credit}
      <span aria-hidden="true"> · </span>
      <Link href={`/credits#${id}`}>Details</Link>
    </span>
  );
}
