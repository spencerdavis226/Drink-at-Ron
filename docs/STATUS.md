# Current status and execution plan

Updated 2026-09-20. **This is the single current handoff and remaining-work plan**, shared by Codex, Cursor, and other editors. Older conversation plans and historical study notes are background, not the next-task authority. User instructions take precedence. Steps 3 and 4 are complete: the dice renderer is a deterministic CSS-3D full-screen overlay (no WebGL, no physics engine), and provisional dice cards ship in their own pack. Remaining: physical-device verification, dice copy/art, and the later playtest/release steps.

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

The core game is functional: pack selection, finite/endless cycles, exact resume, shared frame, local fonts/assets, optional audio, workshop, and Pages workflow exist. Thirty Core cards remain production candidates; two provisional dice cards live in a separate `Dice (provisional)` pack. Dice outcomes, per-draw results, migration, and controller integration exist. Dice render deterministically in CSS 3D (no WebGL, no physics engine), so both the initial and lazy bundles stay tiny.

Fresh review evidence on 2026-09-20 (all commands rerun at `e086291`):

- `npm test`: **73 passed** (includes d6/d20 landing-orientation geometry).
- `BASE_PATH=/Drink-at-Ron/ npm run build`: passed content validation, TypeScript, PWA build, and tiered budgets — 1951 KiB runtime/precache, 80.9 KiB gzip initial, 5.6 KiB gzip lazy.
- `CI=1 BASE_PATH=/Drink-at-Ron/ TEST_PORT=4398 npm run test:e2e -- --workers=2`: **49 passed, 3 skipped** across Chromium/WebKit, including the dice overlay suite. Each die's *visible* face is asserted to equal the engine value in both engines. Skips remain the explicit offline cases; they are not physical iOS evidence.
- `BASE_PATH=/Drink-at-Ron/ npm run test:update`: passed. `npm run test:workshop`: **4 passed** across Chromium/WebKit.
- Reduced motion shows the static result with no dice (accessibility); the dev-only `?force-motion` overrides it for review.
- Physical-device testing, group playtesting, live Pages settings/deployment, and final dice art/copy remain unverified. The dice experience has not been measured on a physical iPhone/iPad since the CSS-3D rewrite.

## Review findings to resolve

1. Resolved in `becec5a`: `.study-rules` lets a stationary tap reach the card but cancels the click after pointer movement, scrolling, or cancellation.
2. Resolved in `d299fed`: the audio test has a constructible `AudioContext` mock and validates asynchronous impact-timer cleanup.
3. Resolved in `e086291`: the WebGL dice library was replaced with a deterministic CSS-3D renderer. The WebGL path caused real-device lag and plops (per-roll context churn, no-reflections material, pre-sim/replay face divergence) and cost ~146 KiB gzip plus an unused physics engine.
4. Resolved 2026-09-20: the release budget is tiered by load path (see **Release budgets**). The earlier single all-JS figure measured unrelated costs together; library package unpacked size is not a measurement of the delivered build.

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
- **Lazy feature JS ≤ 200 KiB gzip** — every other JS file in `dist/assets`, fetched on demand. Current ~5.6 KiB; the CSS-3D dice renderer is tiny.
- **Runtime/precache ≤ 3 MiB** — current ~1.95 MiB. Comfortable headroom now that no WebGL library ships.
- **Any single image ≤ 500 KiB.**
- Developer workshop strings must not appear in production.

Heavy optional features belong in lazy chunks and are judged against the lazy tier, never the initial tier. Do not raise these limits without user approval; report the measured delta first.

## Dice direction — full-screen, deterministic CSS 3D (implemented)

User clarification, 2026-09-20: dice roll across the screen, in the spirit of a tabletop toss, **not inside the card's illustration window**. BG3/Roll20 are interaction references, not sources of copied UI or assets.

Implemented flow:

