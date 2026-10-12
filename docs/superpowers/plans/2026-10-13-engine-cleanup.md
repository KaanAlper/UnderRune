# Engine cleanup responsibility audit

Internal implementation audit, written before removing the approximation engine.
All entries below have an explicit destination or an explicit retirement reason.
No source numerical scripts under src/remake are changed by this cleanup.

## Application host (src/main.ts)

| Existing responsibility | Destination |
| --- | --- |
| Theater remotes, television, Undertale coming-soon, Deltrarune connection, intro, five chapter room | Retain TheaterState/TheaterView, Renderer.intro/room and DeviceRoom. |
| Encounter catalog, chapter filtering, selection, completion badges | Minimal src/bosses/catalog.ts retains catalog.json; BossDeck remains the selection UI. |
| Arrow/WASD selection, Z/Enter confirmation, X/Escape back, T practice | Input remains. Deck left/right selection and X chapter return remain; T only opens supported Jevil practice. |
| Browser approximation fallback for every encounter, including action adaptations | Retire. No-native local runs use EngineBattle only for explicitly available source encounters; unavailable records retain equipment preview. |
| Native profile discovery, local iframe startup, loadout INI, original key forwarding, pause/mute/focus, diagnostics/outcome/failure | NativeBattle remains local only. Original engine stays preferred for local full battles when its profile exists. |
| Equipment catalogs by chapter, saved loadouts, equipment stats, bag, practice bag caveat | PreparationPanel/loadout remain; callback dispatches native or source according to current launch type and availability. |
| Source assets, CanvasGraphics, HUD text measure, BattleView, original sound/pitch/loops, 30 Hz frames in 60 Hz host | Retain EngineBattle and JevilPractice source runtime paths unchanged. |
| Seed CLI/query behavior | Retain ?seed=N reproducibility and random seed per launch; ?demo=1 disables native; DEV-only ?dev=1 remains local. MODE=pages remains source-only. |
| Busy/loading/error/retry, asset failure and sound failure handling | Keep loading/error panels, retry initial catalog failures, preparation launch feedback, token checks and abortable sound loading. |
| Local chapter sprite loading | Bounded AssetStore.preload runs when a chapter opens; cancellation uses the same session token, retry remembers a failed chapter. Public previews retain their existing complete preload. |
| Asynchronous cancellation/back while loading | Keep session tokens and abort source loads when leaving; obsolete or failed native launches cannot reopen or report stale errors after navigation. |
| Pause P/header/touch, R restart, outcome rematch and menu | Keep for both source battle and practice, independent of public/local mode; native header and postMessage controls remain. |
| Completed victory persistence | Source/native host outcomes update existing completed list; practice survival never marks a battle completed. |
| Mute, reduced effects/OS reduced motion, credits/modal keyboard isolation | Keep existing preference controls and about dialog pause; replace stale adaptation text with accurate source/native descriptions. |
| Window blur, visibilitychange, fixed clock reset, held/edge key cleanup | Retain Input, FixedClock, source pause/audio pause and hidden-time reset. |
| Pointer audio unlock, touch pointer capture/release/cancel/lostcapture | Retain handlers and source input feeding. |
| Source outcome delayed native banner and stage class | Retain native timeout identity guard; closeBattle removes banner/class, disposes native, clears source runtime/view/input, stops sound. |
| requestAnimationFrame loop and initialize retry | Retain one RAF; reset obsolete runtime state on launch and menu navigation. |
| Settings/config | Keep shadowcrystal.local.v1 preferences and existing chapter loadout keys/validation in loadout.ts. No keys migrate or disappear. |
| Events/API/context | Keep DOM IDs/listeners, NativeEvent callback, runtime sound hooks and input mapping. No Qt signals/slots, context properties or env variables exist in retired engine. |

## Retired battle/action engine and renderer

