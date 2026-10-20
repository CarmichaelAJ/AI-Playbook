import { ArrowUpRight } from "lucide-react";
import type { LeadershipLetter as Letter } from "@/content/leadershipLetter";
import styles from "./LeadershipLetter.module.css";

// One quiet link to the signed PDF, set beneath the hero title. It does not reproduce or reword the letter.
export default function LeadershipLetter({ letter }: { letter: Letter }) {
  return (
    <a className={styles.link} href={letter.pdf.href} data-testid="leadership-letter">
      {/* The signer's name is in the link text, so the signature image is decorative. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.signature}
        src={letter.signature.src}
        width={letter.signature.width}
        height={letter.signature.height}
        alt=""
        decoding="async"
        draggable={false}
      />
      <span className={styles.text}>
        <strong>{letter.title} <ArrowUpRight size={16} aria-hidden="true" className={styles.arrow} /></strong>
        <span>{letter.signer} <span aria-hidden="true">·</span> <time dateTime={letter.dateIso}>{letter.dateLabel}</time></span>
      </span>
    </a>
  );
}
