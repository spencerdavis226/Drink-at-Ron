# Current state and implementation plan

Updated 2026-09-20. **Single authoritative handoff for OpenCode Go, Codex, and other editors.** Read `AGENTS.md` first. This replaces the old numbered model-routing plan; historical studies are references, not new work orders. Direct user instructions win.

## Review baseline and scope

- Branch: `codex/finish-v1`; audited HEAD: `333d4e7` (documentation), latest application change `a1bf166` (animation/ambience). Working tree was clean at review start.
- This pass is **review and planning only**. This plan, ART_DIRECTION.md and visual-review evidence are being edited; application fixes below are not implemented. HEAD is preserved, with no commit, merge, push, or deployment by this review.
- Reviewed engine, persistence, catalog/validation, screen components, dice adapter/lifecycle, audio, animation/styles, workshop, asset loading, budgets, CI, tests, and design/release documentation. Inspected current production-test dice screenshots. This is not a new physical-device or group playtest.
- GitHub Pages deployment is recorded in `GITHUB_PAGES.md` at `ed41b7a`. The current remote deployment/settings were not re-verified in this local review; do not assume branch HEAD is live. Earlier STATUS and README statements that publishing had never occurred were stale.

## Assessment

**Keep the architecture. It needs a focused reliability and production-readiness pass, not a rewrite.** Pure transitions, deterministic shuffling, snapshot saves, presentation state, local assets, content validation, and Pages infrastructure are already present. The approved visual direction and dice library are established.

The next investment should be: repair visible/accessibility regressions → close lifecycle/testing gaps → make the workshop trustworthy → make artwork data-driven → playtest and commission art → verify on hardware and release. More decorative effects or another renderer would distract from these needs.

| Area | Current state | Remaining need |
| --- | --- | --- |
| Engine | Finite/endless, unique shuffle cycles, cycle-boundary protection, injected randomness, pack deduplication | Preserve; extend tests only for demonstrated gaps |
| Saves | Schema v2, v1 migration, exact committed outcomes, content snapshots, corrupt/unavailable storage paths | Exercise new UI fixes against saves; no migration needed |
| Dice | One lazy Three/Cannon library adapter, predetermined values, full-screen transparent stage, collision audio, fallback | Cleanup on every exit; verify actual face after snap; stronger failure coverage |
| Cards | Approved shared 2:3 painted frame and scrollable rules | Fix visible live-region text; inspect bottom CTA clearance and long-result access |
| Presentation | Controller guards rapid input and persists before motion; latest animations use transform/opacity | Dialog timing/closing interaction tests; physical frame-time evidence |
| Content | 30 Core candidates + 2 provisional Dice cards; stable IDs, categories, briefs, distinct pack marks | Human playtest, copy approval, final pack naming and individual art |
| Workshop | Dev-only, deterministic, storage-isolated, catalog/layout tests | Real dice preview, real viewport dimensions, remove obsolete study control |
| Release | Pages base path, local fonts/assets, precache, two-build update test, budget enforcement | Narrow WebKit exceptions; capture failures; physical installed/offline checks |
| Documentation | Design, illustration, authoring, device and playtest guides exist | Remove conflicting historical guidance from current instructions |

## Fresh verification at this baseline

- `npm test`: **71 passed**, 6 files. The old 73-test count is stale; audio coverage now has one collision-audio test rather than the older timer cases.
- `BASE_PATH=/Drink-at-Ron/ npm run build`: **passed**, validating 32 cards in 2 packs; TypeScript, PWA and budgets pass. Vite warns about the large lazy library chunk; it is not an initial-load budget failure.
- Built sizes: **2523 KiB runtime**, **81.1 KiB gzip initial JS**, **146.2 KiB gzip lazy JS**. PWA reports 38 precache entries / 2505.21 KiB; the budget script conservatively includes additional runtime files.
- `BASE_PATH=/Drink-at-Ron/ npm run test:update`: **passed**, two builds, active-game update withheld, completed save preserved.
- `npm run test:workshop`: **4 passed**, Chromium/WebKit.
- `CI=1 BASE_PATH=/Drink-at-Ron/ TEST_PORT=4498 npm run test:e2e -- --workers=2`: **53 passed, 3 skipped** across Chromium/WebKit (1.7 minutes). Skips are the explicit WebKit offline cases. No failing automated checks in this review.
- Screenshot evidence: current Chromium d20 result visibly exposes the supposed screen-reader announcement; the bottom Continue control overlaps the lower card region. Source confirms the missing `.sr-only` utility. Fix that first, then remeasure remaining layout issues.
- Physical-device approval of earlier dice feel is recorded by the prior handoff. The latest animation/ambience change has no new measured iPhone/iPad performance evidence. Do not convert the older approval into a claim that the whole release is physically verified.

