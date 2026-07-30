# Accessibility Verification Checklist

This checklist supports engineering verification. It is not a Section 508
certification or an authority-to-operate determination.

## Implemented Baseline

- Semantic page landmarks and a keyboard-visible skip link.
- Visible focus indicators for links, buttons, fields, and controls.
- Responsive navigation for keyboard, mobile, and desktop use.
- Native labels and descriptions on forms.
- Dialog close controls and keyboard dismissal.
- Captions track support for first-party learning videos.
- Reduced-motion handling and Windows forced-colors support.
- Text and controls designed to reflow without horizontal page scrolling.

## Required Test Pass

1. Navigate every route and dialog using only Tab, Shift+Tab, Enter, Space, and
   Escape.
2. Verify focus order, focus return after dialogs, and no keyboard traps.
3. Run automated checks with axe or an equivalent approved scanner.
4. Test at 200 and 400 percent zoom at desktop and mobile widths.
5. Test Windows High Contrast and browser forced-colors modes.
6. Test with the supported screen reader and managed browser combination.
7. Confirm field errors are announced and are not communicated by color alone.
8. Confirm every published video has accurate captions and a transcript.
9. Confirm meaningful images have useful alternatives and decorative images are
   ignored by assistive technology.
10. Record, assign, remediate, and disposition each finding before release.

## Release Evidence

- Route and component inventory.
- Automated scan exports.
- Keyboard and screen-reader test records.
- Caption and transcript review records.
- Exceptions, mitigations, owners, and target dates.
- Signed Section 508 or organizational accessibility disposition.
