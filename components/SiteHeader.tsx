"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { FEATURES } from "@/lib/features";
import { MENU_NAVIGATION, SEARCH_LINK } from "@/lib/navigation";
import { openPlatformAccount, usePlatformIdentity } from "@/lib/platformIdentity";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function SiteHeader() {
  const pathname = usePathname();
  const identity = usePlatformIdentity();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback((returnFocus: boolean) => {
    setMenuOpen(false);
    if (returnFocus) menuButton.current?.focus();
  }, []);

  // A modal drawer must (1) move focus in, (2) keep Tab inside it, (3) close on Escape and hand
  // focus back to the button that opened it, and (4) stop the page behind it from scrolling.
  useEffect(() => {
    if (!menuOpen) return;
    const panel = drawer.current;
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    focusables()[0]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="site-header">
      <div className="site-container site-masthead">
        <Link href="/" className="site-brand">
          {/* Native proportions are kept: width is set in CSS and height follows from the 338.667:264.018 viewBox. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/af-symbol-white.svg"
            width={56}
            height={43.66}
            alt="U.S. Air Force symbol"
            className="site-brand-symbol"
          />
          <span>Airman&apos;s <strong>AI Playbook</strong><span className="sr-only"> home</span></span>
        </Link>

        <div className="site-actions">
          {SEARCH_LINK && (
            <Link
              href={SEARCH_LINK.href}
              className="site-action"
              aria-label="Search"
              aria-current={pathname === SEARCH_LINK.href ? "page" : undefined}
            >
              <Search size={18} aria-hidden="true" />
              <span className="site-action-text" aria-hidden="true">Search</span>
            </Link>
          )}
          {/* One sign-in flow: the platform build opens the existing account dialog. The static build has no
              account system, so it links to a page that says so instead of faking one. */}
          {FEATURES.auth ? (
            <button type="button" className="site-action site-action-signin" onClick={openPlatformAccount}>
              <span className="site-action-text">{identity ? "Account" : "Sign in"}</span>
            </button>
          ) : (
            <Link href="/sign-in" className="site-action site-action-signin">
              <span className="site-action-text">Sign in</span>
            </Link>
          )}
          <button
            ref={menuButton}
            type="button"
            className="site-menu-toggle"
            aria-label="Menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={20} aria-hidden="true" />
            <span className="site-action-text" aria-hidden="true">Menu</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="site-drawer-layer">
          <div className="site-drawer-backdrop" onClick={() => closeMenu(true)} aria-hidden="true" />
          <div ref={drawer} id="site-menu" className="site-drawer" role="dialog" aria-modal="true" aria-label="Site menu">
            <div className="site-drawer-head">
              <span>Menu</span>
              <button type="button" className="site-drawer-close" aria-label="Close menu" onClick={() => closeMenu(true)}>
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Site">
              {MENU_NAVIGATION.map(({ href, label, detail }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => closeMenu(false)}>
                    <strong>{label}</strong>
                    <span>{detail}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
