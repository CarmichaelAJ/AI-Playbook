// ── Approved tools roster — Tool Card 2.0 (Sprint 2, launcher-first) ─────────
// EXECUTIVE DECISION (1 Jul 2026): commercial tools are out. Everything listed
// here is approved for official use (confirm locally). If it is on this page, it
// is an approved tool. Personal-use commercial tools are deliberately not listed.
//
// Design principle (19 Jul design review): a play card is a lesson; a tool card
// is a door. Every live tool has one launch_url (the official door), a checkable
// access path for first-timers, an honest verified-as-of date, and one first move.
//
// Plain-language rule: no Impact Level or compliance jargon in any Airman-facing
// string. Say what it means instead. Terminology per project lexicon (C1–C6).

export type Section = "ai" | "automation" | "data" | "platforms" | "soon";
export type WaitClass = "none" | "minutes" | "days";
export type ToolStatus = "live" | "coming_soon";

export interface AccessStep {
  step: string; // imperative voice, one action
}

export interface FirstMove {
  text: string;
  copyable?: string; // paste-ready starter prompt, only where one exists
}

export interface ChangedNote {
  date: string; // ISO — a dot renders on the row while this is within 60 days
  text: string;
}

export interface Tool {
  id: string;
  name: string;
  one_liner: string;             // expanded-header line (collapsed rows carry no description)
  description: string;           // what it is, 1–3 sentences
  section: Section;
  badge?: string;
  icon: string;
  status: ToolStatus;

  // The door
  launch_url: string;            // official entry URL; "" only while coming_soon
  cleared_line: string;          // one sentence, plain language — who/what it's cleared for

  // The path in
  access_path: AccessStep[];     // 2–5 steps to first working use
  cac_required: boolean;
  wait_class: WaitClass;         // none = nothing to request
  path_verified_on: string;      // ISO date the path was last walked
  path_pending_verification?: boolean; // true → amber "steps pending verification" badge

  // First move + plays
  first_move?: FirstMove;
  play_ids: string[];            // plays that run on this tool (deep-links to /plays)
  no_plays_line?: string;        // honest line when play_ids is empty

  changed_note?: ChangedNote;    // dated "changed" pulse
  soon_note?: string;            // coming-soon rows expand to this short honest note
}

// Ordered — drives section render order and headers on the Tools page.
export const SECTIONS: { id: Section; label: string; blurb: string }[] = [
  { id: "ai",         label: "AI",           blurb: "Frontier AI tools, approved for official unclassified work." },
  { id: "automation", label: "Automation",   blurb: "Stop doing it by hand. Let workflows run the busywork." },
  { id: "data",       label: "Data",         blurb: "Turn trackers and spreadsheets into living data." },
  { id: "platforms",  label: "Platforms",    blurb: "Collect, store, and share, without the paper." },
  { id: "soon",       label: "Coming Soon",  blurb: "Announced and on the way. Verify availability locally." },
];

// ── Intent router ("I want to…") — mapped in data, not hardcoded in the UI ────
export interface Intent {
  id: string;
  label: string;
  toolIds: string[];
}

export const INTENTS: Intent[] = [
  { id: "write",     label: "write",             toolIds: ["t1", "t15"] },
  { id: "research",  label: "research",          toolIds: ["t1", "t15", "t14"] },
  { id: "track",     label: "track data",        toolIds: ["t25", "t27", "t26"] },
  { id: "automate",  label: "automate",          toolIds: ["t22"] },
  { id: "dashboard", label: "build a dashboard", toolIds: ["t24", "t14"] },
  { id: "form",      label: "make a form",       toolIds: ["t28", "t23"] },
];

// Verified-as-of date for paths walked during the 9 Jul 2026 verification pass.
const VERIFIED = "2026-07-09";

// Shared cleared-for line for everything living in the government Microsoft 365.
const DAF365_CLEARED =
  "Runs inside DAF365 — the Air Force's own Microsoft 365, the same boundary as your email and SharePoint.";

const AUTOMATION_PLAYS_LINE =
  "Automation plays are landing next — this door will already be open.";
const DATA_PLAYS_LINE =
  "Data plays are landing next — this door will already be open.";

