// ─── Play shelf data ──────────────────────────────────────────────────────────
// The app renders each play as a REFERENCE CARD. It does not run the interview.
// The promptTemplate is a static, copyable starter: each {{var}} is replaced with
// an uppercase bracket placeholder taken from that question's label
// (e.g. {{finding}} -> [WHAT YOU FOUND]) via renderStarter().
//
// SITUATION-FIRST (Doctrine v1.1 §4): plays are organized by the situations every
// Airman meets — Evaluations, Awards, Promotion & Boards, Write It Right,
// Communicate, Research & Decide, Improve the Process (Level 3), and Life Plays.
// AFSC is an optional filter tag, never the front door.
//
// SME-VALIDATION ITEMS: the AFSC codes, nicknames, form/system references, task
// framing, and starter prompts below are illustrative examples for a concept
// demonstration. They must be validated by a subject-matter expert before any
// official use. Content quality, accuracy, and coverage are actively-sought
// feedback (Doctrine §5); category slotting is a product-owner call.

export type PlayCategory =
  | "evaluations"
  | "awards"
  | "promotion"
  | "write"
  | "communicate"
  | "research"
  | "improve"
  | "life";

// Engagement depth (Doctrine §3 — Three Levels). Default 1 (Execute).
// "improve" plays are Level 3; the Council bridges Level 1 → Levels 2/3.
export type PlayLevel = 1 | 2 | 3;

export interface PlayVar {
  key: string;   // matches {{key}} in promptTemplate
  label: string; // rendered as an [UPPERCASE] placeholder in the starter prompt
}

export interface Play {
  id: string;
  title: string;
  task: string;                              // one-line task
  category: PlayCategory;
  afsc?: string;                             // optional AFSC filter tag
  level?: PlayLevel;                         // engagement depth; default 1
  advanced?: boolean;                        // Council — visually distinct advanced tier
  lifeGuardrail?: "financial" | "health";    // Life Plays route decisions to the professional
  promptTemplate: string;
  vars: PlayVar[];
  approvedTool: string;                      // GenAI.mil-first line
  neverPaste: string;                        // safety bar
  verify: string;                            // Airman-voice check step ("…before you sign it")
  timeBack: string;                          // self-reported estimate, always labeled an estimate
}

export interface PlayCategoryMeta {
  id: PlayCategory;
  label: string;
  blurb: string;
  level?: PlayLevel;                         // shown as a tier badge (Improve the Process = 3)
}

// Situation categories, in Doctrine order. Drives section render order + headers.
export const CATEGORIES: PlayCategoryMeta[] = [
  { id: "evaluations", label: "Evaluations",        blurb: "Writing and grading performance statements." },
  { id: "awards",      label: "Awards & Recognition", blurb: "Write, grade, and package award nominations." },
  { id: "promotion",   label: "Promotion & Boards",  blurb: "Prep for the promotion cycle and selection boards." },
  { id: "write",       label: "Write It Right",      blurb: "MFRs, proposals, arguments, and rebuttals." },
  { id: "communicate", label: "Communicate",         blurb: "Emails, talking points, and hard conversations." },
  { id: "research",    label: "Research & Decide",   blurb: "Structured research and decision support." },
  { id: "improve",     label: "Improve the Process", blurb: "Map the flow, find the waste, build the case.", level: 3 },
  { id: "life",        label: "Life Plays",          blurb: "Off-duty firsts, prepared — AI gets you ready for the professional." },
];

// ─── AFSC tiles ─────────────────────────────────────────────────────────────
// SME-VALIDATION: codes and nicknames below are examples and need SME confirmation.
export interface AfscTile {
  code: string;
  nickname: string;
}

export const AFSC_TILES: AfscTile[] = [
  { code: "2W0X1", nickname: "AMMO" },
  { code: "2A3X1", nickname: "Crew Chief" },
  { code: "3P0X1", nickname: "Defender" },
  { code: "3F0X1", nickname: "Personnel" },
  { code: "6C0X1", nickname: "Contracting" },
];

// Shared safety + tool lines — kept consistent so the safety message is unmistakable.
const GENAIMIL_FIRST =
  "Start in GenAI.mil. Commonly approved for unclassified official use — confirm against your local guidance.";
const NEVER_PASTE_DEFAULT =
  "Never paste classified, CUI, PII, rosters, or mission-specific detail. Use generic, unclassified examples only.";
// Life Plays run on the tools Airmen already have — plain language, no Impact-Level jargon.
const LIFE_APPROVED =
  "Runs on the approved tools you already have access to — start in GenAI.mil for unclassified, personal planning.";
const LIFE_NEVER_PASTE =
  "Never paste account numbers, your SSN, full date of birth, or any login or bank details. Use round numbers and generic examples.";

