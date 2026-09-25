# Drink at Ron — game and content brief

For the intended humor, specificity, and card-writing personality, also use [Card voice and theme reference](CARD_VOICE_REFERENCE.md). It distills the reusable creative direction from Spencer's earlier CABIIN card set without importing that game's board, team, zone, or movement rules.

## Pillars

A shared deck, a lively table, one clear instruction at a time. A reveal should be delightful and a rule should make sense on one reading. No accounts, scorekeeping, timers, or player setup. The app deals cards; the people handle the activity.

## Core editorial direction

Classic party: short drinking prompts, broad group prompts, categories, playful verbal challenges, and temporary rules. Fantasy lives in titles and illustration briefs; instructions use everyday language. No intimate disclosures or physical dares. A sip is the unit; do not introduce escalating quantities, speed drinking, or mandatory consumption. Players can pass or use any drink.

Choose anyone to draw first. Pass the device clockwise unless a card names the next drawer. The drawer starts a category or challenge. Complete its activity before dismissing the card. Category rounds end on the first repeat or voluntary pass; no stopwatch or debate about how long someone hesitated. Temporary rules last until the next card is revealed, with explicit consequences in the card text. No rule persists across multiple cards or requires app bookkeeping.

## Current content

The standard deck is the always-included `core` pack: 40 original sample cards, 65 classic / King's Cup basics (`src/content/classics.ts`), and 145 new prompts (`src/content/standard-expansion.ts`). Its 250 cards comprise 47 sip, 54 group, 41 category, 75 challenge, and 33 rule cards; 20 have dice definitions. `VIP night` adds a 12-card themed pack. This distribution is an editorial starting point, not validated balance. All cards are equally likely per shuffle cycle; a deck longer than the pool repeats cards only after exhausting it, and the cycle boundary never repeats immediately when the pool has multiple cards. Classic formats and icebreakers informed the new prompts; the text is original and adapted to this game's one-card flow. Traditional speed-drinking and forced-consumption rules are not carried over.

Keep one primary instruction. Aim for 120 characters and 24 words; the build flags longer rules and rejects those over 180 characters or 35 words. Specify who starts and when an activity stops where relevant. Avoid prompts that assume knowledge of a particular franchise or demographic makeup. Preserve stable IDs for unchanged concepts. Text revisions affect new sessions only; active sessions keep their snapshot.

## Review gate

Use the workshop to inspect every card at 320px and enlarged text. Play a Short (30) game with a real group, then sample more cards across several sessions. Use automated checks for the full 250-card shuffle cycle; a human need not draw 500 cards to review the deck. Record explanations, passes, unclear endings, and repetition before changing the collection. Do not introduce weights or pacing rules without observed need. Lock copy and IDs before generating the remaining individual illustrations.
