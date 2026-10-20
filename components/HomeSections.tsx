"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ExternalLink, X } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { FEATURES } from "@/lib/features";
import { DEPTH_COPY, INTENT_COPY, openOnboarding, useOnboarding } from "@/lib/onboarding";
import { STRATEGY_STACK, ALL_LIBRARY, SHELF_FILTERS, LATEST_IDS } from "@/content/library";
import { PLAY_COUNT, SOURCE_COUNT } from "@/content/counts";
import type { ContentItem } from "@/content/schema";
import styles from "./HomeSections.module.css";

const LAUNCHPADS = [
  { name: "GenAI.mil", url: "https://genai.mil", note: "Start here" },
  { name: "Ask Sage", url: "https://chat.asksage.ai", note: "Advanced" },
  { name: "Envision", url: "", note: "Workstation" },
];

const VIEWS = [
  ["home", "Saved work"],
  ["strategy", "Strategy"],
  ["sources", "Sources"],
] as const;
type View = (typeof VIEWS)[number][0];

function verifiedLabel(iso?: string): string {
  if (!iso) return "verified";
  const [y, m, d] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `verified ${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}

function PersonalizedBrief() {
  const { profile } = useOnboarding();
  const intent = profile.intent ? INTENT_COPY[profile.intent] : null;
  const depth = profile.depth ? DEPTH_COPY[profile.depth] : null;

  if (!FEATURES.onboarding) return null;

  return (
    <div className={styles.setup}>
      <div>
        <p className={styles.eyebrow}>Your setup</p>
        <h3 className={styles.setupTitle}>{intent ? intent.label : "Choose where to begin"}</h3>
        <p className={styles.description}>
          {intent && depth ? `${intent.line} ${depth.line}` : "Pick a starting lane and depth. It stays on this device only."}
        </p>
      </div>
      <div className={styles.setupActions}>
        {intent ? (
          <Link href={intent.href} className={styles.action}>
            Start here <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : (
          <button type="button" onClick={openOnboarding} className={styles.action}>
            Set up Home <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
        <button type="button" onClick={openOnboarding} className={styles.textAction} aria-label="Change Home setup">
          Change setup
        </button>
      </div>
    </div>
  );
}

function MyShelf() {
  const { items, remove } = useFavorites();
  return (
    <div className={styles.workColumns}>
      <section className={styles.saved}>
        <p className={styles.eyebrow}>01 / Keep at hand</p>
        <h3 className={styles.subheading}>Saved plays &amp; tools</h3>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Your next task starts here.</p>
            <p className={styles.description}>
              Star a play or tool to save it here — discover on your phone, run it at your workstation.
            </p>
            <div className={styles.links}>
              <Link href="/communities" className={styles.textAction}>Browse communities <ArrowRight size={15} aria-hidden="true" /></Link>
              <Link href="/tools" className={styles.textAction}>Browse tools <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          </div>
        ) : (
          <ul className={styles.savedList}>
            {items.map((item) => {
              const inner = (
                <>
                  <span className={styles.metadata}>{item.type === "play" ? "Play" : "Tool"}</span>
                  <span className={styles.itemTitle}>{item.title}</span>
                  {!item.url && <span className={styles.guidance}>Access guidance in Tools</span>}
                </>
              );
              return (
                <li key={item.id} className={styles.savedRow}>
                  {item.url ? (
                    item.url.startsWith("http") ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.savedLink}>
                        {inner}<ExternalLink size={15} aria-hidden="true" className={styles.savedExternal} />
                      </a>
                    ) : (
                      <Link href={item.url} className={styles.savedLink}>{inner}</Link>
                    )
                  ) : (
                    <div className={styles.savedLink}>{inner}</div>
                  )}
                  <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.title}`} className={styles.remove}>
                    <X size={18} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <p className={styles.deviceNote}>Saves stay on this device. No account; saved items are not sent anywhere.</p>
      </section>
      <section className={styles.launchpads}>
        <p className={styles.eyebrow}>02 / Put it to work</p>
        <h3 className={styles.subheading}>Open your workspace</h3>
        <p className={styles.description}>Choose a launchpad for the task in front of you.</p>
        <ol className={styles.launchpadList}>
          {LAUNCHPADS.map(({ name, url, note }, index) => {
            const inner = (
              <>
                <span className={styles.rowNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.launchpadName}>{name}<span className={styles.launchpadNote}>{note}</span></span>
                {url && <ExternalLink size={16} aria-hidden="true" />}
              </>
            );
            return (
              <li key={name}>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className={styles.launchpad}>{inner}</a>
                ) : (
                  <div className={styles.launchpadUnavailable}>
                    <div className={styles.launchpad}>{inner}</div>
                    <p className={styles.guidance}>Access guidance in Tools</p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <Link href="/tools" className={styles.textAction}>View tools &amp; access guidance <ArrowRight size={15} aria-hidden="true" /></Link>
      </section>
    </div>
  );
}

function SourceLinks({ doc }: { doc: ContentItem }) {
  return (
    <div className={styles.links}>
      {doc.doc_class === "milestone" && doc.hosted_path && (
        <Link href={`/reader/${doc.id}`} className={styles.textAction}>
          Read it here <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
      {doc.official_url && (
        <a href={doc.official_url} target="_blank" rel="noopener noreferrer" className={styles.textAction}>
          Official source <ExternalLink size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function StackRung({ doc, index }: { doc: ContentItem; index: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li className={styles.stackRung}>
      <span className={styles.railNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <button type="button" onClick={() => setOpen((value) => !value)} className={styles.disclosure} aria-expanded={open} aria-controls={`${id}-detail`}>
        <span>
          <span className={styles.itemTitle}>{doc.title}</span>
          <span className={styles.sourceMetadata}>{doc.issuer} · {verifiedLabel(doc.verified_as_of)}</span>
        </span>
        <ChevronDown size={18} aria-hidden="true" className={open ? styles.chevronOpen : undefined} />
      </button>
      <div id={`${id}-detail`} hidden={!open} className={styles.stackDetail}>
        <p className={styles.description}>{doc.translation_line}</p>
        <SourceLinks doc={doc} />
      </div>
    </li>
  );
}

function StrategyStack() {
  const rungs = useMemo(() => [...STRATEGY_STACK].sort((a, b) => (a.stack_order ?? 0) - (b.stack_order ?? 0)), []);
  return (
    <div className={styles.strategyColumns}>
      <div className={styles.strategyIntroduction}>
        <p className={styles.eyebrow}>Direction into practice</p>
        <h3 className={styles.subheading}>The strategy stack</h3>
        <p className={styles.description}>
          Trace institutional direction to Airman adoption and mission execution. Open each source for its practical meaning and published basis.
        </p>
        <p className={styles.attribution}>A practical response to published direction.</p>
      </div>
      <div>
        <ol className={styles.strategyRail}>
          {rungs.map((doc, index) => <StackRung key={doc.id} doc={doc} index={index} />)}
        </ol>
        <div className={styles.practice}>
          <p className={styles.eyebrow}>Airman adoption / Mission execution</p>
          <h4 className={styles.practiceTitle}>Apply it to the task.</h4>
          <p className={styles.description}>Choose a play, use an appropriate tool, and verify the result before it informs your work.</p>
          <Link href="/communities" className={styles.textAction}>Find a practical starting point <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  );
}

function DocRow({ doc, index }: { doc: ContentItem; index: number }) {
  return (
    <li className={styles.docRow}>
      <span className={styles.rowNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <article className={styles.docContent}>
        <div>
          {LATEST_IDS.includes(doc.id) && <p className={styles.latest}>Latest</p>}
          <h4 className={styles.docTitle}>{doc.title}</h4>
          <p className={styles.sourceMetadata}>{doc.issuer} · {verifiedLabel(doc.verified_as_of)}</p>
        </div>
        <div>
          <p className={styles.description}>{doc.translation_line}</p>
          <SourceLinks doc={doc} />
        </div>
      </article>
    </li>
  );
}

function Shelves() {
  const [filter, setFilter] = useState("all");
  const docs = useMemo(
    () => (filter === "all" ? ALL_LIBRARY : ALL_LIBRARY.filter((doc) => doc.category === filter)),
    [filter],
  );
  const id = useId();
  return (
    <div>
      <p className={styles.eyebrow}>Read the published basis</p>
      <h3 className={styles.subheading}>Source library</h3>
      <p className={styles.description}>Official documents, practical translations, and dated source links.</p>
      <div className={styles.filters} role="group" aria-label="Filter sources">
        {SHELF_FILTERS.map((item) => (
          <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} aria-controls={`${id}-documents`} className={styles.filter}>
            {item.label}
          </button>
        ))}
      </div>
      <p className={styles.resultCount} role="status">{docs.length} {docs.length === 1 ? "source" : "sources"} shown</p>
      <ol id={`${id}-documents`} className={styles.docList}>
        {docs.map((doc, index) => <DocRow key={doc.id} doc={doc} index={index} />)}
      </ol>
    </div>
  );
}

export default function HomeSections() {
  const [section, setSection] = useState<View>("home");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % VIEWS.length; break;
      case "ArrowLeft": next = (index + VIEWS.length - 1) % VIEWS.length; break;
      case "Home": next = 0; break;
      case "End": next = VIEWS.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setSection(VIEWS[next][0]);
    tabRefs.current[next]?.focus();
  }

  return (
    <section aria-labelledby={`${id}-heading`} className={styles.reference} data-home-reference>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>From direction to daily work</p>
          <h2 id={`${id}-heading`} className={styles.heading}>Your working reference</h2>
        </div>
        <p className={styles.headerDescription}>Keep useful work close. Follow the strategy. Check the source.</p>
      </header>
      <div className={styles.tabs} role="tablist" aria-label="Home views">
        {VIEWS.map(([view, label], index) => (
          <button
            key={view}
            ref={(element) => { tabRefs.current[index] = element; }}
            id={`${id}-tab-${view}`}
            type="button"
            role="tab"
            aria-selected={section === view}
            aria-controls={`${id}-panel-${view}`}
            tabIndex={section === view ? 0 : -1}
            onClick={() => setSection(view)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
            className={styles.tab}
          >
            <span className={styles.tabNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            {label}
          </button>
        ))}
      </div>
      {VIEWS.map(([view]) => (
        <div key={view} id={`${id}-panel-${view}`} role="tabpanel" aria-labelledby={`${id}-tab-${view}`} tabIndex={0} hidden={section !== view} className={styles.panel}>
          {view === "home" && <>{FEATURES.onboarding && <PersonalizedBrief />}<MyShelf /></>}
          {view === "strategy" && <StrategyStack />}
          {view === "sources" && <Shelves />}
        </div>
      ))}
      <p className={styles.receipts}>
        <span><strong>{PLAY_COUNT}</strong> deep plays</span>
        <span><strong>{SOURCE_COUNT}</strong> official sources</span>
        <span>Source links carry verification dates.</span>
      </p>
    </section>
  );
}
