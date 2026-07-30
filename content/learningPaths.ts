export interface LearningPath {
  id: string;
  label: string;
  audience: string;
  focus: string;
  steps: string[];
  href: string;
  tags: string[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "front-office-admin",
    label: "Admin and front office",
    audience: "3F5, CSS, exec teams",
    focus: "Draft cleaner staff work, summarize meetings, and keep taskers moving.",
    steps: ["Use a Level 1 play", "Check an approved tool", "Turn repeat work into a template"],
    href: "/search?q=3F5",
    tags: ["MFRs", "Awards", "Email", "Taskers"],
  },
  {
    id: "maintenance",
    label: "Maintenance and production",
    audience: "2A, 2W, MX teams",
    focus: "Turn notes, constraints, and trend data into action without exposing sensitive details.",
    steps: ["Map the constraint", "Summarize repeat blockers", "Build a shift-ready handoff"],
    href: "/search?q=2A",
    tags: ["Turnover", "Constraints", "Trends", "Briefs"],
  },
  {
    id: "cyber-comm",
    label: "Cyber and comm",
    audience: "1D7, KMO, support teams",
    focus: "Document fixes, write user guides, and turn support patterns into reusable knowledge.",
    steps: ["Triage the request", "Write the fix once", "Store the reusable answer"],
    href: "/search?q=1D7",
    tags: ["Tickets", "Guides", "Automation", "Knowledge"],
  },
  {
    id: "leaders",
    label: "Command teams",
    audience: "Commanders, chiefs, shirts",
    focus: "Ask better questions, frame tradeoffs, and review staff products faster.",
    steps: ["Frame the decision", "Red-team the package", "Check the output before use"],
    href: "/search?q=commander",
    tags: ["Decisions", "Risk", "Briefs", "Review"],
  },
];
