---
name: Design agent
description: Describe what this custom agent does and when to use it.
tools: Read, Grep, Glob, Bash # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

<!-- Tip: Use /create-agent in chat to generate content with agent assistance -->

# Airman's AI Playbook Design Agent

This folder is a reusable design skill for an AI coding/design agent.

## Contents

- `SKILL.md` — primary agent instructions
- `references/design-system.md` — visual language
- `references/components.md` — component guidance
- `references/workflow.md` — implementation procedure
- `checklists/ui-qa.md` — final UI QA checklist

## References

White House:
https://www.whitehouse.gov/

Anduril:
https://www.anduril.com/

Airman's AI Playbook:
https://airmans-ai-playbook.vercel.app/tools

## Usage

Give the entire folder to the design/coding agent and instruct it to load `SKILL.md` before beginning UI work.

The agent should inspect the existing application first, then use the reference files as design constraints during implementation.