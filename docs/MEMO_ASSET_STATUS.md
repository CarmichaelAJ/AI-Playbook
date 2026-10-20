# Leadership letter and reference assets

The home hero links to the Chief of Staff's first letter to the force (3 Nov 2025). The link sits beneath the
title, shows the signature (cropped from the supplied scan), and opens the signed PDF in the same tab. The product
owner confirmed this letter is the approved leadership memorandum and that the signature may be shown. There is no
separate AI memorandum.

| Item | Location |
|---|---|
| Source PDF | `handbook/assets/CSAF_Letter.pdf` |
| Web copies (PDF, signature crop) | `public/assets/memo/` |
| Record, SHA-256, validation | [content/leadershipLetter.ts](../content/leadershipLetter.ts) |
| Component | [components/LeadershipLetter.tsx](../components/LeadershipLetter.tsx) |

To replace the letter, put the new PDF and signature crop in `public/assets/memo/`, update the record and its hash in
`content/leadershipLetter.ts`, and run `npm run test:unit` and `npm run test:ui`.

## Not used by the site

`handbook/assets/working_reference_assets/` holds working references that are not served by the site. They are
left in place, untracked, for the owner to keep or discard:

| File | Why it is not used |
|---|---|
| `DOW-Seal-Blue_sm.png` | The hero link does not show the seal. The 200 x 200 px copy is low resolution and its separate use is not approved. |
| `signature_trace_review.svg` | The hero link uses a crop of the signature from the scan instead. Provenance of the trace is unconfirmed. |
| `usaf_memo_v1.tex.j2` | A Jinja/LaTeX template for a different application. Not part of this Next.js site. |
| `README.txt` | Notes on the files above. |
