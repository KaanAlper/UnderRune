# NEO browser input, box and guard fixes implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task-by-task. Independent source investigations use superpowers:dispatching-parallel-agents.

**Goal:** Correct the reported expanded battle-box rendering and missing BIG SHOT, and establish the exact Ralsei guard defect before changing its original behaviour.

**Architecture:** Preserve shared battle strategies. Keyboard release edges belong to browser input and its 60 Hz-to-30 Hz buffer; sprite nine-slice metadata belongs to extraction and the generic canvas renderer. Guard behaviour must follow the installed original events and canonical collision objects.

**Tech stack:** TypeScript, Canvas 2D, Vitest, Playwright, read-only UndertaleModTool extraction.

**Spec:** User's three reported defects; docs/HANDOFF.md architecture and validation requirements.

## Constraints and review focus

- No installed game edits, new source archives, boss branches in shared components or parity exemptions.
- Do not touch the unrelated encounter-15 scripts.
- Preserve input aliases, press edges, movement/slow keys, pause, focus/scene cleanup and frame-rate buffering.
- Preserve sprite tint, alpha, rotation, trimmed atlas regions, mirrored scale, surface targets/captures and sprite cleanup.
- Test nine-slice both enlarged and smaller than the combined corner widths during box growth.
- Build generated assets first; run their dependent tests afterward, never concurrently with bundle replacement.

## Tasks

- [x] Reproduce BIG SHOT failure through real browser keydown/keyup and sprite draw observation. Existing direct-runtime tests manually supplied release edges and missed the production bridge defect.
- [x] Add one-shot logical confirm-release edges to Input and buffer them until the next battle frame; clear them on pause and scene/battle changes. Three unit regressions and the browser regression failed before correction and passed afterward.
- [x] Export original nine-slice margins/tile modes and render them generically. Four browser graphics tests preserve fixed-width borders, captured growth afterimages, trim/tint/rotation/mirrors and tiny growth sizes. Original runner clips corner widths before source cuts, including dimensions smaller than the corner sum. Only two Chapter 2 source sprites enable it, both stretch mode; other modes retain a named unsupported boundary.
- [x] Investigate both circling effects because the owner is uncertain whether the character is Susie or Ralsei. Fifteen guard regressions cover actual canonical runtime dispatch, full-size incoming projectiles, exposed-heart HP, unprotected control, rotation/cooldown/depletion. Ordinary projectiles are intercepted; original basic/laser collision events intentionally do not destroy their projectile, which may continue to the soul. No guard production defect was reproduced; keep the source distinctions. Eight Susie Supercharge tests compare Draw commands against the original event and exercise charge/release, fast shots, sparks and final-shot cleanup. The missing browser release is corrected; no additional speculative effect changes were made.
- [x] Review, rebuild assets, run focused/full tests and production browser acceptance sequentially. Full suite: 506 tests / 53 files, no skips (147.88 seconds); 18 tool tests, typecheck/build; four graphics browser tests; two production battle browser checks (37.2 seconds); final shipped-metadata/BIG SHOT browser check (18.6 seconds). Three reference comparisons still match 27880 frames.
- [ ] Publish the accepted artifact and record live verification in HANDOFF. Tested files: index-DwOLy-rD.js, neo-CI9oUwF6.js and the changed Chapter 2 sprite bundle.

## Evidence before final acceptance

- BIG SHOT: three Input release tests failed before the fix; actual public-app browser draw observation saw zero large-shot frames after keyup. All three tests and the browser hold/release regression pass after forwarding release edges.
- Box: actual original texture stretched its 2-pixel borders to 6 pixels at x3. Source V3NineSlice margins now survive extraction and reach the shared renderer. Four graphics browser tests pass; the original package SHA256 remains unchanged.
- Fresh read-only review found no material defect in input lifecycle, aliases/frame buffering or renderer metadata/origin/surface handling.
- Production browser checks also require the actual shipped bundle to carry the original two nine-slice definitions, so renderer-only synthetic tests cannot conceal an extraction/deployment omission.
