# Current state and implementation plan

Updated 2026-10-05. **Single authoritative handoff.** Read `AGENTS.md` first. Older handoffs are in `docs/STATUS_ARCHIVE.md` (reference only). Direct user instructions win.

## Most Likely To pack and lazy card catalog (2026-10-05, on branch `cabin-weekend-pack`, PR #3, not on `main`)

**Request.** A Drunk Stoned or Stupid style pack of 250 standalone "most likely to" vote cards (no Drunk/Stoned/Stupid tagging), researched from public lists; record every pack/mechanic idea from the design discussion (below, "Ideas backlog") for the owner to pick from later.

**Lazy catalog.** Card text had become the bulk of the initial chunk (98.0 of 100 KiB gzip after Cabin weekend). `src/content/catalog.ts` is now a lazy chunk: it installs itself into `src/content/registry.ts` on import; `main.tsx` calls `loadCatalog()` at boot and renders only after it resolves (it is fetched alongside the art the first render already waits for, and is not subject to the 4 s art cap, because there is no fallback without cards). The workshop entry points also await it. `presentation/packs.ts` and `app/persistence.ts` read `catalog()`; `validateCatalog` moved to `src/content/validate.ts` (re-exported from `catalog.ts`). No session schema or storage change. Result: **80.4 KiB initial** + 169.6 KiB lazy gzip (lazy limit 200 KiB; the catalog chunk is 21.1 KiB gzip, so roughly 30 KiB of lazy headroom remains for packs and features).

