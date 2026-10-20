---
name: airmans-ai-playbook-design
description: Design and redesign the Airman's AI Playbook UI using institutional editorial design inspired by White House information hierarchy and modern defense technology inspired by Anduril. Use this skill when designing, auditing, or implementing the Playbook interface, especially the Tools page and reusable UI system.
---

# Airman's AI Playbook Design Skill

## Mission

Act as the lead UI/UX design agent for the Airman's AI Playbook.

Target:
https://airmans-ai-playbook.vercel.app/tools

Primary reference:
https://www.whitehouse.gov/

Secondary reference:
https://www.anduril.com/

The existing application is the source of truth for content and functionality. Improve the UI without unnecessarily removing or changing existing capabilities.

## Core Design Direction

Create an interface that feels:

- Institutional
- Authoritative
- Mission-focused
- Modern
- Technically sophisticated
- Clean
- Fast
- Accessible
- Defense/public-sector appropriate

Design relationship:

White House → information hierarchy, institutional navigation, editorial structure

Anduril → defense technology, confident typography, modern composition, technical credibility

Airman's AI Playbook → practical mission utility

Do not copy either reference site. Borrow principles, not branding.

## Avoid

Do not use generic AI/SaaS visual clichés:

- Purple AI gradients
- Neon green
- Glowing brains
- Robot imagery
- Excessive glassmorphism
- Giant rounded cards
- Excessive shadows
- Cyberpunk/HUD interfaces
- Fake military classification markings
- Camouflage as decoration
- Excessive animations
- Generic startup marketing language

The result should not look like a White House clone, Anduril clone, or generic AI template.

## Existing Tools Page

Preserve and improve:

- Page title and introduction
- "I want to..." task filters
- Tool counts / review information
- Tool categories
- Tool cards
- Coming Soon tools
- M365 workflow
- OPSEC guidance
- Global navigation

Improve:

- Information hierarchy
- Scanability
- Search
- Filtering
- Visual grouping
- Navigation
- Responsive behavior
- Accessibility
- Perceived authority

## Page Hierarchy

Use this as the conceptual hierarchy:

Global Header
→ Page Hero
→ Search
→ "I Want To..." Filters
→ Tool Directory
→ Category Sections
→ Workflow / Ecosystem
→ OPSEC Guidance
→ Footer

Do not treat this as a rigid pixel-perfect layout. Use judgment based on the existing application.

## Header

Create a compact, strong institutional header.

Desktop concept:

AIRMAN'S AI PLAYBOOK | TOOLS | PLAYS | COMMS | LEARN | SEARCH

Mobile:

AIRMAN'S AI PLAYBOOK | MENU

Requirements:

- Strong identity
- Clear navigation
- Search/discovery
- Active-page state
- Excellent mobile behavior
- Consistency across pages

## Hero

Use an editorial introduction rather than SaaS marketing.

Example:

TOOLS

Approved tools for official unclassified work.

[Search tools...]

12 tools · every path dated · re-checked monthly

Use:

- Eyebrow
- Large title
- Short description
- Search
- Useful metadata

## Intent Filters

The existing "I want to..." interaction is important.

Treat filters as task-based navigation.

Examples:

- Write
- Research
- Track Data
- Automate
- Build a Dashboard
- Make a Form

Support:

- Default
- Hover
- Active
- Focus
- Disabled when appropriate

Do not make everything an oversized pill.

## Tool Cards

Every card should quickly communicate:

1. What is this?
2. What does it do?
3. Who is it useful for?
4. What is its status?
5. What should I do next?

Recommended structure:

CATEGORY / STATUS
TOOL NAME
Description
Status / Metadata
Open Tool →

Use subtle borders, whitespace, clear hierarchy, and restrained hover states.

## Categories

Use strong editorial hierarchy.

Example:

01 — AI

AI tools for official unclassified work.

----------------

[Tool] [Tool]
[Tool] [Tool]

Potential categories:

