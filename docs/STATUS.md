# Current status and execution plan

Updated 2026-09-20. **This is the single current handoff and remaining-work plan**, shared by Codex, Cursor, and other editors. Older conversation plans and historical study notes are background, not the next-task authority. User instructions take precedence.

## Branch and checkpoints

Work on `codex/finish-v1`. Last application commit reviewed: `cec9184`.

- `2ec82d5`: approved continuous frame promoted to gameplay, Previous Card, and workshop.
- `489d0aa`: preserved dice WIP; no production dice cards.
- `875b932`: repaired dice browser assertions and offline test setup.
- `d9be46f`: restored 2:3 card geometry, margins, and contained rules scrolling.
- `cec9184`: fixed WebKit dice depth using face-level transforms; do not repeat the old flattening investigation without a new reproduction.

An untracked `tests/sound.test.ts` exists. Preserve it; it currently fails and is not included in the commits above. Do not stage it accidentally with documentation changes. Main is not the current work target. No merge, push, or publishing was performed by this review.

## Verified state

The core game is functional: pack selection, finite/endless cycles, exact resume, shared frame, local fonts/assets, optional audio, workshop, and Pages workflow exist. Thirty Core cards remain production candidates. Dice definitions, per-draw results, migration, and controller integration exist; two dice cards are development-only fixtures. There is no installed dice/3D library: runtime dependencies remain React and React DOM.

Fresh review evidence on 2026-09-20:

- `npm test`: 72 passed, **1 failed** in the untracked sound test. The AudioContext mock is an arrow-function implementation of `vi.fn`, but production calls `new AudioContext()`. Vitest reports the non-constructible mock, and no impact timers are created. Repair the fixture before diagnosing production audio from this failure; further assertions may need investigation afterward.
- `BASE_PATH=/Drink-at-Ron/ npm run build`: passed content validation, TypeScript, PWA build, and budgets. Runtime assets approximately 1,947 KiB; all app JavaScript approximately 85.3 KiB gzip.
- `CI=1 BASE_PATH=/Drink-at-Ron/ TEST_PORT=4398 npm run test:e2e -- --workers=2`: **47 passed, 3 skipped** across Chromium/WebKit. Skips remain the explicit offline cases; they are not physical iOS evidence.
- Direct WebKit workshop inspection: 2:3 ratio measured; two settled d6 dice visibly show depth and three visible faces each. This is desktop WebKit evidence, not physical iOS performance evidence.
- Physical-device testing, group playtesting, live Pages settings/deployment, and final dice visual approval remain unverified. The update and workshop suites were not rerun during this review.

## Review findings to resolve

1. `src/components/Cards.tsx` unconditionally stops click propagation on `.study-rules`. This prevents scrolling from discarding, but also blocks an ordinary stationary tap on the rules of any revealed card. Restore ordinary tap-to-discard while suppressing actual scroll/drag gestures. Cover stationary taps, touch scrolling, pointer cancellation, and keyboard activation. Do not revert 2:3 geometry or shrink the text.
2. The untracked sound test needs a constructible AudioContext mock and validated asynchronous setup. Fix and commit it separately, or explain any remaining production defect; do not delete it to make checks green.
3. The dice renderer now works in the reviewed WebKit view, but its **in-card presentation is no longer the desired product direction**. Do not spend another pass polishing that presentation.
4. `scripts/check-budget.ts` counts ALL generated app JavaScript, including lazy chunks, against 120 KiB gzip. Calling this an initial-bundle-only limit is incorrect. Library package unpacked size is not a measurement of the delivered build.

## Approved product constraints

- Original painted fantasy tavern: walnut, worn bronze, teal leather, parchment, Grenze. Rich collectible-card craftsmanship, goofy original characters; no copied franchise characters/assets.
- Keep the approved continuous frame, generous phone edge clearance, and a constant **2:3 outer ratio**. Front/back/Previous Card must agree. Preserve readable text and scroll access when content is long; ordinary stationary taps still work.
- Keep current ordinary card flip/discard architecture. No new animation framework for ordinary cards.
- Pure engine owns outcomes. A roll is saved exactly once before animation; the renderer displays predetermined faces. Returning from a roll shows its total and resolved instruction; only a subsequent action discards.
- Keep session schema v2, v1 migration, stable storage key, pack behavior, shuffle randomness, and existing snapshots. Rendering changes should not require another schema migration.
- No production promotion of dice fixtures until the user approves the full-screen study. No additional mechanics, backend, accounts, or content editor.

## Corrected dice direction — full-screen, library-first

User clarification, 2026-09-20: dice should roll across the screen, in the spirit of a tabletop roll overlay, **not inside the card's illustration window**. BG3/Roll20 are interaction references, not sources of copied UI or assets.

Required flow:

1. Reveal relevant card, then present a bold ROLL control in a screen-level overlay. Dim the game behind it. Show the current rule as accessible, readable real text in a quiet parchment area; never bury it under dice.
2. Tap ROLL once. Roll large dice across the viewport's available stage, with physical-looking tumble/contact/shadows. Use the full screen as the overlay boundary, excluding safe areas and the readable rules area from the dice collision/landing region.
3. Settle with individual values and total. Keep result visible until tapped. No automatic discard or reroll.
4. Tap to close the overlay and return to the unchanged 2:3 card. Show the total and resolved instruction on its parchment. The next normal card action discards.

Mount the overlay at the application root or through a portal, outside card transforms and clipping. Use the existing presentation controller and persisted result. Separate overlay input/focus from the underlying card; no click-through or scroll-triggered actions. Restore focus on close. Support resize, safe areas, landscape, reduced motion, keyboard/screen reader, backgrounding, and cancellation. Reload mid-roll shows the saved settled result. Animation/load failure falls back to readable static results and never blocks gameplay.

