"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, GraduationCap, Layers, Wrench, Building2 } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/plays", label: "Plays", icon: Layers },
  { href: "/dashboard", label: "HQ", icon: Building2 },
  { href: "/tools", label: "Tools", icon: Wrench },
  // Tab name locked as "AI & Automation" (Q4, 26 Jul). The bar carries five tabs,
  // so the label is abbreviated here and spelled out in the page H1.
  // FLAGGED: the abbreviation is a product-owner call — swap if another short form reads better.
  { href: "/ai-automation", label: "AI & Auto", icon: GraduationCap },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 nav-glass bottom-nav-safe ${scrolled ? "scrolled" : ""}`}>
      <div className="flex max-w-lg md:max-w-3xl lg:max-w-6xl mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`
                relative flex-1 flex flex-col items-center justify-center pt-2.5 pb-2 gap-1 text-xs font-semibold
                transition-colors duration-150
                ${active ? "text-white" : "text-on-dark-dim hover:text-white active:text-white"}
              `}
            >
              {/* Top accent — the clear "you are here" marker */}
              <span className={`
                absolute top-0 h-0.5 rounded-b-full bg-white transition-all duration-250
                ${active ? "w-8 opacity-100" : "w-0 opacity-0"}
              `} />
              <span className={`
                flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200
                ${active
                  ? "bg-white text-primary shadow-resting"
                  : "bg-transparent"}
              `}>
                <Icon
                  size={21}
                  strokeWidth={active ? 2.6 : 2.1}
                />
              </span>
              <span className={`leading-none tracking-tight ${active ? "font-bold text-white" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
