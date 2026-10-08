import { FEATURES } from "@/lib/features";

export type NavItem = { href: string; label: string; detail: string };

// Search and Sign in sit directly in the header, so they are not repeated here.
// Plays are not a destination: they are reached inside Communities.
export const MENU_NAVIGATION: NavItem[] = [
  ...(FEATURES.communities
    ? [{ href: "/communities", label: "Communities", detail: "Browse by career field, AFSC, or role, with plays inside" }]
    : []),
  { href: "/tools", label: "Tools", detail: "Approved AI, automation, and data tools" },
  { href: "/ai-automation", label: "Learn", detail: "Choose an approach and go as deep as you have time for" },
  ...(FEATURES.auth ? [{ href: "/profile", label: "Profile", detail: "Your account, submissions, and notifications" }] : []),
  ...(FEATURES.settings ? [{ href: "/settings", label: "Device preferences", detail: "Settings stored on this device" }] : []),
  { href: "/credits", label: "Photography & sources", detail: "Credits and provenance" },
];

export const SEARCH_LINK = FEATURES.staticSearch ? { href: "/search", label: "Search" } : null;