## Critical visual audit — follow-up, 2026-09-20

The app was run from the production preview on port 4499, not judged from source alone. All 32 card definitions were measured at 320 and 390px; representative states were visually inspected at 320×568, 390×844, 768×1024 and 844×390, plus enlarged text. A WebKit short-front capture was checked against Chromium. Setup, back/front, category/rule, menu, install, Previous Card, completion, recovery, dice and intermediate flip/discard states were inspected. **No physical-device or FPS claim.** Evidence: [before-fix screenshots and metrics](studies/visual-audit-2026-09-20/README.md).

**Art-director verdict:** the back and source materials are strong; the front construction, reading layout and motion composition are not release-quality. Attractive textures cannot compensate for hidden instructions, distorted variants or visible seams. Keep the approved art direction; fix how it is assembled and presented.

| ID / severity | Observed problem | Required response |
| --- | --- | --- |
| V01 / P1 | At 320×568, `core.left` has an 87px rules viewport for 270px content. Only the beginning of the instruction is visible, with no obvious scroll cue. At 390px its rules are 174px high for 210px content. | Reallocate space from art/title/padding before asking the player to scroll. Keep accessible larger text and a graceful scroll fallback. |
| V02 / P1 | Rules areas overflow on 32/32 cards at 320px and 21/32 at 390px; counts include footer/padding, not necessarily clipped instruction text. | Separate paragraph-fit from footer overflow in tests. A structural containment assertion currently passes a visibly incomplete instruction. |
| V03 / P1 | Previous Card has no aspect-ratio ownership. Measured short-card size is 272×449 (0.606 versus required 0.667); long dice result is even taller in its screenshot. | Use the same bounded 2:3 stage contract as gameplay; content must not set outer geometry. Test short and long previous cards. |
| V04 / P1 | At 844×390, the initial landscape viewport contains the header and top of the illustration; title and instructions are below the screen. | A deliberate short-height reading layout, not a portrait layout wider than the screen is tall. See 1A. |
| V05 / P1 | The portrait front has abrupt horizontal joints in both wooden rails at the title/parchment and lower parchment boundary; squared parchment overlaps look pasted on. Visible at ordinary 390px, not only zoomed. | Correct slice/mask/layer assembly; preserve the continuous-frame design. No ornamental ribbon as a patch over broken joins. |
| V06 / P1 | A wide rectangular shadow/glint stays visible behind a narrow turning surface during intermediate flip frames. The physical effect reads as a rotating panel over a stationary slab. | Separate deck shadow from lifted-card shadow; clip/specify highlight in card-local coordinates, coherent thickness, inspect edge-on frames. |
| V07 / P2 | The easing presents the front very early in the 560ms flip; later motion mostly settles. Discard combines leftward translation, twist and fade. The character needs a cohesive motion study, not faster timings alone. | Review progress at 0/25/50/75/100%, choose one motivated turn and one clear discard trajectory; test completion/cancellation before tuning. |
| V08 / P1 | Dice live-region copy is visible above the card; settled dice can cover title/art. The long-result view is vulnerable to CTA overlap. | Task 1; preserve transparent full-screen tossing, prioritize unobstructed result reading at rest. Do not change physics between simulation and replay. |
| V09 / P2 | The pack mark sits in scrolling content and disappears on longer cards. It cannot reliably identify the active pack while playing. | A small dedicated footer mark outside rules scrolling; reserve its area without covering text. |
| V10 / P2 | Unselected Dice pack is so desaturated/dim that it resembles a disabled/unavailable pack. Core name wraps around an inline diamond; tiles show the same tankard. | Distinguish available/unselected from disabled. Give title, pack identity and selection mark stable slots. No helper-copy expansion. |
| V11 / P2 | Dice CTA is smooth gradient chrome unlike the painted controls. Menu panel grain is high contrast behind text; setup/control ornament competes with content. | Reuse existing material treatment, quiet text-bearing surfaces, maintain hierarchy. |
| V12 / P2 | Large gaps between HUD and card at phone/tablet sizes coexist with cramped small-phone rules. Long centered paragraphs form ragged, dense blocks. | Budget the actual viewport and information hierarchy together; center short prompts, consider left-aligning multi-line instructions inside the same parchment. |
| V13 / P2 | `dice-ready-pulse` still animates box-shadow continuously in card-front.css, despite the previous compositor-only claim. | Replace with bounded/opacity-only treatment if needed, honor Atmosphere/Reduced Motion/hidden state; verify computed animations rather than documentation claims. |

