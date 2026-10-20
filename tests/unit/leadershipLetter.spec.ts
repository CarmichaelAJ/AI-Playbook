import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { LEADERSHIP_LETTER, leadershipLetterProblems } from "../../content/leadershipLetter";

test("the leadership letter record is complete and its PDF matches the recorded hash", async () => {
  expect(leadershipLetterProblems(LEADERSHIP_LETTER)).toEqual([]);
  const bytes = await readFile(path.join(process.cwd(), "public", LEADERSHIP_LETTER.pdf.href));
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(LEADERSHIP_LETTER.pdf.sha256);
});

test("the leadership letter validation requires approval, the signer, and provenance", () => {
  expect(leadershipLetterProblems({ ...LEADERSHIP_LETTER, signatureUseApproved: false })).toContain("signature use has not been approved");
  expect(leadershipLetterProblems({ ...LEADERSHIP_LETTER, signer: "" })).toContain("signer name is missing");
  expect(leadershipLetterProblems({ ...LEADERSHIP_LETTER, pdf: { ...LEADERSHIP_LETTER.pdf, sha256: "" } })).toContain("PDF SHA-256 is missing");
});
