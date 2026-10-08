# Leadership memorandum intake

The home page shows an approved memorandum below the hero. None has been supplied yet, so
[content/memo.ts](../content/memo.ts) exports `APPROVED_MEMO = null` and the section does not render.
Do not paraphrase, reconstruct, or fill gaps.

## What the product owner must supply

1. **The signed source document** (PDF or scan), with its official URL if public. Record its SHA-256.
2. **The exact text**: heading, date, subject, any reference line, every paragraph with its
   number or letter, the signature block lines, and any endorsement attribution.
3. **Approved organizational letterhead**: the exact lines, and the approved seal asset if one is
   to be shown.
4. **The authorized signature artwork** as a high-resolution scan or vector, plus who approved
   its use and when.
5. **The document type.** If the source is not a separate-page MFR (for example it has a
   MEMORANDUM FOR line and a FROM line, or follows a command template), say so. The component
   then uses the source's own heading and addressees. It is never relabeled as an MFR.
6. **Any command or local format guidance** that applies.

## Installing it

1. Convert the signature to SVG paths faithfully. Trace the artwork; do not redraw or smooth it.
   Put the filled outline in `signature.outline`. For the draw-on, add the pen's centerline as
   `signature.pen` (optional; without it the signature is revealed with a left-to-right wipe).
2. Keep the source scan in the repository (for example `public/assets/memo/`) and record its path and
   SHA-256 in `signature.source`.
3. Fill `APPROVED_MEMO` with the exact wording. Paragraph labels are stored as text.
4. Run `npm run test:unit` (validation lists anything missing) and `npm run test:ui`.
5. Look at it at 1440, 768, and 390 px, once with reduced motion on.

## Layout reference

AFH 33-337, *The Tongue and Quill*, Chapter 14, "The Memorandum for Record: Separate Page"
(27 May 2015 edition, pp. 190-191): letterhead; date flush right; "MEMORANDUM FOR RECORD";
"SUBJECT:"; numbered paragraphs with subparagraphs indented; signature and a modified signature
block (organization abbreviation and office symbol rather than duty title) about 4.5 in from the
left edge; no FROM line; Times New Roman 12 pt; 1.75 in top margin with the date at that height and
1 in left, right, and bottom margins.

That edition is from 2015. Confirm it is current and check command and local guidance before calling the result compliant.
OpenAFI answers are research leads only; verify against official publications.