The generic tankard on most cards is known placeholder content, not a newly discovered renderer bug. It makes the collection visually repetitive, but commissioning 31 illustrations before fixing the frame/registry would create rework. The approved cheers illustration and card back should remain comparison anchors.

## Non-negotiable contracts

- Preserve branch/HEAD and unrelated work. One task and one editing agent at a time. No auto-merge/push/publish.
- Keep React/TypeScript/Vite, the pure `src/game` engine, session schema v2 plus v1 migration, and `drink-at-ron.session.v1` key.
- Accepted actions persist exactly once before animation. Interruption never rerolls, advances, or loses a card. Previous Card remains read-only.
- Approved shared 2:3 frame, generous edge clearance, readable real Grenze text, contained rules scrolling. Do not grow/stretch the outer frame for long text. Preserve stationary taps versus scroll/drag cancellation.
- Painted walnut/bronze/teal/parchment; Hearthstone-inspired craftsmanship with original, goofy fantasy characters. No copied franchise identities; no new art-direction reset.
- One dice renderer: `@3d-dice/dice-box-threejs@0.0.12`. Keep the card-forward transparent full-screen interaction approved after the earlier dimmed-dialog study. No second CSS/Babylon renderer.
- Do not change per-body damping/sleep between library pre-simulation and replay. Engine values remain authoritative. Rendering failure shows the saved result.
- Keep the 30-card Core unchanged during engineering tasks. Provisional dice content remains in pack `dice` until a separate content decision.
- All runtime assets local and offline/Pages compatible. No new backend, analytics, accounts, marketplace, scoring, timers, player system, or content editor.
- Budgets remain: initial JS ≤100 KiB gzip, lazy JS ≤200 KiB gzip, runtime ≤3 MiB, individual image ≤500 KiB. Changes require user approval.

## Implementation queue for OpenCode Go

Execution order after this visual audit: **1 → 1A → 1B → 2 → 3 → 1C → 1D → 4 → 5 → 6 → 7 → 8 → 9**. The lettered tasks are bounded additions, not an invitation to redesign everything. Work in that order unless a task explicitly allows independence. For each task: inspect the listed files, reproduce the issue, make the smallest coherent change, run targeted checks, update this document with evidence and remaining risks. Do not solve every task in one turn. A failing regression is not permission to remove an assertion or widen a budget.

### 1. P1 — Restore minimal, accessible dice presentation

**Status — DONE (2026-09-20, OpenCode Go).** Files: `src/style.css` (added the visually-hidden `.sr-only` utility), `src/screens/Play.tsx` (settle/restore announcement now includes the resolved instruction), `tests/browser/dice.spec.ts` (asserts `.sr-only` is ≤1px and carries the instruction; asserts Continue does not intersect `.study-rules`; adds a rules-drag test). Commands: `npm test` **71 passed**; `BASE_PATH=/Drink-at-Ron/ npm run build` passed (2523 KiB runtime, 81.0 KiB initial, 146.2 KiB lazy); `CI=1 BASE_PATH=/Drink-at-Ron/ TEST_PORT=4498 npx playwright test tests/browser/dice.spec.ts --workers=2` **19 passed / 1 skipped**. Measured Continue vs `.study-rules` vertical overlap: **0px** at 320×568, 320×700, 390×844. Remaining for 1A (not task 1): the resolved instruction still needs inner scrolling at 320×568 and 390×844 with no overflow affordance, and settled dice can still cover the title/art. No commit, push, or deploy. **Next task: 1A.**

**Evidence:** `src/screens/Play.tsx` renders `.sr-only[role=status]`, but no stylesheet defines `.sr-only`. Production screenshots display that text above the card. Before Continue, the game-card accessible name announces the total/return action but omits the resolved instruction; the card's explicit accessible name can hide its descendant text from assistive technology.

**Files:** `src/style.css`, `src/screens/Play.tsx`, `src/components/Cards.tsx`, `src/components/fullscreen-dice.css`, `tests/browser/dice.spec.ts`.

**Do:**
- Add a proper visually-hidden utility that retains announcements for assistive technology (not display:none/aria-hidden).
- Announce the result and actionable resolved instruction once on settle/restore; keep controls named clearly without duplicate chatter. Preserve visible minimal copy.
- Recheck 320×700, 390×844, 768×1024, 844×390, split view, and enlarged text after hiding the live region. Fix actual CTA/rules overlap with reserved clearance or layout sizing while retaining 2:3 and readable scrolling. Do not blindly shrink fonts or redesign the frame.
- Verify both card tap and Continue: roll → settled result → return → later discard. Confirm scroll does not discard.

