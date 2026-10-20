import type { ContentAccess } from "@/content/access";

// How narrow a community is. Discovery moves from "community" (broad) toward the
// narrower levels. These are navigation labels, NOT an authoritative Air Force
// classification of jobs; the levels are working vocabulary until an approved source
// (for example the Enlisted/Officer Classification Directories) is adopted.
export type CommunityLevel =
  | "community"
  | "career-field"
  | "afsc"
  | "shredout"
  | "special-duty"
  | "role"
  | "task-area";

export const COMMUNITY_LEVEL_LABEL: Record<CommunityLevel, string> = {
  community: "Community",
  "career-field": "Career field",
  afsc: "AFSC",
  shredout: "Shredout",
  "special-duty": "Special duty",
  role: "Role",
  "task-area": "Task area",
};

export interface Community {
  id: string;
  name: string;
  level: CommunityLevel;
  // Broader communities this one sits under. Several parents are allowed because real
  // work does not fit one tree (a UDM sits under unit programs and under logistics).
  // Top-level communities have none.
  parentIds: string[];
  // Other names people search by: AFSC prefixes, nicknames, abbreviations, spelled-out titles.
  aliases: string[];
  mission: string;
  // Task language. Search treats these as keywords for the community.
  commonWork: string[];
  startingToolIds: string[];
  notes: string;
  // Everything in this repository is public. See docs/RESTRICTED_CONTENT_REQUIREMENTS.md.
  access: ContentAccess;
}

