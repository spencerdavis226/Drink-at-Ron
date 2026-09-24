# Playtest record and session kit

Status: **prepared, no results recorded.** Kit prepared 2026-09-21 at commit `3e7a0d9`. This file is the human-gate record for task 8; the card sheet below is generated from the built catalog and will drift if content changes — regenerate it when the set changes.

## How to run

- Two sessions, ideally one group. Session A is Short (30 cards) with Core. Session B is Infinite through at least two complete cycles.
- Dice cards are mixed into `The house collection` (14 of the 40 carry a roll), so any game can reach a roll — there is no separate dice pack to select.
- Use the game without coaching beyond choosing a first drawer and clockwise turns. Record confusion rather than steering players to the intended answer.
- After each session ask: which cards would you remove, which do you want more of, and was the next action ever unclear?
- Keep automation results separate from these observations. Do not mark a check passed from an emulated screenshot.

## Session A — Short (30, Core)

- Date / build commit:
- Device / OS / Safari or installed Home Screen:
- People / approximate session length:
- Deck: Short, Core only (30 cards from the 40-card pool).

## Session B — Infinite (at least two cycles)

- Date / build commit:
- Device / OS:
- People / approximate session length:
- Note where the shuffle repeats a card across a cycle boundary and whether it felt early.

## Dice and roll checks

- Was tapping the card to roll obvious without coaching on the first dice card? Was tapping it again to return to the resolved rule obvious once the dice settled?
- Did the settled dice ever cover the title or rules so the result was hard to read?
- Did the saved total match the faces you saw? Did returning to the card avoid discarding (the later card action discards)?
- Roll at least 20 times across the session: any lag, frozen canvas, or a roll that would not settle?
- On a platform without WebGL, or with the renderer failing: does the saved result still show and the card tap still work?

## Temporary-rule checks

- For each `rule` card (`core.rulemaster`, `core.no-names`, `core.potty-mouth`, `core.captain-dumbass`, `core.cursed-number`, `core.dice-lord`, and the VIP rule cards): did the rule clearly end at the next reveal, with no app bookkeeping needed?
- Did any rule persist past the next card, or require a reminder of when it stopped?

## Copy and pack decisions (need user approval)

- **`The house collection` name/copy.** Keep, or rename? Description: "The standard 40-card set: quick drinks, group dares, and a few dice rolls."
- **Dice cards.** They currently live inside `The house collection` (no separate dice pack, no dice pack logo). Decide: keep them mixed, or split them into a named dice pack with its own logo and copy. Do not add more dice mechanics by inference.
- **`VIP night` name/copy.** Keep, or rename? The pack mark is `art/packs/vip.svg`.
- **Card wording.** The sample text is supplied as-is, including the crude language. Note any line you want changed; unchanged concepts keep their IDs, unrelated replacements get new IDs. Keep the category distribution until an explicit balance decision.
- **Future art.** The launch card front stays plain parchment inside the approved frame. Discuss any new illustration work separately after copy is locked.

## Observations

Add rows or annotate the sheet below. Mark each card: `fine`, `confusing`, `skipped`, or `remove`.

### The house collection (core, 40)