| Existing responsibility | Destination |
| --- | --- |
| BattleSession phase/actor/cursor, immediate FIGHT/ACT/MAGIC/ITEM/SPARE/DEFEND resolution, timing, text messages | Source battleControllerFull owns actual queued commands, menus, bolt timing and writers; approximation rules retire. |
| Synthetic party stats, fixed starting TP, fixed item list, arbitrary healing/mercy/damage/spare formulas | Source party globals, encounter setup, equipment and item ports already own gameplay; synthesized values retire. |
| Attack sequences, turn timers, bullet spawn/update/filter, yellow shots, shield, blue gravity, hit/graze/guard/invulnerability | Source GameMaker objects/runtime own supported encounters; unsupported generic patterns retire without replacement. |
| Seeded approximation RNG and circle/segment collision | Source WELL512 RNG and precise sprite-mask collision already own gameplay. Delete dead game/rng.ts and game/collision.ts after import audit. |
| Battle snapshot/reset/dispose, audio event queue, hit/graze statistics | Host lifetime/pause/restart/outcome remain; approximation-only snapshots/statistics/events retire. Source emits original sampled sound. |
| ActionSession eight HP, facing/strike/dash/cooldowns, opponent pursuit, telegraph/phase thresholds | Native original game remains for local action encounters; no invented source fallback. Future source ports require complete behavior before availability. |
| Renderer menu rows/pagination and sprite previews | BossDeck already owns accessible cards, sprites, chapter labels, picker and availability. Delete unused canvas menu. |
| Renderer generic boss/bullet drawing, arenas, party HP/TP, commands, action visuals, victory/defeat/pause screens | BattleView/CanvasGraphics/source objects own source battle visuals; host retains practice HP/DF/TP and paused overlay; native owns its iframe visuals. |
| Renderer.pixelHeart (shared theater/room utility), clear/intro/room and DeviceRoom | Retain. Remove private box helper used only by retired drawing. |

## Registry, types, tests and tools

| Existing responsibility | Destination |
| --- | --- |
| Registry exports catalog plus invented family/music/accent/mercy profiles/getDefinition | catalog.ts only exports typed catalog; source encounters own verified availability/music and native owns original profiles. Delete getDefinition/families. |
| bosses/patterns, old Jevil attack variants and Knight stream/source-data | Delete approximation-only dependency tree; keep every src/remake boss module and faithful Jevil practice. |
| tools/build-source-ports.mjs generator and prepare-game invocation | Delete stale Knight approximation generator and its invocation; preserve all extraction/assets/equipment/native preparation stages. |
| EncounterRecord/EnemyRecord/SourceRecord types | Retain shared catalog/preparation/deck contracts. Delete approximation-only bullet/arena/attack/definition/party/snapshot interfaces. |
| battle/action/attacks/knight unit tests | Retire tests asserting deleted engine behavior. Existing faithful source/parity tests remain. |
| tests/engine.test.ts | Keep meaningful Input and FixedClock checks; remove tests of deleted RNG/collision. |
| tests/e2e/app.spec.ts | Retain theater, native launch/outcome, retry, modal/storage and mobile checks; replace generic fallback tests with source launch, Jevil practice and unavailable prep/lifecycle checks. All card launches first select boss ID and await aria-current. |
| tools/check-coverage.mjs | Keep asset/hash checks; remove generic playability claims and report source availability explicitly. Full parity remains unclaimed. |
| tools/audit-parity.mjs | Hash current faithful source component/evidence files; report source-ported/component verification required rather than comparing against deleted approximation files. No full encounter parity claim. |
| Runtime external boundaries | Native URLs/data/WASM stay local; public source launch has no native fallback. Keep assets, audio, fonts, storage and native verification tools. |
| AudioManager.effect synthetic square-wave sound | Only consumer was the retired BattleSession event loop (rg import/call audit). Remove this dead method; sourceEffect/sourceLoop/sourceStop/sourcePitch, unlock/music and audio tests remain unchanged. |
| Fresh local installation of source fallback | tools/setup-source.ps1 (npm run prepare:source) reads pinned UTMT version from tools-lock.json, verifies extracted prerequisites, exports Chapter 1 sprite collision metadata read-only, then builds equipment/source bundles. Source SHA256 before/after and environment restoration remain explicit; no native runtime build occurs. |

## Execution and verification

1. Preserve root-owned BossDeck/main additions; change only host dispatch/lifecycle and retire dead renderer methods.
2. Verify all import consumers before deleting approximation files and types.
3. Replace obsolete fallback tests with no-native source integration coverage, cancellation/retry, practice equipment and truthful unavailable preparation.
4. Run TypeScript, focused unit tests, no-native browser checks, asset/source tool checks and grep for retired executable references.
5. Do not commit, push, build dist-pages, restart the desktop or change source numerical scripts.

This internal document is ASCII; there are no invisible Unicode characters or file metadata fields to clear.