**Done when:** live region is visually absent but accessible; every rule/result can be read and scrolled without being permanently hidden by Continue; front/back/Previous Card preserve ratio and margins; screenshots of short/long results plus keyboard and browser assertions pass. VoiceOver verification remains a human gate.

### 1A. P1 — Fix card reading geometry across contexts

**Status — PARTIAL (2026-09-20, OpenCode Go). Independent portrait + Previous Card fixes DONE; landscape composition awaits visual approval.** Files: `src/components/Cards.tsx` (`.study-body` wrapper; pack mark moved out of the scroll area into a `.card-footer`; `data-overflow` affordance state), `src/presentation/card-front.css` (shared card geometry; reallocated art/title/padding to rules; masked overflow fade; Previous Card 2:3; short-height media query), `tests/browser/layout.spec.ts` (new), `tests/workshop/workshop.spec.ts` (pack-mark selector). Measured after change: gameplay ratio **0.673**, Previous Card **0.667** (2:3); at **390×844 and 768×1024** the longest rule, longest title and a temporary-rule card all fit with **no inner scrolling** (`scrollHeight == clientHeight`); at 320×568 the longest rule still scrolls (**recorded exception**) with the bottom fade affordance active; the pack mark is now always visible outside the scroller. Commands: `npm test` **71 passed**; build passed (2525 KiB runtime, 81.2 KiB initial, 146.2 KiB lazy); `TEST_PORT=4498 npm run test:e2e` **61 passed / 3 skipped / 0 flaky**; `test:update` passed; `test:workshop` **4 passed**. **Open user gate:** short-height/landscape composition (option A: compact 2:3 card + side reading area; option B: full card + accessible reading mode) must be approved before implementing — do not ship tiny type or portrait-only offscreen instructions. Not committed. **Next task: 1B** (1C owns V13 `dice-ready-pulse`, V08 dice occlusion, V10–V12 in 1D).

**Findings:** V01–V04, V09, V12. **Files:** card-front/style CSS, Cards, Play, GameDialogs, layout tests.

- Define one 2:3 outer geometry owner shared by gameplay and Previous Card; make the latter independent of title/rule length. Preserve rotation-aware edge clearance.
- Reserve HUD, safe areas and dice controls first. At small portrait heights reduce illustration share and excess padding/title footprint before compromising rule text. Long titles may use two lines; never truncate the actionable rule or shrink it into microcopy.
- Separate the small pack mark from the scrollable rules body. Keep all text accessible through contained scrolling at enlarged settings. Use an unobtrusive overflow affordance (e.g. a restrained edge fade that disappears at the end), not “scroll to read” helper copy.
- Explicitly measure paragraph visibility separately from total scrollHeight. At 390×844 normal text all approved Core instructions should fit without internal scrolling; at 320×568 aim for complete normal rules and record any named exceptions for review. Larger-text scrolling is expected, inaccessible text is not.
- Produce a short-height/landscape comparison before changing composition: compact 2:3 card with a side reading area versus a fully visible card with clearly accessible reading mode. Recommend the side reading area when a full 2:3 card cannot also carry readable 20px text. **This composition needs visual approval; do not implement tiny type or claim portrait-only offscreen instructions are acceptable.** Independent portrait/Previous Card fixes proceed first.

**Acceptance:** screenshots and measurements for short, longest-title, longest-rule, category, temporary-rule, dice result, Previous Card, enlarged text, small phone, iPad and split view. Same ratios in every card context; no double page-and-rules scroll trap; no lost pack identity. Layout tests fail on paragraph/CTA occlusion, not merely outer bounds.

### 1B. P1 — Repair continuous front construction

**Findings:** V05. **Files:** shared frame CSS, frame slicing script/assets if necessary, art-direction guide.

- Reproduce at 1× normal size and 2× inspection. Audit source slice coordinates, rail continuity, masks, layer order, and top/bottom overlap. Current top/bottom pieces and vertically stretched side strips have visibly different joins.
- Preserve the approved silhouette, title plaque, walnut/bronze craft and image window. Prefer one continuous perimeter asset with transparent interior or correctly matched nine-slice sections. Retain corners at natural proportions; extend only intentionally stretchable grain/flat runs.
- Seat the parchment behind the inner frame, eliminating exposed square sheet corners and abrupt rail cuts. Title plaque should read as attached hardware, not a rectangle pasted across unrelated panels.
- Avoid accumulating CSS patches or covering seams with a new ribbon. Only regenerate frame pieces if the source cannot produce a clean construction; show before/after proof before replacing approved artwork.

