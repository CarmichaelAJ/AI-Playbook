"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/branding";
import { FEATURES } from "@/lib/features";
import { MENU_NAVIGATION, SEARCH_LINK } from "@/lib/navigation";
import { SUGGEST_PLAY_FORM_URL } from "@/lib/links";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <p className="site-footer-statement">The direction is set. The work is yours.</p>
        <div className="site-footer-main">
          <div>
            <Link href="/" className="site-footer-brand">{PRODUCT_NAME}</Link>
            <p>Practical tools. Clear guidance.<br />Your next move, made easier.</p>
          </div>
          <nav aria-label="Footer navigation">
            {MENU_NAVIGATION.filter(({ href }) => href !== "/credits" && href !== "/settings").map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}
            {SEARCH_LINK && <Link href={SEARCH_LINK.href}>{SEARCH_LINK.label}</Link>}
          </nav>
          <nav aria-label="Support">
            <button type="button" onClick={() => window.dispatchEvent(new Event("ap:open-guide"))}>User guide</button>
            <Link href="/">Saved tools &amp; plays</Link>
            <Link href="/credits">Photography &amp; sources</Link>
            {FEATURES.settings && <Link href="/settings">Device preferences</Link>}
            <a href={SUGGEST_PLAY_FORM_URL} target="_blank" rel="noopener noreferrer">
              Suggest an improvement <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </nav>
        </div>
        <div className="site-footer-note">
          <span>Verify access locally. Follow your unit&apos;s guidance.</span>
        </div>
      </div>
    </footer>
  );
}