| ID | Title | Category | Dice | Rule | Notes / proposed change |
| --- | --- | --- | --- | --- | --- |
| `core.house-special` | House Special | sip | — | Drink 3. | |
| `core.bar-tab` | Bar Tab | sip | — | Give 3. | |
| `core.bad-influence` | Bad Influence | sip | — | Pick someone. Both drink 2. | |
| `core.last-call` | Last Call | group | — | Everyone drinks 2. | |
| `core.you-specifically` | Fuck You Specifically | sip | — | Pick someone. They drink 4. | |
| `core.cheap-date` | Cheap Date | group | — | Cheapest drink at the table drinks 3. | |
| `core.baller` | Big Money | group | — | Priciest drink at the table gives 4. | |
| `core.group-project` | Group Project | group | — | Last hand in the air drinks 3. | |
| `core.bad-text` | U Up? | sip | — | Sent a regrettable late-night text? Drink 3. | |
| `core.hr-violation` | HR Violation | sip | — | Hooked up with a coworker? Drink 4. | |
| `core.fake-sick` | Corporate Wellness | sip | — | Faked sick to skip work? Drink 3. | |
| `core.crypto-bro` | Financial Genius | sip | — | Own crypto? Drink 2. Don't? Give 2. | |
| `core.deez-nuts` | Deez Nuts | challenge | — | Get someone with a deez nuts joke. They drink 3. | |
| `core.smooth-brain` | Smooth Brain | challenge | — | Admit something dumb you believed. Drink 2. | |
| `core.would-you` | Would You Though? | group | — | Most likely to text an ex drinks 3. | |
| `core.cheers-idiots` | Cheers, Idiots | group | — | Cheers. Everyone drinks 2. | |
| `core.dice-tax` | Dice Tax | challenge | d6 | Roll d6. Drink half, round up. | |
| `core.give-a-shit` | Give a Shit | challenge | d6 | Roll d6. Give that many. | |
| `core.fuckin-math` | Fuckin' Math | challenge | d6 | Roll d6. Drink 7 minus your roll. | |
| `core.low-roller` | Pathetic | challenge | d6 | Roll d6. 1–2: drink 4. Else give 2. | |
| `core.high-roller` | Big Dick Energy | challenge | d6 | Roll d6. 5–6: give 5. Else drink 2. | |
| `core.same-shit` | Same Shit | challenge | d6 x2 | Roll 2d6. Doubles: give total. Else drink 3. | |
| `core.two-beers-math` | That's Two Beers | challenge | d6 x2 | Roll 2d6. Give the total. | |
| `core.snake-eyes` | Snake Eyes | challenge | d6 x2 | Roll 2d6. Double 1s: drink 6. Else give 3. | |
| `core.lucky-bastard` | Lucky Bastard | challenge | d6 x2 | Roll 2d6. 9+: give 5. Under 9: drink 3. | |
| `core.fuck-around` | Fuck Around & Find Out | challenge | d20 | Roll d20. 1: drink 5. 20: give 8. Else drink 2. | |
| `core.crit-fail` | Critical Failure | challenge | d20 | Roll d20. 1–5: drink 4. 16–20: give 4. | |
| `core.chosen-one` | God's Drunkest Soldier | challenge | d20 | Roll d20. 20: everyone else drinks 3. 1: drink 5. | |
| `core.categories` | Categories | category | — | Pick a category. First repeat or blank drinks 3. | |
| `core.rhyme-time` | Rhyme Time | category | — | Pick a word. First bad rhyme drinks 3. | |
| `core.questions-only` | Questions Only | category | — | Questions only. First statement drinks 3. | |
| `core.name-3` | Name 3 | category | — | Group picks a topic. Name 3 or drink 3. | |
| `core.rock-paper-drink` | Rock Paper Drink | category | — | Challenge someone. Loser drinks 3. | |
| `core.never-have-i` | Never Have I Ever | category | — | Say one. Anyone who has drinks 2. | |
| `core.rulemaster` | Rulemaster | rule | — | Make a rule until next card. Breaker drinks 2. | |
| `core.no-names` | Who the Fuck Are You? | rule | — | Until next card: no names. Slip = drink 2. | |
| `core.potty-mouth` | Church Mode | rule | — | Until next card: no swearing. Slip = drink 2. | |
| `core.captain-dumbass` | Captain Dumbass | rule | — | Until next card: call everyone “Captain.” Slip = drink 2. | |
| `core.cursed-number` | Cursed Number | rule | d6 | Roll d6. That number is banned. Say it = drink 2. | |
| `core.dice-lord` | Dice Lord | rule | d6 | Roll d6. Odd: no pointing. Even: no questions. Slip = drink 2. | |

### VIP night (12)

| ID | Title | Category | Dice | Rule | Notes / proposed change |
| --- | --- | --- | --- | --- | --- |
| `vip.toast` | A toast to the VIP | sip | — | Everyone raises a glass and toasts the VIP by name. The VIP takes one sip, and everyone joins them. | |
| `vip.sidekick` | Choose a sidekick | sip | — | The VIP picks a sidekick until the next card is revealed. They both take one sip now. | |
| `vip.tax` | The VIP tax | sip | — | Even the VIP pays taxes. The VIP takes one sip and names one privilege they would trade away for the night. | |
| `vip.fan-club` | Instant fan club | group | — | Going clockwise, each person shares one reason they are glad the VIP is here. The VIP takes one sip at the end. | |
| `vip.standing-ovation` | Standing ovation | group | — | Everyone gives the VIP a standing ovation. The last person left sitting takes one sip, and the VIP takes one too. | |
| `vip.favors` | Outstanding favors | group | — | Anyone who owes the VIP a favor takes one sip. The VIP takes one sip in happy anticipation. | |
| `vip.gift` | A gift for the VIP | category | — | Name a gift fit for the VIP, going clockwise. No repeats. The first person to repeat or pass takes one sip; the round ends. | |
| `vip.superlatives` | Class superlatives | category | — | Name a superlative the VIP should win, going clockwise. No repeats. The first person to repeat or pass takes one sip; the round ends. | |
| `vip.roast` | The loving roast | challenge | — | Going clockwise, give the VIP one affectionate roast each. The VIP picks the closest hit and takes one sip. | |
| `vip.title` | A title for the VIP | challenge | — | Grant the VIP a ridiculous new title for the night. The VIP accepts it with one sip and uses it in their next sentence. | |
| `vip.excellency` | Your Excellency | rule | — | Until the next card is revealed, address the VIP as Your Excellency. Whoever forgets takes one sip. | |
| `vip.never-alone` | Never drink alone | rule | — | Until the next card is revealed, the VIP never drinks alone: whenever the VIP takes a sip, they choose someone to join them. | |

## Device checks

- Install from Safari, launch from Home Screen, then relaunch offline after assets cache.
- Background while facedown, revealed, and mid-discard; return and verify exact progress.
- Test larger text and reduced motion; try portrait, landscape, and iPad split view.
- Reach a dice card and roll; note whether Roll/Continue is obvious without coaching and whether the settled result is readable.
- Note unintended taps, slow frames, clipped content, and anything hard to read.
- Confirm a new release waits until the game ends before offering Update game.

## Done when

- An observed playtest record exists (this file, filled in).
- Requested revisions survive a retest.
- Copy and pack decisions above are approved by the user.

Engineering work can finish while this human gate remains pending. Do not mark a physical check passed from an emulated screenshot.
