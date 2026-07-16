"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain, BrainCircuit, Coins, Layers, Database, MessageSquare, Bot, GraduationCap,
  ChevronDown, PencilRuler, Workflow, Zap, Repeat, TrendingUp, ExternalLink, BookOpen, ArrowUpRight,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

// ─── Progressive-disclosure accordion — depth never reads heavy ─────────────────
function Accordion({
  icon: Icon, eyebrow, title, teaser, defaultOpen = false, children, id,
}: {
  icon: typeof Brain;
  eyebrow?: string;
  title: string;
  teaser: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  id?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="rounded-card bg-white border border-silver-mid/40 shadow-resting overflow-hidden scroll-mt-24">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center">
            <Icon size={18} className="text-primary" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          {eyebrow && <span className="text-[10px] font-bold uppercase tracking-wider text-silver">{eyebrow}</span>}
          <h2 className="text-sm font-bold text-primary-dark">{title}</h2>
          {!open && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{teaser}</p>}
        </div>
        <ChevronDown size={18} className={`flex-shrink-0 text-gray-400 transition-transform duration-base ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 -mt-1">{children}</div>}
    </div>
  );
}

function Video({ src, title }: { src: string; title: string }) {
  return (
    <div className="aspect-video w-full rounded-inner overflow-hidden border border-silver-mid/40 mt-3">
      <iframe
        className="w-full h-full"
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-600 leading-relaxed">{children}</p>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold text-silver uppercase tracking-wider mb-2">{children}</p>;
}

// Approved-training destinations — route to official lanes, never replicate them.
// URLs are drafts pending verification (Doctrine §5).
const TRAINING = [
  { name: "GenAI.mil training", desc: "Official platform tutorials and guides.", url: "https://genai.mil" },
  { name: "Digital University", desc: "The DAF's learning hub for digital and data skills.", url: "" },
  { name: "DAF & enterprise courses", desc: "Formal AI and data courses across the force.", url: "" },
  { name: "CDAO resources", desc: "DoD Chief Digital and AI Office learning materials.", url: "" },
];

const LEVELS = [
  {
    n: 1, icon: Zap, title: "Execute",
    body: "Team with AI to finish today's task faster. One play, one prompt, minutes back. Every play on the shelf runs here.",
  },
  {
    n: 2, icon: Repeat, title: "Systematize",
    body: "The task repeats? Build a reusable agent — saved context, a role, and output templates — so the result is consistent every time.",
  },
  {
    n: 3, icon: TrendingUp, title: "Improve & Optimize",
    body: "Question the process itself. Map the flow, find the constraint, quantify the waste, and build the case to make it better.",
  },
];

export default function AI101Page() {
  return (
    <div className="flex flex-col">
      {/* Header + thesis */}
      <div className="hero-af text-white px-5 pt-5 pb-6 overflow-hidden rounded-b-[24px]">
        <div className="flex items-center gap-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/af-symbol-white.svg" alt="U.S. Air Force" className="h-6 flex-shrink-0" draggable={false} />
          <div className="w-px h-5 bg-silver/40 flex-shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-on-dark-dim">Airman&apos;s Playbook</span>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider mb-3">AI 101</h1>
        {/* Thesis — verbatim (Doctrine §4) */}
        <div className="rounded-card bg-white/10 border border-white/20 px-4 py-3">
          <p className="text-base font-semibold leading-snug text-white">
            AI is the instrument. The workflow is the music. You are the orchestrator.
          </p>
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-6 pb-6">
        {/* Intro */}
        {/* FLAGGED: confirm the survey source with Mike before coordination; softened for now. */}
        <p className="text-xs text-gray-500 leading-relaxed">
          Open any section that looks useful — you don&apos;t have to read it in order. Airmen asked for short, practical
          lessons, so most sections include a two-minute video. You can&apos;t break anything here.
        </p>

        {/* ─── ARC A: The foundations ─────────────────────────────────────── */}
        <section>
          <ScrollReveal><SectionLabel>The foundations — what it actually is</SectionLabel></ScrollReveal>
          <div className="flex flex-col gap-3">
            <ScrollReveal>
              <Accordion icon={Brain} eyebrow="Foundations" title="AI — what it actually is" defaultOpen
                teaser="A fast, confident drafting partner that still needs a check.">
                <Body>
                  It predicts text from patterns it learned. It is not a search engine, it is not always right, and it is not
                  sentient. Treat it like a fast, confident drafting partner that still needs a check.
                </Body>
                <Video src="https://www.youtube-nocookie.com/embed/qYNweeDHiyU" title="AI, Machine Learning, Deep Learning and Generative AI Explained (IBM Technology)" />
              </Accordion>
            </ScrollReveal>

            <ScrollReveal>
              <Accordion icon={BrainCircuit} eyebrow="Foundations" title="LLMs — the engine behind it"
                teaser="Trained on huge amounts of text; it predicts the next word, over and over.">
                <Body>
                  A large language model is trained on huge amounts of text and works by predicting the next word, over and
                  over. GenAI.mil, Ask Sage, and Envision all run on LLMs — same core idea under the hood.
                </Body>
              </Accordion>
            </ScrollReveal>

            <ScrollReveal>
              <Accordion icon={Coins} eyebrow="Foundations" title="Tokens — how it reads and counts"
                teaser="It reads and writes in chunks of words. Tighter prompts go further.">
                <Body>
                  Models read and write in tokens — chunks of words, not whole sentences. Tokens take up the model&apos;s
                  limited working memory, so tighter prompts and trimmed context go further.
                </Body>
                <Video src="https://www.youtube-nocookie.com/embed/49V-5Ock8LU" title="Tokens and token management explained" />
              </Accordion>
            </ScrollReveal>

            <ScrollReveal>
              <Accordion icon={Layers} eyebrow="Foundations" title="Context — what it can hold at once"
                teaser="Everything the model can see right now. Keep what matters in view.">
                <Body>
                  The context window is everything the model can see at once — your prompt plus the conversation so far. Once
                  it fills up, the oldest content drops off, so keep what matters in view.
                </Body>
                <Video src="https://www.youtube-nocookie.com/embed/-QVoIxEpFkM" title="Context windows in LLMs explained" />
              </Accordion>
            </ScrollReveal>

            <ScrollReveal>
              <Accordion icon={Database} eyebrow="Foundations" title="RAG — giving it your sources"
                teaser="Ground answers in trusted documents instead of memory alone.">
                <Body>
                  Retrieval-augmented generation lets a model pull in trusted documents at answer time instead of relying only
                  on what it memorized. It&apos;s how you ground answers in your own sources and reduce hallucination.
                </Body>
                <Video src="https://www.youtube-nocookie.com/embed/UabBYexBD4k" title="Retrieval-Augmented Generation (RAG) explained" />
              </Accordion>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── ARC B: Working with it (the intellect transfer) ────────────── */}
        <section>
          <ScrollReveal><SectionLabel>Working with it — transfer your intent</SectionLabel></ScrollReveal>
          <div className="flex flex-col gap-3">
            <ScrollReveal>
              <Accordion icon={MessageSquare} eyebrow="Communicate" title="Articulate what you want — prompting"
                teaser="Give it a role, context, the task, and the format. Then iterate.">
                <Body>
                  Prompting is a communication skill, not a magic phrase. Give the model a <strong>role</strong> (&ldquo;act as
                  an Air Force writing coach&rdquo;), the <strong>context</strong> it needs, the <strong>task</strong> in plain
                  terms, and the <strong>format</strong> you want back — then iterate. The clearer your ask, the better the draft.
                </Body>
                <Video src="https://www.youtube-nocookie.com/embed/jC4v5AS4RIM" title="Prompt Engineering explained" />
              </Accordion>
            </ScrollReveal>

            <ScrollReveal>
              <Accordion icon={PencilRuler} eyebrow="Communicate" title="Context engineering — give it what it needs"
                teaser="The right background in, the right answer out. Curate what you feed it.">
                <Body>
                  If prompting is how you ask, context engineering is what you bring. Feed the model the background it actually
                  needs — the sample, the constraints, the audience — and trim what it doesn&apos;t. Garbage or missing context
                  in, weak draft out. This is the skill that pays off most once you&apos;re past the basics: you&apos;re
                  transferring your knowledge of the situation into the model.
                </Body>
              </Accordion>
            </ScrollReveal>

            <ScrollReveal>
              <Accordion icon={Bot} id="agents" eyebrow="Communicate" title="Agents — AI that takes action"
                teaser="It can use tools and take several steps toward a goal. You still own the output.">
                <Body>
                  Agents go a step past chat: they can use tools, take several steps, and work toward a goal instead of just
                  replying. Powerful — but you still own and verify everything they produce. Building one with saved context and
                  templates is <strong>Level 2</strong> below.
                </Body>
                <Video src="https://www.youtube-nocookie.com/embed/FwOTs4UxQS4" title="AI agents explained" />
              </Accordion>
            </ScrollReveal>

            <ScrollReveal>
              <Accordion icon={Workflow} eyebrow="Communicate" title="The systems view — map your process, then place AI"
                teaser="Don't just type faster. See your whole workflow and put AI where it counts.">
                <Body>
                  The biggest wins don&apos;t come from typing faster — they come from stepping back and mapping your whole
                  process, then deciding where AI actually fits. Which step is slow? Which is repetitive? Which is a judgment
                  call only you should make? Put AI on the first two and keep the last for yourself. That&apos;s the difference
                  between doing a bad process faster and making the process better.
                </Body>
              </Accordion>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── ARC C: The Three Levels deep-dive (after Agents, before AAA) ── */}
        <section>
          <ScrollReveal><SectionLabel>How deep you take it — the three levels</SectionLabel></ScrollReveal>
          <div className="flex flex-col gap-3">
            {LEVELS.map(({ n, icon: Icon, title, body }) => (
              <ScrollReveal key={n}>
                <div className="p-4 rounded-card bg-white border border-silver-mid/40 shadow-resting">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center relative">
                        <Icon size={18} className="text-primary" />
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">{n}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-silver">Level {n}</span>
                      <h3 className="text-sm font-bold text-primary-dark">{title}</h3>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{body}</p>
                      {n === 2 && (
                        <a href="#agents" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-1.5">
                          See Agents above <ArrowUpRight size={11} />
                        </a>
                      )}
                      {n === 3 && (
                        <Link href="/plays" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-1.5">
                          Run the Improve the Process plays <ArrowUpRight size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
            <ScrollReveal>
              <p className="text-[11px] text-gray-500 leading-snug px-1">
                Levels 1 and 2 make the task faster. Level 3 asks whether the task should exist as-is — the level senior
                leaders are really asking for.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── Approved training ──────────────────────────────────────────── */}
        <section>
          <ScrollReveal><SectionLabel>Go deeper — approved training</SectionLabel></ScrollReveal>
          <ScrollReveal>
            <p className="text-xs text-gray-500 mb-3 leading-snug">
              This tab gets you oriented. For real depth, these are the official lanes — the Playbook routes you to them,
              it never replaces them. Verify availability locally.
            </p>
          </ScrollReveal>
          <div className="grid gap-2 md:grid-cols-2">
            {TRAINING.map(({ name, desc, url }) => {
              const inner = (
                <>
                  <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-primary-dark leading-tight">{name}</p>
                    <p className="text-[11px] text-gray-500 leading-snug">{desc}</p>
                  </div>
                  {url
                    ? <ExternalLink size={15} className="flex-shrink-0 text-primary/60" />
                    : <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400 flex-shrink-0">Link pending</span>}
                </>
              );
              return (
                <ScrollReveal key={name}>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting active:bg-primary/5 transition-colors">
                      {inner}
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-card bg-white border border-silver-mid/40 shadow-resting">
                      {inner}
                    </div>
                  )}
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* ─── AAA — the flagship Road-2 (Discovery) handoff ──────────────── */}
        <ScrollReveal>
          <div className="p-4 rounded-card bg-primary/5 border border-primary/25 shadow-resting">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-inner bg-primary/10 flex items-center justify-center">
                  <GraduationCap size={18} className="text-primary" />
                </div>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-silver">The schoolhouse</span>
                <h2 className="text-sm font-bold text-primary-dark">AI for All Airmen (AAA)</h2>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  This page got you oriented. When you&apos;re ready for real depth, AAA is the Air Force&apos;s AI schoolhouse
                  arriving on GenAI.mil: a personal tutor that learns your job and builds a learning roadmap from approved
                  sources. The Playbook is the no-CAC front door on your phone; AAA is the enterprise schoolhouse. Learn here,
                  do there. Coming soon, so verify availability locally.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ─── CONTENT SLOT ────────────────────────────────────────────────
            Product owner's incoming AI-101 outline lands here (Doctrine item 25).
            Structure tonight, content to follow. Keep evergreen — principles, not
            tool versions. */}
        <ScrollReveal>
          <div className="p-4 rounded-card bg-white border border-dashed border-silver-mid/70 text-center">
            <p className="text-xs font-semibold text-gray-500 leading-snug">More lessons on the way</p>
            <p className="text-[11px] text-gray-400 mt-1 leading-snug">
              The full AI-101 outline is in progress. Sections drop in here as the content is written.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
