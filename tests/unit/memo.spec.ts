import { expect, test } from "@playwright/test";
import { APPROVED_MEMO, memoProblems, type ApprovedMemo } from "../../content/memo";

// Structure fixture only. Not approved wording and never rendered on the site.
const FIXTURE: ApprovedMemo = {
  heading: "MEMORANDUM FOR RECORD",
  isSeparatePageMfr: true,
  letterhead: { lines: ["TEST LETTERHEAD"] },
  date: { iso: "2000-01-01", label: "1 January 2000" },
  subject: "Test",
  body: [{ label: "1.", level: 0, text: "Test." }],
  signature: {
    viewBox: "0 0 10 10",
    outline: ["M0 0h10v10z"],
    alt: "Test",
    source: { file: "x", sha256: "0".repeat(64), description: "test" },
  },
  signatureBlock: ["TEST"],
  endorsement: "Test.",
  provenance: { title: "Test", sha256: "1".repeat(64), approvedBy: "Test" },
};

test("no unapproved memorandum is published", () => {
  expect(memoProblems(APPROVED_MEMO)).toEqual([]);
});

test("memo validation enforces the MFR rules and required provenance", () => {
  expect(memoProblems(FIXTURE)).toEqual([]);
  expect(memoProblems({ ...FIXTURE, from: "Someone" })).toContain("a separate-page MFR must not have a FROM line");
  expect(memoProblems({ ...FIXTURE, isSeparatePageMfr: false })).toContain("non-MFR documents must carry the addressees printed on the source");
  expect(memoProblems({ ...FIXTURE, endorsement: "" })).toContain("approved endorsement attribution is missing");
  expect(memoProblems({ ...FIXTURE, signature: { ...FIXTURE.signature, outline: [] } })).toContain("signature SVG artwork is missing");
  expect(memoProblems({ ...FIXTURE, provenance: { ...FIXTURE.provenance, sha256: "" } })).toContain("memo source SHA-256 is missing");
});
