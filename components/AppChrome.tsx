"use client";

import { useEffect, useState } from "react";
import GuideModal from "./GuideModal";
import OnboardingModal from "./OnboardingModal";
import { FEATURES } from "@/lib/features";
import { useOnboarding } from "@/lib/onboarding";
import PlatformAccount from "./PlatformAccount";
import OfflineSupport from "./OfflineSupport";

// Global app chrome: hosts the Guide modal and keeps its open pathway wired. The
// floating "?" trigger was removed; the modal now opens only via the
// `ap:open-guide` custom event (e.g. Home's "What is this?" link), so the pathway
// stays intact and can be re-exposed later without re-plumbing.
export default function AppChrome() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const { profile } = useOnboarding();

  useEffect(() => {
    const openModal = () => setGuideOpen(true);
    window.addEventListener("ap:open-guide", openModal);
    return () => window.removeEventListener("ap:open-guide", openModal);
  }, []);

  useEffect(() => {
    if (!FEATURES.onboarding) return;
    const openModal = () => setOnboardingOpen(true);
    window.addEventListener("ap:open-onboarding", openModal);
    return () => window.removeEventListener("ap:open-onboarding", openModal);
  }, []);

  useEffect(() => {
    if (!FEATURES.onboarding) return;
    setOnboardingOpen(!profile.seen);
  }, [profile.seen]);

  return (
    <>
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <OfflineSupport />
      {FEATURES.onboarding && <OnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />}
      {FEATURES.auth && <PlatformAccount />}
    </>
  );
}