export const PLAYS: Play[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // EVALUATIONS
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "taxer-eprs",
    title: "Performance Statement Bullets",
    task: "Turn raw accomplishment notes into tight, formatted bullets.",
    category: "evaluations",
    promptTemplate:
      "You are an Air Force writing coach. Draft 5 performance statement bullets from the accomplishments below. Each bullet should follow an action-impact-result shape, start with a strong verb, and stay concise. Keep the language factual and verifiable.\n\nAccomplishments: {{accomplishments}}\nRole and level: {{role}}",
    vars: [
      { key: "accomplishments", label: "your accomplishment notes" },
      { key: "role", label: "your role and level" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "You own the record. Confirm every metric and claim is accurate and supportable before your name goes on it.",
    timeBack: "Est. about 45 min back",
  },
  {
    id: "eval-grade",
    title: "Grade an EPB Draft",
    task: "Pressure-test performance statements before they go up.",
    category: "evaluations",
    promptTemplate:
      "You are an Air Force writing coach. Review the performance statements below. For each one: rate its strength, flag weak or passive verbs, call out any claim that isn't quantified or supportable, and rewrite it tighter in an action-impact-result shape. Then name the two or three statements that need the most work and why.\n\nThe statements to review: {{statements}}\nRole and level: {{role}}",
    vars: [
      { key: "statements", label: "the statements to review" },
      { key: "role", label: "role and level" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "The rewrite is a coaching aid. Confirm every reworded claim is still accurate against the record before you sign it.",
    timeBack: "Est. about 30 min back",
  },

  // ═════════════════════════════════════════════════════════════════════════
  // AWARDS & RECOGNITION
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "taxer-award",
    title: "Award Package Narrative",
    task: "Draft a focused quarterly award narrative.",
    category: "awards",
    promptTemplate:
      "Write an Air Force award package narrative in formal style. Structure: an opening hook, three specific accomplishments with quantifiable impact, and a closing on leadership and community. Keep it concise and credible.\n\nWho it is for and the period: {{nominee}}\nKey accomplishments: {{accomplishments}}",
    vars: [
      { key: "nominee", label: "nominee and period" },
      { key: "accomplishments", label: "key accomplishments" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Check every figure and accomplishment against the record before you submit the package.",
    timeBack: "Est. about 1.5 hrs back",
  },
  {
    id: "award-grade",
    title: "Score an Award Package",
    task: "Score a nomination against the criteria before the board sees it.",
    category: "awards",
    promptTemplate:
      "Act as an awards board president. Score the award narrative below against standard criteria: leadership, job performance, whole-Airman and community involvement, and overall impact. For each area give a score band, the strongest line, the weakest line, and one specific fix. End with the top three changes that would most improve the package.\n\nThe award and category: {{award}}\nThe narrative: {{narrative}}",
    vars: [
      { key: "award", label: "award and category" },
      { key: "narrative", label: "the narrative" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Scoring is a coaching aid, not the board's decision. Confirm every accomplishment is accurate before you submit.",
    timeBack: "Est. about 45 min back",
  },
  {
    id: "award-docs",
    title: "Award Citation & Supporting Documents",
    task: "Turn a finished narrative into a citation and cover paperwork.",
    category: "awards",
    promptTemplate:
      "From the award narrative below, draft the supporting documents: a formal citation in standard style, a short cover memo routing the package, and a checklist of the supporting documents this package typically needs. Keep the citation dignified and specific.\n\nThe award and period: {{award}}\nThe narrative or key points: {{narrative}}",
    vars: [
      { key: "award", label: "award and period" },
      { key: "narrative", label: "narrative or key points" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Check the citation and routing against your unit's current award instructions before you sign it.",
    timeBack: "Est. about 45 min back",
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PROMOTION & BOARDS
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "promo-prep",
    title: "Promotion Cycle Prep",
    task: "Build your personal checklist and timeline for this cycle.",
    category: "promotion",
    promptTemplate:
      "I want to prepare for my promotion cycle. Build me a personal prep plan: the typical timeline and milestones, what factors go into the promotion score and which ones I still control, the records and documents I should verify now, the point-leavers people most commonly miss, and a study plan for any testing. Keep it practical and unclassified.\n\nMy grade and the grade I'm testing for: {{grade}}\nWhat I know about my timeline: {{timeline}}",
    vars: [
      { key: "grade", label: "your grade and target" },
      { key: "timeline", label: "your timeline" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Confirm every date, weight, and requirement against the current official promotion guidance. Cycles change year to year.",
    timeBack: "Est. about 1 hr back",
  },
  {
    id: "board-prep",
    title: "Selection / Review Board Prep",
    task: "Get your record and your brief board-ready.",
    category: "promotion",
    promptTemplate:
      "Help me prepare for a selection or review board. Build: a checklist to review my own record for accuracy and gaps, the story my record currently tells and where it's weak, likely questions with strong ways to frame my answers, and a one-page brag sheet a board could skim. Keep it factual and unit-agnostic.\n\nThe board and what it decides: {{board}}\nMy background and record highlights: {{background}}",
    vars: [
      { key: "board", label: "the board" },
      { key: "background", label: "background and highlights" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Verify every record entry against the source system before the board date. The record is what speaks for you.",
    timeBack: "Est. about 1 hr back",
  },

  // ═════════════════════════════════════════════════════════════════════════
  // WRITE IT RIGHT
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "write-mfr",
    title: "Memorandum for Record (MFR)",
    task: "Turn events into a clean, factual MFR.",
    category: "write",
    promptTemplate:
      "Draft a Memorandum for Record in standard Air Force format. Lead with a BLUF, then lay out the facts in neutral, chronological order, separate observation from assumption, and close with the purpose or recommended way ahead. Keep it factual and unclassified.\n\nWhat the MFR needs to document: {{subject}}\nThe facts, in the order they happened: {{facts}}",
    vars: [
      { key: "subject", label: "what it documents" },
      { key: "facts", label: "the facts in order" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Confirm every fact and date against your own notes before you sign it. An MFR is a record.",
    timeBack: "Est. about 30 min back",
  },
  {
    id: "write-proposal",
    title: "Build a Proposal",
    task: "Shape an idea into a proposal leadership can act on.",
    category: "write",
    promptTemplate:
      "Help me turn an idea into a decision-ready proposal. Structure: the problem in one line, the proposed solution, how it works, resources and cost, benefits and risks with mitigations, a simple timeline, and the specific decision I'm asking for. Be honest about tradeoffs.\n\nThe idea: {{idea}}\nThe problem it solves and who it affects: {{problem}}\nWhat I know about cost, resources, and constraints: {{constraints}}",
    vars: [
      { key: "idea", label: "the idea" },
      { key: "problem", label: "problem and who it affects" },
      { key: "constraints", label: "cost and constraints" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Pressure-test your own numbers and assumptions before this goes up the chain under your name.",
    timeBack: "Est. about 1 hr back",
  },
  {
    id: "write-rebuttal",
    title: "Structure a Rebuttal",
    task: "Organize a clear, professional written response — argument structure, not legal advice.",
    category: "write",
    promptTemplate:
      "Help me structure a professional written response to a document I received. Organize my side into a clear argument: a respectful opening, the specific points I'm addressing, the facts and context that support each point, what I'm asking for, and a professional close. Keep the tone measured and factual, never emotional.\n\nWhat I'm responding to (generic summary, no names): {{document}}\nMy side and the facts I can support: {{facts}}\nThe outcome I'm asking for: {{outcome}}",
    vars: [
      { key: "document", label: "what you're responding to" },
      { key: "facts", label: "your side and the facts" },
      { key: "outcome", label: "the outcome you want" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Never paste the actual document, names, or any protected-process detail. Summarize your situation generically.",
    verify:
      "This organizes your argument — it is not legal advice. For anything involving an LOC/LOR, discipline, EO, or IG, talk to your first sergeant, chief, or the legal office before you respond.",
    timeBack: "Est. about 45 min back",
  },
  {
    id: "everyday-decisionmemo",
    title: "Decision Memo Draft",
    task: "Shape a recommendation into a clean decision memo.",
    category: "write",
    promptTemplate:
      "Draft a decision memo for an approving authority. Structure: the issue in one line, background, two or more courses of action with pros and cons, a recommendation, and a clear approve/disapprove line. Keep it to one page.\n\nThe issue: {{issue}}\nThe options you are weighing: {{options}}",
    vars: [
      { key: "issue", label: "the issue" },
      { key: "options", label: "the options" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Validate the facts behind each option before the memo goes up the chain.",
    timeBack: "Est. about 45 min back",
  },
  {
    id: "everyday-execsum",
    title: "One-Page Executive Summary",
    task: "Condense a report into a one-page summary a leader can read in two minutes.",
    category: "write",
    promptTemplate:
      "Write a one-page executive summary for a senior leader. Format: title, a one-sentence purpose, three to five key findings, numbered recommendations, and a way ahead. Concise language only.\n\nThe document or topic (sanitized): {{document}}",
    vars: [{ key: "document", label: "the sanitized document" }],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Check the findings and recommendations against the source before the summary stands on its own.",
    timeBack: "Est. about 1 hr back",
  },

  // ═════════════════════════════════════════════════════════════════════════
  // COMMUNICATE
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "everyday-email",
    title: "Professional Military Email",
    task: "Draft a clear, respectful email to leadership.",
    category: "communicate",
    promptTemplate:
      "Draft a formal Air Force email. Use a greeting, a BLUF paragraph, supporting detail, a clear action request, and a professional close. Tone: direct and respectful of the reader's time.\n\nWho it is to and the topic: {{topic}}\nWhat you need them to know or do: {{message}}",
    vars: [
      { key: "topic", label: "recipient and topic" },
      { key: "message", label: "what you need" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Read it once for tone and accuracy before you hit send. Your name is on it.",
    timeBack: "Est. about 15 min back",
  },
  {
    id: "taxer-bluf",
    title: "BLUF Email Summary",
    task: "Compress a long email chain into a crisp BLUF.",
    category: "communicate",
    promptTemplate:
      "Summarize the email chain below in BLUF format. Structure: a one or two sentence bottom line, key points as bullets, required actions with who and by when, and brief background. Use plain language.\n\nThe email chain (sanitized): {{chain}}",
    vars: [{ key: "chain", label: "the sanitized chain" }],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Strip names, contact info, and any sensitive content before pasting. Summarize the substance, not the people.",
    verify: "Confirm the actions and owners are right before you forward the summary.",
    timeBack: "Est. about 20 min back",
  },
  {
    id: "everyday-talkingpoints",
    title: "Talking Points for Leadership",
    task: "Build crisp, speakable talking points for an engagement.",
    category: "communicate",
    promptTemplate:
      "Generate five to seven talking points for a leader on the topic below. Give each a supporting data point or example, include a what-this-means-for-our-Airmen framing, and keep each point speakable in under 30 seconds.\n\nThe topic and audience: {{topic}}\nThe key message to reinforce: {{message}}",
    vars: [
      { key: "topic", label: "topic and audience" },
      { key: "message", label: "key message" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Confirm each data point is accurate before anyone speaks from these.",
    timeBack: "Est. about 30 min back",
  },
  {
    id: "taxer-feedback",
    title: "Feedback Session Prep",
    task: "Build structured talking points for a feedback session.",
    category: "communicate",
    promptTemplate:
      "Generate a structured feedback session outline for a supervisor. Include: an opening to set the tone, two or three observed strengths, one or two improvement areas with concrete next steps, development goals, and a motivating close. Keep the tone professional and constructive.\n\nBackground on the Airman: {{background}}\nStrengths and improvement areas: {{notes}}",
    vars: [
      { key: "background", label: "background on the airman" },
      { key: "notes", label: "strengths and areas" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Review the outline against your own observations. Keep the feedback yours, not the tool's.",
    timeBack: "Est. about 30 min back",
  },
  {
    id: "team-conversation",
    title: "Prep a High-Stakes Conversation",
    task: "Plan a difficult professional conversation: clear, calm, mission-focused.",
    category: "communicate",
    promptTemplate:
      "I need to prepare for a high-stakes professional conversation. Help me build a concise conversation plan that is direct, respectful, and mission-focused. Build it with: the purpose in one sentence, facts I should state (separating observed facts from assumptions), open-ended questions I should ask, the message I need to deliver in direct but professional language, likely reactions and how to handle each, the decision or commitment to ask for before it ends, and a short follow-up note I can send afterward. Keep it candid, calm, and aligned to mission and standards, not emotional.\n\nThe situation (generic, no names): {{situation}}\nThe other party's role: {{role}}\nDesired outcome: {{outcome}}\nConstraints and what makes it difficult: {{concern}}",
    vars: [
      { key: "situation", label: "the situation, generically" },
      { key: "role", label: "their role" },
      { key: "outcome", label: "desired outcome" },
      { key: "concern", label: "constraints and concerns" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Never paste names, ranks with identifying context, personnel actions, medical or family details, or anything from a protected process. Describe people only by generic role.",
    verify: "The plan preps you; the conversation is yours. If it touches discipline, EO, or IG territory, talk to the right office first.",
    timeBack: "Est. about 45 min back",
  },

  // ═════════════════════════════════════════════════════════════════════════
  // RESEARCH & DECIDE
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "research-structured",
    title: "Structured Research",
    task: "Turn a broad question into an organized, sourced research plan.",
    category: "research",
    promptTemplate:
      "Help me research a topic in an organized way. First break my question into sub-questions. For each: what to look for, the likely sources, and what a good answer looks like. Then give me a template to capture findings with a place for the source on every claim, and a short structure to synthesize it at the end. Remind me to ground every factual claim in a real source, since AI can be confidently wrong.\n\nThe question or decision I'm researching: {{question}}\nWhat I already know and where I'm starting: {{context}}",
    vars: [
      { key: "question", label: "your question" },
      { key: "context", label: "what you know" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "AI can invent sources and facts. Confirm every citation and figure against the real source before you rely on it.",
    timeBack: "Est. about 1 hr back",
  },
  {
    id: "team-disagreement",
    title: "Turn Team Disagreement into Decision Options",
    task: "Depersonalize a stuck debate into courses of action.",
    category: "research",
    promptTemplate:
      "Help me turn a team disagreement into clear decision options. Build it with: a neutral problem statement, what each side is optimizing for, valid concerns on each side, hidden assumptions to test, decision criteria, possible courses of action, a recommended path forward, and one paragraph I can use to reset the team conversation.\n\nThe issue: {{issue}}\nPosition A (summarized fairly): {{positionA}}\nPosition B and other views: {{positionB}}\nMission impact and constraints: {{impact}}\nWho decides, if known: {{owner}}",
    vars: [
      { key: "issue", label: "the issue" },
      { key: "positionA", label: "position a" },
      { key: "positionB", label: "position b and others" },
      { key: "impact", label: "impact and constraints" },
      { key: "owner", label: "decision owner" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Summarize positions without names. Never paste sensitive program data or anything said in confidence.",
    verify: "Pressure-test the recommended course with the actual decision owner before presenting it as the way forward.",
    timeBack: "Est. about 45 min back",
  },
  {
    id: "team-ambiguous",
    title: "Turn Ambiguous Guidance into an Action Plan",
    task: "Move out on unclear guidance without waiting for perfect clarity.",
    category: "research",
    promptTemplate:
      "Help me turn ambiguous guidance into a practical action plan. Build it with: commander's intent as understood, key assumptions, the decision needed now, actions we can take without additional permission, questions that require clarification, risks and mitigations, a recommended next 24 to 72 hour move, and a short update I can send to leadership.\n\nMission or task: {{task}}\nGuidance received (summarized): {{guidance}}\nKnown facts and unknowns: {{facts}}\nConstraints: {{constraints}}\nRisk if we wait vs. risk if we move: {{risk}}",
    vars: [
      { key: "task", label: "the mission or task" },
      { key: "guidance", label: "guidance received" },
      { key: "facts", label: "knowns and unknowns" },
      { key: "constraints", label: "constraints" },
      { key: "risk", label: "risk of waiting vs. moving" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Never paste operational details, unit identifiers, timelines tied to real missions, or the actual guidance verbatim if it is sensitive. Summarize generically.",
    verify: "Confirm the intent and assumptions with your leadership before anyone executes. The plan is a draft, not an order.",
    timeBack: "Est. about 1 hr back",
  },
  {
    id: "team-commitments",
    title: "Convert a Meeting into Commitments",
    task: "Turn meeting notes into owners, deadlines, and follow-through.",
    category: "research",
    promptTemplate:
      "Turn these meeting notes into a clear commitment tracker. Produce: key decisions made, open issues, action items with owner, due date, and deliverable, dependencies, risks to follow-through, a suggested follow-up message, and a recommended agenda for the next check-in.\n\nObjective of the meeting: {{objective}}\nMeeting notes (sanitized): {{notes}}\nBattle rhythm or deadline, if known: {{rhythm}}",
    vars: [
      { key: "objective", label: "meeting objective" },
      { key: "notes", label: "the sanitized notes" },
      { key: "rhythm", label: "deadline or battle rhythm" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Strip names and contact info; use roles or offices as owners. Never paste sensitive program detail from the notes.",
    verify: "Confirm each owner actually agreed to the action before the tracker goes out under your name.",
    timeBack: "Est. about 30 min back",
  },
  {
    id: "taxer-agenda",
    title: "Meeting Agenda Builder",
    task: "Generate a clean agenda with time blocks and owners.",
    category: "research",
    promptTemplate:
      "Create a professional staff meeting agenda. Include time blocks, an objective for each item, who leads it, and a parking-lot plus action-item tracker at the end.\n\nPurpose and duration: {{purpose}}\nTopics to cover: {{topics}}",
    vars: [
      { key: "purpose", label: "purpose and duration" },
      { key: "topics", label: "topics to cover" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Sanity-check the time blocks and owners against reality before you send the invite.",
    timeBack: "Est. about 15 min back",
  },
  {
    id: "team-charter",
    title: "Build a Team Charter for a Short-Fuse Effort",
    task: "Get a tiger team or working group aligned on one page, fast.",
    category: "research",
    promptTemplate:
      "Help me build a one-page team charter for a short-fuse effort. Create it with: purpose, problem statement, desired outcome, roles and responsibilities, decision rights, operating rhythm, communication norms, measures of success, top risks, and the first three actions.\n\nThe effort and deadline: {{effort}}\nMission or problem: {{problem}}\nTeam roles and stakeholders (roles, not names): {{team}}\nConstraints and desired end product: {{constraints}}",
    vars: [
      { key: "effort", label: "effort and deadline" },
      { key: "problem", label: "the problem" },
      { key: "team", label: "roles and stakeholders" },
      { key: "constraints", label: "constraints and product" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Walk the charter with the team and the decision owner; it only counts once they agree to it.",
    timeBack: "Est. about 1 hr back",
  },
  {
    id: "taxer-extraduty",
    title: "Additional Duty Kickstart",
    task: "Turn a newly assigned extra duty into a 30-day plan you can execute.",
    category: "research",
    promptTemplate:
      "I was just assigned an additional duty on top of my primary job. Build me a 30-day kickstart plan. Structure: what this duty typically requires and who typically inspects or checks it, a week-by-week plan for the first 30 days, a running checklist of recurring tasks with suggested frequency, the five questions I should ask the outgoing member or my leadership, and the two or three things people most commonly get wrong in this duty. Keep it practical and unclassified.\n\nThe additional duty: {{duty}}\nWhat I already know or was handed: {{context}}",
    vars: [
      { key: "duty", label: "the additional duty" },
      { key: "context", label: "what you were handed" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Never paste unit-specific inspection results, member names, or program data. Describe the duty generically.",
    verify: "Check the plan against your unit's actual program requirements and your predecessor's continuity binder.",
    timeBack: "Est. about 2 hrs back",
  },
  {
    id: "dts-voucher",
    title: "DTS Voucher Filing",
    task: "Get your travel voucher filed right the first time.",
    category: "research",
    promptTemplate:
      "Walk me through filing a travel voucher in DTS. Give me: the documents and receipts to gather first, the order of steps to build the voucher, the entries people most often get wrong, the common reasons vouchers get returned, and a pre-submit checklist. Keep it general — I'll match it to my actual trip and local finance guidance.\n\nMy trip type and dates: {{trip}}\nWhat I have so far (orders, receipts, lodging): {{have}}",
    vars: [
      { key: "trip", label: "trip type and dates" },
      { key: "have", label: "what you have so far" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Never paste your full SSN, DoD ID, bank/EFT details, or GTC number. Describe the trip in generic terms.",
    verify: "DTS rules and entitlements change and vary by location. Confirm against your orders and local finance before you submit.",
    timeBack: "Est. about 1 hr back",
  },

  // ═════════════════════════════════════════════════════════════════════════
  // IMPROVE THE PROCESS — Level 3 (Doctrine §3)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "improve-map",
    title: "Map Your Process Flow",
    task: "Lay out how the work actually flows, step by step.",
    category: "improve",
    level: 3,
    promptTemplate:
      "Help me map a process I run so I can see it clearly. Produce: each step in order, with who does it, roughly how long it takes, and the waits between steps; the inputs and outputs at each step; the handoffs and decision points; and every place the same information gets re-entered or re-touched. Present it as a simple numbered flow I can validate, and ask me for anything you need to complete the picture.\n\nThe process and its goal: {{process}}\nThe steps as I know them today: {{steps}}",
    vars: [
      { key: "process", label: "the process and goal" },
      { key: "steps", label: "the steps today" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Walk the map with the people who actually do the work before you treat it as truth.",
    timeBack: "Est. about 1 hr back",
  },
  {
    id: "improve-constraint",
    title: "Find the Constraint & Quantify the Waste",
    task: "Find where the process is stuck and put numbers on the cost.",
    category: "improve",
    level: 3,
    promptTemplate:
      "Using the process below, help me find the constraint and the waste. Identify: the step where work piles up or waits longest, the rework and duplicate effort, the manual steps that could be automated or eliminated, and a rough estimate of time or effort lost per cycle and across a month. Rank the problems by impact, and be honest where the data is too thin to estimate.\n\nThe process as it works today: {{process}}\nWhat I know about volume, timing, and pain points: {{data}}",
    vars: [
      { key: "process", label: "the process today" },
      { key: "data", label: "volume and pain points" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Your estimates are only as good as your inputs. Sanity-check the numbers with the team before you brief them.",
    timeBack: "Est. about 1.5 hrs back",
  },
  {
    id: "improve-brief",
    title: "Build the Improvement Brief for Leadership",
    task: "Turn a process fix into a decision-ready case.",
    category: "improve",
    level: 3,
    promptTemplate:
      "Help me build a short leadership brief to propose a process improvement. Structure: the problem and its cost today, the root constraint, the proposed change, the expected gain (time, quality, or capacity back), what it takes to implement, the risks and how I'll measure success, and the decision I'm asking for. Keep it to one page and honest about assumptions.\n\nThe process and the problem: {{problem}}\nThe change I'm proposing and the expected gain: {{change}}",
    vars: [
      { key: "problem", label: "process and problem" },
      { key: "change", label: "proposed change and gain" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: NEVER_PASTE_DEFAULT,
    verify: "Confirm your baseline and projected numbers are defensible before you put them in front of a decision-maker.",
    timeBack: "Est. about 1 hr back",
  },

  // ═════════════════════════════════════════════════════════════════════════
  // LIFE PLAYS — AI prepares you for the professional; it does not replace one
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "life-budget",
    title: "Budgeting Basics",
    task: "Build a simple monthly budget you'll actually keep.",
    category: "life",
    lifeGuardrail: "financial",
    promptTemplate:
      "Help me build a simple monthly budget. Walk me through: listing income, separating fixed bills from flexible spending, setting a starter savings target, and a simple way to track it week to week. Give me a clean template and two or three realistic adjustments if the numbers don't balance. Use round, generic numbers in your examples.\n\nMy rough monthly income and big fixed bills: {{income}}\nWhat I'm trying to do (save, pay down debt, get organized): {{goal}}",
    vars: [
      { key: "income", label: "income and fixed bills" },
      { key: "goal", label: "your goal" },
    ],
    approvedTool: LIFE_APPROVED,
    neverPaste: LIFE_NEVER_PASTE,
    verify: "This is a starting framework, not financial advice. For real decisions, talk to a Personal Financial Counselor (PFC), the A&FRC, or Military OneSource — they're free.",
    timeBack: "Est. about 1 hr back",
  },
  {
    id: "life-finance",
    title: "Financial Planning Basics",
    task: "Get your questions and priorities ready before you see a counselor.",
    category: "life",
    lifeGuardrail: "financial",
    promptTemplate:
      "Help me get ready to plan my finances. Build: a plain-language explanation of the basics I should understand (emergency fund, TSP, debt, insurance), the questions I should ask a financial counselor, the documents to bring, and a simple list of my priorities to talk through. Don't recommend specific products.\n\nMy situation in general terms: {{situation}}\nWhat's prompting this (a goal, a change, just getting started): {{prompt}}",
    vars: [
      { key: "situation", label: "your situation" },
      { key: "prompt", label: "what's prompting this" },
    ],
    approvedTool: LIFE_APPROVED,
    neverPaste: LIFE_NEVER_PASTE,
    verify: "This prepares you for the conversation; it is not financial advice. Take your questions to a PFC, the A&FRC, or Military OneSource before you act.",
    timeBack: "Est. about 1 hr back",
  },
  {
    id: "life-car",
    title: "First-Car Research",
    task: "Do your homework before you set foot on a lot.",
    category: "life",
    lifeGuardrail: "financial",
    promptTemplate:
      "Help me research buying my first car without getting taken. Build: how to figure out my real budget (including insurance, gas, and maintenance, not just the payment), how to compare a few options, the questions to ask about price and financing, the common first-buyer traps, and a checklist to take with me. Keep it neutral — no specific dealer or lender.\n\nMy rough budget and what I need the car for: {{need}}\nWhat I already know or am considering: {{context}}",
    vars: [
      { key: "need", label: "budget and need" },
      { key: "context", label: "what you know" },
    ],
    approvedTool: LIFE_APPROVED,
    neverPaste: LIFE_NEVER_PASTE,
    verify: "Before financing anything, run the numbers past a PFC or the A&FRC — a bad first loan follows you for years.",
    timeBack: "Est. about 2 hrs back",
  },
  {
    id: "life-loan",
    title: "Refinancing / VA Loan Research",
    task: "Understand the questions before a big loan decision.",
    category: "life",
    lifeGuardrail: "financial",
    promptTemplate:
      "Help me understand my options and prepare — do not tell me what to choose. Explain in plain language how this type of loan generally works, the terms and fees to compare, what a VA loan benefit generally involves, the questions to ask a lender and a counselor, and the documents I'd need. Flag anything that commonly trips people up.\n\nWhat I'm looking at (refinance, VA home loan, etc.): {{topic}}\nMy situation in general terms: {{situation}}",
    vars: [
      { key: "topic", label: "what you're looking at" },
      { key: "situation", label: "your situation" },
    ],
    approvedTool: LIFE_APPROVED,
    neverPaste: LIFE_NEVER_PASTE,
    verify: "This is preparation, not financial or lending advice. Take the decision to a PFC, the A&FRC, or Military OneSource, and confirm VA specifics with the VA.",
    timeBack: "Est. about 2 hrs back",
  },
  {
    id: "life-diet",
    title: "Diet Plan Prep",
    task: "Build your questions and a starting framework before you see a professional.",
    category: "life",
    lifeGuardrail: "health",
    promptTemplate:
      "Help me get organized about eating better — a starting framework, not a prescribed diet. Give me: the general questions to think through, how to describe my goals and current habits to a professional, a simple framework for balanced meals, and the questions to bring to a dietitian or my provider. Keep it general and safe.\n\nMy general goal (energy, PT test, overall health): {{goal}}\nAnything relevant about my routine: {{routine}}",
    vars: [
      { key: "goal", label: "your goal" },
      { key: "routine", label: "your routine" },
    ],
    approvedTool: LIFE_APPROVED,
    neverPaste: LIFE_NEVER_PASTE,
    verify: "AI is not a medical professional. Take any real nutrition or weight plan to a dietitian or your medical provider before you start.",
    timeBack: "Est. about 45 min back",
  },
  {
    id: "life-workout",
    title: "Workout Plan Prep",
    task: "Frame your goals and questions before building a real plan.",
    category: "life",
    lifeGuardrail: "health",
    promptTemplate:
      "Help me get ready to build a workout routine — a starting framework, not a prescription. Cover: how to set a realistic goal, the general components of a balanced week, how to describe my current fitness and any limitations to a professional, and the questions to ask a trainer or my provider. Emphasize starting safely.\n\nMy goal (PT test, strength, general fitness): {{goal}}\nMy current activity level and any limitations: {{level}}",
    vars: [
      { key: "goal", label: "your goal" },
      { key: "level", label: "current level and limits" },
    ],
    approvedTool: LIFE_APPROVED,
    neverPaste: LIFE_NEVER_PASTE,
    verify: "AI is not a trainer or a doctor. Clear any new program with a fitness professional or your medical provider, especially with an injury or condition.",
    timeBack: "Est. about 45 min back",
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ADVANCED TIER — The Council (Doctrine §4; bridges Level 1 → Levels 2/3)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "council",
    title: "The Council",
    task: "Convene an AI advisory council — multiple expert lenses on one hard call.",
    category: "improve",
    level: 2,
    advanced: true,
    promptTemplate:
      "Act as an orchestrator that convenes a council of advisors to help me think through a hard decision. Create six distinct advisors, each with its own lens, have each give an honest read, then synthesize:\n\n1. First Sergeant — people, morale, good order and discipline.\n2. Legal / EO lens — process, fairness, and where I need to stop and ask a real professional.\n3. Project Manager — scope, timeline, resources, and risk.\n4. Technical Expert — feasibility and second-order effects.\n5. Political Advisor — stakeholders, optics, and who needs to be brought along.\n6. Collaborative Partner — the honest friend who challenges my blind spots.\n\nFor each advisor: give their take, their top concern, and their recommendation. Then synthesize into points of agreement, the real tradeoffs, and a recommended way ahead with the two or three things I must decide. Ask me for any missing context first.\n\nThe decision or situation (generic, no names): {{situation}}\nWhat I'm weighing and any constraints: {{constraints}}",
    vars: [
      { key: "situation", label: "the situation, generically" },
      { key: "constraints", label: "what you're weighing" },
    ],
    approvedTool:
      "Best run as a saved agent in the GenAI.mil Agent Designer, or an Ask Sage workflow, where you can give the council standing context. Start in GenAI.mil.",
    neverPaste:
      "Never paste names, personnel actions, or protected-process detail. Describe the situation generically — the personas are a thinking aid, not a system of record.",
    verify: "The council sharpens your thinking; the call is yours. Anything touching discipline, EO, or legal territory goes to the real professional, not the personas.",
    timeBack: "Est. about 1 hr back",
  },

  // ═════════════════════════════════════════════════════════════════════════
  // AFSC-TAGGED PLAYS — surfaced only through the optional "Filter by job" tiles
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "ammo-1",
    title: "Inventory Discrepancy Memo",
    task: "Turn a count discrepancy into a clean, routed memo.",
    category: "write",
    afsc: "2W0X1",
    promptTemplate:
      "Draft a professional Air Force memorandum for record documenting a munitions inventory discrepancy. Use a clear BLUF, then: what was expected vs. what was counted, the suspected cause, immediate corrective action taken, and a recommended way ahead. Keep it factual and unclassified.\n\nWhat the discrepancy was: {{finding}}\nWhen and where it was noticed: {{context}}\nAction already taken: {{action}}",
    vars: [
      { key: "finding", label: "what you found" },
      { key: "context", label: "when and where" },
      { key: "action", label: "action already taken" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Never paste real stock numbers, quantities on hand, storage locations, or account data. Use placeholders.",
    verify: "Confirm every figure and corrective action against your account records before it leaves your hands.",
    timeBack: "Est. about 30 min back",
  },
  {
    id: "crewchief-1",
    title: "Write-Up to Plain-Language Summary",
    task: "Translate a maintenance write-up into a status the whole shift understands.",
    category: "communicate",
    afsc: "2A3X1",
    promptTemplate:
      "Rewrite the following aircraft maintenance note into a short, plain-language status update for a shift change brief. Lead with current aircraft status, then the open discrepancy, what has been done, what is still needed, and the estimated impact to the schedule. Keep it tight enough to read aloud in under a minute.\n\nThe write-up / note: {{note}}\nWhat has been done so far: {{progress}}",
    vars: [
      { key: "note", label: "the write-up" },
      { key: "progress", label: "what has been done" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Never paste tail numbers, unit identifiers, locations, or anything that ties to a specific airframe or mission.",
    verify: "Check the rewritten status against the official forms. The forms are the record, not the summary.",
    timeBack: "Est. about 20 min back",
  },
  {
    id: "defender-1",
    title: "Incident Report Draft",
    task: "Turn rough shift notes into a structured, factual report draft.",
    category: "write",
    afsc: "3P0X1",
    promptTemplate:
      "Organize the following rough shift notes into a clear, chronological incident report draft. Use neutral, factual language with no speculation. Structure: summary, timeline of events (time-stamped), persons and assets involved (use generic labels), actions taken, and current status. Flag anything that reads as an assumption rather than an observation.\n\nRough notes: {{notes}}",
    vars: [{ key: "notes", label: "your rough notes" }],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Never paste names, ranks, badge numbers, plate numbers, or any PII. Use generic labels like Subject 1, Vehicle A.",
    verify: "Verify the timeline and every fact against your own notes before entering it into the system of record.",
    timeBack: "Est. about 45 min back",
  },
  {
    id: "personnel-1",
    title: "Customer Inquiry Response",
    task: "Draft a clear, correct answer to a common MPF question.",
    category: "communicate",
    afsc: "3F0X1",
    promptTemplate:
      "Draft a professional, friendly response to an Airman's personnel question. Explain the process in plain steps, note what the member needs to provide, and point them to the right office or system. Keep the tone helpful and the steps numbered. Add a line reminding them to confirm current requirements, since policy changes.\n\nThe question being asked: {{question}}\nWhat you know about the process: {{process}}",
    vars: [
      { key: "question", label: "the question" },
      { key: "process", label: "what you know" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste: "Never paste the member's SSN, DoD ID, record details, or any PII. Describe the process generically.",
    verify: "Confirm every step and reference against current policy and the authoritative system before you send it.",
    timeBack: "Est. about 20 min back",
  },
  {
    id: "contracting-1",
    title: "Market Research Summary",
    task: "Shape scattered research notes into a structured summary.",
    category: "research",
    afsc: "6C0X1",
    promptTemplate:
      "Summarize the following market research notes into a clean, decision-ready summary. Structure: the requirement in one line, vendors or sources reviewed, price and availability ranges, key findings, and a recommended next step. Keep it neutral and factual, with no commitment language.\n\nThe requirement: {{requirement}}\nWhat your research found: {{research}}",
    vars: [
      { key: "requirement", label: "the requirement" },
      { key: "research", label: "what your research found" },
    ],
    approvedTool: GENAIMIL_FIRST,
    neverPaste:
      "Never paste source-selection sensitive information, proprietary vendor data, or pre-decisional pricing. Generalize.",
    verify: "Validate every figure and source against your file before the summary informs any decision.",
    timeBack: "Est. about 1 hr back",
  },
];

// Replace each {{var}} with an uppercase bracket placeholder from the var's label.
export function renderStarter(play: Play): string {
  let out = play.promptTemplate;
  for (const v of play.vars) {
    const placeholder = `[${v.label.toUpperCase()}]`;
    out = out.split(`{{${v.key}}}`).join(placeholder);
  }
  return out;
}

// Group the shelf by situation category, in CATEGORIES order. AFSC-tagged plays
// stay hidden unless their tile is selected (optional filter, not the front door).
// Advanced plays (the Council) are excluded here and rendered in their own tier.
export function playsByCategory(
  selectedAfsc: string | null,
): { category: PlayCategoryMeta; plays: Play[] }[] {
  const visible = PLAYS.filter(
    (p) => !p.advanced && (!p.afsc || p.afsc === selectedAfsc),
  );
  return CATEGORIES
    .map((category) => ({ category, plays: visible.filter((p) => p.category === category.id) }))
    .filter((group) => group.plays.length > 0);
}

// The advanced tier — the Council and any future orchestrator-pattern plays.
export const ADVANCED_PLAYS: Play[] = PLAYS.filter((p) => p.advanced);

// Time-back options for the one-tap self-reported capture.
export const TIME_BACK_OPTIONS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hr", minutes: 60 },
  { label: "2+ hrs", minutes: 120 },
];
