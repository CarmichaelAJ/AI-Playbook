// ─── Chief of Staff letter to the force ─────────────────────────────────────
// The home hero links to the signed PDF. The signature image is cropped from the supplied
// scan (handbook/assets/CSAF_Letter.pdf) and shown as signed. Nothing here rewords the letter.
//
// The product owner confirmed approval to show the signature on 20 Oct 2026. Record any change here.

export interface LeadershipLetter {
  title: string;
  dateIso: string;
  dateLabel: string;
  signer: string;
  signature: { src: string; width: number; height: number };
  pdf: { href: string; sha256: string };
  signatureUseApproved: boolean;
}

export const LEADERSHIP_LETTER: LeadershipLetter = {
  title: "First letter to the force",
  dateIso: "2025-11-03",
  dateLabel: "3 November 2025",
  signer: "General Kenneth S. Wilsbach",
  signature: { src: "/assets/memo/leadership-letter-signature.png", width: 460, height: 98 },
  pdf: {
    href: "/assets/memo/leadership-letter.pdf",
    sha256: "d5f7a92635335bd96421aa991d27415e9856d939351decf4ff40619d98432e8d",
  },
  signatureUseApproved: true,
};

export function leadershipLetterProblems(letter: LeadershipLetter | null): string[] {
  if (!letter) return [];
  const problems: string[] = [];
  const need = (ok: unknown, message: string) => { if (!ok) problems.push(message); };
  need(letter.title.trim(), "letter title is empty");
  need(/^\d{4}-\d{2}-\d{2}$/.test(letter.dateIso) && letter.dateLabel.trim(), "letter date is incomplete");
  need(letter.signer.trim(), "signer name is missing");
  need(letter.signature.src, "signature image is missing");
  need(letter.pdf.href.trim(), "signed PDF link is missing");
  need(/^[0-9a-f]{64}$/.test(letter.pdf.sha256), "PDF SHA-256 is missing");
  need(letter.signatureUseApproved, "signature use has not been approved");
  return problems;
}