- AI
- Automation
- Data
- Platforms
- Coming Soon

Use typography, spacing, numbering, and dividers rather than unrelated visual themes.

## Trust / Status

Useful states may include:

- Approved
- Advanced
- M365
- Coming Soon
- Review Required
- Updated
- Verified

Never communicate status by color alone.

Use text + icon + visual treatment.

Do not invent classifications, certifications, seals, or government endorsements.

## Typography

Typography is a primary design mechanism.

Use a restrained modern sans-serif such as:

- Inter
- Geist
- IBM Plex Sans
- Source Sans
- System UI

Hierarchy:

Display
H1
H2
H3
Body
Metadata
Micro labels

Use uppercase selectively for labels and metadata.

## Color

Prefer:

- White / off-white
- Black / near-black
- Neutral gray
- Deep navy / Air Force-inspired blue accent

Avoid:

- Neon green
- Purple AI gradients
- Excessive red
- Cyber blue
- Rainbow gradients

Color should communicate hierarchy and state.

## Components

Favor reusable components such as:

- SiteHeader
- MobileNavigation
- SiteSearch
- PageHero
- IntentFilters
- ToolDirectory
- ToolCategory
- ToolCard
- StatusBadge
- MetadataRow
- SectionHeader
- WorkflowDiagram
- OpsecNotice
- SiteFooter

Centralize:

- Colors
- Typography
- Spacing
- Radius
- Borders
- Shadows
- Breakpoints
- Transitions

The design system should support Tools, Plays, Comms, Learn, and individual tool pages.

## Search

Search should support:

- Tool names
- Categories
- Capabilities
- Keywords
- Descriptions

Make it discoverable without allowing it to overwhelm the page.

## Responsive Design

Desktop:
- Strong navigation
- Multi-column tool grid
- Large editorial layout

Tablet:
- Reduced grid
- Simplified navigation

Mobile:
- Single-column cards
- Compact header
- Mobile menu
- Readable typography
- Touch-friendly controls
- No horizontal overflow

Do not merely shrink the desktop layout.

## Accessibility

Require:

- Semantic HTML
- Correct heading hierarchy
- Keyboard navigation
- Visible focus states
- Adequate contrast
- Meaningful alt text
- Accessible interactive controls
- Touch-friendly targets
- Reduced-motion support
- No color-only status indicators

## Motion

Motion should be calm, precise, and intentional.

Prefer 150–250ms transitions.

Use for:

- Navigation
- Filters
- Search
- Card hover
- Expansion
- Page transitions

Avoid constant movement, glitch effects, bouncing, excessive parallax, or cursor gimmicks.

## Content Voice

Keep language direct and practical.

Prefer:

"Stop doing it by hand. Let workflows run the busywork."

Avoid:

"Unlock next-generation AI-powered workflow acceleration."

The product should sound like an experienced Airman explaining useful capabilities to another Airman.

## Agent Workflow

Before changing UI:

1. Audit the existing codebase.
2. Inventory routes, components, data, styles, interactions, and responsive behavior.
3. Map the current UI.
4. Define the design system.
5. Build reusable components.
6. Preserve existing functionality.
7. Validate desktop, tablet, mobile, keyboard, search, filters, and accessibility.
8. Polish typography, spacing, alignment, visual rhythm, and motion last.

## Decision Priority

When choices conflict, prioritize:

1. Usability
2. Information hierarchy
3. Accessibility
4. Consistency
5. Performance
6. Institutional credibility
7. Visual polish
8. Decoration

Never sacrifice usability for aesthetics.

## Critical Interpretation

Do not interpret this skill as:

"Make the website look like the White House."

Interpret it as:

"Study how an institutional website establishes authority, hierarchy, navigation, and information architecture. Combine those principles with the confidence and technical sophistication of modern defense technology, then create an original design system for Airman's AI Playbook."

Final result:

Airman's AI Playbook elevated into a serious digital platform.
