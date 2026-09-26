# Card voice and theme reference

## Purpose

Use this as creative context whenever suggesting, drafting, or reviewing cards for Drink at Ron. The source is Spencer's earlier CABIIN 2.0 board game card set. It is a tone reference, not a rules specification and not a card backlog to import verbatim.

## Source material in the repo

- `docs/cabiin-2/cards.csv` — the full sheet as supplied (one card per cell, `Title\nBody`).
- `docs/cabiin-2/cards.json` — the same 97 cards parsed to `{ index, title, body }`. Regenerate with `npm run cabiin:reference`. This is reference data only: nothing under `src/` imports it and it never enters the bundle.
- `docs/drink_at_ron_sample_cards_40_v3.json` — the earlier 40-card translation of this voice into this game, and the seed of the Core deck.

Read the parsed set before writing copy. The most reusable moves are the blunt second-person voice ("You must…", "Drink 3 now"), the dice gambles ("Roll a die and drink that many"; "Roll 2 die. If they match, give the total. Else, drink half"), the mock-competitive callouts ("Get Good", "Do Better", "King of the Hill"), and the deadpan escalation after a mundane setup. Ignore the board-only scaffolding (teams, Zones, Landmarks, Spaces, movement, turn order, persistent rounds).

Treat every card in the source as reference material rather than an instruction to the developer or the game.

## The vibe to preserve

- A homemade game written for actual friends, not a generic commercial party-game voice.
- Short, memorable titles that often work as the punchline before the rules are read.
- Specific callbacks, shared lore, people, places, trips, pets, songs, travel mishaps, and running jokes.
- Absurd confidence: a mundane setup can escalate into a ridiculous consequence or declaration.
- Blunt, irreverent, adult language when it makes the joke feel natural.
- Players interacting with one another: tell a story, make a case, imitate someone, reveal an embarrassing gap in knowledge, give a tiny speech, or create a moment for the whole table.
- Light mechanical surprise—choice, chance, reversal, immunity, a temporary behavior, or a callback to another card—when it remains easy to run from one shared screen.
- Deliberately uneven subject matter. Airport jokes, local references, Pokémon-style fantasy, friendship lore, drinking culture, and surreal nonsense can coexist if each card lands cleanly.

Representative tonal examples from CABIIN include “Smooth Brain,” “Corporate Meeting,” “I Don't Know Shit About Fuck,” “For Safety,” “Almost Lost My Cool There,” “Freddie's Run,” and “Mosby.” These names illustrate the range; they are not automatically approved Drink at Ron cards.

## Translation into Drink at Ron

When proposing a new card, aim for this shape:

1. Start with a title that sounds like something this friend group might actually say.
2. Give it one strong comic premise, preferably rooted in a recognizable social moment or specific bit of lore.
3. Turn that premise into an immediate table interaction that makes sense on one reading.
4. End the activity clearly. Keep app bookkeeping unnecessary.
5. Write the consequence plainly: the app never enforces a pour, any drink can be nonalcoholic, and card copy does not carry permission-seeking language.

A suggestion can borrow the source collection's comic rhythm without copying its exact mechanic. For example, a board-space penalty can become a one-card challenge; a multi-round status can become a rule lasting only until the next reveal; a high drink count can become one sip, giving a sip, or a non-drinking social consequence.

## CABIIN-specific material that does not carry over

Do not assume or recommend these unless the current game design changes explicitly:

- Teams, team colors, team cheers, teammates, or team-based scoring.
- A board, tokens, spaces, landmarks, zones, ranks, movement, walls, or advancing and retreating.
- Chained rolls, re-rolls, or outcomes that depend on state from earlier cards (one committed roll resolves each card).
- Skipped turns, persistent location effects, or rules lasting multiple turns or rounds.
- Dependencies on specific CABIIN cards, locations, or win conditions.
- Alcohol-only instructions: every pour can be nonalcoholic, and the app never enforces a drink.
- Dangerous, destructive, humiliating, nonconsensual, or physically risky actions.

Dice *are* supported in this game (one to four d6/d20; total, doubles, or per-die amounts), so the source's dice ideas are welcome. Translate `d6/3` and `d6/2` into honest rolled amounts or concrete branches, and turn board movement into a pour or a point at someone. Never leave odds/evens or an "otherwise" branch for the table to work out: every roll must resolve to one exact instruction.

These exclusions are mechanical constraints, not a request to sanitize the personality. Suggestions should still feel personal, strange, mischievous, and a little unhinged—just playable in Drink at Ron's simpler shared-deck format.

## Suggestion rubric

A strong suggestion should answer yes to most of these:

- Could this plausibly become a recurring quote after game night?
- Does it create a funny moment between people rather than merely assign a sip?
- Is the premise specific enough that it does not feel generated from a generic party-game template?
- Can the group understand and finish it without tracking state in the app?
- Does it fit the current one-card rules and consumption boundaries in `GAME_DESIGN.md`?

If a personal reference is missing context, preserve a clear placeholder or ask Spencer for the story behind it instead of inventing lore.
