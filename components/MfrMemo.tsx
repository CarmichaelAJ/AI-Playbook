import { ArrowUpRight } from "lucide-react";
import type { ApprovedMemo } from "@/content/memo";
import SignatureDraw from "@/components/SignatureDraw";
import styles from "./MfrMemo.module.css";

// Renders the supplied memorandum in the AFH 33-337 (Chapter 14) separate-page layout.
// It lays out data; it never writes wording. Elements are placed in the order the
// handbook shows: letterhead, date (flush right), title, [addressees], SUBJECT,
// [reference], numbered body, signature, then the signature block.
export default function MfrMemo({ memo }: { memo: ApprovedMemo }) {
  return (
    <section className={styles.section} aria-labelledby="memo-title" data-testid="leadership-memo">
      <div className={styles.frame}>
        <article className={styles.page} data-mfr={memo.isSeparatePageMfr ? "separate-page" : "other"}>
          <header className={styles.letterhead}>
            {memo.letterhead.sealUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.seal} src={memo.letterhead.sealUrl} alt={memo.letterhead.sealAlt ?? ""} />
            )}
            <div className={styles.letterheadText}>
              {memo.letterhead.lines.map((line, index) => (
                <p key={line} className={index === 0 ? styles.agency : styles.unit}>{line}</p>
              ))}
            </div>
          </header>

          <p className={styles.date}><time dateTime={memo.date.iso}>{memo.date.label}</time></p>

          <h2 id="memo-title" className={styles.title}>{memo.heading}</h2>
          {memo.from && <p className={styles.line}>FROM: {memo.from}</p>}
          {memo.addressees?.map((line) => <p key={line} className={styles.line}>{line}</p>)}
          <p className={styles.line}>SUBJECT: {memo.subject}</p>
          {memo.reference && <p className={styles.line}>{memo.reference}</p>}

          <div className={styles.body}>
            {memo.body.map((block, index) => (
              <p key={index} className={styles.paragraph} data-level={block.level}>
                {block.label ? `${block.label} ` : ""}{block.text}
              </p>
            ))}
          </div>

          <div className={styles.signoff}>
            <div className={styles.ink}><SignatureDraw artwork={memo.signature} /></div>
            <div className={styles.block}>
              {memo.signatureBlock.map((line) => <p key={line}>{line}</p>)}
            </div>
          </div>
        </article>
      </div>

      <div className={styles.meta}>
        <p className={styles.endorsement}>{memo.endorsement}</p>
        <details className={styles.provenance}>
          <summary>Source of this memorandum</summary>
          <p>{memo.provenance.title}. {memo.provenance.approvedBy}.</p>
          <p className={styles.hash}>SHA-256 {memo.provenance.sha256}</p>
          <div className={styles.links}>
            {memo.provenance.sourceUrl && (
              <a href={memo.provenance.sourceUrl} target="_blank" rel="noopener noreferrer">
                Official source <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
            {memo.provenance.localUrl && (
              <a href={memo.provenance.localUrl} target="_blank" rel="noopener noreferrer">
                Signed copy (PDF) <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </details>
      </div>
    </section>
  );
}
