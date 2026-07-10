// ─── Outbound links the app routes to ─────────────────────────────────────────
// The Playbook is a conduit / cohesive layer: it connects Airmen to the approved
// tools and to the SME contribution form. It never runs a model or holds data.
// GenAI.mil is the live primary destination for running a play; Ask Sage and
// Envision are the other named approved AI destinations (see the Tools tab).

export const GENAIMIL_URL = "https://genai.mil";

// ─── SME contribution door ────────────────────────────────────────────────────
// Google Form where Airmen propose new plays. Created separately from this build.
// While empty, the CTA renders as a disabled "coming soon" rather than a dead link.
export const SUGGEST_PLAY_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScr7E4hN_d1Sl31BnK1zFW5F3kwiT-rSfvODVpnbGEf5DZoKw/viewform";
