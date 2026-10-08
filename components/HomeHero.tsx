import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FEATURES } from "@/lib/features";
import { Photo, PhotoCredit } from "@/components/Photograph";
import styles from "./HomeHero.module.css";

// Every action is a real route. None of them scroll to a section of this page.
const actions = [
  FEATURES.communities && {
    href: "/communities",
    label: "Communities",
    detail: "Start broad, then narrow to a career field, AFSC, or role.",
  },
  FEATURES.staticSearch && {
    href: "/search",
    label: "Search",
    detail: "Look up a task, tool, AFSC, or source by the words you use.",
  },
  {
    href: "/tools",
    label: "Tools",
    detail: "Find an approved AI, automation, or data tool.",
  },
  {
    href: "/sign-in",
    label: "Sign in",
    detail: FEATURES.auth ? "Join communities and save what you use." : "See what sign-in offers in this build.",
  },
].filter((action): action is { href: string; label: string; detail: string } => Boolean(action));

export default function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="playbook-title" data-tone="dark">
      <div className={styles.media} aria-hidden="true">
        <Photo id="c17-dusk" priority decorative sizes="100vw" className={styles.photo} />
      </div>
      <div className={styles.grade} aria-hidden="true" />
      <div className={styles.colonnade} aria-hidden="true" />

      <div className={styles.stage}>
        <div className={styles.identity}>
          <p className={styles.eyebrow}>The Playbook</p>
          <h1 id="playbook-title" className={styles.wordmark}>Airman&apos;s <span>AI Playbook</span></h1>
          <p className={styles.lede}>Find your community, the play for the task in front of you, or an approved tool.</p>
        </div>

        <nav aria-label="Start here" className={styles.actions}>
          <ul>
            {actions.map(({ href, label, detail }, index) => (
              <li key={href}>
                <Link href={href} className={styles.action}>
                  <span className={styles.numeral} aria-hidden="true">0{index + 1}</span>
                  <span className={styles.actionText}><strong>{label}</strong><span>{detail}</span></span>
                  <ArrowUpRight size={20} aria-hidden="true" className={styles.arrow} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.foot}>
        <PhotoCredit id="c17-dusk" className={styles.credit} />
      </div>
    </section>
  );
}