1. The revealed 2:3 card stays fully visible. There is no dialog and no dimming; the dice tumble on a transparent full-screen stage over the card.
2. One bottom control reads `Roll 2d6` / `Rolling…` / `Continue`; tapping the card works too. Dice enter from the screen edges, tumble over the card, and settle in ~1.9 s via one authored trajectory that blends into the exact landing for each value.
3. The moment the dice settle, the card's parchment becomes the result: `Rolled N` with the number emphasized plus the resolved instruction. Dice remain until tapped; no auto-discard.
4. Continue returns to the unchanged card (result already shown); the next normal card action discards.

Contact shadows are painted per die on a dedicated element that scales and fades with the die's height, so they read as grounded without dimming. The motion is one authored full-screen trajectory per die (enter from an edge, bounce, settle) that blends into the exact landing orientation for its value, so it can never plop weakly or land wrong; no physics engine is involved. Reduced motion shows the static result with no dice; `?force-motion` in dev overrides that. Reload mid-roll shows the saved settled result; if the animation cannot run, the card still shows the result and gameplay is never blocked.

### Renderer decision (resolved)

The renderer is deterministic CSS 3D (`src/components/FullScreenDice.tsx`, `src/presentation/dice/DiceRoll.tsx`, math in `src/presentation/dice/geometry.ts`). It consumes engine-owned values from `src/game/dice.ts` and blends to the exact face for each value. No WebGL, no physics engine, no procedural-texture dependency — which is why it is lean and cannot plop. A commissioned face texture can later drop into the facet material without touching the math. Verify with the standard `npm run build` and `npm run test:e2e`.

Provisional content: `dice.toast` (2d6) and `dice.title` (1d20) in `src/content/catalog.ts`, pack id `dice`, with placeholder artwork and copy.

## Execution sequence and model routing

Use one editing agent at a time. Keep tasks bounded and commit verified changes separately.

| Step | Owner | Scope | Done when |
| --- | --- | --- | --- |
| 1 | Terra | Repair untracked sound test; preserve existing WIP | Complete in `d299fed`; unit tests pass. |
| 2 | Terra | Stationary card taps versus rules scrolling | Complete in `becec5a`; cross-browser gesture and keyboard coverage passes without ratio regression. |
| 3 | Sol | Full-screen library dice prototype | Complete: card-forward, full-screen, contact-shadowed; user approved the visual result. |
| 4 | Sol | Integrate the selected renderer as the default; retire the custom renderer | Complete in `e472f3f`; the WebGL library was later replaced by deterministic CSS 3D in `e086291` (leaner, no context churn). Dice suite runs in CI and asserts visible faces. |
| 5 | Terra | Workshop cleanup and dice content copy/art | Numbered dice pack content approved; workshop previews the real overlay or is deliberately scoped; no stale frame comparison. |
| 6 | User + Terra | Group playtest and text revisions | 40-card plus Endless evidence recorded; copy locked. |
| 7 | Terra + image tool + user | Data-driven art mapping and approved illustration batches | Centered readable art; no per-card component branches; budgets verified. |
| 8 | Terra + user | Pages/update/offline and physical-device checks | Automated and physical evidence recorded separately; dice measured on physical iPhone/iPad. |
| 9 | Sol, then Terra | Focused integration review; authorized release | No release blockers, checked commit, then explicit publishing authorization. |

No routine Astra session is required. Escalate to Astra only if Sol's bounded investigation finds an unresolved architectural tradeoff or cannot identify the root cause. Do not use a new tool/model switch as a reason to repeat completed work.

## Portable handoff prompt — next task

> Read AGENTS.md and docs/STATUS.md in this checkout. Continue on codex/finish-v1; inspect git status and preserve uncommitted files. Dice render deterministically in CSS 3D (`src/components/FullScreenDice.tsx`, `src/presentation/dice/DiceRoll.tsx`, math in `src/presentation/dice/geometry.ts`) from engine-owned values in `src/game/dice.ts`; do not reintroduce WebGL or a physics engine, and keep every die's visible face equal to its value. The engine, persisted results, and v1-to-v2 migration must stay intact. Provisional dice cards live in the `dice` pack; keep the 30-card Core unchanged. The next task is physical-device verification of the dice (roll feel, frame timing, backgrounding, orientation, reduced motion) plus dice copy/art and workshop cleanup. Update STATUS in place with results and the exact next step. Do not merge, push, or publish without explicit authorization.

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