**Acceptance:** no visible rail discontinuity, doubled corner, hard masking notch or stretched ornament at 320, 390, 768 widths, Previous Card and mid-flip. Current/next artwork, titles and rules stay live text; budgets remain unchanged.

### 1C. P1 — Give the card a coherent physical motion model

**Findings:** V06–V07, V13. **Files:** card transform hierarchy, shared motion manifest/CSS, controller completion bindings.

- Treat deck, lifted card, front/back, edge and contact shadow as distinct intentional layers. A lifted card's shadow changes with its projected shape; the remaining deck may keep its own restrained shadow. Do not rotate only the picture while the lifted-card shadow stays rectangular.
- Attach/clamp the glint to the moving surface. It must not wash over bare tabletop or appear as a stationary bright rectangle at edge-on.
- Review a normal-speed and slowed sequence using the actual front/back artwork. Show turn progression at 0/25/50/75/100%; keep a readable, consistent turn direction and a small believable lift. A simple correct transform is better than extra spring, shake and glow.
- Audit all computed transition/animation durations and their completion owner. Use one approved token per semantic phase; remove obsolete fallback values after verifying effective CSS. Retain exactly-once input/save guards and interrupted-animation recovery.
- Discard should clearly release the old card and expose the next back; fade only as it exits, not as a substitute for motion. No snap, accidental reverse flip or face replacement before discard completion.
- Replace the dice-ready animated box-shadow with a subtle opacity-only accent, or remove it if the Roll control already makes the action obvious. Honor Atmosphere off, Reduced Motion and background suspension.

**Acceptance:** slow-motion frame strip and normal-speed browser recording reviewed in Chromium/WebKit; no backface bleed, duplicate surface, detached highlight or shadow slab; rapid taps/cancel/background still commit exactly once. Physical frame-time verification remains task 6.

### 1D. P2 — Unify secondary screens and control hierarchy

**Findings:** V10–V12. **Files:** Setup, shared UI, GameDialogs, dice CTA styles and theme.

- Keep unselected pack tiles readable and visibly tappable; reserve disabled appearance for unavailable actions. Use existing selected border/check feedback with consistent title/logo/selection alignment. No new pack descriptions permanently crowding setup.
- Reuse painted control surfaces for Roll/Continue instead of adding another smooth gradient style. Maintain thumb reach and focus visibility without covering parchment or footer.
- Quiet panel texture beneath menu/install/recovery text; preserve richer edges. Keep one strongest action per screen. Menu spacing and label baselines should remain consistent when pack names wrap.
- Review Previous Card and dialogs for reachable close/back controls and bounded scroll; avoid a narrow card nested in an oversized decorative frame where it compromises reading.
- Review complete/recovery/install states for the same spacing/type tokens; preserve the understated completion celebration instead of adding confetti/effects by default.

**Acceptance:** before/after screenshots for setup selected/unselected, pause, previous, install, recovery and completion at small phone and iPad. No ambiguous disabled states, busy texture through body text, unreachable controls, or newly introduced helper text. This is a refinement of the approved art direction.

### 2. P1 — Make dice resource cleanup and input audio reliable

**Source-confirmed defects/gaps:** `FullScreenDice` installs timeout/resize/visibility/media listeners before the unsupported-WebGL early return, so that branch never returns cleanup. Its WebGL support probe creates an extra context per roll. Its portal CTA is outside `<main>`'s audio-unlock capture and uses a raw button, so a resumed dice card can be rolled without unlocking effects. Retained settled canvases have no explicit resize/context-loss recovery after roll effect cleanup; reproduce before changing.

**Files:** `src/components/FullScreenDice.tsx`, `src/presentation/dice/library.ts`, `src/app/sound.ts`, `src/main.tsx`, `tests/browser/dice.spec.ts`, `tests/sound.test.ts`.

