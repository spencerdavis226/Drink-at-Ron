# Current status and execution plan

Updated 2026-09-20. **This is the single current handoff and remaining-work plan**, shared by Codex, Cursor, and other editors. Older conversation plans and historical study notes are background, not the next-task authority. User instructions take precedence. Steps 3 and 4 are complete: the full-screen `@3d-dice/dice-box-threejs` overlay is the default dice renderer, and provisional dice cards ship in their own pack. Remaining: physical-device checks, dice content approval/playtest, and the later art/release steps.

## Branch and checkpoints

Work on `codex/finish-v1`. Last application commit: `e472f3f` (dice renderer promoted to default).

- `2ec82d5`: approved continuous frame promoted to gameplay, Previous Card, and workshop.
- `489d0aa`: preserved dice WIP; no production dice cards.
- `875b932`: repaired dice browser assertions and offline test setup.
- `d9be46f`: restored 2:3 card geometry, margins, and contained rules scrolling.
- `cec9184`: fixed WebKit dice depth using face-level transforms; do not repeat the old flattening investigation without a new reproduction.
- `d299fed`: repaired and committed the dice-audio cancellation fixture.
- `becec5a`: stationary rules taps now discard; moved, scrolled, or cancelled pointer gestures do not.
- `c392309`→`889dd1e`: full-screen library dice prototype, reworked card-forward with projected contact shadows.
- `e472f3f`: overlay promoted to the default renderer; the custom in-card dice renderer retired; provisional `dice` pack added.

Main is not the current work target. No merge, push, or publishing was performed by this review.

## Verified state

The core game is functional: pack selection, finite/endless cycles, exact resume, shared frame, local fonts/assets, optional audio, workshop, and Pages workflow exist. Thirty Core cards remain production candidates; two provisional dice cards live in a separate `Dice (provisional)` pack. Dice outcomes, per-draw results, migration, and controller integration exist. `@3d-dice/dice-box-threejs` (Three.js + Cannon ES) is the default dice renderer, lazy-loaded from the play screen, so the initial bundle stays React-only.

Fresh review evidence on 2026-09-20 (all commands rerun at `923613a`):

- `npm test`: **73 passed**.
- `BASE_PATH=/Drink-at-Ron/ npm run build`: passed content validation, TypeScript, PWA build, and tiered budgets — 2519 KiB runtime/precache, 80.9 KiB gzip initial, 146.0 KiB gzip lazy.
- `CI=1 BASE_PATH=/Drink-at-Ron/ TEST_PORT=4398 npm run test:e2e -- --workers=2`: **53 passed, 3 skipped** across Chromium/WebKit, including the dice overlay suite. Skips remain the explicit offline cases; they are not physical iOS evidence.
- `BASE_PATH=/Drink-at-Ron/ npm run test:update`: passed. `npm run test:workshop`: **4 passed** across Chromium/WebKit.
- Roll consistency is now guarded: a test runs 6 rolls per browser and requires every roll to settle, never fall back, and never finish as a weak "plop"; measured durations are 2.3-3.5 s. `data-roll-ms` exposes the duration for diagnostics.
- Reduced motion shows the static result with no dice (accessibility); the dev-only `?force-motion` overrides it for review.
- The user confirmed on a physical device that the dice look and rolls are good after the minimum-throw fix.
- **Deployed 2026-09-20**: GitHub Pages now builds from GitHub Actions; the live site is https://spencerdavis226.github.io/Drink-at-Ron/ (commit `ed41b7a`). Page, manifest, and service worker all respond 200. CI gates the deploy on Chromium unit/e2e/update/workshop; WebKit runs non-blocking because Linux CI WebKit throttles animation/rAF headlessly (a runner limitation, not an app bug).
- Physical-device lag has not been re-measured since; group playtesting, live Pages deployment, and final dice art/copy remain unverified.

## Review findings to resolve

