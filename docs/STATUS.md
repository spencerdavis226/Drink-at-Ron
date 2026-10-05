# Current state and implementation plan

Updated 2026-10-05. **Single authoritative handoff.** Read `AGENTS.md` first. Older handoffs are in `docs/STATUS_ARCHIVE.md` (reference only). Direct user instructions win.

## Rename to Side Quest (2026-10-05, branch `side-quest-rename`, PR #6, not on `main`)

**Request.** Owner renamed the app from Drink at Ron to Side Quest and wants it comprehensive: app, repo, URL and storage.

**Change.**
- App: manifest `name`/`short_name` "Side Quest", description "The main quest can wait." (`vite.config.ts`); `<title>` and `apple-mobile-web-app-title` (`index.html`); setup wordmark "Side / Quest"; non-quest completion screen gains a "Side quest complete" kicker above "To good company."; Core card New Blood says "First time Side Quest players"; dice colorset label; package name `side-quest`.
- URL: the workflow derives `BASE_PATH` from the repository name (`/${{ github.event.repository.name }}/`), so the build matches wherever Pages serves it, before or after the rename. Docs and local commands use `/side-quest/`.
- Storage: keys are now `side-quest.session.v1` / `side-quest.settings.v1` / `side-quest.card-review.v1`. `migrateStorageKeys` (persistence, called first in `main.tsx`) moves the old `drink-at-ron.*` session and settings once (new key wins; old key removed only after a successful copy); the workshop review reads its old key as a fallback. Covered by `tests/storage-keys.test.ts` and a browser test that resumes a game saved under the old key; the legacy-settings browser test now seeds the old key too.
- Docs: README, AGENTS, CLAUDE files, GITHUB_PAGES, DEVICE_CHECKLIST, card review export.

**Kept on purpose.** `reference/` raw sources (incl. `Drink at Ron - Sheet1.csv`); the supplied House card "Drink at Ron" (`house.sheet-011`, verbatim); history in `STATUS_ARCHIVE.md` and `docs/studies`. Icons, card back and tankard art are unchanged; a Side Quest emblem is a separate art task.

**Consequences.** GitHub redirects the old repository URL for git, but not the Pages URL: `/Drink-at-Ron/` stops serving once renamed. Installed Home Screen copies keep running their cached old build offline and stop updating; remove and re-add from `/side-quest/`. An iOS Home Screen app has its own storage, so a game in progress in an old install does not move to the new one.

**Next.** Owner renames the repo, then merges; reinstall on devices; optional redirect stub at the old path; optional emblem art.

## League immersion, phase 1: tiered ribbons, stage banners, badge case, Hall of Fame (2026-10-05, branch `league-immersion`, not on `main`)

**Request.** Start the immersion roadmap (below) with the items that need no art and no rule change.

