"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  Home,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { FEATURES } from "@/lib/features";
import { usePlatformIdentity } from "@/lib/platformIdentity";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/plays", label: "Plays", icon: Layers },
  { href: "/tools", label: "Tools", icon: Wrench },
  ...(FEATURES.communities ? [{ href: "/communities", label: "Comms", icon: Users }] : []),
  ...(FEATURES.auth
    ? [{ href: "/profile", label: "Profile", icon: UserRound }]
    : [{ href: "/ai-automation", label: "Learn", icon: GraduationCap }]),
];

const desktopTabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/plays", label: "Plays", icon: Layers },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/ai-automation", label: "AI & Auto", icon: GraduationCap },
  ...(FEATURES.communities ? [{ href: "/communities", label: "Communities", icon: Users }] : []),
  ...(FEATURES.auth ? [{ href: "/profile", label: "Profile", icon: UserRound }] : []),
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();
  const identity = usePlatformIdentity();
  const [scrolled, setScrolled] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const profileLabel = identity ? "Profile" : "Sign in";
  const mobileTabs = tabs.map((tab) => tab.href === "/profile" ? { ...tab, label: profileLabel } : tab);
  const sidebarTabs = desktopTabs.map((tab) => tab.href === "/profile" ? { ...tab, label: profileLabel } : tab);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem("ap.desktopNav") !== "open");
    } catch {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem("ap.desktopNav", next ? "closed" : "open");
    } catch {
      /* local preference unavailable */
    }
  };

  return (
    <>
      <nav className={`fixed bottom-0 left-0 right-0 z-50 nav-glass bottom-nav-safe lg:hidden ${scrolled ? "scrolled" : ""}`}>
        <div className="flex max-w-lg md:max-w-3xl mx-auto">
          {mobileTabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex-1 flex flex-col items-center justify-center pt-2.5 pb-2 gap-1 text-[10px] font-semibold transition-colors duration-150 ${
                  active ? "text-white" : "text-on-dark-dim hover:text-white active:text-white"
                }`}
              >
                <span className={`absolute top-0 h-0.5 rounded-b-full bg-white transition-all duration-250 ${active ? "w-7 opacity-100" : "w-0 opacity-0"}`} />
                <span className={`flex items-center justify-center w-9 h-7 rounded-full transition-all duration-200 ${active ? "bg-white text-primary shadow-resting" : "bg-transparent"}`}>
                  <Icon size={20} strokeWidth={active ? 2.6 : 2.1} />
                </span>
                <span className={`leading-none tracking-tight ${active ? "font-bold text-white" : ""}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <aside
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 z-50 flex-col nav-glass border-r border-primary/50 transition-[width] duration-250 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className={`flex items-center gap-3 px-4 py-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-widest uppercase text-on-dark-dim">Airman&apos;s</p>
              <p className="text-sm font-extrabold text-white leading-none">Playbook</p>
            </div>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            className="w-10 h-10 rounded-inner flex items-center justify-center text-on-dark-dim hover:text-white hover:bg-white/10"
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1" aria-label="Desktop navigation">
          {sidebarTabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 min-h-11 rounded-inner px-3 text-sm font-bold transition-colors ${
                  active ? "bg-white text-primary shadow-resting" : "text-on-dark-dim hover:text-white hover:bg-white/10"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={20} strokeWidth={active ? 2.6 : 2.1} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-4 pb-4">
            <p className="text-[10px] leading-snug text-on-dark-dim">
              {FEATURES.auth
                ? "Search lives on Home. Platform identity and submissions live in Profile."
                : "Search lives on Home. Preferences and saved items stay on this device."}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
