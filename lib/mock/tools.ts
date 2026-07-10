// ── Approved tools roster ───────────────────────────────────────────────────
// EXECUTIVE DECISION (1 Jul 2026): commercial tools are out. Everything listed
// here is approved for official use (confirm locally). If it is on this page, it
// is an approved tool. Personal-use commercial tools are deliberately not listed.
//
// Fixed schema (Doctrine v1.1 §4): what it is (1–2 sentences, hard cap) ·
// authorization level (LINKED to the authoritative source, never asserted) ·
// use cases · the full access path to first working use · a verified-as-of date.
// Access paths are the app's most perishable content — they ship as DRAFTS pending
// product-owner verification.
//
// Plain-language rule: no Impact Level or compliance jargon (IL2/IL4/IL5,
// FedRAMP, CAC-gated) in any Airman-facing string. Say what it means instead.

export type UseCase =
  | "Writing" | "Research" | "Images" | "Briefings" | "Data"
  | "Automation" | "Dashboards" | "Apps" | "Forms";
export type Section = "ai" | "automation" | "data" | "platforms" | "soon";

export interface ToolAuthorization {
  label: string;        // plain-language statement of the authorization
  sourceUrl?: string;   // link to the authoritative source; empty → "confirm locally"
}

export interface Tool {
  id: string;
  name: string;
  tagline: string;
  whatItIs: string;                 // 1–2 sentences, hard cap
  authorization: ToolAuthorization; // linked, never asserted
  section: Section;
  useCases: UseCase[];
  url: string;
  badge?: string;
  icon: string;
  inDevelopment?: boolean;
  // Can an Airman reach this directly from a personal phone browser?
  //   true  → works on any device.
  //   false → workstation only → still shows "Open tool", with a workstation note.
  accessibleMobile: boolean;
  accessPath: string[];             // every step to first working use
  accessVerified: string;           // as-of date; rendered as a draft pending verification
}

// Ordered — drives section render order and headers on the Tools page.
export const SECTIONS: { id: Section; label: string; blurb: string }[] = [
  { id: "ai",         label: "AI",           blurb: "Frontier AI, approved for official unclassified work." },
  { id: "automation", label: "Automation",   blurb: "Stop doing it by hand. Let workflows run the busywork." },
  { id: "data",       label: "Data",         blurb: "Turn trackers and spreadsheets into living data." },
  { id: "platforms",  label: "Platforms",    blurb: "Collect, store, and share, without the paper." },
  { id: "soon",       label: "Coming Soon",  blurb: "Announced and on the way. Verify availability locally." },
];

// Draft access paths — pending product-owner verification (Doctrine §5 standing duty).
const DRAFT_DATE = "9 Jul 2026";