1. Resolved in `becec5a`: `.study-rules` lets a stationary tap reach the card but cancels the click after pointer movement, scrolling, or cancellation.
2. Resolved in `d299fed`: the audio test has a constructible `AudioContext` mock and validates asynchronous impact-timer cleanup.
3. Resolved in `e472f3f`: the custom in-card dice renderer was retired; the full-screen library overlay is now the only dice renderer, matching the approved direction.
4. Resolved 2026-09-20: the release budget is tiered by load path (see **Release budgets**). The earlier single all-JS figure measured unrelated costs together; library package unpacked size is not a measurement of the delivered build.
5. Resolved in `923613a`: the "plops" were the library deriving throw speed from a random offset (near-zero offset = weak toss). A minimum throw speed and spin are now enforced before pre-simulation; the spawn clamp bug (`vector.x` vs `vector.pos.x`) was also fixed. A 6-rolls-per-browser regression test guards it.
6. Reverted: a deterministic CSS-3D renderer (`e086291`) was tried and rejected by the user as a severe visual regression. Do not replace the WebGL renderer without a screenshot-gated comparison the user approves.

## Approved product constraints

- Original painted fantasy tavern: walnut, worn bronze, teal leather, parchment, Grenze. Rich collectible-card craftsmanship, goofy original characters; no copied franchise characters/assets.
- Keep the approved continuous frame, generous phone edge clearance, and a constant **2:3 outer ratio**. Front/back/Previous Card must agree. Preserve readable text and scroll access when content is long; ordinary stationary taps still work.
- Keep current ordinary card flip/discard architecture. No new animation framework for ordinary cards, and no second dice renderer.
- Pure engine owns outcomes. A roll is saved exactly once before animation; the renderer displays predetermined faces. Settling shows the resolved instruction on the card; only a subsequent action discards.
- Keep session schema v2, v1 migration, stable storage key, pack behavior, shuffle randomness, and existing snapshots. Rendering changes should not require another schema migration.
- Dice are approved for the provisional `dice` pack. Do not add dice cards to the validated 30-card Core, or add additional mechanics/backend/accounts/editor, without an explicit content/playtest decision.

## Release budgets (approved 2026-09-20)

`scripts/check-budget.ts` enforces the production build (`dist`) against tiered limits that match how the app loads:

- **Initial (critical-path) JS ≤ 100 KiB gzip** — the chunks referenced by `dist/index.html`. Current ~80.9 KiB.
- **Lazy feature JS ≤ 200 KiB gzip** — every other JS file in `dist/assets`, fetched on demand. Current ~145.8 KiB (the dice library chunk).
- **Runtime/precache ≤ 3 MiB** — current ~2.5 MiB, including the lazy dice chunk and its textures. Still comfortable headroom.
- **Any single image ≤ 500 KiB.**
- Developer workshop strings must not appear in production.

Heavy optional features belong in lazy chunks and are judged against the lazy tier, never the initial tier. Do not raise these limits without user approval; report the measured delta first.

## Dice direction — full-screen, library-first (implemented)

User clarification, 2026-09-20: dice roll across the screen, in the spirit of a tabletop toss, **not inside the card's illustration window**. BG3/Roll20 are interaction references, not sources of copied UI or assets.

Implemented flow:

1. The revealed 2:3 card stays fully visible. There is no dialog and no dimming; the dice tumble on a transparent full-screen stage over the card.
2. One bottom control reads `Roll 2d6` / `Rolling…` / `Continue`; tapping the card works too. Dice enter from the screen edges and carom off invisible walls (~2.3–3.5 s). Gravity and throw are constant; a minimum throw speed and spin guarantee every toss carries instead of plopping.
3. The moment the dice settle, the card's parchment becomes the result: `Rolled N` with the number emphasized plus the resolved instruction. Dice remain until tapped; no auto-discard.
4. Continue returns to the unchanged card (result already shown); the next normal card action discards.