**Change.**
- Tiered ribbons: `CardDefinition.ribbonTone` (optional `"pearl" | "violet" | "crimson"`, validated, needs a `ribbon`; gold when absent). Legendaries are pearl, the Elite Four violet, Champions crimson; gym leaders keep the approved gold. The title takes the ribbon's colour (`.study-face.tone-*`). Games saved before this keep gold ribbons (cards are snapshotted).
- Stage banners: `QuestStage.intro` (optional, ≤ 28 characters, display only, never saved): "A Legendary appears", "The Elite Four await", "The Champion awaits". `StageBanner.tsx` sweeps a cloth banner in the stage's tone across the table while the stage's first card is dealt face down (2.6 s, fade only under reduced motion, `pointer-events: none`, `role="status"`). It reappears if the app reloads on that face-down card.
- Badge case: the meter is now a button (disabled while cards move) that opens a dialog titled with the meter label ("Badges"): 8 medal slots with badge and leader names, then each stage with the cards beaten. Picks not yet dealt are never shown.
- Hall of Fame: beating the Champion swaps the completion screen's tankard and toast for "Pokémon League / Hall of Fame." and the same record.
- Engine: `questRecord(session)` derives the run from the save (quest cards in this cycle's order behind the position, capped at the count; finale picks already put aside), so the save format is unchanged. `finaleStage` also returns the stage number.
- Medals are lettered gold discs for now; the painted badges from `docs/art-prompts/pokemon-league.md` §1 replace them when the art exists. Banner art (§4) and the Hall of Fame scene (§5) are likewise optional upgrades.

**Verified.** `npm test` 122 passed (record without spoilers, completion record, tone and intro validation; League stages have intros and tones); typecheck clean; build and budgets passed (88.3 KiB gzip initial, card text not in the initial chunk); full production E2E Chromium 90/90, including new `quest.spec.ts` checks for the pearl banner on the eighth badge, the badge case at 320×568 (names, no spoilers, focus returns to the meter) and the Hall of Fame after a full engine-played run. Screenshots reviewed at 320 and 390 px. Workshop (Chromium) 12/13: `dice-texture.spec.ts` fails identically on `main` ("numeral 7 horizontal centre") with the local fallback Chromium 1194, so it is not from this change. Not verified: WebKit locally (CI runs it), devices, how the banner timing feels at the table.

**Next.** Owner picks the next roadmap item: art drop-in (badges, emblem, banners), region runs, pacing beats, or hardcore.

## League gauntlet: Legendary, Elite Four, Champion (2026-10-05, branch `pokemon-gym-leaders`, PR #4, merged to `main` as e6f7115)

**Request.** After 8 badges: one Legendary, then 4 random Elite Four members from Gens 1–3, then a random Champion. Also: proposals for making the mode more immersive, and image-generation prompts in a Markdown file.

**Change.** A quest's single finale card became ordered stages (`PackQuest.finale: { label, pick, cardIds }[]`). `createSession` snapshots each stage's pool and picks the run's cards at random (`QuestState.stages`, `finale`, `step`); after the goal they are dealt one at a time between deck cards, and putting the last aside ends the game. Replays re-pick. Saves validate the picks against the pools, the stage order, and `discarded = cycle × cards + position + step`. The meter shows the stage: "Legendary" and "Champion" with "VS", "Elite Four 2/4". Content (`pokemon-league.ts`): 8 Legendaries (Articuno, Zapdos, Moltres, Mewtwo, Lugia, Ho-Oh, Latias & Latios, Deoxys; ribbon "Legendary Encounter", catches are rare), 9 Elite Four (Lorelei, Bruno, Agatha, Will, Karen, Sidney, Phoebe, Glacia, Drake; ribbon "Elite Four · <Type>"; Lance is a Champion here and Koga stays a gym leader, so neither repeats), 3 Champions (Blue, Lance, Steven; ribbon "Champion · <Region>"; whole-table fights). `pokemon.league` is retired; Champion IDs are `pokemon.league-champion-*` because `pokemon.champion-lance` is an existing regular-deck card. Catalog 714.

**Fit.** On the production build no gauntlet card overflows at 375×667; at 320×568 most scroll by 16px (the same as gym leaders) after shortening Lugia, Phoebe, Lance and Steven.

**Art prompts.** `docs/art-prompts/pokemon-league.md`: shared style block plus prompts for 24 original badge pins, a badge case, a League mode emblem, three gauntlet banners, a Hall of Fame scene, and an optional League card back (a frame change that needs owner sign-off). Designs are original and only evoke each badge's name.

**Immersion roadmap (proposed, not built).** 1) Stage banners that sweep across the table when the gauntlet and each stage begin. 2) Badge case: tap the meter to see the badges earned and the leaders beaten; a Hall of Fame completion screen for the run. 3) Tiered ribbons: bronze gym, pearl Legendary, violet Elite Four, crimson-and-gold Champion. 4) Region runs: pick Kanto, Johto or Hoenn and face that region's 8 leaders in canonical order, then its own Elite Four and Champion (Mixed stays as today). 5) Hardcore option: a badge only on a win; a lost leader is shuffled back in (needs per-outcome quest progress and won/lost plaques on non-dice leaders). 6) Pokémon Center water break after badge 4, and rival encounters paced between badges. 7) Optional League card back and banner art from the prompts file.

**Verified.** `npm test` 119 passed (quest tests now cover a two-stage finale: random picks per stage, stage order, the meter stage, completion on the last card, tampered picks rejected); typecheck clean; build and budgets passed; full production E2E Chromium 88/88 (`quest.spec.ts` covers the eighth badge opening the gauntlet with the Legendary, a reload mid-gauntlet, and the Elite Four counting 2 of 4 to 3 of 4); workshop 12/12; update flow passed. Not verified: WebKit locally, devices, the gauntlet at the table.

## Gym leaders: 24, League-only, harder, with a ribbon (2026-10-05, branch `pokemon-gym-leaders`, not on `main`)

**Request.** Mark gym leaders on the card in League mode; make every leader a real challenge; take leaders out of the regular Pokémon deck (League only); cover all 24 gym leaders of Gens 1–3.