export const TOOLS: Tool[] = [
  // ── AI ───────────────────────────────────────────────────────────────────
  {
    id: "t1",
    name: "GenAI.mil",
    tagline: "DoD Enterprise AI Platform (CDAO)",
    whatItIs:
      "The Department's enterprise generative AI platform, run by the CDAO and adopted across the DAF: frontier models for drafting, summarizing, images, enterprise search, and no-code agents, in a secure government environment where your data never trains public models. The easiest on-ramp — start here.",
    authorization: {
      label: "Approved for official unclassified use across the DAF (CDAO).",
      sourceUrl: "https://genai.mil",
    },
    section: "ai",
    useCases: ["Writing", "Research", "Images", "Briefings", "Data"],
    url: "https://genai.mil",
    badge: "Start Here",
    icon: "🛡️",
    accessibleMobile: false,
    accessPath: [
      "Open genai.mil from a CAC-enabled government network.",
      "Sign in with your CAC — no DD 2875 or separate request needed.",
      "Accept the terms, pick a model, and start working.",
    ],
    accessVerified: DRAFT_DATE,
  },
  {
    id: "t15",
    name: "Ask Sage",
    tagline: "Multi-Model AI for Government Work",
    whatItIs:
      "A government-focused generative AI platform for official unclassified work, with 150+ models and a no-code Agent Builder for multi-step workflows. More powerful and technical than GenAI.mil, but usage is metered and onboarding has more steps.",
    authorization: {
      label: "Approved for official unclassified work; access varies by unit.",
      sourceUrl: "https://chat.asksage.ai",
    },
    section: "ai",
    useCases: ["Writing", "Research", "Data"],
    url: "https://chat.asksage.ai",
    badge: "Advanced",
    icon: "🧭",
    accessibleMobile: false,
    accessPath: [
      "Check whether your unit or organization already has Ask Sage access — usage is metered.",
      "Request an account through your unit's process or IT.",
      "Sign in from a government workstation and pick a model.",
    ],
    accessVerified: DRAFT_DATE,
  },

  // ── Automation (M365 Power Platform) ─────────────────────────────────────
  {
    id: "t22",
    name: "Power Automate",
    tagline: "Automate the busywork",
    whatItIs:
      "Build no-code flows that route approvals (leave, awards, travel), move files, and send reminders automatically — killing the manual chasing and status-tracking. An AI assistant can draft a flow from a plain-English description.",
    authorization: {
      label: "Part of the government Microsoft 365 (Power Platform) environment; entitlement varies by tenant.",
    },
    section: "automation",
    useCases: ["Automation"],
    url: "https://make.gov.powerautomate.us",
    badge: "M365",
    icon: "⚙️",
    accessibleMobile: false,
    accessPath: [
      "Sign in to the government Microsoft 365 environment with your government account.",
      "Open Power Automate from the Microsoft 365 app launcher.",
      "Start from a template or build a flow. (Premium connectors and Dataverse flows need extra licensing.)",
    ],
    accessVerified: DRAFT_DATE,
  },
  {
    id: "t23",
    name: "Power Apps",
    tagline: "Build apps without code",
    whatItIs:
      "Turn a spreadsheet or SharePoint List into a real phone or desktop app with forms and logic — replacing a paper in-processing checklist or an Excel tracker. An AI assistant can generate a starter app from a description.",
    authorization: {
      label: "Part of the government Microsoft 365 (Power Platform) environment; entitlement varies by tenant.",
    },
    section: "automation",
    useCases: ["Apps", "Automation"],
    url: "https://make.gov.powerapps.us",
    badge: "M365",
    icon: "🧩",
    accessibleMobile: false,
    accessPath: [
      "Sign in to the government Microsoft 365 environment.",
      "Open Power Apps from the app launcher.",
      "Build from a SharePoint List or a template. (Dataverse and premium-connector apps need extra licensing.)",
    ],
    accessVerified: DRAFT_DATE,
  },

  // ── Data ─────────────────────────────────────────────────────────────────
  // TODO(user): verify the Envision URL from a CAC-enabled workstation before
  // publishing. Kept link-less (Coming soon) until confirmed.
  {
    id: "t14",
    name: "Envision",
    tagline: "Enterprise DAF Data & AI Platform",
    whatItIs:
      "The DAF's enterprise data platform, open to Airmen just by logging in from a government workstation. It connects DAF data sources so you can build apps, analysis, and AI grounded on that data — the most powerful platform here for data-driven work.",
    authorization: {
      label: "DAF enterprise data platform, open to Airmen on the government network.",
    },
    section: "data",
    useCases: ["Data", "Research"],
    url: "",
    badge: "DAF Enterprise",
    icon: "🔭",
    accessibleMobile: false,
    accessPath: [
      "Log in to Envision from a CAC-enabled government workstation.",
      "No separate request for basic access — logging in is access.",
      "Explore the connected DAF data sources to build apps or analysis.",
    ],
    accessVerified: DRAFT_DATE,
  },
  {
    id: "t24",
    name: "Power BI",
    tagline: "Live dashboards from data",
    whatItIs:
      "Point it at a tracker and get an auto-refreshing, interactive leadership dashboard instead of rebuilding weekly slides by hand.",
    authorization: {
      label: "Part of the government Microsoft 365 environment; entitlement varies by tenant.",
    },
    section: "data",
    useCases: ["Dashboards", "Data"],
    url: "https://app.powerbigov.us",
    badge: "M365",
    icon: "📊",
    accessibleMobile: false,
    accessPath: [
      "Sign in to the government Microsoft 365 / Power BI environment.",
      "Open the Power BI service (app.powerbigov.us).",
      "Connect a dataset or a List and build a report.",
    ],
    accessVerified: DRAFT_DATE,
  },
  {
    id: "t25",
    name: "Microsoft Lists / SharePoint Lists",
    tagline: "Smart trackers, shared",
    whatItIs:
      "One structured, shared tracker for tasks, assets, and statuses — with views, rules, and reminders — instead of an emailed Excel file. It's the free data layer that Power Apps, Power Automate, and Power BI build on.",
    authorization: {
      label: "Part of the government Microsoft 365 environment; available to most users.",
    },
    section: "data",
    useCases: ["Data"],
    url: "https://www.microsoft365.us",
    badge: "M365",
    icon: "📋",
    accessibleMobile: false,
    accessPath: [
      "Sign in to the government Microsoft 365 environment.",
      "Open Lists (or a SharePoint site) from the app launcher.",
      "Create a list from a template or from blank.",
    ],
    accessVerified: DRAFT_DATE,
  },
  {
    id: "t26",
    name: "Dataverse",
    tagline: "Power Platform's real database",
    whatItIs:
      "The secure relational database behind advanced Power Platform apps — for complex related data, roles, and business rules well beyond what a List handles. It's premium-licensed, not free like Lists.",
    authorization: {
      label: "Premium Power Platform capability; confirm your entitlement before building.",
    },
    section: "data",
    useCases: ["Data"],
    url: "https://make.gov.powerapps.us",
    badge: "Advanced",
    icon: "🗄️",
    accessibleMobile: false,
    accessPath: [
      "Confirm you have a premium Power Platform license (Dataverse is not free like Lists).",
      "Sign in to the government Microsoft 365 environment.",
      "Create a Dataverse environment and tables through Power Apps.",
    ],
    accessVerified: DRAFT_DATE,
  },

  // ── Platforms ────────────────────────────────────────────────────────────
  // TODO(user): SharePoint/Forms URLs are tenant-specific — confirm for your unit.
  {
    id: "t27",
    name: "SharePoint",
    tagline: "Your team's home base",
    whatItIs:
      "Team sites and versioned document libraries — one source of truth for SOPs, docs, and trackers instead of scattered shared drives. It's the backbone behind Teams, Lists, Power Apps, and Power Automate.",
    authorization: {
      label: "Part of the government Microsoft 365 environment; site creation may need admin approval.",
    },
    section: "platforms",
    useCases: ["Data"],
    url: "https://www.microsoft365.us",
    badge: "M365",
    icon: "🗂️",
    accessibleMobile: false,
    accessPath: [
      "Sign in to the government Microsoft 365 environment.",
      "Open SharePoint from the app launcher.",
      "Request or create a team site (site creation may need admin approval in your tenant).",
    ],
    accessVerified: DRAFT_DATE,
  },
  {
    id: "t28",
    name: "Microsoft Forms",
    tagline: "Surveys and intake forms",
    whatItIs:
      "Stand up a survey or intake form in minutes; responses land in Excel or Lists automatically and can trigger a Power Automate flow to route and log them. Goodbye paper.",
    authorization: {
      label: "Part of the government Microsoft 365 environment; some gov-cloud extras are disabled.",
    },
    section: "platforms",
    useCases: ["Forms", "Data"],
    url: "https://forms.office.com",
    badge: "M365",
    icon: "📝",
    accessibleMobile: false,
    accessPath: [
      "Sign in to the government Microsoft 365 environment.",
      "Open Forms from the app launcher.",
      "Create a form; responses flow to Excel/Lists. (Gov clouds disable a few extras like email notifications and external sharing.)",
    ],
    accessVerified: DRAFT_DATE,
  },

  // ── Coming Soon ──────────────────────────────────────────────────────────
  // AAA is the enterprise AI schoolhouse arriving on GenAI.mil — the flagship
  // Road-2 (Discovery) handoff. No live URL yet: honesty over dead links.
  {
    id: "t21",
    name: "AI for All Airmen (AAA)",
    tagline: "Your personal AI tutor, on GenAI.mil",
    whatItIs:
      "The Air Force's enterprise AI schoolhouse arriving on GenAI.mil (CMSAF AI Action Team, via CDAO): it interviews you about your job, then builds a personalized learning roadmap grounded only in approved sources, with quizzes, audio overviews, and mind maps.",
    authorization: {
      label: "Coming soon — verify availability locally.",
    },
    section: "soon",
    useCases: ["Research", "Briefings"],
    url: "",
    badge: "Coming Soon",
    icon: "🎓",
    inDevelopment: true,
    accessibleMobile: false,
    accessPath: [
      "Not yet released to the enterprise.",
      "When it ships, access will be through your GenAI.mil sign-in. Verify availability locally.",
    ],
    accessVerified: DRAFT_DATE,
  },
  // FLAGGED (Doctrine Rule 4): "Copilot Studio" is a named Microsoft builder, not
  // one of the three controlled AI surfaces. Kept as an approved M365 platform tool
  // (Coming Soon); pending product-owner confirmation it should be named in-app.
  {
    id: "t29",
    name: "Copilot Studio",
    tagline: "Build your own chatbot",
    whatItIs:
      "A no-code builder for custom AI agents that answer from your unit's docs and policies and take action via flows — for example, a help-desk bot for routine member questions.",
    authorization: {
      label: "Availability varies by environment; verify in your tenant.",
    },
    section: "soon",
    useCases: ["Automation", "Apps"],
    url: "",
    badge: "Coming Soon",
    icon: "🛠️",
    inDevelopment: true,
    accessibleMobile: false,
    accessPath: [
      "Confirm Copilot Studio is enabled in your tenant.",
      "Sign in to the government Microsoft 365 environment.",
      "Open Copilot Studio to build and publish a custom agent.",
    ],
    accessVerified: DRAFT_DATE,
  },
];

export const USE_CASES: UseCase[] = ["Writing", "Research", "Images", "Briefings", "Data", "Automation", "Dashboards", "Apps", "Forms"];