**Do:**
- Ensure every path removes listeners, timers, canvases and owned GPU resources, including no WebGL, failed import/init/texture load, interrupted initialization, Escape, hidden document, timeout, unmount, and repeated rolls. Prefer one cleanup owner; avoid state updates after unmount.
- Avoid allocating an extra probing WebGL context on each roll, or explicitly release it. Keep real renderer failure handling.
- Unlock audio through either valid input control, with Effects/Ambience/hidden preferences respected. Test a fresh page restored to an unrolled dice card with Effects enabled and clicking only the CTA.
- Handle a settled-stage resize/context loss gracefully with the same saved static result if needed. Never reroll to recover.
- Strengthen adapter verification to compare final rendered upward face values after `snapDiceFlat`, not only the library's returned results array. Keep the adapter's private-library surface isolated and add narrow local types for methods actually used; do not undertake a wholesale vendor rewrite.
- Check whether removed/replaced geometries and factory caches need disposal with evidence from repeated creation/disposal. Profile first; do not claim a measured GPU leak merely from `any` types.

**Done when:** unsupported-WebGL/load failure still allows Continue; no leftover listeners/timers or accumulating owned stages across repeated rolls; saved outcomes never change; valid d6/d20 faces match requested values including min/max; sound unlock/cancel/visibility tests pass. Preserve approved roll feel and physical timing.

### 3. P1 — Restore meaningful Safari regression gates

**Evidence:** `.github/workflows/pages.yml` marks entire WebKit e2e and workshop steps `continue-on-error`. A global WebGL `beforeEach` skip in `tests/browser/dice.spec.ts` skips even static/reduced-motion/failure tests on platforms without WebGL. Artifact upload uses `if: failure()`, which can omit evidence from tolerated WebKit failures. The existing “never a weak plop” check only measures duration; it does not prove travel distance.

**Files:** workflow, Playwright configs, `tests/browser/dice.spec.ts`, `tests/workshop/workshop.spec.ts`.

**Do:**
- Separate hardware-dependent visual-roll checks from mandatory engine/UI/reduced-motion/no-WebGL/fallback tests. Scope WebGL skips only to tests that genuinely require it.
- Reproduce the Linux limitation and document exact failing tests. Make reliable WebKit functionality blocking again; quarantine only specific evidenced runner-dependent tests with a documented retest condition. Do not assume every Safari failure is the runner.
- Upload reports/traces for diagnostic failures even when a narrowly scoped job is informational; expose skipped/failed counts clearly.
- Add only missing meaningful checks from tasks 1–2, lazy-load failure, restored CTA audio, final dice dismissal and Previous Card result preservation. Retain existing tests.
- If retaining a roll-quality test, measure motion/travel or rename its claim to duration/settling. Random timing alone is not an aesthetic test.

**Done when:** no-WebGL CI proves fallback flows; unrelated Safari regressions cannot silently ship; diagnostic failures retain artifacts; `dist` remains the exact artifact tested and uploaded. Remote settings/publishing remain separate authorization.

### 4. P2 — Make the workshop a faithful production preview

**Evidence:** `Workshop.tsx` explicitly passes `overlay={false}`, so dice roll through the controller safety timeout without showing the production overlay. Size presets set only width, not actual viewport height/media conditions. The obsolete “New front study” control remains. Replay resets shuffle RNG but not `diceRandom`, so repeating the same seed need not repeat dice outcomes.

**Files:** `src/workshop/Workshop.tsx`, `src/workshop/session.ts`, workshop CSS/tests, `src/presentation/usePresentation.ts`, `src/components/FullScreenDice.tsx`.

**Do:**
- Remove obsolete approved-versus-study controls and unused study imports after reference audit; preserve source art/history.
- Add a dev-only isolated viewport preview using actual production components and real width/height/media conditions. A bounded same-origin iframe preview is an acceptable approach to contain the existing body portal; never point it at the real saved-game app.
- Restore the real full-screen dice interaction within that viewport. Keep workshop games/preferences isolated and effects deliberately controlled.
- Reset both RNG streams when replaying a seeded session. Keep first-card selection and min/max outcome controls.
- Unify the dev `?force-motion` override with the presentation controller: currently the overlay honors it but `usePresentation` still immediately settles reduced motion. Production must always honor Reduced Motion.

**Done when:** seeded replay repeats outcomes; phone/iPad/landscape previews reflect both dimensions; production overlay is visible and cannot cover editor controls outside its viewport; no writes to actual saves/settings; no workshop code in production; expanded workshop tests pass.

### 5. P2 — Establish one artwork registry before more illustrations

**Evidence:** `Cards.tsx` branches on `core.cheers` and imports its illustration directly, while the catalog still points to the generic artwork. `main.tsx` eagerly imports/preloads every file under presentation/art; adding illustrations there would eagerly decode the whole collection. Current/next preload uses catalog paths and is not the same resolver as rendering.

