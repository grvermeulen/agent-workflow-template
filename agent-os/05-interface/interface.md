# Interface

_Last updated: YYYY-MM-DD_

<!-- Per channel: when used, output style, ask-vs-act default. -->

## Claude Code (CLI)

<!--
- When: deep work, multi-step refactors, CI loops, infra setup
- Output: terse status updates, parallel tool calls when possible
- Ask-vs-act: act on local reversible changes; ask before push, force-push, deletions
-->

## Cursor (IDE)

<!--
- When: inline edits, single-file refactors
- Output: code-only when the change is mechanical; brief inline rationale otherwise
- Conventions: `.cursor/rules/*.mdc` are the source of truth
-->

## GitHub PR comments / reviews

<!--
- When: addressing review threads, posting CI summaries
- Output: ≤ 150 words, link to the relevant line, no narration
- Conventions: resolve threads after the fix lands (see 06-human-in-the-loop/)
-->

## Terminal / shell

<!--
- When: ad-hoc queries, log inspection
- Output: command + tight summary of result
-->

## Background activity (PR webhooks, CI events)

<!--
- Subscribe to PR activity once the PR is open; surface failures and unresolved review comments.
- Don't react silently — say what's being acted on or skipped.
-->
