# Playtest record and session kit

Status: **prepared, no results recorded.** Kit prepared 2026-09-21 at commit `3e7a0d9`. This file is the human-gate record for task 8; the catalog review sheet is generated separately from the live cards.

## How to run

- Two sessions, ideally one group. Session A is Short (30 cards) with Core. Session B is Infinite for another 30–60 cards; use more sessions to cover the deck.
- Dice cards are mixed into `The house collection` (20 of the 250 carry a roll), so any game can reach a roll — there is no separate dice pack to select.
- Use the game without coaching beyond choosing a first drawer and clockwise turns. Record confusion rather than steering players to the intended answer.
- After each session ask: which cards would you remove, which do you want more of, and was the next action ever unclear?
- Keep automation results separate from these observations. Do not mark a check passed from an emulated screenshot.

## Session A — Short (30, Core)

- Date / build commit:
- Device / OS / Safari or installed Home Screen:
- People / approximate session length:
- Deck: Short, Core only (30 cards from the 250-card pool).

## Session B — Infinite (another 30–60 cards)

- Date / build commit:
- Device / OS:
- People / approximate session length:
- Note any repetition or pacing issues; automated engine tests verify cycle exhaustion.

## Dice and roll checks

- Was tapping the card to roll obvious without coaching on the first dice card? Was tapping it again to return to the resolved rule obvious once the dice settled?
- Did the settled dice ever cover the title or rules so the result was hard to read?
- Did the saved total match the faces you saw? Did returning to the card avoid discarding (the later card action discards)?
- Roll at least 20 times across the session: any lag, frozen canvas, or a roll that would not settle?
- On a platform without WebGL, or with the renderer failing: does the saved result still show and the card tap still work?

## Temporary-rule checks

- For each `rule` card encountered: did the rule clearly end at the next reveal, with no app bookkeeping needed?
- Did any rule persist past the next card, or require a reminder of when it stopped?

## Copy and pack decisions (need user approval)

- **`The house collection` name/copy.** Keep, or rename? Description: "The always-on deck: classic give-and-drink prompts, King's Cup rules, group games, and a few dice rolls."
- **Dice cards.** They currently live inside `The house collection` (no separate dice pack, no dice pack logo). Decide: keep them mixed, or split them into a named dice pack with its own logo and copy. Do not add more dice mechanics by inference.
- **`VIP night` name/copy.** Keep, or rename? The pack mark is `art/packs/vip.svg`.
- **Card wording.** The sample text is supplied as-is, including the crude language. Note any line you want changed; unchanged concepts keep their IDs, unrelated replacements get new IDs. Discuss balance after observing the expanded deck; keep IDs stable for copy edits.
- **Future art.** The launch card front stays plain parchment inside the approved frame. Discuss any new illustration work separately after copy is locked.

## Observations

Add rows or annotate the sheet below. Mark each card: `fine`, `confusing`, `skipped`, or `remove`.

Use the generated [card review sheet](CARD_REVIEW.md) or [CSV](card-review.csv) to record per-card observations for all 250 Core and 12 VIP cards. Keep this file for session findings and decisions.

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
