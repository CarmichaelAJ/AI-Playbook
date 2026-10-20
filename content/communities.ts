export interface SourceCommunity {
  id: string;
  name: string;
  kind: "afsc" | "role" | "function";
  aliases: string[];
  mission: string;
  commonWork: string[];
  startingPlayIds: string[];
  startingToolIds: string[];
  notes: string;
}

// Starting communities for discovery and feedback. These are not authoritative
// AFSC mappings. They are source communities to recruit reviewers, collect use
// cases, and test whether the Playbook speaks their language.
export const SOURCE_COMMUNITIES: SourceCommunity[] = [
  {
    id: "front-office-admin",
    name: "Front offices, CSS, and admin teams",
    kind: "function",
    aliases: ["3F5", "3F0", "CSS", "admin", "exec", "front office", "commander support staff"],
    mission: "Turn daily staff work into cleaner drafts, faster routing, and better records.",
    commonWork: ["MFRs", "email cleanup", "award packages", "task tracking", "meeting notes"],
    startingPlayIds: ["mfr-one-pass", "email-that-gets-answered", "award-1206", "epb-forge"],
    startingToolIds: ["t1", "t15", "t22", "t23"],
    notes: "Strong first beta group because the work is high-volume, text-heavy, and easy to validate.",
  },
  {
    id: "maintainers",
    name: "Maintenance and sortie generation",
    kind: "afsc",
    aliases: ["2A", "2W", "maintenance", "MX", "flightline", "sortie generation", "production"],
    mission: "Find repeat work, write cleaner turnover notes, and turn constraint data into action.",
    commonWork: ["turnover notes", "constraint tracking", "trend summaries", "process maps", "parts follow-up"],
    startingPlayIds: ["process-map-constraint", "brief-improvement", "deep-research-brief"],
    startingToolIds: ["t1", "t14", "t24", "t25"],
    notes: "Good source community for process-improvement plays and tool-access verification from the flightline perspective.",
  },
  {
    id: "cyber-comm",
    name: "Cyber, comm, and knowledge operations",
    kind: "afsc",
    aliases: ["1D7", "17X", "cyber", "comm", "KMO", "knowledge management", "spectrum", "network"],
    mission: "Help teams choose the right tool path, document fixes, and automate repeatable support work.",
    commonWork: ["ticket triage", "knowledge articles", "root-cause notes", "automation ideas", "user guides"],
    startingPlayIds: ["claim-audit", "process-map-constraint", "email-that-gets-answered"],
    startingToolIds: ["t1", "t22", "t23", "t25"],
    notes: "Useful reviewers for access paths, technical language, and whether tool cards are accurate enough.",
  },
  {
    id: "security-forces",
    name: "Security Forces and emergency services",
    kind: "afsc",
    aliases: ["3P0", "security forces", "SF", "defenders", "law enforcement", "BDOC"],
    mission: "Structure reports, after-action notes, and decision support without putting sensitive details into AI tools.",
    commonWork: ["incident summaries", "shift notes", "AARs", "risk tradeoffs", "training plans"],
    startingPlayIds: ["mfr-one-pass", "paperwork-response", "tradeoff-matrix", "pre-mortem"],
    startingToolIds: ["t1", "t15", "t23"],
    notes: "Needs extra safety language because much of the work can involve sensitive operational details.",
  },
  {
    id: "logistics",
    name: "Logistics, supply, and transportation",
    kind: "afsc",
    aliases: ["2S", "2T", "LRS", "logistics", "supply", "transportation", "deployment"],
    mission: "Turn trackers, recurring reports, and hand-built coordination into cleaner workflows.",
    commonWork: ["tracker cleanup", "status briefs", "route planning notes", "inventory follow-up", "deployment taskers"],
    startingPlayIds: ["process-map-constraint", "tradeoff-matrix", "brief-improvement"],
    startingToolIds: ["t14", "t22", "t24", "t25", "t27"],
    notes: "Good source community for automation and dashboard use cases.",
  },
  {
    id: "medical",
    name: "Medical and support squadrons",
    kind: "afsc",
    aliases: ["4N", "4A", "4E", "medical", "MDG", "clinic", "support squadron"],
    mission: "Improve staff workflows and communication while keeping patient information out of the Playbook workflow.",
    commonWork: ["clinic admin", "policy summaries", "workflow handoffs", "training plans", "staff responses"],
    startingPlayIds: ["email-that-gets-answered", "claim-audit", "process-map-constraint"],
    startingToolIds: ["t1", "t15", "t23"],
    notes: "Needs clear privacy guardrails because patient data and protected information cannot be pasted into AI tools.",
  },
  {
    id: "intel-ops",
    name: "Intel, operations, and planning staffs",
    kind: "afsc",
    aliases: ["1N", "11X", "12X", "13X", "intel", "ops", "planning", "AOC", "staff"],
    mission: "Build better unclassified frames, tradeoff logic, and decision support while protecting classified details.",
    commonWork: ["decision briefs", "red-team reviews", "premortems", "option papers", "planning assumptions"],
    startingPlayIds: ["deep-research-brief", "claim-audit", "tradeoff-matrix", "pre-mortem", "red-team-review"],
    startingToolIds: ["t1", "t15"],
    notes: "Good reviewers for decision quality, but the app must keep classified and sensitive operational content out.",
  },
  {
    id: "acquisition-contracting",
    name: "Acquisition, contracting, and program offices",
    kind: "function",
    aliases: ["6C", "63A", "64P", "acquisition", "contracting", "program office", "PMO"],
    mission: "Pressure-test requirements, research claims, and convert messy inputs into decision-ready staff work.",
    commonWork: ["market research", "requirement drafts", "claim audits", "trade studies", "brief improvement"],
    startingPlayIds: ["deep-research-brief", "claim-audit", "tradeoff-matrix", "brief-improvement"],
    startingToolIds: ["t1", "t15", "t25"],
    notes: "Useful for testing source discipline, citation quality, and acquisition-safe language.",
  },
  {
    id: "command-teams",
    name: "Command teams and senior enlisted leaders",
    kind: "role",
    aliases: ["commander", "chief", "first sergeant", "SEL", "shirt", "director", "superintendent"],
    mission: "Use AI for better questions, cleaner decisions, and faster staff products, not for delegating accountability.",
    commonWork: ["decision review", "risk framing", "staff packages", "talking points", "policy rollout"],
    startingPlayIds: ["tradeoff-matrix", "pre-mortem", "red-team-review", "brief-improvement"],
    startingToolIds: ["t1", "t15"],
    notes: "Important source community for tone, safety, and whether the Playbook reads as practical rather than gimmicky.",
  },
  {
    id: "training-education",
    name: "Training, education, and learning teams",
    kind: "function",
    aliases: ["AETC", "AU", "instructor", "training", "education", "learning", "schoolhouse"],
    mission: "Build learning paths, original lessons, and explainers that Airmen can actually use.",
    commonWork: ["lesson outlines", "job aids", "knowledge checks", "video scripts", "learning paths"],
    startingPlayIds: ["deep-research-brief", "brief-improvement", "process-map-constraint"],
    startingToolIds: ["t1", "t15"],
    notes: "Best source community for replacing embedded YouTube with Airman-made learning.",
  },
];