**Files:** catalog, `Cards.tsx`, `presentation/theme.ts`, `main.tsx`, `scripts/validate-content.ts`, authoring guide.

**Do:**
- Make catalog/registry artwork references determine scene, fallback, and any approved crop/fit metadata. Remove card-ID conditionals from generic CardFace. Preserve compatibility with old saved artwork strings and local paths.
- Use the same resolver for render/validation/preload; load core frame surfaces first and current/next art as needed. Do not keep an eager glob of all future card illustrations.
- Inventory unused runtime legacy surfaces before removing them from preload/precache. Preserve historical source images and compatibility fallbacks.
- Keep validation actionable: missing assets/invalid metadata fail the build; optional runtime art failures remain readable and playable.
- Measure cold initial requests/decode work, initial/lazy JS, total offline bytes and largest images before/after. Distinguish on-demand JS evaluation from service-worker precaching: lazy chunks are still downloaded for offline readiness.

**Done when:** adding one new illustration requires content/assets only, no CardFace edits; old snapshots render/fallback correctly; scene styling and preload agree; budgets pass; no runtime CDN.

**Art capacity warning:** current runtime leaves about **549 KiB** under 3 MiB. At the existing cheers illustration's ~60 KiB, dozens of new illustrations will not fit. Before commissioning the full set, measure an optimized representative batch and propose a concrete size/caching policy for approval. Do not silently raise the limit or drop promised offline coverage.

### 6. P2 — Finish presentation consistency and measure performance

**Files:** shared UI/GameDialogs, theme tokens/CSS, Atmosphere, sound, relevant browser tests.

**Do:**
- Consolidate dialog timing: `EXIT_MS=200`, CSS exit 180ms and entry fallback 220ms are separate from the supposedly shared motion manifest. Ensure close completion/cancellation has a bounded fallback and exiting controls cannot trigger unintended actions.
- Test rapid close/reopen, menu→Previous→Back, End cancel, keyboard focus restoration, and Reduced Motion. Preserve native-dialog focus behavior.
- Evaluate the dice CTA against existing painted controls and reuse their visual treatment where appropriate, keeping its clear 44px+ target and low visible-copy count. No new art direction.
- Profile current flip/discard/deal, a dice roll and idle atmosphere on actual iPhone/iPad. Record device/OS/build, Effects/Ambience/Atmosphere settings, frame-time/stall observations, startup and background behavior. Compare Atmosphere off/on; do not promise 60 fps from desktop tests.
- Optimize measured costs only: unnecessary GPU contexts, synchronous dice pre-simulation, redundant image decode, shadow rendering, paint/layer growth, or audio buffer work if profiles identify them. Do not reduce fidelity/change physics speculatively. Keep no redraw loop after settled dice and suspend hidden decoration/audio.
- Test audio resume rejection and async dispose/resume races, ambience on/off independently of Effects; remove obsolete unused timer scaffolding only after checking tests/references.

**Done when:** shared timings agree, dialog controls/focus are reliable, keyboard/touch targets work, baseline measurements and focused improvements are recorded. If physical hardware isn't available, finish engineering evidence and leave the hardware gate explicitly pending.

### 7. P2 — Reconcile design and contributor documentation

**Evidence:** ART_DIRECTION still contains “pending approval,” older motion durations, and obsolete “grow the card” guidance alongside later approvals. AUTHORING says long rules can grow the frame. README still says no public site exists. These contradictions can cause another agent to undo approved work.

**Files:** README, ART_DIRECTION, AUTHORING, GITHUB_PAGES, DEVICE_CHECKLIST, PLAYTEST; this STATUS remains the only execution plan.

**Do:** put approved current rules first; clearly label historical prompts as historical. Align 2:3/contained scrolling, current dice interaction, motion tokens, local asset workflow, provisional pack status, and actual CI policy. Record deployment history separately from current verified live state. Extend device checklist for dice, no-WebGL fallback, CTA/audio, 20+ rolls, orientation/toolbar resize, installed offline roll, and post-update resume. Do not mark unchecked device items passed.

**Done when:** an agent can read the entry point and guides without finding contradictory instructions; historical rejected dwarf/mouse/CSS dice studies are not interpreted as current direction. This documentation task may proceed after task 1 independently of implementation, but must describe actual code accurately.

### 8. Human gate + bounded Go task — Playtest and finalize copy

Use `GAME_DESIGN.md`, `CARD_VOICE_REFERENCE.md`, `ILLUSTRATION_GUIDELINES.md`, and `PLAYTEST.md`.

