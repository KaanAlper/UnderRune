# Lobby Leaderboards Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline execution.

**Goal:** Expose game-wide boards from the theater and chapter hub, preserving selected-boss boards and making the score sheet a centered event-style overlay.

**Architecture:** Extend LeaderboardPanel with a game-scoped opening method; keep existing API, scores, profile storage, filters and boss opening unchanged. The shell only controls lobby visibility, game context and focus transfer. No scene-system rewrite or backend change.

**Tech Stack:** Existing TypeScript DOM, CSS, Playwright and Supabase REST.

**Spec:** docs/HANDOFF.md section 19 and the owner's instruction to continue remaining work.

## Global Constraints

- English interface and existing pixel font; no new dependencies.
- Preserve five chapter choices, per-boss boards, equipment filters, all NEO route boards and saved player names.
- UNDERTALE must not show DELTARUNE scores or offer unimplemented battles.
- No fixture scores submitted to the public database.
- Keyboard and touch input work; closing restores the opener; UI is bounded on 390x844.
- General chat and the proposed shell refactor remain separate tasks.

## Responsibility Audit

This is an extension, not a rewrite. LeaderboardPanel retains configuration retry, pending submission, name storage, nested dialogs, native selectors, arrow/Z/X handling, async cancellation/revisions, pagination and equipment rendering. The shell retains all scene transitions, shortcut handling, audio and battle lifecycle. Input changes only scope the new lobby controls. No settings or schema changes.

## Design

Use the game's black backdrop (#08060b), pale score text (#efe4ff), muted lavender rules (#51425f), gold podium (#ffe761) and teal secondary placement (#8be3cc). Keep the established pixel font. Center a compact score-sheet frame with visible margins and a translucent dark backdrop; retain the game scene beneath. Distinguish game context and podium positions, while leaving filters quiet. Keyboard opening is immediate; no motion on frequently used navigation. Use existing native focus and dialog semantics.

## Review Focus

- Changing games after a populated board cancels pending responses and removes old rows.
- A nested name dialog never closes its parent on X or steals focus.
- Arrows/Z/X opening the lobby board never also advance chapters or activate the TV.
- Empty/unconfigured/error states stay readable without blocking gameplay.
- Long names, expanded equipment and mobile filters stay inside the frame.

## Tasks

- [x] Add browser regressions and verify missing lobby control fails first.
- [x] Add game-scoped opening and honest UNDERTALE empty state.
- [x] Connect theater/chapter lobby control and keyboard focus return.
- [x] Improve the centered score-sheet frame and podium styling without removing behavior.
- [x] Run browser regressions, typecheck/build, request independent review and publish verified changes.