Contact shadows are painted on a 2D canvas beneath the WebGL canvas by projecting each die onto the floor plane, so dice read as grounded without dimming or bundling a second Three copy. Impact clacks are driven by real physics collisions (intensity-scaled, throttled), respect the Effects toggle, and stay silent while backgrounded. Spawn points are clamped inward before the throw is pre-simulated so large dice never clip at the edge; a post-settle flat-snap removes cocked dice. All feel tuning lives in construction options and contact materials — do not change per-body damping/sleep between the library's pre-simulation and its replay, or the forced face will diverge. Reduced motion shows the static result with no dice; `?force-motion` in dev overrides that. Reload mid-roll shows the saved settled result; animation/load failure falls back to readable static results and never blocks gameplay.

### Renderer decision (resolved)

The full-screen overlay (`src/components/FullScreenDice.tsx`, adapter `src/presentation/dice/library.ts`) is the default and only dice renderer. `@3d-dice/dice-box-threejs` supplies predetermined results (e.g. `2d6@3,5`) from `src/game/dice.ts`. The separate Babylon/Ammo `@3d-dice/dice-box` package is not interchangeable. The earlier custom in-card renderer was removed rather than retained. There is no separate prototype build: verify with the standard `npm run build` and `npm run test:e2e`.

Provisional content: `dice.toast` (2d6) and `dice.title` (1d20) in `src/content/catalog.ts`, pack id `dice`, with placeholder artwork and copy.

## Execution sequence and model routing

Use one editing agent at a time. Keep tasks bounded and commit verified changes separately.

| Step | Owner | Scope | Done when |
| --- | --- | --- | --- |
| 1 | Terra | Repair untracked sound test; preserve existing WIP | Complete in `d299fed`; unit tests pass. |
| 2 | Terra | Stationary card taps versus rules scrolling | Complete in `becec5a`; cross-browser gesture and keyboard coverage passes without ratio regression. |
| 3 | Sol | Full-screen library dice prototype | Complete: card-forward, full-screen, contact-shadowed; user approved the visual result. |
| 4 | Sol | Integrate the selected renderer as the default; retire the custom renderer | Complete in `e472f3f`; engine invariants and cross-browser flows pass, dice suite runs in CI. |
| 5 | Terra | Workshop cleanup and dice content copy/art | Numbered dice pack content approved; workshop previews the real overlay or is deliberately scoped; no stale frame comparison. |
| 6 | User + Terra | Group playtest and text revisions | 40-card plus Endless evidence recorded; copy locked. |
| 7 | Terra + image tool + user | Data-driven art mapping and approved illustration batches | Centered readable art; no per-card component branches; budgets verified. |
| 8 | Terra + user | Pages/update/offline and physical-device checks | Automated and physical evidence recorded separately; dice measured on physical iPhone/iPad. |
| 9 | Sol, then Terra | Focused integration review; authorized release | No release blockers, checked commit, then explicit publishing authorization. |

No routine Astra session is required. Escalate to Astra only if Sol's bounded investigation finds an unresolved architectural tradeoff or cannot identify the root cause. Do not use a new tool/model switch as a reason to repeat completed work.

## Portable handoff prompt — next task

> Read AGENTS.md and docs/STATUS.md in this checkout. Continue on codex/finish-v1; inspect git status and preserve uncommitted files. The full-screen `@3d-dice/dice-box-threejs` overlay is the default dice renderer; the engine (`src/game/dice.ts`), persisted results, and v1-to-v2 migration must stay intact, and do not reintroduce a second renderer or change per-body physics between the library's pre-simulation and replay. Provisional dice cards live in the `dice` pack; keep the 30-card Core unchanged. The next task is physical-device verification of the dice (roll feel, frame timing, backgrounding, orientation, reduced motion) plus workshop cleanup and dice copy/art. Update STATUS in place with results and the exact next step. Do not merge, push, or publish without explicit authorization.

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
