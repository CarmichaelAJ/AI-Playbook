"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Search } from "lucide-react";
import { LEARNING_PATHS } from "@/content/learningPaths";
import { FEATURES } from "@/lib/features";
import { SUGGEST_PLAY_FORM_URL } from "@/lib/links";
import HomeSections from "@/components/HomeSections";
import HomeHero from "@/components/HomeHero";
import MfrMemo from "@/components/MfrMemo";
import { APPROVED_MEMO } from "@/content/memo";
import { Photo, PhotoCredit } from "@/components/Photograph";
import { PHOTOGRAPHS } from "@/content/photography";
import styles from "./home.module.css";

const paths = [
  {
    href: "/communities",
    title: "Execute a task",
    label: "Plays, in communities",
    body: "Open your community and get the safe starting move for the situation in front of you. Fill it in, run it, and check it before your name goes on it.",
  },
  {
    href: "/tools",
    title: "Find the right tool",
    label: "The tool directory",
    body: "Find an approved AI, automation, or data tool. See what it is cleared for and follow the full access path.",
  },
  {
    href: "/ai-automation",
    title: "Choose your approach",
    label: "The field guide",
    body: "Chat, agent, automation, or fix the process first. Make the call, then go as deep as you have time for.",
  },
];

const levels = [
  { title: "Execute", body: "Team with AI to finish today's task faster. One play, one prompt, minutes back." },
  { title: "Systematize", body: "The task repeats? Build a reusable agent with saved context and templates, so the result is consistent every time." },
  { title: "Improve & optimize", body: "Question the process itself. Map the flow, find the waste, and build the case to make it better." },
];