export const TOOLS: Tool[] = [
  // ── AI ───────────────────────────────────────────────────────────────────
  {
    id: "t1",
    name: "GenAI.mil",
    one_liner: "The Department of War's official AI platform",
    description:
      "One secure door to the Department's approved frontier AI tools — Google's Gemini for Government and xAI's Grok today, with a custom ChatGPT arriving now.",
    section: "ai",
    badge: "Start Here",
    icon: "🛡️",
    status: "live",
    launch_url: "https://genai.mil",
    cleared_line:
      "Approved for official work, including controlled unclassified information (CUI) — never classified. The platform's own data rules are the authority; read them once before your first real task.",
    access_path: [
      { step: "On your government computer (unclassified network), go to GenAI.mil" },
      { step: "Sign in with your CAC — no separate request or account paperwork needed." },
      { step: "Accept the terms of use the first time in." },
      { step: "Pick an AI tool — any of them runs every play in this app" },
    ],
    cac_required: true,
    wait_class: "none",
    path_verified_on: VERIFIED,
    first_move: {
      text: "Open a chat and run your first play — most Airmen start with Deep Research Brief. Or paste this to get oriented:",
      copyable:
        "In five bullets, give me a plain-language tour of what you can do for an Airman's daily staff work — drafting, summarizing, research, and checking my work. Then ask me what I'm working on today.",
    },
    play_ids: [
      "deep-research-brief", "claim-audit", "tradeoff-matrix", "pre-mortem", "red-team-review",
      "process-map-constraint", "brief-improvement", "epb-forge", "award-1206", "mfr-one-pass",
      "paperwork-response", "email-that-gets-answered",
    ],
    changed_note: {
      date: "2026-07-15",
      text: "GAMECHANGER now lives inside GenAI.mil — turn it on from the tools panel there instead of visiting it separately.",
    },
  },
  {
    id: "t15",
    name: "Ask Sage",
    one_liner: "Multi-model AI platform for government work",
    description:
      "150+ AI models and a no-code Agent Builder for multi-step workflows — more technical than GenAI.mil, and usage is metered. Ask Sage is a separate approved commercial AI platform some units pay for — check whether your unit has seats. It is not part of GenAI.mil.",
    section: "ai",
    badge: "Advanced",
    icon: "🧭",
    status: "live",
    launch_url: "https://chat.asksage.ai",
    cleared_line:
      "Approved for official unclassified work — never classified; access and usage limits vary by unit.",
    access_path: [
      { step: "Check whether your unit or organization already has Ask Sage seats — usage is metered and paid." },
      { step: "Request an account through your unit's process or IT shop." },
      { step: "Sign in from your government computer and choose an AI model to work with." },
    ],
    cac_required: true,
    wait_class: "days",
    path_verified_on: VERIFIED,
    first_move: {
      text: "Run the same play you'd run on GenAI.mil — the play anatomy transfers one-for-one.",
    },
    play_ids: ["pre-mortem", "red-team-review", "brief-improvement", "award-1206", "email-that-gets-answered"],
  },

  // ── Automation (M365 Power Platform) ─────────────────────────────────────
  {
    id: "t22",
    name: "Power Automate",
    one_liner: "Automate the busywork",
    description:
      "Build no-code flows that route approvals (leave, awards, travel), move files, and send reminders automatically — killing the manual chasing and status-tracking. An AI assistant can draft a flow from a plain-English description.",
    section: "automation",
    badge: "M365",
    icon: "⚙️",
    status: "live",
    launch_url: "https://make.gov.powerautomate.us",
    cleared_line: DAF365_CLEARED,
    access_path: [
      { step: "Sign in to DAF365 with your government account." },
      { step: "Open Power Automate from the Microsoft 365 app launcher." },
      { step: "Start from a template, or describe the flow you want in plain English. (Premium connectors and Dataverse flows need extra licensing.)" },
    ],
    cac_required: true,
    wait_class: "none",
    path_verified_on: VERIFIED,
    first_move: {
      text: "Automate the thing you chase most: pick the \"Start approval when a file is added\" template and point it at your team's tracker.",
    },
    play_ids: [],
    no_plays_line: AUTOMATION_PLAYS_LINE,
  },
  {
    id: "t23",
    name: "Power Apps",
    one_liner: "Build apps without code",
    description:
      "Turn a spreadsheet or SharePoint List into a real phone or desktop app with forms and logic — replacing a paper in-processing checklist or an Excel tracker. An AI assistant can generate a starter app from a description.",
    section: "automation",
    badge: "M365",
    icon: "🧩",
    status: "live",
    launch_url: "https://make.gov.powerapps.us",
    cleared_line: DAF365_CLEARED,
    access_path: [
      { step: "Sign in to DAF365 with your government account." },
      { step: "Open Power Apps from the app launcher." },
      { step: "Build from a SharePoint List or a template. (Dataverse and premium-connector apps need extra licensing.)" },
    ],
    cac_required: true,
    wait_class: "none",
    path_verified_on: VERIFIED,
    first_move: {
      text: "Turn an existing tracker into an app: choose \"Start from SharePoint list\" and pick the List your team already uses.",
    },
    play_ids: [],
    no_plays_line: AUTOMATION_PLAYS_LINE,
  },

  // ── Data ─────────────────────────────────────────────────────────────────
  {
    id: "t14",
    name: "Envision",
    one_liner: "The Air Force's enterprise data & analytics platform",
    description:
      "Connects DAF data sources so you can build analysis, apps, and AI grounded on real data — the most powerful platform here for data-driven work. Basic access is just logging in.",
    section: "data",
    badge: "DAF Enterprise",
    icon: "🔭",
    status: "live",
    launch_url: "https://envision.af.mil",
    cleared_line:
      "Open to Airmen on the government network — logging in from your government computer is the access.",
    access_path: [
      { step: "On your government computer, go to Envision." },
      { step: "Sign in with your CAC — no separate request for basic access." },
      { step: "Explore the connected DAF data sources for your functional area." },
    ],
    cac_required: true,
    wait_class: "none",
    path_verified_on: VERIFIED,
    path_pending_verification: true,
    first_move: {
      text: "Browse the data catalog for your functional area before building anything — knowing what's connected is half the value.",
    },
    play_ids: ["email-that-gets-answered"],
  },
  {
    id: "t24",
    name: "Power BI",
    one_liner: "Live dashboards from data",
    description:
      "Point it at a tracker and get an auto-refreshing, interactive leadership dashboard instead of rebuilding weekly slides by hand.",
    section: "data",
    badge: "M365",
    icon: "📊",
    status: "live",
    launch_url: "https://app.powerbigov.us",
    cleared_line: DAF365_CLEARED,
    access_path: [
      { step: "Sign in to DAF365 with your government account." },
      { step: "Open the Power BI service (app.powerbigov.us)." },
      { step: "Connect a dataset or a List and build a report." },
    ],
    cac_required: true,
    wait_class: "none",
    path_verified_on: VERIFIED,
    first_move: {
      text: "Point it at the tracker you brief from every week — connect the file or List and let it draft the first visuals.",
    },
    play_ids: [],
    no_plays_line: DATA_PLAYS_LINE,
  },
  {
    id: "t25",
    name: "Microsoft Lists / SharePoint Lists",
    one_liner: "Smart trackers, shared",
    description:
      "One structured, shared tracker for tasks, assets, and statuses — with views, rules, and reminders — instead of an emailed Excel file. It's the free data layer that Power Apps, Power Automate, and Power BI build on.",
    section: "data",
    badge: "M365",
    icon: "📋",
    status: "live",
    launch_url: "https://portal.office365.us",
    cleared_line: DAF365_CLEARED,
    access_path: [
      { step: "Sign in to DAF365 with your government account." },
      { step: "Open Lists (or a SharePoint site) from the app launcher." },
      { step: "Create a list from a template or from blank." },
    ],
    cac_required: true,
    wait_class: "none",
    path_verified_on: VERIFIED,
    first_move: {
      text: "Rebuild your most-emailed Excel tracker as a List — start from the \"Issue tracker\" or \"Asset manager\" template.",
    },
    play_ids: [],
    no_plays_line: DATA_PLAYS_LINE,
  },
  {
    id: "t26",
    name: "Dataverse",
    one_liner: "Power Platform's real database",
    description:
      "The secure relational database behind advanced Power Platform apps — for complex related data, roles, and business rules well beyond what a List handles. It's premium-licensed, not free like Lists.",
    section: "data",
    badge: "Advanced",
    icon: "🗄️",
    status: "live",
    launch_url: "https://make.gov.powerapps.us",
    cleared_line: DAF365_CLEARED,
    access_path: [
      { step: "Confirm you have a premium Power Platform license (Dataverse is not free like Lists)." },
      { step: "Sign in to DAF365 with your government account." },
      { step: "Create a Dataverse environment and tables through Power Apps." },
    ],
    cac_required: true,
    wait_class: "days",
    path_verified_on: VERIFIED,
    first_move: {
      text: "Before building here, check whether a plain List covers your need — Dataverse earns its licensing only when data gets genuinely relational.",
    },
    play_ids: [],
    no_plays_line: DATA_PLAYS_LINE,
  },

  // ── Platforms ────────────────────────────────────────────────────────────
  {
    id: "t27",
    name: "SharePoint",
    one_liner: "Your team's home base",
    description:
      "Team sites and versioned document libraries — one source of truth for SOPs, docs, and trackers instead of scattered shared drives. It's the backbone behind Teams, Lists, Power Apps, and Power Automate.",
    section: "platforms",
    badge: "M365",
    icon: "🗂️",
    status: "live",
    launch_url: "https://portal.office365.us",
    cleared_line: DAF365_CLEARED,
    access_path: [
      { step: "Sign in to DAF365 with your government account." },
      { step: "Open SharePoint from the app launcher." },
      { step: "Request or create a team site (site creation may need admin approval in your tenant)." },
    ],
    cac_required: true,
    wait_class: "minutes",
    path_verified_on: VERIFIED,
    first_move: {
      text: "Move one SOP out of the shared drive and into a document library — versioning starts working the moment it lands.",
    },
    play_ids: [],
    no_plays_line: AUTOMATION_PLAYS_LINE,
  },
  {
    id: "t28",
    name: "Microsoft Forms",
    one_liner: "Surveys and intake forms",
    description:
      "Stand up a survey or intake form in minutes; responses land in Excel or Lists automatically and can trigger a Power Automate flow to route and log them. Goodbye paper.",
    section: "platforms",
    badge: "M365",
    icon: "📝",
    status: "live",
    launch_url: "https://forms.office.com",
    cleared_line: DAF365_CLEARED,
    access_path: [
      { step: "Sign in to DAF365 with your government account." },
      { step: "Open Forms from the app launcher." },
      { step: "Create a form; responses flow to Excel or Lists. (Government clouds disable a few extras like email notifications and external sharing.)" },
    ],
    cac_required: true,
    wait_class: "none",
    path_verified_on: VERIFIED,
    first_move: {
      text: "Replace one paper intake sheet: build the form, then watch responses land in a List without anyone retyping them.",
    },
    play_ids: [],
    no_plays_line: AUTOMATION_PLAYS_LINE,
  },

  // ── Coming Soon ──────────────────────────────────────────────────────────
  // Shipped unnamed by design (Q12): the official program name isn't public.
  {
    id: "t21",
    name: "AI training for every Airman",
    one_liner: "Announced by the CMSAF — official name pending",
    description:
      "An enterprise AI schoolhouse arriving on GenAI.mil: it interviews you about your job, then builds a learning roadmap grounded only in approved sources, with quizzes, audio overviews, and mind maps.",
    section: "soon",
    icon: "🎓",
    status: "coming_soon",
    launch_url: "",
    cleared_line: "Coming soon — verify availability locally.",
    access_path: [
      { step: "Not yet released to the enterprise." },
      { step: "When it ships, access will be through your GenAI.mil sign-in." },
    ],
    cac_required: true,
    wait_class: "none",
    path_verified_on: VERIFIED,
    play_ids: [],
    soon_note:
      "The official program name isn't public yet, so this card doesn't print one. The day it ships, the name, path, and a verified date land here.",
  },
  {
    id: "t29",
    name: "Copilot Studio",
    one_liner: "Build your own chatbot",
    description:
      "A no-code builder for custom AI agents that answer from your unit's docs and policies and take action via flows — for example, a help-desk bot for routine member questions.",
    section: "soon",
    icon: "🛠️",
    status: "coming_soon",
    launch_url: "",
    cleared_line: "Not yet available in the cloud most Airmen use.",
    access_path: [
      { step: "Not yet available — no path to publish." },
    ],
    cac_required: true,
    wait_class: "none",
    path_verified_on: VERIFIED,
    play_ids: [],
    soon_note:
      "Not yet available in the cloud most Airmen use — we'll publish the path if that changes. Don't brief it as available.",
  },
];
