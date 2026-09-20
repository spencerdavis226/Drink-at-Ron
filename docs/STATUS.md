# Current status and execution plan

Updated 2026-09-20. **This is the single current handoff and remaining-work plan**, shared by Codex, Cursor, and other editors. Older conversation plans and historical study notes are background, not the next-task authority. User instructions take precedence. The full-screen library dice prototype (step 3) is implemented and committed, and the tiered release-budget policy is approved; the remaining decisions are visual/technical review, physical-device timing, and dice content.

## Branch and checkpoints

Work on `codex/finish-v1`. Last application commit: `c392309` (full-screen library dice prototype checkpoint).

- `2ec82d5`: approved continuous frame promoted to gameplay, Previous Card, and workshop.
- `489d0aa`: preserved dice WIP; no production dice cards.
- `875b932`: repaired dice browser assertions and offline test setup.
- `d9be46f`: restored 2:3 card geometry, margins, and contained rules scrolling.
- `cec9184`: fixed WebKit dice depth using face-level transforms; do not repeat the old flattening investigation without a new reproduction.
- `d299fed`: repaired and committed the dice-audio cancellation fixture.
- `becec5a`: stationary rules taps now discard; moved, scrolled, or cancelled pointer gestures do not.
- `c392309`: full-screen, flag-gated `@3d-dice/dice-box-threejs` prototype; normal production builds keep the custom in-card renderer.

Main is not the current work target. No merge, push, or publishing was performed by this review.

## Verified state

The core game is functional: pack selection, finite/endless cycles, exact resume, shared frame, local fonts/assets, optional audio, workshop, and Pages workflow exist. Thirty Core cards remain production candidates. Dice definitions, per-draw results, migration, and controller integration exist; two dice cards are development-only fixtures. `@3d-dice/dice-box-threejs` is now a dependency used only by the flag-gated prototype; normal production builds still ship React and React DOM only.

Fresh review evidence on 2026-09-20 (all commands rerun at `c392309`):

- `npm test`: **73 passed**. `tests/sound.test.ts` uses a constructible `AudioContext` mock; its cancellation, backgrounding, and sound-disable timer assertions pass.
- `BASE_PATH=/Drink-at-Ron/ npm run build`: passed content validation, TypeScript, PWA build, and budgets — 1948 KiB runtime, 85.5 KiB gzip app JS.
- `CI=1 BASE_PATH=/Drink-at-Ron/ TEST_PORT=4398 npm run test:e2e -- --workers=2`: **47 passed, 3 skipped** across Chromium/WebKit. Skips remain the explicit offline cases; they are not physical iOS evidence.
- `BASE_PATH=/Drink-at-Ron/ npm run test:update`: passed. `npm run test:workshop`: **4 passed** across Chromium/WebKit.
- Direct WebKit workshop inspection: 2:3 ratio measured; two settled d6 dice visibly show depth and three visible faces each. This is desktop WebKit evidence, not physical iOS performance evidence.
- `npm run build:dice-prototype`: succeeded. The lazy `library` chunk is 554.00 kB raw / **144.67 KiB gzip**; the entry stays ~80.5 KiB gzip.
- `npm run measure:dice-prototype`: production `dist` is unchanged and passes (all JS **87,549 B gzip**; runtime 1,994,323 B). Prototype `dist-dice-prototype` is runtime 2,552,092 B (passes 3 MiB) but all app JS **233,234 B gzip** — **exceeds the 120 KiB limit**, entirely from the lazy library chunk. Largest image unchanged at 309,734 B.
- `npm run test:dice-prototype`: **15 passed, 1 skipped** (WebKit offline navigation) across Chromium/WebKit. Rendered top faces matched every requested 2d6 and 1d20 value; startup reported ~47–70 ms; reload and reduced motion restore the static saved result; Escape, resize, WebGL failure, and backgrounding all settle without a reroll and preserve the committed roll. No external network requests were observed.
- Physical-device testing, group playtesting, live Pages settings/deployment, and final dice visual approval remain unverified.

## Review findings to resolve

1. Resolved in `becec5a`: `.study-rules` now lets a stationary tap reach the card, but cancels the click after pointer movement, scrolling, or cancellation. The cross-browser game test covers drag/scroll, stationary tap, pointer cancellation, and keyboard activation without changing card geometry.
2. Resolved in `d299fed`: the audio test now has a constructible `AudioContext` mock and validates asynchronous impact-timer cleanup. No production audio defect was found.
3. The custom dice renderer's **in-card presentation is no longer the desired product direction**. Do not spend another pass polishing it; the committed full-screen library prototype now implements the intended direction, and the custom renderer remains the production default until a selection is approved.
4. Resolved 2026-09-20: the release budget is now tiered by load path — initial (critical-path) JS ≤ 100 KiB gzip and lazy feature JS ≤ 200 KiB gzip, plus runtime ≤ 3 MiB and image ≤ 500 KiB. See **Release budgets**. The single all-JS figure was measuring unrelated costs together; library package unpacked size is not a measurement of the delivered build.

