# GIGA Queen (encounter 84)

Continue the approved source-event/Strategy architecture from HANDOFF.md. This is the normal story boxing fight;
the arcade wireframe encounter is a separate, explicitly unavailable path. Do not change Knight or Rouxls.

## Responsibilities and ownership

Preserve the existing menu-facing proxy, input arbitration, lifecycle helpers and attack plans. No replacement of
the shared battle controller: its command progression, keyboard shortcuts, item consumption, FIGHT timings,
TP, party HUD, scene entry/exit and game-over paths remain there. Encounter differences use BattleHooks.

- `giga-queen/player*.ts`: player Create/Step, punch/dodge/duck/hurt/special state, hitbox collision, knockout.
- `giga-queen/opponent*.ts`: Queen Create/Step, attack dispatch, patterns 0-9, hit responses, round transitions.
- `giga-queen/draw*.ts`, `support*.ts`, `projectiles*.ts`: source Draw mutations, HUD, effects, city background,
  hitboxes, baseball/finale and projectile collisions. Drawing is game logic here and must run in recordings.
- `giga-queen/menu.ts`: shared panel offsets and suspension, machine portrait/HP, FIGHT and command adapters.
- `giga-queen/motion.ts`: source precise movement helper. Runtime audio pitch reaches the existing AudioManager.
- `giga-queen/index.ts`, Chapter 2 host: explicit registration, source encounter/monster setup. Keep availability
  development-only until independent recordings, a fresh battle and browser controls/ending pass.

## Execution and acceptance

1. Read all native responsibilities; write failing focused tests before implementing each owned unit.
2. Implement explicit TypeScript events with native instance fields, event order, random calls and alarms.
   No source evaluator, invented AI, silent sprite placeholders or catch-and-ignore behavior.
3. Register the adapter and compare the three existing `ch2-84-s11-god*` original recordings. Investigate the
   first differing frame and full-state snapshot; preserve earlier passing encounters.
4. Add legal-input coverage for later rounds, final baseball and loss. Capture additional original recordings
   when existing recordings do not cover them. Test a fresh start separately from snapshot restoration.
5. Rebuild local assets, restart the preview after newly generated files, and inspect a browser tour for controls,
   attack visuals, all bars, HUD transitions and page/missing-sprite errors. Run TypeScript and affected regressions.
6. Only publish once acceptance passes; document remaining optional variants truthfully. Keep original game files,
   decompiled GML, bytecode, traces and extracted text out of source control.

Independent event families are assigned to parallel agents. Root owns shared hooks, registration, parity debugging
and final verification. Each agent must report source omissions explicitly; no agent builds assets while tests read them.
