# NEO Weird Route Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement the tasks in this session.

**Goal:** Add the original solo-Kris NEO encounter, including source ACTs, the high-defense ending and input-triggered rage, without changing the public normal-route policy.

**Architecture:** Reuse the NEO enemy strategy, canonical projectile factories and shared battle engine. A route strategy replaces only route-specific talk, ACT, status and ending behavior. The host owns route initialization and standalone scene boundaries; the shell owns route selection, preparation and scoring.

**Tech Stack:** TypeScript, the existing GameMaker-compatible runtime, Vitest and headless Playwright.

**Spec:** Owner's route decision in this conversation; docs/HANDOFF.md section 14; installed Chapter 2 source events, read locally only.

## Global Constraints

- No original GML, dialogue, bytecode, recordings or native packages in commits.
- Normal NEO keeps three heroes, logical confirm release and disabled rapid-shot rage.
- Weird NEO uses only Kris, independent confirm release and source-driven rage detection.
- Public availability requires route, ending and browser acceptance; an opening replay alone is insufficient.
- Preserve keyboard, touch, equipment persistence, retry, scoring and normal practice.

## Responsibility Audit

No large engine or UI rewrite is planned. NEO currently owns initialization, attacks, box placement, balloons, ACTs, wire mercy, normal endings, multipart Draw, audio cleanup and battle hooks. Those remain in their existing modules. Export its strategy so a separate weird-route module can replace only differing steps. Source draw differences for solo wireheart damage and defeat poses stay in body.ts. Existing source registry identities, projectile aliases, Create order and normal ending callbacks remain intact.

Host responsibilities: register the route enemy and FriedPipis, initialize phase flags before encounter/controller creation, use the fountain scene instead of coasters, and expose the source battle-completion boundary. Shell responsibilities: load the same lazy NEO host for either route, select the correct party before preparation, retain input mode on retry, and submit distinct normal/weird/enraged records. Route variants must not become duplicate boss cards.

## Review Focus

- A normal battle launched after a weird battle must have no copied hooks, flags or rage policy.
- X-Slash must hit twice, restore Kris's sprite and finish the ACT; FriedPipis must heal once after its animation.
- Crossing 10% HP starts the defense sequence rather than a normal defeat; further damage cannot bypass the ending.
- The final Noelle call must finish the encounter and scoring; regular help calls must return to combat.
- Keyboard-only route selection, single-column equipment, retry and leaderboard filters must retain route identity.

## Tasks

### 1. Route-specific strategy and setup

- [x] Add failing tests for solo setup, ACT tables, no spare, negative initial defense, and normal-route isolation.
- [x] Export the existing NEO strategy without changing its behavior; add a separate route strategy and host setup.
- [x] Port source dialogue keys, X-Slash, FriedPipis, high-defense transition and Noelle ending.
- [x] Verify tests against local original events and continuous normal NEO regression.

### 2. Attacks and presentation

- [x] Add failing tests for solo wireheart target/damage and source low-HP pose.
- [x] Port the specific Draw differences and register the FriedPipis animation.
- [x] Exercise all natural attack families with independent confirm release and actual rage activation.
- [x] Compare deterministic state with local original events and native recordings where available.

### 3. Public integration and acceptance

- [x] Keep the variant gated while implementation tests are incomplete.
- [x] Wire route identity into lazy host loading, preparation, practice and leaderboard selection without duplicate cards.
- [x] Verify ACTs against local source/native events; verify keyboard routes, the first attack, ending and retry in a headless browser.
- [x] Run typecheck, relevant tests, production build and normal NEO regression; publish only accepted work and update HANDOFF.