## Approved product constraints

- Original painted fantasy tavern: walnut, worn bronze, teal leather, parchment, Grenze. Rich collectible-card craftsmanship, goofy original characters; no copied franchise characters/assets.
- Keep the approved continuous frame, generous phone edge clearance, and a constant **2:3 outer ratio**. Front/back/Previous Card must agree. Preserve readable text and scroll access when content is long; ordinary stationary taps still work.
- Keep current ordinary card flip/discard architecture. No new animation framework for ordinary cards.
- Pure engine owns outcomes. A roll is saved exactly once before animation; the renderer displays predetermined faces. Returning from a roll shows its total and resolved instruction; only a subsequent action discards.
- Keep session schema v2, v1 migration, stable storage key, pack behavior, shuffle randomness, and existing snapshots. Rendering changes should not require another schema migration.
- No production promotion of dice fixtures until the user approves the full-screen study. No additional mechanics, backend, accounts, or content editor.

## Release budgets (approved 2026-09-20)

`scripts/check-budget.ts` enforces the production build (`dist`) against tiered limits that match how the app loads:

- **Initial (critical-path) JS ≤ 100 KiB gzip** — the chunks referenced by `dist/index.html`. Current ~80.7 KiB.
- **Lazy feature JS ≤ 200 KiB gzip** — every other JS file in `dist/assets`, fetched on demand. Current ~4.9 KiB; the dice library prototype adds ~144.7 KiB, still inside this tier.
- **Runtime/precache ≤ 3 MiB** — current ~1.9 MiB; prototype ~2.55 MiB.
- **Any single image ≤ 500 KiB.**
- Developer workshop strings must not appear in production.

Heavy optional features belong in lazy chunks and are judged against the lazy tier, never the initial tier. Do not raise these limits without user approval; report the measured delta first. The prototype measurement script (`scripts/measure-dice-prototype.ts`) reports the same split for `dist` and `dist-dice-prototype`.

## Corrected dice direction — full-screen, library-first

User clarification, 2026-09-20: dice should roll across the screen, in the spirit of a tabletop roll overlay, **not inside the card's illustration window**. BG3/Roll20 are interaction references, not sources of copied UI or assets.

Required flow:

1. Reveal relevant card, then present a bold ROLL control in a screen-level overlay. Dim the game behind it. Show the current rule as accessible, readable real text in a quiet parchment area; never bury it under dice.
2. Tap ROLL once. Roll large dice across the viewport's available stage, with physical-looking tumble/contact/shadows. Use the full screen as the overlay boundary, excluding safe areas and the readable rules area from the dice collision/landing region.
3. Settle with individual values and total. Keep result visible until tapped. No automatic discard or reroll.
4. Tap to close the overlay and return to the unchanged 2:3 card. Show the total and resolved instruction on its parchment. The next normal card action discards.

Mount the overlay at the application root or through a portal, outside card transforms and clipping. Use the existing presentation controller and persisted result. Separate overlay input/focus from the underlying card; no click-through or scroll-triggered actions. Restore focus on close. Support resize, safe areas, landscape, reduced motion, keyboard/screen reader, backgrounding, and cancellation. Reload mid-roll shows the saved settled result. Animation/load failure falls back to readable static results and never blocks gameplay.

### Library decision

**The bounded library prototype is implemented and committed** (`c392309`), using the preferred first candidate `@3d-dice/dice-box-threejs` (Three.js + Cannon ES), not another custom dice engine. Its official README documents predetermined results, such as `2d6@3,5`, which fits the existing engine-owned outcomes:
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
- Preserve existing release budget checks during the experiment. If the candidate exceeds them, report the measured delta and propose a specific revised limit before changing policy. A documented budget adjustment may be preferable to maintaining custom physics/rendering — now approved as the tiered **Release budgets** above.
- Present the running prototype and evidence for visual/technical selection. Do not silently abandon the library or rewrite geometry if it has a blocker; report the blocker and options.

**Prototype result:** every acceptance check passes under the approved tiered budget — the library loads lazily (~144.7 KiB gzip) inside the 200 KiB lazy ceiling and leaves the ~80.7 KiB initial tier untouched; runtime and largest-image limits also pass. The prototype stays flag-gated and must not become the default until the user approves the visual result and physical-device timing, and until dice content ships. Reproduce with `npm run build:dice-prototype`, `npm run measure:dice-prototype`, and `npm run test:dice-prototype`.

