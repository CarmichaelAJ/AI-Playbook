// ─── The 12 MVP plays (Sprint 1) ─────────────────────────────────────────────
// Source of truth: content-source/PLAYS-MVP-v1.md. Each prompt_template is the
// EXACT engineered prompt (Rule 2 — verbatim). {{slot}} tokens map to feed_slots;
// assemblePrompt() reproduces the source prompt character-for-character. The five
// body_segments are the on-card anatomy; segment_why carries the plain-language
// coaching line for each. The `verify` list is the Airman's own checklist and is
// NOT part of the assembled prompt.

import type { ContentItem } from "@/content/schema";

// Shared safety bars.
const NEVER_PASTE =
  "Never paste anything classified, CUI, PII, names you haven't sanitized, or mission-specific detail. Use generic, unclassified examples.";
const NEVER_PASTE_SENSITIVE =
  "Never paste the actual paperwork, real names, or any protected-process detail. Describe your situation generically — sanitize before you type.";

export const PLAYS: ContentItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // THINK & DECIDE  (framework plays 1–5)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "deep-research-brief",
    type: "play",
    title: "Deep Research Brief",
    situation: "\"I need to actually understand something before I act on it.\"",
    category: "think",
    level: 1,
    connectors: ["Web Search"],
    time_back: "Est. 1–3 hrs per research task",
    contract:
      "You walk away with: a decision-ready brief — BLUF, sourced findings, confidence ratings, and the weakest claims named.",
    run_on: { surfaces: ["GenAI.mil"], connector_note: "Turn ON Web Search — the play demands a cited URL for every fact." },
    never_paste: NEVER_PASTE,
    prompt_template:
      "You are a research analyst preparing a decision-ready brief. Before researching, ask me up to 3 clarifying questions if my request is vague. Before we start: I will use generic names and will not paste CUI, PII, or anything sensitive. Remind me if I slip.\n\nMy research question: {{question}}\nWhy I need it / what decision it feeds: {{decision}}\nScope boundaries (timeframe, what's out of scope): {{scope}}\n\nProcess: (1) Restate my question in your own words. (2) Break it into 3–5 sub-questions. (3) Use web search to answer each — cite the URL for every factual claim; mark anything you couldn't verify as [UNVERIFIED]. (4) Deliver: a bottom-line-up-front summary (3 sentences max), findings per sub-question with sources, a confidence rating per finding (High/Med/Low), and recommended next steps.\n\nFinish by listing the three claims you are least confident in, so I know where to dig.",
    body_segments: {
      persona:
        "A research analyst preparing a decision-ready brief — asks up to 3 clarifying questions when your request is vague, and sanitizes before it starts.",
      task:
        "Restate your question, break it into 3–5 sub-questions, search the web to answer each with cited URLs, and mark anything unverified.",
      feed_slots: [
        { key: "question", token: "QUESTION", label: "Your research question", placeholder: "What do you need to understand before you act?", multiline: true },
        { key: "decision", token: "DECISION", label: "Why you need it / the decision it feeds", placeholder: "What this research will inform" },
        { key: "scope", token: "SCOPE", label: "Scope boundaries", placeholder: "Timeframe, and what's out of scope" },
      ],
      format:
        "A 3-sentence BLUF, findings per sub-question with sources, a High/Med/Low confidence rating on each, next steps — and the 3 claims it's least sure of.",
      verify: [
        "Spot-check the two most load-bearing sources yourself",
        "Treat anything marked [UNVERIFIED] as not-yet-true",
        "The decision is yours — the brief only informs it",
      ],
    },
    segment_why: {
      persona: "A role with standards that asks before it fires beats \"be helpful\" — it aims before it researches.",
      task: "Decomposition plus real web search turns \"reason from memory\" into \"find and cite.\" The connector is the upgrade.",
      feed: "The tighter your question and scope, the less the model wanders. Facts in, focused brief out.",
      format: "Confidence ratings and a \"least sure\" list tell you exactly where to dig instead of trusting all of it equally.",
    },
  },
  {
    id: "claim-audit",
    type: "play",
    title: "Claim Audit",
    situation: "\"Someone handed me a document or argument and I need to know what's actually true.\"",
    category: "think",
    level: 1,
    connectors: ["Web Search"],
    time_back: "Est. 30–90 min per document",
    contract:
      "You walk away with: every claim in the document letter-graded, with evidence for and against, and what to check before you act.",
    run_on: { surfaces: ["GenAI.mil"], connector_note: "Web Search ON — evidence must be searched and cited, never invented." },
    never_paste: NEVER_PASTE,
    prompt_template:
      "You are an objective, evenhanded analyzer of truth claims. You have no stake in the outcome. Before we start: generic names only, no CUI/PII — remind me if I slip.\n\nI will paste a document or argument. For it: (1) List each distinct factual claim (16 words max each). (2) For each claim, give supporting evidence AND refuting evidence — searched and cited, never invented. If evidence doesn't exist, say so. (3) Name any logical fallacies with the exact quoted sentence. (4) Rate each claim A (definitely true) to F (definitely false). (5) Close with: overall argument summary (30 words), the strongest claim, the weakest claim, and what a careful reader should check before acting on this document.\n\nHere is the document: {{doc}}",
    body_segments: {
      persona:
        "An objective, evenhanded analyzer of truth claims with no stake in the outcome.",
      task:
        "List each factual claim, give evidence for AND against (searched and cited), name any fallacies with the quoted sentence, and letter-grade each claim.",
      feed_slots: [
        { key: "doc", token: "PASTE", label: "The document or argument", placeholder: "Paste the sanitized document or argument to audit", multiline: true },
      ],
      format:
        "Each claim graded A–F with evidence both ways, fallacies named, then a 30-word summary, the strongest and weakest claims, and what to check.",
      verify: [
        "Read the A-rated and F-rated claims yourself — extremes hide the mistakes",
        "Confirm the cited evidence actually says what the model claims",
      ],
    },
    segment_why: {
      persona: "\"No stake in the outcome\" is the feature — it stops the model from telling you what you want to hear.",
      task: "Forcing evidence FOR and AGAINST every claim is what separates an audit from an opinion.",
      feed: "Sanitize first — you're pasting someone else's document, so strip anything sensitive before it goes in.",
      format: "A letter grade per claim turns a wall of text into a triage list you can act on.",
    },
  },
  {
    id: "tradeoff-matrix",
    type: "play",
    title: "Options & Trade-off Matrix",
    situation: "\"I have to choose between options and defend the choice.\"",
    category: "think",
    level: 1,
    connectors: ["Web Search"],
    time_back: "Est. 1–2 hrs per decision paper",
    contract:
      "You walk away with: a scored trade-off matrix, the dominant trade-off in plain words, and the one assumption that could flip it.",
    run_on: { surfaces: ["GenAI.mil"], connector_note: "Web Search ON if facts about the options matter." },
    never_paste: NEVER_PASTE,
    prompt_template:
      "You are a neutral staff analyst. You do not have a preferred option, and you never hide a weakness to make an option look better. Generic names only, no CUI/PII — remind me if I slip.\n\nDecision I must make: {{decision}}\nOptions on the table: {{options}}\nHard constraints (budget, time, policy, manpower): {{constraints}}\n\nProcess: (1) Propose 5–7 evaluation criteria and ask me to strike, add, or weight them before scoring. (2) Score each option per criterion, one-line justification each — flag any score that rests on an assumption rather than a fact I gave you. (3) Deliver: the matrix as a table, a short narrative of the dominant trade-off, and a sensitivity note: which single assumption, if wrong, flips the ranking.",
    body_segments: {
      persona:
        "A neutral staff analyst with no preferred option, who never hides a weakness to make an option look better.",
      task:
        "Propose 5–7 criteria for you to adjust, score each option with a one-line justification, and flag any score resting on an assumption.",
      feed_slots: [
        { key: "decision", token: "DECISION", label: "The decision you must make", placeholder: "What are you choosing between, and why now?", multiline: true },
        { key: "options", token: "OPTION 1 / OPTION 2 / OPTION 3", label: "Options on the table", placeholder: "List the options you're weighing", multiline: true },
        { key: "constraints", token: "CONSTRAINTS", label: "Hard constraints", placeholder: "Budget, time, policy, manpower" },
      ],
      format:
        "The matrix as a table, a short narrative of the dominant trade-off, and a sensitivity note: the one assumption that flips the ranking.",
      verify: [
        "Check every score the model flagged as resting on an assumption",
        "Confirm the assumption that would flip the ranking before you brief it",
      ],
    },
    segment_why: {
      persona: "\"No preferred option\" keeps the analysis honest — you want the trade-offs, not a sales pitch.",
      task: "Letting you weight the criteria first means the matrix scores what YOU care about, not what the model assumes.",
      feed: "Naming your hard constraints up front stops the model from recommending something you can't actually do.",
      format: "The sensitivity note is the payoff: it tells you which single belief your whole decision rests on.",
    },
  },
  {
    id: "pre-mortem",
    type: "play",
    title: "Pre-Mortem",
    situation: "\"We're about to commit to a plan. What kills it?\"",
    category: "think",
    level: 1,
    connectors: [],
    time_back: "Est. 1–2 hrs — and possibly the whole project",
    contract:
      "You walk away with: 5–8 distinct failure stories, early warning signs, and a mitigation mapped to each.",
    run_on: { surfaces: ["GenAI.mil", "Ask Sage"] },
    never_paste: NEVER_PASTE,
    prompt_template:
      "It is one year from now, and the plan I'm about to describe has failed. You are the honest after-action facilitator explaining why. Generic names only, no CUI/PII — remind me if I slip.\n\nThe plan: {{plan}}\nWhat success was supposed to look like: {{success}}\nTimeline and key players (generic titles): {{roles}}\n\nProcess: (1) Write 5–8 genuinely different failure stories — not variations of one failure. (2) For each: likelihood (H/M/L), severity, and the earliest warning sign we'd see. (3) Give the single strongest argument for not doing this at all, stated as its best advocate would. (4) Map one concrete mitigation to each failure. (5) Before you finish: which failure did you almost leave out because it's uncomfortable rather than unlikely? Add it.",
    body_segments: {
      persona:
        "An honest after-action facilitator, standing one year in the future, explaining why the plan failed.",
      task:
        "Write 5–8 genuinely different failure stories with likelihood, severity, and the earliest warning sign — then map a mitigation to each.",
      feed_slots: [
        { key: "plan", token: "PLAN", label: "The plan", placeholder: "What are you about to commit to?", multiline: true },
        { key: "success", token: "SUCCESS", label: "What success was supposed to look like", placeholder: "How you'd know it worked" },
        { key: "roles", token: "TIMELINE/ROLES", label: "Timeline and key players", placeholder: "Generic titles only — no names" },
      ],
      format:
        "5–8 distinct failure stories rated H/M/L with warning signs, the strongest case against doing it at all, and a mitigation per failure.",
      verify: [
        "Bring the tripwire list to the team",
        "Assign an owner to watch each warning sign — or the pre-mortem was theater",
      ],
    },
    segment_why: {
      persona: "Imagining it already failed frees people to name risks they'd hedge on if you asked \"what could go wrong?\"",
      task: "Forcing genuinely different failures — not five flavors of one — is what surfaces the risk you didn't see.",
      feed: "Generic titles keep it shareable; the model doesn't need real names to find the failure modes.",
      format: "That last, uncomfortable failure the model almost skipped is usually the one worth watching.",
    },
  },
  {
    id: "red-team-review",
    type: "play",
    title: "Red Team Review",
    situation: "\"Tear my draft apart before my boss does.\"",
    category: "think",
    level: 1,
    connectors: [],
    time_back: "Est. one embarrassing meeting",
    contract:
      "You walk away with: your draft attacked on five fronts, each finding paired with a fix, and a before/after score.",
    run_on: { surfaces: ["GenAI.mil", "Ask Sage"] },
    never_paste: NEVER_PASTE,
    prompt_template:
      "You are an adversarial reviewer. Your explicit goal is to make me doubt this draft — do not be agreeable, do not soften. Generic names only, no CUI/PII — remind me if I slip.\n\nThe draft: {{draft}}\nAudience and purpose: {{audience}}\nWhat I most fear being wrong about: {{fear}}\n\nAttack in this order: (1) factual weaknesses, (2) logical fallacies — name them and quote the sentence, (3) missing evidence a skeptic will demand, (4) unintended consequences or second-order effects, (5) the strongest counter-position, argued as its best advocate would. Rank findings by severity; pair every finding with a one-line fix. Close by rating the draft 1–10 before and after your proposed fixes — if the rating doesn't move, explain why.",
    body_segments: {
      persona:
        "An adversarial reviewer whose explicit goal is to make you doubt the draft — no softening, no agreeableness.",
      task:
        "Attack in order — facts, fallacies, missing evidence, second-order effects, the strongest counter-position — ranked by severity with a fix each.",
      feed_slots: [
        { key: "draft", token: "PASTE", label: "The draft", placeholder: "Paste your sanitized draft", multiline: true },
        { key: "audience", token: "WHO READS IT / WHAT IT MUST ACHIEVE", label: "Audience and purpose", placeholder: "Who reads it and what it must achieve" },
        { key: "fear", token: "FEAR", label: "What you most fear being wrong about", placeholder: "The weak spot you're worried about" },
      ],
      format:
        "Findings ranked by severity, each paired with a one-line fix, and a 1–10 rating before and after the fixes.",
      verify: [
        "Fix what's real; you own what stays",
        "Check the work before your name goes on it",
      ],
    },
    segment_why: {
      persona: "You want the model hostile here — a friendly reviewer misses exactly what your boss will catch.",
      task: "A fixed order of attack means it can't stop at the easy stuff; it has to reach the counter-argument.",
      feed: "Telling it what you fear points the attack at your real weak spot instead of the obvious ones.",
      format: "A before/after score keeps the critique honest — if a fix doesn't move the number, it wasn't a real fix.",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IMPROVE THE PROCESS  (framework plays 6–7 · Level 3)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "process-map-constraint",
    type: "play",
    title: "Map & Improve a Recurring Process",
    situation: "\"This process eats my time every week and I think it's broken.\"",
    category: "improve",
    level: 3,
    connectors: ["GAMECHANGER"],
    time_back: "Est. hours per week, permanently, if the case lands",
    contract:
      "You walk away with: a step map of the process, the real constraint, the waste named, and 2–3 improvements sized by effort.",
    run_on: { surfaces: ["GenAI.mil"], connector_note: "Turn ON GAMECHANGER — check what the instruction actually requires vs. local habit." },
    never_paste: NEVER_PASTE,
    deeper_links: [
      { label: "Pairs with: Brief Leadership on an Improvement", note: "Once you've found the fix, Play 7 turns it into the decision brief." },
    ],
    prompt_template:
      "You are a process-improvement partner helping me build a case my leadership can act on. Generic names only, no CUI/PII — remind me if I slip.\n\nThe process, in plain language — what triggers it, every step, who touches it, where it waits: {{describe}}\nHow often it runs and roughly how long each cycle takes: {{frequency}}\nThe most painful part: {{pain}}\n\nProcess: (1) Restate the workflow as a numbered step map: owner, action, wait time per step. (2) Identify the single constraint — the step everything else queues behind. (3) Categorize the waste you see: rework, waiting, handoffs, approvals, duplicate data entry. (4) Use the GAMECHANGER connector to check whether the steps I described are actually required by the governing instruction, or just local habit — cite the instruction and paragraph for anything that IS required. (5) Propose 2–3 improvements sized by effort vs. impact — my verbs are improve and optimize; disposition calls belong to my leadership. (6) List the questions only someone who does this job daily can answer before this is briefable.",
    body_segments: {
      persona:
        "A process-improvement partner helping you build a case your leadership can act on.",
      task:
        "Turn your description into a numbered step map, find the single constraint, categorize the waste, and check requirements against the actual instruction.",
      feed_slots: [
        { key: "describe", token: "DESCRIBE", label: "The process, in plain language", placeholder: "What triggers it, every step, who touches it, where it waits", multiline: true },
        { key: "frequency", token: "FREQUENCY/TIME", label: "How often it runs and how long each cycle takes", placeholder: "e.g. weekly, ~3 hours a cycle" },
        { key: "pain", token: "PAIN", label: "The most painful part", placeholder: "Where it hurts most" },
      ],
      format:
        "A step map with owners and wait times, the named constraint, the waste categorized, 2–3 sized improvements, and the questions only a daily operator can answer.",
      verify: [
        "Walk the step map past a coworker who actually runs the process",
        "Confirm every \"required by instruction\" claim against the real reg via GAMECHANGER",
        "Disposition calls belong to your leadership, not the tool",
      ],
    },
    segment_why: {
      persona: "\"Build the case\" is the frame — this isn't venting, it's evidence leadership can act on.",
      task: "GAMECHANGER is the anti-hallucination move: it separates what the reg truly requires from \"we've always done it this way.\"",
      feed: "The more honestly you map the waits and handoffs, the more clearly the constraint shows itself.",
      format: "Improve and optimize are your verbs; the call on what to change stays with your leadership.",
    },
  },
  {
    id: "brief-improvement",
    type: "play",
    title: "Brief Leadership on an Improvement",
    situation: "\"I found the fix — now I need the decision.\"",
    category: "improve",
    level: 3,
    connectors: [],
    time_back: "Est. 1–2 hrs per proposal",
    contract:
      "You walk away with: a half-page decision brief you can also speak in 90 seconds — current state, the ask, the payoff.",
    run_on: { surfaces: ["GenAI.mil", "Ask Sage"] },
    never_paste: NEVER_PASTE,
    prompt_template:
      "You are helping me turn an analysis into a decision-ready brief for my leadership. Keep it tight enough to survive a hallway conversation. Generic names only, no CUI/PII — remind me if I slip.\n\nThe process and what's wrong with it: {{process}}\nMy proposed improvement: {{proposal}}\nWhat it costs (time, money, risk) and what it returns: {{costgain}}\n\nBuild: (1) Current state — two sentences, with the cost of doing nothing. (2) Proposed change — what's different Monday morning. (3) Expected gain — honest ranges, never invented numbers; if I gave you no number, ask me rather than estimating. (4) Risks and what we'd watch. (5) The ask — the specific decision needed, from whom, by when. Format as a half-page paper I can also speak in 90 seconds.",
    body_segments: {
      persona:
        "A partner turning your analysis into a decision-ready brief — tight enough to survive a hallway conversation.",
      task:
        "Build current state (with the cost of doing nothing), the proposed change, honest expected-gain ranges, risks, and a specific ask.",
      feed_slots: [
        { key: "process", token: "FROM PLAY 6 OR DESCRIBE", label: "The process and what's wrong with it", placeholder: "Paste the output of Play 6, or describe it", multiline: true },
        { key: "proposal", token: "PROPOSAL", label: "Your proposed improvement", placeholder: "What you want to change" },
        { key: "costgain", token: "COST/GAIN", label: "What it costs and what it returns", placeholder: "Time, money, risk — and the payoff" },
      ],
      format:
        "A half-page paper — current state, proposed change, expected gain in honest ranges, risks, and the ask (who decides, by when) — speakable in 90 seconds.",
      verify: [
        "Every number traces to something real — leadership will ask",
        "You gave the ranges; don't let the model invent new ones",
      ],
    },
    segment_why: {
      persona: "\"Survive a hallway conversation\" sets the length — a decision brief, not a white paper.",
      task: "Leading with the cost of doing nothing is what makes a busy leader care enough to decide.",
      feed: "Feed it your real cost/return; the play forbids invented numbers, so it'll ask rather than guess.",
      format: "The explicit ask — who decides, by when — is what turns a good idea into a decision.",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WRITE IT RIGHT  (military-writing plays 8–12)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "epb-forge",
    type: "play",
    title: "Performance Statement Forge (EPB)",
    situation: "\"EPB season. My accomplishments deserve better than what I'd write at 2200.\"",
    category: "write",
    level: 1,
    connectors: ["GAMECHANGER"],
    time_back: "Est. 2–4 hrs per EPB cycle",
    contract:
      "You walk away with: 5 candidate statements, each ≤350 characters, action + impact, QC-checked — you and your supervisor pick and refine.",
    run_on: { surfaces: ["GenAI.mil"], connector_note: "GAMECHANGER ON to confirm the current narrative-statement standard." },
    never_paste: NEVER_PASTE,
    deeper_links: [
      { label: "This task repeats? Build the Bullet Forge agent", note: "Same play, saved permanently with your context (Level 2, ~10 min setup)." },
    ],
    prompt_template:
      "You are a skeptical senior rater who writes Air Force narrative performance statements. You reject vague impact claims and never invent facts or numbers — if a number is missing, ask me for it. Generic names only (\"SSgt X,\" \"my unit\"), no CUI/PII — remind me if I slip.\n\nThe rules for every statement: one standalone sentence, 350 characters or fewer, past tense, plain language, starts from a strong action, and carries action + impact (result or outcome). No personal pronouns, no uncommon acronyms. The statement should let a board see leadership qualities without naming them.\n\nFirst: use the GAMECHANGER connector to confirm the current narrative-statement guidance and tell me in one sentence what standard you're writing to. Then I'll dump my raw accomplishments — messy is fine: {{wordvomit}}\n\nFor each accomplishment: ask me for any missing impact number, then draft 5 candidate statements with different emphasis (mission, people, resources, innovation). Label each with the leadership quality it shows. I pick and we refine. Close each round with your own QC check: is it standalone, under 350 characters, action+impact, and would leadership recognize the expertise?",
    body_segments: {
      persona:
        "A skeptical senior rater who rejects vague impact claims and never invents facts or numbers — it asks you for what's missing.",
      task:
        "Confirm the current statement standard via GAMECHANGER, then turn your raw accomplishments into 5 candidate statements with different emphasis.",
      feed_slots: [
        { key: "wordvomit", token: "WORD VOMIT: what you did, who it helped, any numbers", label: "Your raw accomplishments — messy is fine", placeholder: "What you did, who it helped, any numbers you have", multiline: true },
      ],
      format:
        "5 standalone statements ≤350 characters, past tense, action + impact, each labeled with the leadership quality it shows — plus a QC check each round.",
      verify: [
        "Every number traces to something real — no invented metrics",
        "Each statement stands alone and fits 350 characters",
        "Your supervisor is the final editor — AI drafts; the Airman signs",
      ],
    },
    segment_why: {
      persona: "A role with standards beats \"be helpful.\" The skepticism is the feature — it interrogates your inputs like the board will.",
      task: "GAMECHANGER pulls the CURRENT guidance instead of trusting memory — and 5 candidates beat one \"final answer.\"",
      feed: "Facts in, statements out. The anti-fabrication rule means it can only use what you give it — and asks for missing numbers.",
      format: "Hard, checkable constraints: you can verify every rule by eyeball. That's what makes the output trustworthy.",
    },
  },
  {
    id: "award-1206",
    type: "play",
    title: "Award Package Builder (1206)",
    situation: "\"My Airman earned this award. The package should prove it.\"",
    category: "write",
    level: 1,
    connectors: [],
    time_back: "Est. 3–5 hrs per package",
    contract:
      "You walk away with: an award package drafted to the scoring areas, every claim flagged if it lacks a number or witness.",
    run_on: { surfaces: ["GenAI.mil", "Ask Sage"] },
    never_paste: NEVER_PASTE,
    prompt_template:
      "You are an awards-board veteran who knows a winning package quantifies impact and tells one coherent story. You never invent facts, numbers, or events — you ask for what's missing. Generic names only, no CUI/PII — remind me if I slip.\n\nAward and category: {{award}}\nThe nominee's raw accomplishments this period: {{accomplishments}}\nWhat made this period different from just doing the job: {{sowhat}}\n\nProcess: (1) Interview me — ask up to 5 questions that surface quantified impact I forgot (money saved, hours returned, people affected, mission outcomes). (2) Sort material by the award's scoring areas. (3) Draft each section in the required format with 2 candidate versions. (4) Flag every claim that has no number or witness — those get fixed or cut before submission. (5) Final pass: does the package read as one story a board member remembers?",
    body_segments: {
      persona:
        "An awards-board veteran who knows a winning package quantifies impact and tells one coherent story — and never invents facts.",
      task:
        "Interview you for the impact you forgot, sort material by the award's scoring areas, and draft each section with two candidate versions.",
      feed_slots: [
        { key: "award", token: "AWARD / QUARTER-ANNUAL / CATEGORY", label: "Award and category", placeholder: "Which award, which quarter/annual, which category" },
        { key: "accomplishments", token: "WORD VOMIT with any numbers you have", label: "The nominee's raw accomplishments this period", placeholder: "Everything they did — with any numbers you have", multiline: true },
        { key: "sowhat", token: "THE \"SO WHAT\"", label: "What made this period different from just doing the job", placeholder: "The \"so what\" that sets them apart" },
      ],
      format:
        "Each section drafted to the scoring areas with 2 candidate versions, every unquantified claim flagged, and a final one-story check.",
      verify: [
        "Confirm the current award cycle's format and criteria with your awards monitor",
        "Every claim has a number or a witness — fix or drop the rest",
        "Check every figure against the record before submission",
      ],
    },
    segment_why: {
      persona: "A board veteran's instinct — quantify or cut — is exactly what turns a nomination into a winner.",
      task: "The interview step surfaces the impact you'd have left on the table writing it alone at your desk.",
      feed: "Dump everything; the play sorts it and asks for the numbers that make a claim land.",
      format: "Flagging every claim with no number or witness is what keeps the package honest and board-ready.",
    },
  },
  {
    id: "mfr-one-pass",
    type: "play",
    title: "MFR in One Pass",
    situation: "\"I need a clean Memorandum for Record that says what happened and holds up later.\"",
    category: "write",
    level: 1,
    connectors: ["GAMECHANGER"],
    time_back: "Est. 30–60 min per MFR",
    contract:
      "You walk away with: a clean, factual MFR in standard format — chronological, observation separated from hearsay.",
    run_on: { surfaces: ["GenAI.mil"], connector_note: "GAMECHANGER ON if the MFR cites a policy or instruction." },
    never_paste: NEVER_PASTE,
    prompt_template:
      "You are an experienced admin NCO who writes Memorandums for Record — MFR means Memorandum for Record; do not reinterpret the acronym. MFRs are plain, factual, first-person, and exist so the record exists. Generic names where possible, no CUI/PII — remind me if I slip.\n\nWhat happened, in my words (who, what, when, where, any references): {{facts}}\nWhy this needs to be on the record: {{purpose}}\n\nProcess: (1) Ask me for any missing element a reader will need later (dates, titles, sequence). (2) If I cite a policy or instruction, use the GAMECHANGER connector to confirm the reference and cite it exactly — never guess a reference. (3) Draft the MFR body: chronological, factual, no speculation, no emotion; distinguish clearly between what I observed and what I was told. (4) Keep the standard memorandum format placeholders (FROM/SUBJECT/date/signature block) for me to complete in the template. (5) QC pass: could someone who wasn't there reconstruct events from this alone?",
    body_segments: {
      persona:
        "An experienced admin NCO who writes MFRs — plain, factual, first-person — and will not reinterpret the acronym.",
      task:
        "Ask for any missing element, confirm any cited reference via GAMECHANGER, and draft a chronological, factual body that separates observation from hearsay.",
      feed_slots: [
        { key: "facts", token: "FACTS", label: "What happened, in your words", placeholder: "Who, what, when, where, any references", multiline: true },
        { key: "purpose", token: "PURPOSE", label: "Why this needs to be on the record", placeholder: "The reason the MFR exists" },
      ],
      format:
        "A standard-format MFR body — chronological, no speculation, observed vs. told kept separate — with FROM/SUBJECT/date/signature placeholders for you to complete.",
      verify: [
        "Check names, dates, and references character-by-character",
        "Confirm any cited instruction on e-Publishing",
        "Keep what you observed separate from what you were told",
      ],
    },
    segment_why: {
      persona: "Pinning the acronym down matters — generic prompt sites have expanded \"MFR\" as \"Major Failure Report.\" Not here.",
      task: "GAMECHANGER confirms any reference exactly, so the record cites the reg instead of guessing it.",
      feed: "The more complete the who/what/when/where, the less the model has to ask — and the tighter the record.",
      format: "\"Could someone who wasn't there reconstruct this?\" is the bar an MFR has to clear.",
    },
  },
  {
    id: "paperwork-response",
    type: "play",
    title: "Respond to Paperwork (LOC/LOR Response)",
    situation: "\"I received paperwork and I get a limited window to respond. I need my strongest, calmest argument.\"",
    category: "write",
    level: 1,
    connectors: ["GAMECHANGER"],
    time_back: "Est. the difference between reacting and responding",
    sensitive: true,
    contract:
      "You walk away with: a calm, structured response — allegation by allegation, grounded in your record, ready for the ADC to review.",
    run_on: { surfaces: ["GenAI.mil"], connector_note: "Turn ON GAMECHANGER to pull the cited instruction." },
    never_paste: NEVER_PASTE_SENSITIVE,
    deeper_links: [
      { label: "See the Area Defense Counsel first", note: "The ADC is free, confidential, and outside your chain — this play structures writing, not legal advice." },
    ],
    prompt_template:
      "You are helping me structure a written response to administrative paperwork. You are calm, factual, and allergic to excuses and emotion — they read badly. You are not a lawyer and will remind me to see the Area Defense Counsel for anything beyond writing structure. Generic names, no CUI/PII — remind me if I slip.\n\nWhat the paperwork alleges, in its words: {{allegation}}\nThe instruction/standard it cites, if any: {{reference}}\nMy side, with facts and any evidence: {{facts}}\nMy record (time in service, ratings, awards, anything showing character): {{record}}\n\nProcess: (1) Use the GAMECHANGER connector to pull the cited instruction and tell me exactly what the standard requires — we respond to what it says, not what we assume. (2) Structure my response: acknowledge receipt professionally → address each allegation with facts and evidence, point by point → establish this is out of character using my record → note corrective actions already taken and lessons learned → close civil and forward-looking. (3) Strip anything that reads as blame-shifting, sarcasm, or excuse — flag it and tell me why. (4) Remind me of my suspense date math and that character letters from people who know my duty performance strengthen this.",
    body_segments: {
      persona:
        "A calm, factual writing partner — allergic to excuses and emotion — that is not a lawyer and will route you to the Area Defense Counsel.",
      task:
        "Pull the cited instruction via GAMECHANGER, then structure a point-by-point response grounded in your record, stripping anything that reads as an excuse.",
      feed_slots: [
        { key: "allegation", token: "ALLEGATION", label: "What the paperwork alleges, in its words", placeholder: "Summarize the allegation generically", multiline: true },
        { key: "reference", token: "REFERENCE", label: "The instruction/standard it cites, if any", placeholder: "The reg or standard named, if any" },
        { key: "facts", token: "FACTS", label: "Your side, with facts and any evidence", placeholder: "Your account and what you can support", multiline: true },
        { key: "record", token: "RECORD", label: "Your record", placeholder: "Time in service, ratings, awards, anything showing character" },
      ],
      format:
        "A structured response — professional acknowledgement → each allegation answered → out-of-character via your record → corrective actions → civil close — with excuses flagged and stripped.",
      verify: [
        "See the Area Defense Counsel before you sign — this structures writing, not legal advice",
        "Have the ADC or a trusted senior NCO read it for tone",
        "Confirm your actual suspense date from the paperwork",
      ],
    },
    segment_why: {
      persona: "Calm reads as credible; excuses read as guilt. The persona keeps your strongest, steadiest voice on the page.",
      task: "GAMECHANGER pulls what the instruction actually requires, so you answer the real standard — not what you assume it says.",
      feed: "Summarize generically — never paste the actual paperwork. Your record is what establishes this is out of character.",
      format: "Point-by-point, grounded in your record, forward-looking — the structure a reviewer expects to see.",
    },
  },
  {
    id: "email-that-gets-answered",
    type: "play",
    title: "Email That Gets Answered",
    situation: "\"This email matters and I keep rewriting it.\"",
    category: "write",
    level: 1,
    connectors: [],
    time_back: "Est. 15–30 min per hard email — and fewer follow-ups",
    contract:
      "You walk away with: a subject line that lands, a BLUF-first email under ten sentences, and a one-line version for busy leadership.",
    run_on: { surfaces: ["GenAI.mil", "Ask Sage", "Envision"] },
    never_paste: NEVER_PASTE,
    prompt_template:
      "You are a staff-communication editor trained on military email discipline: bottom line first, subject lines that carry keywords (ACTION / INFO / SIGN / DECISION + suspense date), active voice, short. Generic names, no CUI/PII — remind me if I slip.\n\nWho it's going to and our relationship (up/down/lateral): {{audience}}\nWhat I need from them, by when: {{ask}}\nBackground, messy is fine: {{context}}\n\nDeliver: (1) A subject line with the right keyword and suspense. (2) The email: BLUF first sentence carrying the ask and date, then only the context the reader needs to act, then a clean close. Ten sentences max unless I say otherwise. (3) A one-line \"if you only read one sentence\" version for busy leadership. (4) Flag anything in my draft context that sounds like frustration leaking through.",
    body_segments: {
      persona:
        "A staff-communication editor trained on military email discipline: bottom line first, keyworded subject lines, active voice, short.",
      task:
        "Write a keyworded subject line and a BLUF-first email under ten sentences, plus a one-line version for busy leadership.",
      feed_slots: [
        { key: "audience", token: "AUDIENCE", label: "Who it's going to and your relationship", placeholder: "Up / down / lateral, and who they are" },
        { key: "ask", token: "THE ASK + SUSPENSE", label: "What you need from them, by when", placeholder: "The ask and the suspense date" },
        { key: "context", token: "CONTEXT", label: "Background — messy is fine", placeholder: "Everything the reader might need to act", multiline: true },
      ],
      format:
        "A subject line with keyword + suspense, a BLUF-first email (ten sentences max), a one-line \"read only this\" version, and a flag on any frustration leaking through.",
      verify: [
        "Read it once as the recipient — would you answer it today?",
        "Confirm the ask and suspense are unmistakable",
        "Check that no frustration leaked into the tone",
      ],
    },
    segment_why: {
      persona: "Email discipline is a real skill — BLUF and a keyworded subject are what get a busy inbox to act.",
      task: "Leading with the ask and the date is the whole game; everything else is only what's needed to act on it.",
      feed: "Give it the messy background; the play's job is to cut it down to what the reader actually needs.",
      format: "The \"if you only read one sentence\" line is your insurance for the leader who skims.",
    },
  },
];