// Working communities for discovery and feedback. They are not authoritative AFSC
// mappings. They are source communities used to recruit reviewers, collect use cases,
// and test whether the Playbook speaks their language. Plays are attached to communities
// in content/playCommunities.ts, not here.
export const COMMUNITIES: Community[] = [
  {
    id: "front-office-admin",
    name: "Front offices, CSS, and admin teams",
    level: "community",
    parentIds: [],
    aliases: ["3F5", "3F0", "CSS", "admin", "exec", "front office", "commander support staff"],
    mission: "Turn daily staff work into cleaner drafts, faster routing, and better records.",
    commonWork: ["MFRs", "email cleanup", "award packages", "task tracking", "meeting notes"],
    startingToolIds: ["t1", "t15", "t22", "t23"],
    notes: "Strong first beta group because the work is high-volume, text-heavy, and easy to validate.",
    access: "public",
  },
  {
    id: "maintainers",
    name: "Maintenance and sortie generation",
    level: "community",
    parentIds: [],
    aliases: ["2A", "2W", "maintenance", "MX", "flightline", "sortie generation", "production"],
    mission: "Find repeat work, write cleaner turnover notes, and turn constraint data into action.",
    commonWork: ["turnover notes", "constraint tracking", "trend summaries", "process maps", "parts follow-up"],
    startingToolIds: ["t1", "t14", "t24", "t25"],
    notes: "Good source community for process-improvement plays and tool-access verification from the flightline perspective.",
    access: "public",
  },
  {
    id: "cyber-comm",
    name: "Cyber, comm, and knowledge operations",
    level: "community",
    parentIds: [],
    aliases: ["1D7", "17X", "cyber", "comm", "KMO", "knowledge management", "spectrum", "network"],
    mission: "Help teams choose the right tool path, document fixes, and automate repeatable support work.",
    commonWork: ["ticket triage", "knowledge articles", "root-cause notes", "automation ideas", "user guides"],
    startingToolIds: ["t1", "t22", "t23", "t25"],
    notes: "Useful reviewers for access paths, technical language, and whether tool cards are accurate enough.",
    access: "public",
  },
  {
    id: "security-forces",
    name: "Security Forces and emergency services",
    level: "community",
    parentIds: [],
    aliases: ["3P0", "security forces", "SF", "defenders", "law enforcement", "BDOC"],
    mission: "Structure reports, after-action notes, and decision support without putting sensitive details into AI tools.",
    commonWork: ["incident summaries", "shift notes", "AARs", "risk tradeoffs", "training plans"],
    startingToolIds: ["t1", "t15", "t23"],
    notes: "Needs extra safety language because much of the work can involve sensitive operational details.",
    access: "public",
  },
  {
    id: "logistics",
    name: "Logistics, supply, and transportation",
    level: "community",
    parentIds: [],
    aliases: ["2S", "2T", "LRS", "logistics", "supply", "transportation", "deployment"],
    mission: "Turn trackers, recurring reports, and hand-built coordination into cleaner workflows.",
    commonWork: ["tracker cleanup", "status briefs", "route planning notes", "inventory follow-up", "deployment taskers"],
    startingToolIds: ["t14", "t22", "t24", "t25", "t27"],
    notes: "Good source community for automation and dashboard use cases.",
    access: "public",
  },
  {
    id: "medical",
    name: "Medical and support squadrons",
    level: "community",
    parentIds: [],
    aliases: ["4N", "4A", "4E", "medical", "MDG", "clinic", "support squadron"],
    mission: "Improve staff workflows and communication while keeping patient information out of the Playbook workflow.",
    commonWork: ["clinic admin", "policy summaries", "workflow handoffs", "training plans", "staff responses"],
    startingToolIds: ["t1", "t15", "t23"],
    notes: "Needs clear privacy guardrails because patient data and protected information cannot be pasted into AI tools.",
    access: "public",
  },
  {
    id: "intel-ops",
    name: "Intel, operations, and planning staffs",
    level: "community",
    parentIds: [],
    aliases: ["1N", "11X", "12X", "13X", "intel", "ops", "planning", "AOC", "staff"],
    mission: "Build better unclassified frames, tradeoff logic, and decision support while protecting classified details.",
    commonWork: ["decision briefs", "red-team reviews", "premortems", "option papers", "planning assumptions"],
    startingToolIds: ["t1", "t15"],
    notes: "Good reviewers for decision quality, but the app must keep classified and sensitive operational content out.",
    access: "public",
  },
  {
    id: "acquisition-contracting",
    name: "Acquisition, contracting, and program offices",
    level: "community",
    parentIds: [],
    aliases: ["6C", "63A", "64P", "acquisition", "contracting", "program office", "PMO"],
    mission: "Pressure-test requirements, research claims, and convert messy inputs into decision-ready staff work.",
    commonWork: ["market research", "requirement drafts", "claim audits", "trade studies", "brief improvement"],
    startingToolIds: ["t1", "t15", "t25"],
    notes: "Useful for testing source discipline, citation quality, and acquisition-safe language.",
    access: "public",
  },
  {
    id: "command-teams",
    name: "Command teams and senior enlisted leaders",
    level: "community",
    parentIds: [],
    aliases: ["commander", "chief", "first sergeant", "SEL", "shirt", "director", "superintendent"],
    mission: "Use AI for better questions, cleaner decisions, and faster staff products, not for delegating accountability.",
    commonWork: ["decision review", "risk framing", "staff packages", "talking points", "policy rollout"],
    startingToolIds: ["t1", "t15"],
    notes: "Important source community for tone, safety, and whether the Playbook reads as practical rather than gimmicky.",
    access: "public",
  },
  {
    id: "training-education",
    name: "Training, education, and learning teams",
    level: "community",
    parentIds: [],
    aliases: ["AETC", "AU", "instructor", "training", "education", "learning", "schoolhouse"],
    mission: "Build learning paths, original lessons, and explainers that Airmen can actually use.",
    commonWork: ["lesson outlines", "job aids", "knowledge checks", "video scripts", "learning paths"],
    startingToolIds: ["t1", "t15"],
    notes: "Best source community for replacing embedded YouTube with Airman-made learning.",
    access: "public",
  },
  {
    id: "unit-programs",
    name: "Unit programs and additional duties",
    level: "community",
    parentIds: [],
    aliases: ["additional duty", "unit program", "unit programs", "program manager"],
    mission: "Run a unit program well alongside a primary job: track it, brief it, and keep the records straight.",
    commonWork: ["program tracking", "unit briefings", "status reports", "checklists", "records"],
    startingToolIds: ["t1", "t15"],
    notes: "Working group for roles that cut across career fields. Needs SME review.",
    access: "public",
  },
  {
    id: "epb-narratives",
    name: "EPB narratives",
    level: "task-area",
    parentIds: ["front-office-admin", "command-teams"],
    aliases: ["EPB", "enlisted performance brief", "performance statements", "bullets", "evaluations"],
    mission: "Draft and tighten performance statements for an enlisted performance brief.",
    commonWork: ["performance statements", "bullet writing", "narrative drafts", "evaluation rewrites"],
    startingToolIds: ["t1", "t15"],
    notes: "A task area that supervisors, front offices, and command teams all reach for.",
    access: "public",
  },
  {
    id: "udm",
    name: "UDM",
    level: "role",
    parentIds: ["unit-programs", "logistics"],
    aliases: ["UDM", "unit deployment manager", "deployment manager"],
    mission: "Unit deployment manager work: deployment taskers, tracking, and coordination.",
    commonWork: ["deployment taskers", "tracker cleanup", "status briefs", "coordination emails"],
    startingToolIds: ["t1", "t22"],
    notes: "Working label for the role. Needs SME review.",
    access: "public",
  },
  {
    id: "utm",
    name: "UTM",
    level: "role",
    parentIds: ["unit-programs", "training-education"],
    aliases: ["UTM", "unit training manager", "training manager"],
    mission: "Unit training manager work: training plans, tracking, and clear communication to the unit.",
    commonWork: ["training plans", "training tracking", "unit reminders", "briefings"],
    startingToolIds: ["t1", "t15"],
    notes: "Working label for the role. Needs SME review.",
    access: "public",
  },
  {
    id: "afsc-2a",
    name: "2A",
    level: "career-field",
    parentIds: ["maintainers"],
    aliases: ["2A", "2A series", "2AX"],
    mission: "The 2A career-field prefix, one step narrower than maintenance and sortie generation.",
    commonWork: ["turnover notes", "work documentation", "trend summaries"],
    startingToolIds: ["t1", "t24"],
    notes: "Working label.",
    access: "public",
  },
  {
    id: "afsc-2a6x1",
    name: "2A6X1",
    level: "afsc",
    parentIds: ["afsc-2a"],
    aliases: ["2A6X1", "2A6"],
    mission: "The 2A6X1 AFSC, the narrowest step on this maintenance path.",
    commonWork: ["turnover notes", "work documentation", "process maps"],
    startingToolIds: ["t1", "t24"],
    notes: "Working label.",
    access: "public",
  },
];