export default function HomePage() {
  return (
    <div className={`${styles.home} bleed`}>
      <HomeHero />
      {APPROVED_MEMO && <MfrMemo memo={APPROVED_MEMO} />}

      <section className={`${styles.band} ${styles.statement}`} aria-labelledby="statement-title">
        <div className={`${styles.inner} ${styles.statementGrid}`}>
          <div className={`${styles.statementCopy} rise`}>
            <p className={styles.eyebrow}>The Playbook</p>
            <h2 id="statement-title" className={styles.monument}>
              Leadership has set the direction. <em>This is where Airmen act on it.</em>
            </h2>
            <p className={styles.lede}>
              The Department of the Air Force has called for an AI-first force. This is the practical response:
              approved tools, ready plays, and the guidance to use them well, in the work already in front of you.
            </p>
            <Link href="/communities" className={styles.solidLink}>Browse communities <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
          <figure className={`${styles.plate} rise`}>
            <div className={`${styles.frame} ${styles.frameTall}`}>
              <Photo id="academy-chapel" sizes="(min-width: 64rem) 40vw, 90vw" className={`${styles.frameImage} drift`} />
            </div>
            <figcaption>
              <span className={styles.plateLabel}>Plate I</span>
              {PHOTOGRAPHS["academy-chapel"].caption}
              <PhotoCredit id="academy-chapel" className={styles.credit} />
            </figcaption>
          </figure>
        </div>
      </section>

      <section className={`${styles.dark} ${styles.direction}`} aria-labelledby="direction-title" data-tone="dark">
        <div className={styles.stage}>
          <div className={styles.backdrop} aria-hidden="true">
            <Photo id="hangar-t6" decorative sizes="100vw" className={`${styles.backdropImage} drift`} />
          </div>
          <div className={styles.shade} aria-hidden="true" />
          <div className={`${styles.inner} ${styles.stageInner} rise`}>
            <p className={styles.eyebrow}>02 / Institutional direction</p>
            <h2 id="direction-title" className={styles.monument}>An AI-first force.<br />A practical next step.</h2>
          </div>
          <PhotoCredit id="hangar-t6" className={styles.sectionCredit} />
        </div>
        <div className={styles.quoteBand}>
          <div className={`${styles.inner} ${styles.quoteGrid} rise`}>
            <blockquote cite="https://www.af.mil/Portals/1/documents/2026SAF/DAF_AI_Strategy.pdf">
              <p>“We will move with urgency from a posture of deliberate experimentation to one of enterprise-wide operationalization.”</p>
            </blockquote>
            <div className={styles.strategyMeta}>
              <p className={styles.attribution}>
                Troy E. Meink <span>Secretary of the Air Force</span>
              </p>
              <p className={styles.sourceNote}>DAF Artificial Intelligence Strategy, foreword · Released April 2026</p>
              <Link href="/reader/daf-ai-strategy" className={styles.textLink}>Read the strategy <ArrowUpRight size={16} aria-hidden="true" /></Link>
              <p className={styles.interpretation}>
                The strategy sets the direction. This Playbook is a practical response: a place to learn the approach,
                find an approved tool, and apply it to the work in front of you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="start-here" className={`${styles.band} ${styles.paper} ${styles.adoption}`} aria-labelledby="execution-title">
        <div className={`${styles.inner} ${styles.adoptionGrid}`}>
          <figure className={`${styles.plate} ${styles.featurePlate} rise`}>
            <div className={`${styles.frame} ${styles.frameWide}`}>
              <Photo id="airman-laptop" sizes="(min-width: 64rem) 55vw, 92vw" className={`${styles.frameImage} drift`} />
            </div>
            <figcaption>
              <span className={styles.plateLabel}>Plate II</span>
              {PHOTOGRAPHS["airman-laptop"].caption}
              <PhotoCredit id="airman-laptop" className={styles.credit} />
            </figcaption>
          </figure>
          <div className={`${styles.adoptionCopy} rise`}>
            <p className={styles.eyebrow}>03 / Airman adoption</p>
            <h2 id="execution-title" className={styles.monument}>Put direction into practice.</h2>
            <button type="button" className={styles.textLink} onClick={() => window.dispatchEvent(new Event("ap:open-guide"))}>
              <BookOpen size={16} aria-hidden="true" /> Read the user guide
            </button>
            <div className={styles.actionColumns}>
              {paths.map(({ href, title, label, body }, index) => (
                <Link href={href} key={href} className={styles.action}>
                  <span className={styles.actionNumeral} aria-hidden="true">0{index + 1}</span>
                  <span className={styles.actionText}>
                    <span className={styles.eyebrow}>{label}</span>
                    <strong>{title}</strong>
                    <span className={styles.actionBody}>{body}</span>
                  </span>
                  <ArrowUpRight size={22} aria-hidden="true" className={styles.actionArrow} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {FEATURES.staticSearch && (
        <section className={`${styles.band} ${styles.stone2} ${styles.find}`} aria-label="Search the Playbook">
          <form action="/search" className={`${styles.inner} ${styles.search}`}>
            <label htmlFor="home-search">Have a task in mind?</label>
            <div className={styles.searchInput}>
              <Search size={22} aria-hidden="true" />
              <input id="home-search" name="q" type="search" placeholder="Search tasks, tools, AFSCs, sources..." autoComplete="off" />
              <button type="submit">Search <ArrowRight size={17} aria-hidden="true" /></button>
            </div>
            <div className={styles.searchShortcuts} aria-label="Suggested searches">
              <span>Start with</span>
              {[
                ["2A6X1", "/search?q=2A6X1"],
                ["EPB", "/search?q=EPB"],
                ["UDM", "/search?q=UDM"],
                ["MFR", "/search?q=MFR"],
                ["Tools", "/search?kind=tool"],
                ...(FEATURES.communities ? [["Communities", "/search?kind=community"]] : []),
              ].map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </div>
          </form>
        </section>
      )}

      <section className={`${styles.dark} ${styles.engagement}`} aria-labelledby="engagement-title" data-tone="dark">
        <figure className={styles.splitPhoto}>
          <Photo id="b2-night" sizes="(min-width: 64rem) 55vw, 100vw" className={`${styles.splitImage} drift`} />
          <figcaption>
            <span className={styles.plateLabel}>Plate III</span>
            {PHOTOGRAPHS["b2-night"].caption}
            <PhotoCredit id="b2-night" className={styles.credit} />
          </figcaption>
        </figure>
        <div className={`${styles.splitText} rise`}>
          <p className={styles.eyebrow}>04 / Mission execution</p>
          <h2 id="engagement-title" className={styles.monument}>Start with today.<br />Build for what&apos;s next.</h2>
          <div className={styles.engagementAside}>
            <p>You choose how deep to go. Every play runs today at Level 1.</p>
            <Link href="/ai-automation" className={styles.textLink}>Explore AI &amp; automation <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <ol className={styles.levels}>
            {levels.map(({ title, body }, index) => (
              <li key={title}>
                <span className={styles.levelNumber} aria-hidden="true">0{index + 1}</span>
                <div><h3>{title}</h3><p>{body}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {FEATURES.learningPaths && (
        <section className={`${styles.band} ${styles.paper} ${styles.learning}`} aria-labelledby="learning-title">
          <div className={styles.inner}>
            <header className={`${styles.sectionHeading} rise`}>
              <div>
                <p className={styles.eyebrow}>In your field</p>
                <h2 id="learning-title" className={styles.monument}>Make it useful to your work.</h2>
              </div>
              {FEATURES.communities && <Link href="/communities" className={styles.textLink}>See all communities <ArrowRight size={16} aria-hidden="true" /></Link>}
            </header>
            <div className={styles.learningRows}>
              {LEARNING_PATHS.map((path) => (
                <Link key={path.id} href={path.href} className={styles.learningRow}>
                  <div><p className={styles.eyebrow}>{path.audience}</p><h3>{path.label}</h3></div>
                  <div>
                    <p>{path.focus}</p>
                    <p className={styles.firstMoves}>{path.tags.join(" / ")}</p>
                    <p className={styles.firstMoves}><strong>First moves</strong> {path.steps.join(" · ")}</p>
                  </div>
                  <ArrowUpRight size={22} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className={`${styles.band} ${styles.referenceBand}`}>
        <div className={styles.inner}>
          <HomeSections />
        </div>
      </div>

      <section className={`${styles.band} ${styles.stone2} ${styles.responsibility}`} aria-labelledby="responsibility-title">
        <div className={`${styles.inner} rise`}>
          <p className={styles.eyebrow}>The responsibility stays with you</p>
          <h2 id="responsibility-title" className={styles.monument}>Use the tool. Own the result.</h2>
          <p className={styles.lede}>Use approved tools. Never enter classified information, and follow your local guidance on CUI and PII.
            Check every output before it becomes official work.</p>
          <div className={styles.closingLinks}>
            <Link href="/tools" className={styles.textLink}>Check tool guidance <ArrowRight size={16} aria-hidden="true" /></Link>
            {SUGGEST_PLAY_FORM_URL && <a href={SUGGEST_PLAY_FORM_URL} target="_blank" rel="noopener noreferrer" className={styles.textLink}>Suggest a play <ArrowUpRight size={16} aria-hidden="true" /></a>}
          </div>
        </div>
      </section>
    </div>
  );
}