### Library decision

**Next technical task is a bounded library prototype, not another custom dice engine.** Preferred first candidate: `@3d-dice/dice-box-threejs` (Three.js + Cannon ES). Its official README documents predetermined results, such as `2d6@3,5`, which fits the existing engine-owned outcomes:
https://github.com/3d-dice/dice-box-threejs

The separate Babylon/Ammo `@3d-dice/dice-box` package is not interchangeable. Verify required outcome control before substituting it:
https://fantasticdice.games/docs/intro

The earlier custom-renderer choice prioritized budgets using package-size/dependency information, without a measured library prototype. Do not treat it as proof that a library cannot fit. Keep the existing custom implementation as a checkpoint while evaluating the candidate; do not expand both implementations indefinitely.

Prototype acceptance:

- Actual full-screen 2d6 and 1d20 demonstrations using fixed results from the existing engine.
- Confirm rendered top faces match all requested values, normal completion and bounded interruption recovery.
- Isolated renderer adapter with load/show/roll/settle/dispose behavior; no UI/persistence logic inside the library integration.
- Locally bundled assets, no runtime CDN, correct `/Drink-at-Ron/` paths, offline relaunch, and required license notices.
- Measure actual added initial JS, lazy JS, total precache, images, startup delay, and observed browser behavior. Test Chromium/WebKit. Do not infer these from npm unpacked size.
- Preserve existing release budget checks during the experiment. If the candidate exceeds them, report the measured delta and propose a specific revised limit before changing policy. A documented budget adjustment may be preferable to maintaining custom physics/rendering, but is not yet approved.
- Present the running prototype and evidence for visual/technical selection. Do not silently abandon the library or rewrite geometry if it has a blocker; report the blocker and options.

## Execution sequence and model routing

Use one editing agent at a time. Keep tasks bounded and commit verified changes separately.

| Step | Owner | Scope | Done when |
| --- | --- | --- | --- |
| 1 | Terra | Repair untracked sound test; preserve existing WIP | Focused audio tests and all unit tests pass; test committed |
| 2 | Terra | Stationary card taps versus rules scrolling | Tap, real gesture, cancellation, keyboard tests pass without ratio regression |
| 3 | Sol or comparably capable Cursor model | Full-screen library prototype described above | Working 2d6/1d20, predetermined results, browser evidence, measured budgets; user review |
| 4 | Sol | Integrate selected renderer, overlay lifecycle, saves/audio interruption | Existing engine invariants and focused cross-browser flows pass |
| 5 | Terra | Workshop cleanup and approved dice content promotion | Full-screen preview isolated from saves; approved Core composition/IDs; no stale frame comparison |
| 6 | User + Terra | Group playtest and text revisions | 40-card plus Endless evidence recorded; copy locked |
| 7 | Terra + image tool + user | Data-driven art mapping and approved illustration batches | Centered readable art; no per-card component branches; budgets verified |
| 8 | Terra + user | Pages/update/offline and physical-device checks | Automated and physical evidence recorded separately |
| 9 | Sol, then Terra | Focused integration review; authorized release | No release blockers, checked commit, then explicit publishing authorization |

No routine Astra session is required. Escalate to Astra only if Sol's bounded investigation finds an unresolved architectural tradeoff or cannot identify the root cause. Do not use a new tool/model switch as a reason to repeat completed work.

## Portable handoff prompt — next renderer task

> Read AGENTS.md and docs/STATUS.md in this checkout. Continue on codex/finish-v1; inspect git status and preserve uncommitted files. The approved ordinary cards use a shared painted 2:3 frame. Current dice engine, persisted results, and v1-to-v2 migration must remain intact. The user now wants a full-screen dice overlay, not dice inside the illustration window. Build only the bounded library prototype specified in STATUS, first evaluating @3d-dice/dice-box-threejs for predetermined 2d6/1d20 results. Reuse src/game/dice.ts and the presentation controller; mount outside card transforms. Keep rules readable and prevent click-through. Bundle assets locally for GitHub Pages and offline use. Measure delivered sizes; do not change budgets, introduce another save schema, or replace this with more custom geometry without presenting evidence. Show the actual prototype, browser results, and blockers before production promotion. Update STATUS with results and the exact next step. Do not merge, push, or publish.

For the routine tasks, assign only the relevant numbered row and its acceptance criteria. Do not ask an agent to “finish the entire application.”

## Verification commands

Use Node 22.12+, an unused test port, and a fresh production server:

```sh
npm test
BASE_PATH=/Drink-at-Ron/ npm run build
CI=1 BASE_PATH=/Drink-at-Ron/ TEST_PORT=4398 npm run test:e2e -- --workers=2
BASE_PATH=/Drink-at-Ron/ npm run test:update
npm run test:workshop
```

Run focused tests during iteration, then broader affected checks once. After each task, replace stale status statements; record the commit, exact commands/results, remaining issues, and next task. Never call all checks green while an untracked test fails.

## Using another editor or machine

Same Mac: open this repository folder in Codex or Cursor and stay on this branch. The files and Git history are the handoff; no full chat transcript is needed. Explicitly ask the agent to read AGENTS and STATUS rather than assuming editor-specific instruction discovery. Stop the other editing agent first.

Another machine/cloud: a fresh clone will not contain an unpushed branch or untracked files. Preserve and commit intended work first, then explicitly authorize pushing this branch or transfer a Git bundle/local archive that includes the required work. Do not transfer credentials. Check branch, HEAD, and working-tree status before continuing. Development saves are local browser data and do not travel with Git.
