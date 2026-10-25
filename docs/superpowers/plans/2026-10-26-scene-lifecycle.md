# Shell scene lifecycle audit and implementation plan

Date: 2026-10-26. Scope: shell only; retain battle engines and public encounter catalog.

## Responsibility map (recorded before implementation)

| Existing responsibility | Destination and preservation |
| --- | --- |
| Scene strings theater/intro/room/menu/native/remake and transitions | Typed SceneMachine, complete scene adapters with enter/exit/input/draw; one transition function |
| Theater remotes, TV hitboxes, reduced-motion state and selection | Theater adapter; TheaterState/TheaterView unchanged; reset on explicit theater entry |
| Intro connect hitbox and Z/X; room chapter arrows/WASD, wrapping, boundary focus, chapter selection | Intro/room input and draw adapters; chapter state stays shell-owned; focusLobby hook retained |
| Boss deck selection, native select, card/actions focus, practice select, T shortcut and hitboxes | Menu adapter plus existing BossDeck and menu-tools events; selected card focus stays on mount |
| Game leaderboards, lobby game context, Down/S entry and arrows/X return | Existing lobbyGame/focusLobby and lobby-actions hooks stay in main for chat extension; hidden outside lobby scenes |
| Route chooser, preparation/equipment, bag, loadout and practice selection | Existing startBattle/preparation UI; async route choice gets scene revision guard |
| Async chapter preload, remake asset cache, effect preparation, lazy chapter host, native iframe start | SceneWork token/AbortController ownership; stale completion cannot enter a scene; loading/error/retry UI stays shell-owned |
| Busy flag and cancellation, failed chapter retry, optional native/profile/equipment/art fallback | Busy presentation stays shell-owned; central transition invalidates SceneWork and resets loading; existing initialize fallbacks retained |
| Pause P/Esc/Z, blur/visibility pause, click resume, X twice leave, clock reset and audio pause | Remake adapter and existing event hooks; leaving combat tears down through lifecycle |
| Menu playlist, unlock, encounter themes, original game-over track fallback, runtime sound API, victory fade | Menu playback moves to scene entry; engine sound adapter, themes and fade remain unchanged |
| Native pause/mute/focus, forwarded browser keys, touch key capture/release, diagnostics/outcome delay/dispose | Native adapter enter/exit plus existing event hooks; modal/editable guards consistent with shell input |
| Remake logical/independent confirm release, held/pressed/released accumulation, 30Hz stepping, HUD/practice draw | Remake input/draw adapters; Input behavior and route policy retained |
| Completion/fought preferences, score result, async rank, game-over map, retry session, active route preservation | Existing showOutcome/placeRun/activeRemakeRecord and session maps retained |
| About modal, leaderboard modal, routes/preparation focus return and dialog guards | Existing UI modules retained; shell gates input behind any modal and clears cross-scene keys |
| Back/pause/mute/effects/practice/retry/outcome/credits/adaptation buttons and stage pointer handlers | Existing DOM wiring delegates to transitions/adapters; no IDs removed |
| Browser prefs/storage, reduced effects, sound, completed/fought, equipment loadout | Existing storage and UI modules unchanged; no new key or migration |
| URL dev/demo/nostrict/seed and Vite DEV/pages, asset paths | Existing launch/initialize paths unchanged |
| Canvas setup, remake offscreen canvas, RAF and fixed clock, render invalidation | Loop dispatches active scene draw; SceneMachine before-enter clears input and resets clock |
| beforeunload battle guard, strict instance reads, DEV inspect/lose/win/choosing hooks | Existing hooks unchanged |

## Work sequence

1. Add failing unit tests for lifecycle order, cancellation/abort/stale work, blocked input and single-scene dispatch.
2. Implement small typed SceneMachine and SceneWork modules without dependencies.
3. Replace direct scene assignments with transitions; register enter/exit/input/draw adapters, preserve battle functions and DOM extension hooks.
4. Cover simultaneous confirm/cancel and all-dialog shortcut guards. Run unit tests/typecheck and existing headless keyboard/lobby/routes/battle-end/knight/preparation/deck browser tests.
5. Review changes against every audit row; deliver exact checks and any limitation. No commit or push.

Layer A: this document has no invisible Unicode/variation selectors or embedded metadata. Full watermarks-remover is not installed on Windows; installation is needed for its complete pipeline.

## Implemented outcome and verification

- `src/game/scene-machine.ts`: typed active-scene lifecycle, explicit same-scene resource refresh, resource-owned exit adapters and cancelable async work tickets.
- `src/main.ts`: all scene changes delegate to transition(); each scene has enter/exit/input/draw handlers. Chapter/boss selection remains shell-owned. Battle and preparation implementations stay intact. Lobby hooks remain available to the parent chat integration.
- Cross-scene input resets clear held and buffered battle keys, reset the clock and return focus to the canvas before scene-specific focus work. Browser key repeats cannot become fresh presses after a reset.
- Cancel wins simultaneous menu/chapter confirm. All open dialogs block the practice shortcut. Menu music stays continuous between lobby scenes and resumes explicitly after focus/visibility returns.
- Resource-owning exits cannot dispose a new native/remake battle installed before a transition. A delayed native outcome also checks the native instance, protecting retries that reuse the same catalog record.
- 20 targeted unit tests pass (scene lifecycle/work/resource ownership, browser input and existing audio tests). Typecheck passes.
- Existing 28-test browser batch: 27 passed; one route test was interrupted by a source hot reload during the run. A subsequent stable rerun of all four route tests and five new lifecycle tests passed (9/9). The added sixth lifecycle test for delayed native results also passed.
- Existing passing coverage includes both keyboard cases, lobby/mobile, deck/swipe, preparation/bag/layout, Knight missing-chunk recovery, game over retry, pointer return, victory, immediate rematch, pause/two-X leave and Weird-route restart.
- The parent owns final chat integration and combined verification. No server restart, visible browser, commit or push was used.
- Read-only cross-review of chat/API/profile/migration/component tests found no actionable findings in async ownership, drafts, shared authentication, room separation, identity snapshots, safe rendering or database grants/rates.