## Execution sequence and model routing

Use one editing agent at a time. Keep tasks bounded and commit verified changes separately.

| Step | Owner | Scope | Done when |
| --- | --- | --- | --- |
| 1 | Terra | Repair untracked sound test; preserve existing WIP | Complete in `d299fed`; 73 unit tests pass. |
| 2 | Terra | Stationary card taps versus rules scrolling | Complete in `becec5a`; cross-browser gesture and keyboard coverage passes without ratio regression. |
| 3 | Sol or comparably capable Cursor model | Full-screen library prototype described above | Implemented as `c392309`: 2d6/1d20 predetermined faces confirmed, 15/1 browser tests, startup ~47–70 ms, and inside the approved lazy budget tier. Pending visual/technical approval and physical-device timing. |
| 4 | Sol | Integrate selected renderer, overlay lifecycle, saves/audio interruption | Existing engine invariants and focused cross-browser flows pass |
| 5 | Terra | Workshop cleanup and approved dice content promotion | Full-screen preview isolated from saves; approved Core composition/IDs; no stale frame comparison |
| 6 | User + Terra | Group playtest and text revisions | 40-card plus Endless evidence recorded; copy locked |
| 7 | Terra + image tool + user | Data-driven art mapping and approved illustration batches | Centered readable art; no per-card component branches; budgets verified |
| 8 | Terra + user | Pages/update/offline and physical-device checks | Automated and physical evidence recorded separately |
| 9 | Sol, then Terra | Focused integration review; authorized release | No release blockers, checked commit, then explicit publishing authorization |

No routine Astra session is required. Escalate to Astra only if Sol's bounded investigation finds an unresolved architectural tradeoff or cannot identify the root cause. Do not use a new tool/model switch as a reason to repeat completed work.

## Portable handoff prompt — next renderer task

> Read AGENTS.md and docs/STATUS.md in this checkout. Continue on codex/finish-v1; inspect git status and preserve uncommitted files. The approved ordinary cards use a shared painted 2:3 frame; the dice engine, persisted results, and v1-to-v2 migration must remain intact. The full-screen library prototype is committed as `c392309` and gated behind `VITE_DICE_PROTOTYPE=1` / dev `?dice=library`; normal builds still use the custom renderer. First show the running prototype (`npm run build:dice-prototype`, then `BASE_PATH=/Drink-at-Ron/ npm run preview -- --outDir dist-dice-prototype --port 4399`) and capture `npm run test:dice-prototype` evidence for visual/technical review. The approved release budget is tiered (initial ≤100 KiB gzip, lazy feature ≤200 KiB gzip); the library fits the lazy tier, so do not treat the old 120 KiB all-JS limit as a blocker. Do not promote the prototype to the default, add a save schema, or replace the presentation without explicit user approval. If the user approves the renderer and physical-device timing, integrate it as the default overlay — reuse `src/game/dice.ts` outcomes and the presentation controller, keep rules readable, prevent click-through, restore focus, bundle assets locally for Pages/offline, and retain the custom renderer only as a documented fallback. Update STATUS in place with the decision and exact next step. Do not merge, push, or publish.

For the routine tasks, assign only the relevant numbered row and its acceptance criteria. Do not ask an agent to “finish the entire application.”

## Verification commands

Use Node 22.12+, an unused test port, and a fresh production server:

```sh
npm test
BASE_PATH=/Drink-at-Ron/ npm run build
CI=1 BASE_PATH=/Drink-at-Ron/ TEST_PORT=4398 npm run test:e2e -- --workers=2
BASE_PATH=/Drink-at-Ron/ npm run test:update
npm run test:workshop
npm run build:dice-prototype
npm run measure:dice-prototype
npm run test:dice-prototype
```

Run focused tests during iteration, then broader affected checks once. After each task, replace stale status statements; record the commit, exact commands/results, remaining issues, and next task. Never call all checks green while an untracked test fails.

## Using another editor or machine

Same Mac: open this repository folder in Codex or Cursor and stay on this branch. The files and Git history are the handoff; no full chat transcript is needed. Explicitly ask the agent to read AGENTS and STATUS rather than assuming editor-specific instruction discovery. Stop the other editing agent first.

Another machine/cloud: a fresh clone will not contain an unpushed branch or untracked files. Preserve and commit intended work first, then explicitly authorize pushing this branch or transfer a Git bundle/local archive that includes the required work. Do not transfer credentials. Check branch, HEAD, and working-tree status before continuing. Development saves are local browser data and do not travel with Git.
