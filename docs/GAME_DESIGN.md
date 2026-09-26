# Drink at Ron — game and content brief

For the intended humor, specificity, and card-writing personality, also use [Card voice and theme reference](CARD_VOICE_REFERENCE.md). It distills the reusable creative direction from Spencer's earlier CABIIN card set without importing that game's board, team, zone, or movement rules.

## Pillars

A shared deck, a lively table, one clear instruction at a time. A reveal should be delightful and a rule should make sense on one reading. No accounts, scorekeeping, timers, or player setup. The app deals cards; the people handle the activity.

## Core editorial direction

Classic party: short drinking prompts, broad group prompts, categories, playful verbal challenges, temporary rules, and dice gambles. Instructions use everyday language. No intimate disclosures or physical dares. Pours are dice-sized — a rolled total is the pour — or small fixed amounts, roughly up to eight; no speed drinking and no mandatory consumption, and players can always pass or use any drink.

Choose anyone to draw first. Pass the device clockwise unless a card names the next drawer. The drawer starts a category or challenge. Complete its activity before dismissing the card. Category rounds end on the first repeat or voluntary pass; no stopwatch or debate about how long someone hesitated. Temporary rules last until the next card is revealed, with explicit consequences in the card text. No rule persists across multiple cards or requires app bookkeeping.

## Current content

The always-included `core` pack is the whole game except VIP night: 40 original sample cards, 65 classic / King's Cup basics (`src/content/classics.ts`), 114 voice/dice expansion cards (`src/content/standard-expansion.ts`), and all 103 nonblank Main rows from the supplied Sheet1 (`src/content/custom.ts`) — **322 cards, 80 of them dice cards**. `VIP night` is the only optional pack, with 16 cards including the four supplied VIP rows. The expansion replaced an earlier set of generic single-sip filler with blunt, specific prompts in the voice of `CARD_VOICE_REFERENCE.md` and the CABIIN 2.0 set (`docs/cabiin-2/cards.json`), letting dice drive most of the amounts. Its 322 cards comprise 55 sip, 57 group, 39 category, 125 challenge, and 46 rule cards. This distribution is an editorial starting point, not validated balance. All cards are equally likely per shuffle cycle; a deck longer than the pool repeats cards only after exhausting it, and the cycle boundary never repeats immediately when the pool has multiple cards. Classic formats and icebreakers informed the prompts; the text is original and adapted to this game's one-card flow. Traditional speed-drinking and forced-consumption rules are not carried over.

The supplied sheet is source material, not gameplay authority. `src/content/custom.ts` uses its 1-based row numbers in stable IDs (`house.sheet-003` through `house.sheet-106`, excluding blank row 75; `vip.sheet-003` through `vip.sheet-006`) and now merges the house rows straight into Core instead of offering them as a separate pack. The Main row headed “Debate” had no description; its released rule is a short, silly debate with a table vote. Repeated headings such as Categories and Call Out remain separate cards because their prompts differ. The transcribed house rows keep a recognizable premise and small single-pour quantities; the dice energy from the source sheet (its `4d6`, `1d20` and `2d6` cards) was carried into the new expansion instead. Review the adapted wording against the source sheet before the group playtest.

Keep one primary instruction. Aim for 90 characters and 18 words; the build flags longer rules and rejects those over 120 characters or 24 words. Specify who starts and when an activity stops where relevant. Avoid prompts that assume knowledge of a particular franchise or demographic makeup. Preserve stable IDs for unchanged concepts. Text revisions affect new sessions only; active sessions keep their snapshot.

## Review gate

Use the workshop to inspect every card at 320px and enlarged text. Play a Short (30) game with a real group, then sample more cards across several sessions. Use automated checks for the full 322-card shuffle cycle; a human need not draw 500 cards to review the deck. Record explanations, passes, unclear endings, and repetition before changing the collection. Do not introduce weights or pacing rules without observed need. Lock copy and IDs before any further content work.
