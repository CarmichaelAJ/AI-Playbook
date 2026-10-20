# Design Agent Operating Procedure

## Phase 1 — Audit

Before modifying code, inspect:

- Existing routes
- Components
- CSS/Tailwind/design tokens
- Data structures
- Tool data
- Existing navigation
- Existing responsive behavior
- Existing functionality

Do not rebuild working functionality simply to change its appearance.

## Phase 2 — Visual Inventory

Document:

- Header
- Hero
- Search
- Intent filters
- Categories
- Cards
- Workflow
- OPSEC
- Footer

Identify which elements can become reusable components.

## Phase 3 — Reference Analysis

Use the White House primarily to study:

- Hierarchy
- Navigation
- Editorial organization
- Search
- Content prioritization

Use Anduril primarily to study:

- Typography
- Technical confidence
- Modern defense presentation
- Spacing
- Visual restraint

Do not copy branding.

## Phase 4 — Implement

Build from the design system.

Prioritize reusable components over one-off markup.

Preserve data and behavior.

## Phase 5 — Validate

Test:

- 1440px desktop
- 1024px tablet
- 768px tablet/mobile boundary
- 390px mobile

Check:

- Overflow
- Long tool names
- Missing descriptions
- Empty search results
- Active filters
- Keyboard navigation
- Focus visibility
- Touch targets
- Reduced motion

## Phase 6 — Polish

Only after the page works:

- Tune typography
- Tune spacing
- Improve visual rhythm
- Refine states
- Add restrained motion
- Improve mobile composition

## Final Question

Before declaring the redesign complete, ask:

"Can a user understand what this page is, find the right tool, understand its status, and open it without thinking about the interface?"

If not, continue improving the hierarchy.