**Most Likely To.** `src/content/likely.ts`: pack `likely`, 250 `likely.NNN` cards, all `group`, title "Most Likely To", rules "<Prompt>. Point on three: most votes drinks 2." (payout varies on some prompts: 3, a shot, or finish the drink). Prompts are original, grouped as nights out, embarrassing, stoned, spicy, the future, and the group; reviewed against public "most likely to" lists for range (page fetches were blocked by this environment's network policy, so only search snippets were read). Logo `public/art/packs/likely.svg` (game-icons `delapouite/human-target`). Catalog 684 cards, 6 packs.

**Tests.** New unit test for the pack's shape; total 684; `secondary.spec.ts`/`game.spec.ts` expect 6 packs and 684 cards with all selected; `title-fit.spec.ts` timeout 180 s → 360 s for the larger catalog (no assertion changed).

**Verified.** `npm test` 105 passed; typecheck clean; Pages-path build and budgets passed; full production E2E **Chromium only** (local `chromium-1194` via a temporary config; WebKit not installed here) 83/83; update flow passed (same local Chromium); workshop suite minus the every-card sweep: title fit passed (2/2), `dice-texture.spec.ts` fails identically on the baseline build in this container (older Chromium text metrics), 5 others passed.

**Not verified.** WebKit, the every-card workshop sweep, any device, first launch on a slow connection with the extra catalog request (the first render now also waits for the catalog chunk; it is precached by the service worker after the first visit).

**Next.** Owner reviews Cabin weekend and Most Likely To copy; merge PR #3 to deploy. Then pick from the ideas backlog.

## Ideas backlog (2026-10-05, owner to choose; nothing here is approved)

The owner's goal: packs that change how the game plays, not just add cards. Today a pack cannot, because every card must finish on its own and the app keeps no state between cards. The platform features below would let a pack bring a mechanic.

**Platform features (enablers)**
- **A. Shared table progress + finale.** One table-wide meter on screen (badges, rooms cleared, a filling cup) and a forced final card at the end of Short/Long. No player names. Optional session field, so no migration.
- **B. Optional player roster.** Names at setup, skippable. Unlocks whose-turn display, recorded votes, per-player stats, end-of-game awards, classes/roles. Needs a session schema version with migration (v2 + v1 migration must stay working).
- **C. Active rules tray.** Lasting rules stay visible with who drew them and when they expire. Clean with B; with only a player count, expiry by draw count.
- **D. New card types.** Secret cards (hold to peek before passing), timer cards (hidden fuse while the phone is passed), push-your-luck dice (roll again or stop; breaks the one-roll-per-card rule).

**Pack ideas**
- **Most Likely To awards (needs B).** Record each vote; end of game crowns the most-voted per theme (the Drunk Stoned or Stupid payoff). The shipped pack is the standalone version.
- **Pokémon badge quest (needs A).** The table is one trainer; gym cards award badges (x/8); 8 badges unlock the Elite Four, then the Champion as the final card; a Pokémon Center card is a water break. Mostly tagging existing cards.
- **Dungeon crawl / D&D (needs A, later B).** Shared party HP; failed d20 checks cost HP; 0 HP wipes the party (everyone finishes their drink); clearing rooms raises party level (easier rolls); a boss is always the final card; one-use loot (Shield ignores a drink, Potion hands your drink off). With B: classes (Barbarian drinks and gives double, Bard sings to skip, Rogue steals, Cleric gives water). Core already has Nat One/Nat Twenty/Critical Failure/Dungeon Master/Mimic Chest, so plain D&D cards alone would duplicate Core.
- **Paranoia (needs D, secret cards).** A question goes privately to one player, who answers aloud with someone's name; that person can drink 2 to learn the question.
- **Spyfall / Werewolf (needs D).** Everyone peeks at a role once at setup (one spy or werewolf); accusation cards through the game.
- **Assassin / secret missions (needs D).** Private mission per player at the start ("get Ron to say 'literally'"); completing one gives a big pour. Runs in the background of any pack.
- **Hot Potato / Exploding Kittens bomb (needs D, timer).** A bomb card starts a hidden fuse; pass the phone; holder at the boom drinks. Sound only (iOS Safari has no vibration).
- **Push-your-luck dice (needs D).** Farkle / Pass the Pigs / blackjack: roll, bank or roll again; bust drinks the pot.
- **King's Cup cup (needs A).** Each King adds to a shared drink; the 4th King drinks it.
- **Mario Party bonus awards (needs B).** End-of-game awards: most drinks given, most votes, unluckiest roller.
- **Fluxx rule changers (needs C).** Cards that rewrite rules and sit in the tray.
- **Travel/airport pack.** Considered; overlaps House (Spirit Airlines, Never Have I Ever countries) and Cabin weekend.

**Suggested order (not approved):** lazy catalog (done) → vote pack (done) → A + Pokémon badge quest → dungeon crawl → B + rules tray + awards → secret and timer card packs.

## Cabin weekend pack from CABIIN 2.0 (2026-10-05, local only, not committed)

**Request.** Owner asked for a new pack built from as much of the CABIIN 2.0 sheet (`reference/cabiin-2/`, 96 spaces plus the legend) as fits the Drink at Ron rules, with the CABIIN-born Core cards moved into it, and lore-dependent spaces dropped if they don't stand alone.

**Change.** New `src/content/cabin.ts`: pack `cabin`, "Cabin weekend", 77 `cabin.*` cards (22 sip, 11 group, 34 challenge, 18 rule; 19 dice, 2 of them `choice` cards: `cabin.mint-chev`, `cabin.fourth-meal`) plus 8 House rows shared by ID, untouched (`house.sheet-012/016/024/028/040/042/053/054`), 85 in the pack. Logo `public/art/packs/cabin.svg` (game-icons `delapouite/forest-camp`, background removed). Registered last in `catalog.ts`; category motifs in `imprint.ts`.
- **Moved from Core** (old `core.*` IDs retired, recreated as `cabin.*`): Smooth Brain, I Don't Know Shit, That's Two Beers, Samesies, Almost Lost My Cool, What an Idiot, For Safety, It's Gotta Go, Get Good, Fuck You In Particular, Thanos Snap. Three were restored toward the CABIIN wording: Fuck You In Particular is "Roll d6. Drink 10 minus your roll" (was "Pick someone. They drink 6"), Thanos Snap makes the *unpicked* half drink, That's Two Beers is "Give out 24 drinks" (Core's 4d6 version is gone; House `sheet-003` still has 4d6). Core is now 105 cards; saved games keep their snapshot, and retired `core.*` IDs keep the Core mark via the prefix rule in `presentation/packs.ts`.
- **Translation rules used.** Teams became the drawing player or a home-state call-out (Florida, Michigan, Wisconsin, Ohio, Ski Team). Board movement and skipped turns became pours; multi-round effects last until the drawer's next turn. d6/3 and d6−3 are written out per roll. Guess I'll Die uses 2d6 doubles because the engine's `doubles` means *all* dice match (3d6 "any two match" would need an engine change).
- **Left out.** Legend (#45) and Group Effort (board scaffolding); Pipe Bomb, That's My Boyd, Gengar (guess-the-roll); I'm Gonna Cum, Another One, Do Better, Mike Bet (depend on another card); SS Allure, Too Soon O'Conner, Hot Dog Water (need backstory); Abra (covered by the shared House row and the Pokémon pack).
- **Tests and specs.** `tests/workshop.test.ts` Core counts (105; 16/22/9/43/15; 36 dice), total 434, and a new Cabin composition test; `tests/dice.test.ts` choice-card list; `dice.spec.ts` four-dice test now sources `house.sheet-003`; `secondary.spec.ts` and `game.spec.ts` expect 5 packs, 434 cards with all selected, 207 for Core + House. Counts updated in AGENTS.md, CLAUDE.md, README, GAME_DESIGN, AUTHORING, PLAYTEST, DEVICE_CHECKLIST, `src/content/CLAUDE.md`. `npm run cards:review` regenerated.

**Verified.** `npm test` 104 passed; typecheck clean; no Cabin card hits the long-copy review flag; Pages-path build and budgets passed (2624 KiB runtime; **98.0 KiB of 100 KiB initial gzip**, card data is in the initial chunk, so roughly one more pack this size would breach it); full production E2E in **Chromium only** (pre-installed `chromium-1194` through a temporary config, because the pinned Playwright wants `1243` and WebKit is not installed in this container): 82 passed, 1 failed under load (`dice.spec.ts:93`) that then passed 3/3 isolated. Two `game.spec.ts` keyboard tests (`:220`, `:620`) failed intermittently in this container and fail identically on the untouched baseline build. Workshop `title-fit.spec.ts` passed (Chromium).

**Not verified.** WebKit; the update flow; the full workshop sweep; any device. Card copy has not been reviewed by the owner or played.

**Next.** Owner reviews the Cabin cards (`docs/CARD_REVIEW.md`, pack `cabin`), then commit and push to `main` on approval (push deploys).

## Update offer survives an early takeover; update check hardened (2026-10-04, committed locally, not pushed)

**Trigger.** CI run `37212135022` (`10fd5a4`, no app change) failed in `npm run test:update`: `forceUpdate` timed out after 30 s waiting for the second new worker to take over (`scripts/check-update.ts`). The other failure that day (`38e45f8`) was unrelated: a WebKit release-smoke `toHaveText` timeout in `game.spec.ts`, not looked into.

**Found.** The CI timeout itself was not reproduced (8 old-script runs under 8x and 20x CPU throttling and with a forced in-flight update check all passed), so its exact cause is unproven. Probing it did expose a real app bug: when a new release's worker takes control before the app has mounted (the first render is held for its art) or before the update hook is listening, the takeover went unnoticed and Update game was never offered that session. A probe that swaps the build while the reloaded page is still loading, at 8x CPU throttle, failed 4 of 5 runs before the fix and passed 5 of 5 after it.

**Change.** `src/main.tsx` listens for `controllerchange` at module load (ignoring the first install) and sets the Update game offer from it; the existing `onNeedReload` path is unchanged, and an active game is still never reloaded. `scripts/check-update.ts` now records the controlling worker before the next build is served and waits for a different controller, instead of attaching a `controllerchange` listener after the swap; it retries `registration.update()` every 3 s within the same 30 s budget; and `settled` waits for the table to exist.

**Verified.** `npm test` 103 passed; typecheck clean; build and budgets passed (94.9 KiB initial gzip); release smoke 34/34; update flow passed 5 consecutive local runs. **Not verified:** that CI no longer flakes (needs runs on GitHub), and the early-takeover case on a real installed iPhone. The probe was a temporary script and is not part of the suite, because it depends on CPU throttling to hit the window.

## Review pass: pack marks, play-screen furniture, tablet card, cleanup (2026-10-04, committed locally as `1d64f5c` plus a docs commit, not pushed)

**Request.** Review the app, then implement the findings plus three owner requests: a cleaner pack selector with no prose, a less cheap top area on the play screen, and a much larger card on iPad (it is read from across a coffee table). The owner wants text kept to a minimum everywhere.

**Pack marks.** Each pack now has exactly one single-colour silhouette, `public/art/packs/<id>.svg` (the former `*-seal.svg` files; the coloured logos are gone). `PackLogo` paints it as a CSS mask: gilded on Setup, the pack dialog and the pause menu, debossed in a card footer. A new pack needs one SVG and matches automatically. Pack tiles lead with the pack's mark (no tankard art). `setupHint` is removed from the type, both packs, validation and tests. The Setup row shows the selected marks plus the card count, which can no longer be clipped. The pause menu's pack legend is a row of marks.

**Play-screen top row.** The wordmark is gone during play. The counter is a brass medallion and the menu a matching stud, both cut from `public/art/bezel.webp` (previously shipped but unused), sharing one row in `main.tsx`'s header; `Play.tsx` no longer renders the counter. The menu stud no longer dims on every flip. `dialogs.spec.ts` used to assert the menu did not use the bezel; that expectation was reversed for this request.

**Tablet card.** `.card-stage` ceiling 470px to 760px and `.playing` is `min(100%, 860px)` wide; `--play-chrome` is 112px (138px at `min-width: 700px`). Card text, dice chips, choice plaques, footer marks and corner radius scale past the old caps with `max(px, cqw)` in `card-front.css`, so a 760px card reads like the 470px one enlarged. At 1024x1366 the card is 760 wide with 58px titles and 55px rules.

**Fixes.** End game settles any motion before clearing (it could be ignored during the dice-result reveal). Dialogs close on a tap outside the panel. The dice stage is rebuilt if its WebGL context is lost before the roll or the app returns from the background without one (`FullScreenDice.tsx`). `card-front.webp` (128 KiB, unused) is deleted and dropped from the preload list; legacy card, wordmark and tankard-tile CSS is removed; the italic Grenze face is preloaded. `npm run typecheck` added. `AGENTS.md` branch line corrected.

**Content.** `core.banned-number` is removed: it duplicated `core.cursed-number` (same mechanic, 3 instead of 2). Core is 116 cards and the catalog 368. Saved games keep their own card snapshot, so a game in progress is unaffected. Counts updated in the docs and tests; `docs/CARD_REVIEW.md` and the CSV regenerated.

**Workshop Landscape preset.** It was 844x390, a phone on its side, which the app blocks with the rotate prompt; the every-card sweep failed there on the first card on the previous commit too (a two-line title cannot fit the 220px floor card). The preset is now 1180x820, tablet landscape, which is the landscape people can actually play in.

**Verified (final tree).** `npm test` 103 passed; `npm run typecheck` clean; Pages-path build and budgets passed (2613 KiB runtime, down from 2739; 94.8 KiB initial + 147.9 KiB lazy gzip). Full production E2E, Chromium + emulated WebKit: 163 passed, 3 intentional WebKit offline skips, before the card removal; after it 161 passed and 1 test (both browsers) failed on a stale Core + House total, which then passed with the spec rerun 12/12. Update flow passed on the final build. Workshop suite: 13/13 in Chromium and 13/13 in emulated WebKit, including title fit and the 368-card sweep (normal and enlarged) at Small phone, Large phone, iPad, tablet Landscape and Split view. Seen in the desktop browser pane at 393x760, 375x667 and 1024x1366.

**Not verified.** Any physical device or simulator; the tablet card on a real iPad (legibility at distance, dice size against the larger card, iPad landscape and Split View); the brass top row at table distance; tap-outside dismissal by touch; the dice rebuild after real iOS backgrounding (tested with a synthetic `webglcontextlost` only).

**Next.** Push to `main` when the owner is ready (push deploys; not done). Then the device session in `docs/DEVICE_CHECKLIST.md`: installed-app edges, wake lock, iPad card size and landscape, launch flash, dice after backgrounding. Still open from the 2026-10-03 plan and gated on that session: ambient animation cost (task 5) and startup images (task 6). The playtest in `docs/PLAYTEST.md` has not been run. No lint script exists; adding one means a new ESLint dependency.

## First screen waits for its painted art (2026-10-04, committed and pushed)

**Report.** On a fresh Home Screen install the Play button showed a flat tan bar with odd top and bottom bands instead of the painted plate (owner's iPhone screenshot).

**Cause.** `button.webp` is a CSS `border-image`. The browser only requests it after the stylesheet is parsed and the button exists, and WebKit paints neither a partial nine-piece image nor the border while it is pending, so the gradient fallback showed (its bands were the gradient repeating under the transparent border). An installed app starts with empty storage, so its first launch downloads the art while the service worker precaches 2.7 MiB on the same connection. The file itself is served and precached correctly on Pages (checked 200, 93 KiB). Not established: whether the bar on the phone was a slow load or stayed until relaunch.

**Change.** `src/main.tsx` holds the first render until the first screen's art (`table.webp`, `button.webp`) and the Grenze faces are decoded; a resumed game also waits for every shared surface and the card frame. A 4 s cap falls through to the themed fallbacks. `index.html` preloads `table.webp`, `button.webp`, and `grenze.woff2` so they download alongside the script. `.primary` fallback gradient is now `border-box` (no bands if it is ever seen). `tests/browser/pages.spec.ts` gains an `@release` test that delays the art 1.5 s and asserts no Play button exists until it arrives; `motion.spec.ts` `seed` waits for the now-asynchronous mount.

**Verified.** `npm test` 98 passed; Pages-path build and budgets passed (2739 KiB runtime; 94.5 KiB initial + 147.8 KiB lazy gzip); full production E2E Chromium + emulated WebKit 154 passed, 3 skipped, 1 flaky (`orientation.spec.ts:7` WebKit, then 8/8 in isolation); update flow passed. Another session was editing `src/style.css` and `tests/browser/layout.spec.ts` during these runs. **Not verified:** a physical iPhone or the simulator's installed app.

## Choice cards: do it or roll (2026-10-04, committed and pushed)

**Request.** Cards like "Wear Becca's glasses for a round. Else drink 2d6" always rolled. They now offer the choice on the card.

**Change.** `DiceDefinition.choice?: { skip, roll }` (labels, at most 14 characters, checked by `validateDice`); `choice()` helper in `src/content/author.ts`. Engine: `awaitingChoice` and `skipRoll` in `src/game/engine.ts` (`advance` is unchanged and still refuses an unrolled dice card). Controller: `choose("skip" | "roll")`; `tap()` does nothing while a choice is pending. `parseSession` accepts an unrolled previous or final card only when that card has `dice.choice`. No session schema change, same storage key; games already in progress keep their snapshot and the old behaviour. `Play.tsx` renders two `.card-choice` plaques as siblings of the card button after the flip lands (styles in `card-front.css`); the parchment body shrinks above them, and a tap on the card only pulses them. Six House rows are marked: `house.sheet-004` (roll = "Got pitted", skip = "Take a shot"; its instruction is now "Drink {total} water."), `-008`, `-009`, `-023`, `-042`, `-062`. Sheet wording is untouched. Fixed-number "or drink 4" cards are unchanged.

**Verified.** `npm test` 104 passed (6 new in `tests/dice.test.ts`). Pages-path build and budgets passed (95.0 KiB initial + 147.8 KiB lazy gzip). New `@release` test in `tests/browser/dice.spec.ts` at 390×844 and 375×548, Chromium and WebKit, 4/4: plaques inside the card, at least 48px tall, no rule text under them, card tap inert, skip saves and reloads, roll resolves. `npm run cards:review` regenerated.

**Pre-push review of the whole working tree (same day).** Full production E2E: 158 passed, 3 intentional WebKit offline skips, 1 flaky (`orientation.spec.ts:7`, WebKit, first attempt only). Cause: `PortraitGate` read the orientation at render and attached its listeners in an effect, so a rotation in between was missed; the delayed first render made that window reachable. Fixed by re-checking when the listeners attach (`src/components/PortraitGate.tsx`). After the fix: release smoke 32/32 with no retry, update flow passed. `pages.spec.ts` "first screen waits for its painted art and fonts", recorded below as failing, passed 10/10 on a quiet machine; the earlier failure was host load.

**Not verified.** A physical iPhone or iPad (thumb reach, legibility at table distance), enlarged text with the plaques up, workshop suite.

## Play screen fits a Safari tab (2026-10-04, committed and pushed)

**Report.** iPhone 15 Pro, iOS 27, Safari tab with the two-row bottom toolbar: the card's bottom edge was cut off and the page could be dragged up and down.

**Cause.** The card was only height-fitted inside `@media (min-height: 760px)`. A Safari tab with its toolbar showing is about 650 to 715px tall on a 6.1in iPhone, so the card fell back to width sizing (337×505 at 393 wide) and the play screen came out a few pixels taller than the viewport. Playwright never saw it: every layout test used 844/852 or 568.

**Change.** `src/style.css`: `.card-stage` width is always `min(100% - 8px, (--app-height - --play-chrome) * 2/3, 470px)` with a 220px floor; `--play-chrome` on `.playing` adds up the real padding (safe-area insets included), topbar, counter and gaps instead of a fixed 175px (148px base at `min-width: 700px`). The `min-height: 760px` card rule is gone. `html:has(.playing) { overscroll-behavior: none }` stops rubber-banding on the play screen; Setup still scrolls. `--app-height` is unchanged (`100svh` in a tab, `100lvh` installed). `tests/browser/layout.spec.ts`: new `@release` test checks no page scroll, the card ending above the fold and 2:3 at eight viewports from 375×548 to 820×1050.

**Verified.** Pages-path build and budgets passed. Layout spec 22/22 in Chromium and WebKit. iOS 27.0 simulator (iPhone 17 Pro), Safari tab with the compact toolbar: card back and front fully visible above the toolbar; a vertical drag leaves the page in place. `pages.spec.ts:109` ("first screen waits for its painted art and fonts", from the earlier uncommitted preload work) failed in both browsers at `expect(delivered).toBe(false)`; not investigated here.

**Not verified.** The two-row bottom toolbar from the report (the simulator used the compact one), a physical iPhone, rubber-band behaviour mid-drag, the installed app after this change on a device, `npm test`, full E2E, workshop.

## Installed app is full screen (2026-10-04, committed and pushed)

**Result.** The strip under the installed app and the flat band behind the status bar are not system-owned. They are the page's own background showing where the document is not painted. Fixed in CSS plus one small effect; the wood now covers the whole display in the installed app on the iOS 18.5 and iOS 27.0 iPhone simulators. This supersedes the two sections below ("Wood to the edges", "installed iPhone bottom strip") and the claim that WebKit bug 301994 puts the strip outside the DOM. Screenshots: `docs/evidence/standalone-ios27-{before,after}.jpg`.

**Mechanism (measured, iPhone 16 Pro / 17 Pro simulators, 402×874, top inset 62).** With `viewport-fit=cover` + `black-translucent`, the installed web view is the full 874pt, but WebKit sizes the layout to 812 (`100%`, `svh`, `clientHeight`), i.e. screen minus the top inset. Only `100lvh`/`100vh` report 874. While the document is 812 tall it sits in one of two places, and both show a 62pt flat band of page background: at the top of the screen with the band at the bottom (iOS 18.5 always; iOS 27 on some launches: the "chin"), or one inset down at `scrollY = -62` with the band behind the status bar and the top inset applied twice (iOS 27 on other launches; iOS draws its scroll-edge blur over the band, which is the "frost"). Once the document is 874 tall and at `scrollY = 0`, the page paints the whole screen and there is no frost. A finger drag can otherwise pull the page back to `-62`, where it rests.

| Variation (installed app unless noted) | Measured | Verdict |
| --- | --- | --- |
| Shipped build, iOS 27.0 | `html` 812, wood ends at 812, flat 62pt strip below; other launches: `scrollY -62`, flat band on top, content 62pt low | Reproduces the device screenshot |
| Shipped metas on a probe page, iOS 18.5 | inner 812, `dvh`/`svh`/`100%` 812, `lvh`/`vh` 874; a 1400pt fixed ruler is clipped at 812; strip takes the `body` background colour | Same bug predates iOS 26 |
| Fixed layer `height: 100lvh`, `screen.height`, `bottom: -200px` (document still 812) | Element box reaches 874+, paint still stops at 812 on 18.5 | No effect alone |
| `html { height/min-height: 100lvh }` | 18.5: inner becomes 874, ruler reaches the bottom. 27.0: wood reaches the bottom | Removes the bottom strip |
| Same, plus `scrollTo(0, 0)` on 27.0 | `scrollY 0`, `.app 0..874`, no frost, status bar over wood | Full screen |
| Same, then drag the page down | Scrolls to `-62` and stays | Needs a lock |
| `html, body { overflow: hidden }` + the above | Drag produces no scroll events; stays at 0 | Lock works |
| Web manifest present vs absent (cloned web clips) | Identical geometry | Not a factor |
| Safari tab, iOS 27.0 iPhone and iPad | inner 714 / 1124, `lvh` 754 / 1153; layout unchanged by this work | Tab path untouched |

Not tested: `apple-mobile-web-app-status-bar-style` `default`/`black`, `viewport-fit` absent, manifest `display: fullscreen`/`minimal-ui`, `apple-touch-startup-image`. They were unnecessary once the shipped configuration filled the screen; `default` reportedly trades the bug for an opaque status bar ([jargon-gym PR 181](https://github.com/behnamazimi/jargon-gym/pull/181), 2026-10-04).

**Sources checked 2026-10-04.** [WebKit 301994](https://bugs.webkit.org/show_bug.cgi?id=301994) is still REOPENED (last comments 2026-07-20 to 2026-08-04, reproduces on 26.5.2 and 27 beta). [WebKit 301108](https://bugs.webkit.org/show_bug.cgi?id=301108) is NEW. Other installed apps fix the same gap by sizing to `100lvh`/`100vh` ([ghostly PR 651](https://github.com/MiguelMedeiros/ghostly/pull/651), 2026-09-29; [bunyan PR 3](https://github.com/alieldinHosni/bunyan/pull/3), 2026-09-29). One report found nothing could paint in the strip on a real iPhone on iOS 26.6.1 ([busssss PR 23](https://github.com/tpdbf5509/busssss/pull/23), 2026-09-05); that was not reproduced here, so a physical check is still required.

**Change.** `index.html`: an inline script adds `html.standalone` before first paint when `navigator.standalone` or `(display-mode: standalone)`. `src/style.css`: `--app-height` (`100svh`; `100lvh` when standalone) and `--backdrop-height` (`100dvh`; `100lvh` when standalone) replace the literal units in `.app`, `.playing`, the card-stage width and the two backdrop layers; when standalone, `html` and `body` are `height: 100lvh; overflow: hidden` and `#root` is the scroller (`overflow: hidden auto; overscroll-behavior: none`). `src/presentation/theme.css`: `.atmosphere` uses `--backdrop-height`. `src/main.tsx`: one effect keeps the class in sync and holds `scrollY` at 0 (start, scroll, resize, pageshow, orientationchange, visibilitychange) while standalone. The browser-tab layout, engine, session schema, storage key, card frame, dice and manifest are unchanged. `tests/browser/layout.spec.ts`: the tab edge test now asserts it is not standalone; a new `@release` test poses `navigator.standalone` and checks the document, `#root`, `.app` and both backdrop layers end on the last row, the root cannot scroll, the bottom row is wood, and the 2:3 card still fits.

**Verified.** iOS 27.0 simulator (iPhone 17 Pro), installed app: cold launch, play screen, card flip by tap, background/resume all at `inner 874`, `scrollY 0`, `.app 0..874`. The app installed through Safari from the previous build (service worker + manifest) picked the fix up on its second launch with no reinstall. iOS 18.5 simulator (iPhone 16 Pro): cold launch full screen with the home indicator over wood. `npm test` 98 passed; Pages-path build and budgets passed (2738 KiB runtime; 94.3 KiB initial + 147.8 KiB lazy gzip); layout + pages specs 28/28; release smoke 24/24; update flow passed. Full production E2E on a quiet machine: 150 passed, 3 intentional WebKit offline skips, 1 flaky (`game.spec.ts:607`, the known WebKit menu-focus assertion, passed on retry). An earlier E2E run made while three simulators were booting had 1 failure (`game.spec.ts:204`, Chromium) and 3 flaky; that test then passed 6/6 in isolation. Not run: `npm run test:workshop`.

**Not verified.** A physical iPhone or iPad (simulators are not device evidence; record the result in `docs/DEVICE_CHECKLIST.md`). iPad installed app: the iPad Pro 11 (iOS 27.0) simulator never finished loading web content in the installed app or in Safari's Add to Home Screen dialog, so only its Safari tab was seen. Landscape and rotation in the installed app. Small phones without a notch. Setup content taller than the screen scrolling inside `#root` on a real device.

**Leftovers on this Mac.** The iOS 27.0 simulator runtime (about 7.5 GB) and two simulators, "Ron iOS27" and "Ron iPad27", were added for this work and can be deleted in Xcode. Nothing is committed or pushed. Next task: authorization to commit and deploy, then reopen the installed app on the physical iPhone and iPad and record both edges.

## Wood to the edges (2026-10-03, committed and pushed)

Spencer disliked the top/bottom blur and asked for the wood to run to the edges. Removed the flat top band, bottom fade and firelight mask; the wood now paints edge to edge at `100dvh`. `--chrome`, the page background, `theme-color` and manifest colours changed from `#17100c` to `#271c11`, the measured bottom-edge average of the wood (393×852 and 834×1194), so the iOS-owned strip below the web view matches the last painted row. The strip itself still cannot show texture, and iOS 27's top frost is system-owned and remains. `tests/browser/layout.spec.ts` now averages the last row (±8) and expects no mask. Verified: layout+pages 26/26, release 22/22, update flow, build budgets unchanged. Not verified: the real installed iPhone (strip colour is cached at launch: close and reopen the icon). Capture: `/tmp/ron-wood-edge.png`.

## Review and improvement plan — iOS/iPadOS Home Screen app (2026-10-03)

Read-only review of `main` plus the uncommitted chin-mitigation diff; no source behavior changed. Added `CLAUDE.md` (imports `AGENTS.md`) at the root and in `src/{game,app,content,presentation,presentation/dice,components,screens,workshop}`, `tests`, `scripts`, `docs`, `reference`, `public`, `assets`. Checked: `npm test` 98 passed, `tsc -b` clean. Not run: production build, Playwright, any physical device. Everything below about iOS behavior is unverified until observed on hardware.

**Verified from code (no bug found).** Engine/save invariants and v1 migration, update flow (`autoUpdate` + `onNeedReload`, never reloads mid-game), dice stage disposal (`forceContextLoss`), storage-denied degradation, saved roll validation. Save cost per tap is 27 KB (Core) to 84 KB (all packs) synchronous; acceptable, no action.

**Findings, highest value first.**

1. **Screen can lock mid-game.** Nothing requests a Screen Wake Lock (`grep wakeLock src` is empty). A phone or iPad sitting on a table between card reads will dim and lock on iOS defaults. Saves survive, but it breaks the "native app" feel.
2. **iPad landscape is blocked.** `PortraitGate` treats every iPhone/iPad (including iPadOS reporting as Macintosh with touch) in landscape as blocked. iPads on a table are often landscape. The card is a fixed 2:3, so landscape should simply centre it. This is a product decision as well as a bug; confirm with Spencer before changing.
3. **Install copy omits a data-loss trap.** On iOS the Safari tab and the installed Home Screen app do not share localStorage, so a game started in Safari is not there after installing. Nothing calls `navigator.storage.persist()` either. Tell people to install first, and request persistence where available.
4. **Unresolved installed-app bottom strip.** The local `100dvh` backdrop and firelight fade (uncommitted) still need authorization to commit and a physical recheck. Do not add more speculative CSS if it persists (see the task below).
5. **Always-on ambient animation.** Fire, six embers, eight dust motes and a candle loop for the whole session (`theme.css`), paused only when the page is hidden. Likely battery and heat cost on a table-top device left on for hours; unmeasured.
6. **Possible white launch flash.** No `apple-touch-startup-image`; `index.html` only sets the title, icon and translucent status bar. Whether iOS shows a white frame before the dark UI is unverified.
7. **Short/Long on small packs repeats cards.** Length is a fixed 30/60 cards, but VIP alone has 16, so one "Short" game reshuffles and repeats cards with no hint on Setup. Setup also never shows how many cards the selected packs contain.
8. **Stale/contradictory docs.** `AGENTS.md` still says to preserve branch `codex/finish-v1`; `main` is the only branch. This file is ~725 lines and its header date predates the latest work. `scripts/_temporary-card-edit.mjs` (untracked) overwrites card modules with superseded copy, including the denied `core.deez-nuts`; running it would regress content.
9. **Tooling gaps.** No `typecheck` or lint script (hooks lint would catch effect-dependency mistakes in `FullScreenDice`/`main.tsx`); `npm test` does not type-check. Two near-duplicate cards remain (`core.cursed-number`, `core.banned-number`). `assets/` is ~66 MB of tracked source art.

**Plan.** One task at a time, each ending with updated status and device-checklist items. Nothing here is authorized for commit, push or deploy.

| # | Task | Done when |
| --- | --- | --- |
| 1 | Get authorization to commit the chin mitigation and deploy; recheck on the installed iPhone and record it in `docs/DEVICE_CHECKLIST.md`. | Result recorded, pass or fail. |
| 2 | Wake Lock hook in `src/app` or `src/presentation`: acquire while a game is active, re-acquire on `visibilitychange`, release on complete/setup, silent no-op when unsupported. | Playwright test with a stubbed `navigator.wakeLock`; device check that the screen stays on for 5+ minutes in the installed app. |
| 3 | Install dialog and persistence: warn to install before playing, call `navigator.storage.persist()` when available. | Copy updated; unit/browser test for denied or missing API. |
| 4 | Decide iPad landscape (Spencer's call). If yes, gate only phone-sized landscape and verify card fit at 1180×820, 1366×1024 and Split View. | Orientation specs updated; device check on an iPad. |
| 5 | Measure ambient animation cost with Safari Web Inspector on a real device; if material, pause ambience during dice, dialogs and after idle. | Before/after numbers in this file. |
| 6 | Check for a launch flash on device; if present add startup images for current iPhone/iPad sizes under `public/`, inside the 3 MiB runtime budget. | Cold launch checked on device. |
| 7 | Setup: show pack card counts, and clamp or label Short/Long when the selected packs have fewer cards than the limit. | Unit test on the clamp; Setup layout still passes `@release`. |
| 8 | Hygiene (ask first): fix the `AGENTS.md` branch line, move STATUS history to an archive file, delete the scratch script, add `typecheck`/lint scripts, merge or differentiate the two number-ban cards. | Docs and CI still pass. |

**Progress (2026-10-03, committed and pushed).** Tasks 2, 3, 4 and 7 are implemented; 1, 5, 6 and 8 are open. Per Spencer's "whatever a professional game dev would do": wake lock via `src/app/wakeLock.ts` (`useWakeLock(active)` in `main.tsx`); `requestPersistence()` on start and an Install dialog line saying to install before playing; `PortraitGate` now blocks only landscape with a short side under 600px, so iPad landscape plays (the old "iPad landscape is blocked" test was replaced by a 1180×820 card-fit check); Setup shows the selected packs' card count and a repeat hint when the count is below the 30/60 limit (no clamp; the game itself is unchanged). Verified: `npm test` 98 passed, `tsc` clean, Pages-path build and budgets passed (2737 KiB runtime; 94.2 KiB initial + 147.8 KiB lazy gzip), new wake-lock spec plus orientation/secondary/game specs 49 passed / 2 skipped / 1 flaky (a WebKit menu-focus assertion in game.spec.ts passed on retry; unrelated code), release smoke 22/22, update flow passed. Not verified: real wake lock on iPhone/iPad (needs iOS 16.4+, Home Screen fix 18.4+), iPad landscape at 1366×1024 and Split View, Setup hint layout on a 320px phone.

Gates for every task: `npm test`, `BASE_PATH=/Drink-at-Ron/ npm run build` (budgets unchanged), `npm run test:release` with a unique `TEST_PORT`, and the matching device check.