**Change.** `PackQuest.cardIds`: quest-only cards dealt only in that mode (engine `createSession`, `loaders.ts`, validation, setup card count, workshop preview). New `src/content/pokemon-league.ts` holds the 24 leaders (Kanto: Brock, Misty, Lt. Surge, Erika, Koga, Sabrina, Blaine, Giovanni; Johto: Falkner, Bugsy, Whitney, Morty, Chuck, Jasmine, Pryce, Clair; Hoenn: Roxanne, Brawly, Wattson, Flannery, Norman, Winona, Tate & Liza, Wallace) as `pokemon.gym-*`, and the League finale. The 14 old leader cards (`pokemon.misty`, `chuck`, `pryce`, `clair`, `flannery`, `winona`, `tate-liza`, `brawly`, `norman`, `viridian`, `erika`, `sootopolis`, `bugsy`, `jasmine`) are retired; `pokemon.gym-battle` stays in the regular deck as an ordinary card. The regular Pokémon deck is 120 cards; catalog 695. Difficulty: most battles lose more often than they win (Brock 60% drink 5; Giovanni 50% shot plus 3; Whitney's Rollout up to 10; Lt. Surge and Wattson punish matching dice), feats cost a finished drink on failure, and every leader still earns the badge when put aside. Copy was written for the mode at the owner's request and is not source-sheet text.

**Indicator.** `CardDefinition.ribbon` (optional, ≤ 32 characters, validated): a gold banner over the rules ("Gym Leader · Boulder Badge"), a gilded title, and a one-time shine when the card turns face up. The badge count on the meter pops when it rises. Both respect reduced motion.

**Fit.** Measured every leader on the production build: no overflow at 375×667 or 390×844; at 320×568 the rules scroll by 16px (6px for Pryce), against 6px for plain cards of similar length there (40px for the longest), after compacting the ribbon and shortening Sabrina and Tate & Liza.

**Verified.** `npm test` 118 passed (League test: 24 leaders, ribbons, never in the plain deck, all 24 dealt in League, 8 within 39 draws across 40 seeds); typecheck clean; build and budgets passed; full production E2E Chromium 86 passed plus the count fix in `secondary.spec.ts` (670 cards with every pack in a plain mode), then `secondary` and `quest` specs 10/10; workshop 12/12. `quest.spec.ts` now checks the ribbon text and that it stays inside the card.

**Not verified.** WebKit locally, devices, whether the leaders feel hard but fair at the table.

## Pokémon League mode; House and Cabin share nothing (2026-10-05, on branch `cabin-weekend-pack`, PR #3, not on `main`)

**Request.** Make Pokémon its own mode beside Short/Long/Infinite (forcing the Pokémon pack on, plain modes can still include Pokémon cards). The 8 CABIIN rows of the house sheet belong to Cabin only, not shared.

**Decision (recommended to and accepted from the owner's framing).** A quest is a game mode, not something that warps every game containing the pack. Pokémon League: holds the Pokémon pack on (others can join), no card limit, 8 gyms spread through the first 40 draws, the eighth badge deals the League, and putting the League aside ends the game (runs of about 30 to 40 cards). In Short/Long/Infinite the gym cards are ordinary cards: no meter, no reordering.

**Change.** `PackQuest` gains `mode`, `summary`, `length`; `GameConfig.quest` (pack id; requires the pack selected and `limit: null`); `SessionState.quest` (single, optional; replaces `quests`). Engine: the quest exists only when `config.quest` is set; `paceQuest` spreads `goal` tagged cards through the first `length` draws (new games and replays); the finale completes the game; the "meter starts over" path and `finalesShown` are gone. `parseSession`: quest present iff `config.quest`, completion is "limit reached" or "finale put aside". Setup (`Setup.tsx`): one wide choice per quest pack under the lengths (pack mark, mode, summary); choosing it adds and locks the pack (`PackTile locked`, `aria-disabled`); choosing a length clears it. Preferences persist `choice: "quest"` with `config.quest`. `QuestMeters` became `QuestMeter`.

**House/Cabin.** `custom.ts` now splits the restored sheet: `houseCards` (94) and `cabinSheetCards` (rows 12, 16, 24, 28, 40, 42, 53, 54 as `cabin.maddy-booty`, `cabin.ursaring`, `cabin.wench`, `cabin.no-take-give`, `cabin.first-name-only`, `cabin.pet-that-dog`, `cabin.abra-like-a-slut`, `cabin.whinnie-the-pooh`, wording unchanged). Cabin is 85 cards with no shared IDs; the Cabin loader no longer pulls House. A unit test fails if any card is in two packs.

**Verified.** `npm test` 118 passed; typecheck clean; build and budgets passed (86.1 KiB initial, not capped); full production E2E Chromium 86/87, the one failure being `dice.spec.ts:93`, a pre-existing test bug now fixed (it required a bold amount, but the d20 card's 1 and 20 read "Take a shot."/"Give a shot.", so it failed on about 1 roll in 10; 40/40 after the fix); update flow passed; workshop 12/12; `quest.spec.ts` covers the setup mode (pressed state, locked pack, meter at 0/8, saved config) and that a plain mode with Pokémon has no meter. Screenshot at 320×568: the mode row fits; Play sits just below the fold on that smallest phone, as the setup screen scrolls.

**Not verified.** WebKit locally, devices, the run length at the table.

**Gym spreading kept (owner, 2026-10-05).** Owner asked why gyms are not simply shuffled through the whole deck. By chance alone the 8th of 15 gyms lands near draw 8(N+1)/16: about 68 with Pokémon only (134 cards), 120 with Core added, 342 with all six packs. The 40-draw spread keeps a run night-sized whatever the pack mix; the owner chose to keep it. Alternatives on file: spread through ~30% of the deck capped at 60, or a run-length choice (quick ~25 / normal ~40 / epic ~70) under the mode.

## Leaner tests, no initial-JS cap, eight Pokémon badges (2026-10-05, on branch `cabin-weekend-pack`, PR #3, not on `main`)

**Request.** Remove unnecessary tests and the 100 KiB limit; make the Pokémon quest all 8 badges.

**Budget.** `check-budget.ts` no longer caps initial JS (owner decision); it still reports it (85.9 KiB gzip), keeps the lazy (200 KiB), runtime (3 MiB) and image (500 KiB) limits, and still fails the build if card text reaches the initial chunk. AGENTS.md updated.

**Tests trimmed.** The workshop every-card sweep (5 viewports × every card × normal and enlarged) now runs a 34-card stress set (`tests/workshop/stress-set.ts`: 12 longest rules, 6 longest titles, every choice card, the 3 dice cards with most dice, quest finales, first card of each pack). Title fit checks distinct titles of 12+ characters (152, was 685 per pass); the wide-letter test still covers short titles. The sweep's pack-mark check now expects every pack containing a shared card (Cabin weekend shares House rows; the old single-mark check would have failed since that pack existed) and polls for the marks. The isolation test now snapshots storage after the app has mounted (it raced the app's first settings save). The workshop can preview a quest finale (marks its quest due). Release smoke still runs in Chromium and WebKit: headless Linux WebKit has no WebGL, so the dice-render checks only really run in Chromium. Full E2E and workshop stay manual-only in CI, as before.

**Eight badges.** `pokemon` quest goal 8; League copy "Eight badges!". By chance alone a Short Pokémon-only game would reach 8 gyms 0.5% of the time (Long 33%; with Core mixed in 0% and 1.5%), so `paceQuests` (engine) now moves enough tagged cards into the draws before a finite game's last one; replays are paced too; endless games are untouched. A 30-card game with Pokémon therefore always contains at least 8 gym cards in its first 29 draws.

**Verified.** `npm test` 121 passed (new: pacing in `tests/quest.test.ts`, eight-badge Short game across 40 seeds in `tests/workshop.test.ts`); typecheck clean; build and budgets passed; full production E2E Chromium 86/86; workshop (title fit, stress sweep at 5 viewports, card review, isolation, viewport, overlay) 12/12 twice in about 3.5 min, Chromium. `dice-texture.spec.ts` still fails identically on the baseline build in this container (older Chromium), not run in the timings above.

**Not verified.** WebKit locally (CI runs the release smoke in WebKit), any device, how an 8-gym Short game feels at the table.

## Per-pack card loading, pack quests, Pokémon badge quest (2026-10-05, on branch `cabin-weekend-pack`, PR #3, not on `main`)

**Request.** Owner approved steps 1 to 3 of the suggested order: load each pack's cards separately, ship Most Likely To as plain vote cards (already done), then Feature A (shared progress and a finale) with the Pokémon badge quest as the first user.

**Per-pack loading (replaces the single lazy catalog from the entry below).** The app imports `src/content/manifest.generated.ts` (pack metadata and card IDs only, about 4 KiB gzip), generated by `scripts/pack-manifest.ts` (`npm run content:manifest`, also the first step of `npm run build`; `tests/manifest.test.ts` fails if it is stale). `src/content/loaders.ts` has one dynamic-import loader per pack; `main.tsx` warms the selected packs while setup is open and loads them on Play (synchronously when already warmed, else async with a "Couldn't load the cards" notice on failure). The first render waits for no card text at all, and a resumed game uses its save snapshot. `registry.ts` is gone. `check-budget.ts` now also fails the build if any card's first sentence (case-insensitive) appears in the initial chunk; verified by temporarily importing `likely.ts` into `main.tsx` (build failed: `likely.001`). Initial JS 85.6 KiB gzip, lazy 172.0 KiB (each pack its own chunk, 0.8 to 6.6 KiB).

**Feature A: pack quests.** Types `PackQuest` (pack: label, goal, finaleId), `CardDefinition.quest` (pack id), `QuestState` and optional `SessionState.quests` (no schema version change; saves without it load as before). Engine: `createSession` starts a meter for each selected quest pack whose finale was loaded; putting aside a tagged card adds one; at the goal the finale becomes `currentCard` (dealt between deck cards, no deck position used); putting the finale aside resets the meter and counts it in `shown`; `replaySession` resets. `findCard` and `finalesShown` keep history and the save invariants honest (`discarded = cycle × cards + position + finales shown`). `parseSession` validates quest state (pack selected, counts in range, `due` iff at goal, at most one due, finale not a deck card). `validateCatalog` requires at least `goal` tagged cards and a finale outside `cardIds`. UI: `src/components/QuestMeters.tsx` in the top row's free left slot (pack mark, label, count; gold glow when the finale is in play).

**Pokémon badge quest.** 15 gym cards tagged; goal 4 (a Short Pokémon-only game draws about 3.4 gyms, Long about 6.7; 8 would rarely trigger); finale `pokemon.league` (d20: Champion sweeps / close fight / victory / Hall of Fame). Catalog 685 cards, 684 in the deck pool.

**Tests.** `tests/quest.test.ts` (9: meter start, counting, finale dealing and rolling, reset and repeat, completion on the finale, replay, tampered saves, catalog validation, missing finale); `tests/manifest.test.ts` (3); `tests/browser/quest.spec.ts` (`@release` at 320 and 390 px: meter fills, glows, deals the League, survives reload; plus no meter without a quest pack). Browser specs that read the save right after tapping Play now wait for the play screen first (start can be async).

**Verified.** `npm test` 117 passed; typecheck clean; Pages-path build and budgets passed; full production E2E Chromium only (local `chromium-1194`; WebKit not installed here) 86/86, twice; update flow passed. Screenshots at 320 and 390 px checked by eye: meter fits beside the medallion.

**Not verified.** WebKit, the workshop sweep, any device. Quest balance (goal 4) is untested with people.

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

**Pokémon League immersion (owner wants all of these; 2026-10-05).**
- **Stage banners.** Built in CSS (2026-10-05); painted banner art (§4) is an optional upgrade.
- **Badge case.** Built with lettered medals (2026-10-05); painted badges (§1, §2) pending.
- **Hall of Fame.** Built (2026-10-05); the painted scene (§5) is an optional upgrade.
- **Tiered ribbons.** Built (2026-10-05): pearl, violet, crimson; gym leaders stay gold.
- **Region runs.** Choose Kanto, Johto or Hoenn: that region's 8 leaders in canonical order, then that region's own Elite Four and Champion; today's random mix stays as "Mixed".
- **Hardcore option.** A badge only on a win; a lost leader is shuffled back in. Needs per-outcome quest progress on dice leaders and Won/Lost plaques on feat leaders.
- **Pacing beats.** A Pokémon Center water break after badge 4; rival battles (Blue, Silver, May) paced between badges.
- **League card back.** A special back for gauntlet cards (art §6). Changes the approved frame, so it needs owner sign-off.
- **Mode emblem.** A League mark for the setup button and meter (art §3).

**Suggested order:** per-pack loading (done) → vote pack (done) → A + Pokémon badge quest (done, 2026-10-05) → dungeon crawl (reuses quests; would add a finale at the end of a finite game and loot) → B + rules tray + awards → secret and timer card packs.

**Owner decisions (2026-10-05).** Initial-JS cap removed; workshop sweeps trimmed to a stress set (see the entry at the top).

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

## Update offer survives an early takeover; update check hardened (2026-10-04, pushed as `aeb84dd`; CI run `37244462749` passed and deployed)

**Trigger.** CI run `37212135022` (`10fd5a4`, no app change) failed in `npm run test:update`: `forceUpdate` timed out after 30 s waiting for the second new worker to take over (`scripts/check-update.ts`). The other failure that day (`38e45f8`) was a test race, since fixed: `game.spec.ts:39` sent the reveal and its eight "rapid" taps as two steps, so on a slow runner the flip finished in between and a tap discarded the card (the test then read an empty title from the hidden face). Reproduced exactly by delaying the taps 800 ms; it and the same pattern in `motion.spec.ts` now send reveal and taps in one synchronous burst (24/24 over 6 repeats in Chromium and WebKit). The app was behaving correctly.

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