- Human session: Core 40 cards and Endless through two cycles; separate mixed Core/Dice session. Record confusing instructions, skipped prompts, temporary-rule expiry, repetition, accidental taps, and whether Roll/Continue is obvious without coaching.
- Go can prepare the session/checklist and summarize observations; it cannot invent playtest results or approve content for the user.
- Revise only approved card text/concepts. Retain IDs when concepts match; give unrelated replacements new IDs. Keep Core category distribution until an explicit balance decision. No timing/scoring/targeting system.
- Obtain decisions on final Dice pack name/composition, its distinct logo, and copy. Do not add more dice mechanics by inference.
- Lock text and illustration briefs before finished art; update AUTHORING examples for the registry from task 5.

**Done when:** observed playtest record exists; requested revisions survive retest; copy/pack decisions are approved. Engineering work can finish while this human gate remains pending.

### 9. Human approval + Go integration — Art batches and release candidate

- Generate/commission a small representative approved batch first: short prompt, category, temporary rule, dice. Center the focal subject, safe crop margins, simple readable silhouettes, original goofy fantasy, same painted material/lighting reference. Keep text and pack marks out of scene images.
- Inspect at actual phone image-window size and iPad, using the trustworthy workshop. Integrate through the registry; compress and remeasure the proposed full-collection budget before scaling to remaining cards.
- Capture setup, facedown, revealed short/long, moving flip/discard, menu, Previous Card, completion, recovery, install/update, and settled dice states. Keep the main UI minimal.
- Run the full release commands below. Confirm Pages base paths, asset/font/license bundling, no external runtime requests, offline play including unvisited dice, updates across two builds, and save compatibility.
- Complete physical iPhone/iPad Safari and Home Screen checklist, VoiceOver/larger text/reduced motion, audio, offline cold relaunch, lock/background, portrait/landscape/split view. Separate a prior “looks good” approval from each measured/checklisted result.
- With explicit authorization only: review intended diff, merge/push/deploy, verify live release ID/manifest/service worker and an installed-client update. Retain a rollback commit and preserve saves.

**Done when:** approved copy/art, recorded group/device evidence, release checks passed, no unresolved high-priority regressions, and authorized deployment verified. Until then call it a playable development build, not a fully polished native-quality release.

## What not to build now

No Redux/state framework, generic plugin system, new animation engine, second renderer, broad CSS rewrite, IndexedDB migration, native wrapper, remote content system or multiplayer. Current scale does not justify them. Do not refactor working shuffle/persistence for style alone. Small typed adapter boundaries, one asset resolver, reliable tests and truthful documentation are the useful framework improvements.

## Verification and handoff rules

```sh
npm test
BASE_PATH=/Drink-at-Ron/ npm run build
CI=1 BASE_PATH=/Drink-at-Ron/ TEST_PORT=4498 npm run test:e2e -- --workers=2
BASE_PATH=/Drink-at-Ron/ npm run test:update
npm run test:workshop
```

Use an unused test port. Build and browser checks must share `/Drink-at-Ron/`; dev/workshop uses `/`. `npm test` runs unit tests only. Update test builds its second artifact in a temporary directory; never substitute a rebuilt untested artifact before deploy. Run focused checks during iteration, then the affected broader checks once. Report every failure/skip, including untracked tests, and explain evidence gaps rather than calling everything green.

For each task, append/replace its status here: files changed, commit if created, commands/results, screenshot evidence, risks, next task. Keep the remaining queue current rather than adding another master plan. Local commits may group one completed task when requested; never overwrite existing work or assume push/deploy authorization.

## Copy/paste starter for OpenCode Go

> Read AGENTS.md and docs/STATUS.md. You implement; the plan in STATUS is the authority. Inspect branch, HEAD and working tree first. Implement **task 1 only: Restore minimal, accessible dice presentation**. Confirm the missing .sr-only style with the existing dice result screenshot or a fresh reproduction. Preserve the approved 2:3 frame, dice library, engine and saved-state contracts. Fix visible live-region text, accessible resolved instructions, and any reproducible CTA/rules clearance issue after that fix. Add focused regression coverage, run the listed relevant checks, and update STATUS with evidence and the next task (1A). Do not proceed to task 1A or task 2, redesign the app, change budgets, merge, push or deploy.

For subsequent work, replace the bold task name/number with the next unfinished task. Same-machine handoff: open this checkout in OpenCode Go, stay on `codex/finish-v1`, and stop other editing agents. On another machine, transfer the intended branch/files first with user-authorized push or archive; local browser saves do not travel with Git.
