# Drink at Ron — game and content brief

For the intended humor, specificity, and card-writing personality, also use [Card voice and theme reference](CARD_VOICE_REFERENCE.md). It distills the reusable creative direction from Spencer's earlier CABIIN card set without importing that game's board, team, zone, or movement rules.

## Pillars

A shared deck, a lively table, one clear instruction at a time. A reveal should be delightful and a rule should make sense on one reading. No accounts, scorekeeping, timers, or player setup. The app deals cards; the people handle the activity.

## Core editorial direction

Classic party: short drinking prompts, broad group prompts, categories, playful verbal challenges, temporary rules, and dice gambles. Instructions use everyday language. Pours are printed on the card or resolved from a committed dice roll; the app never enforces a pour, and any drink can be nonalcoholic. The House deck ships exactly as supplied: blunt, specific, and without consent boilerplate.

Choose anyone to draw first. Pass the device clockwise unless a card names the next drawer. The drawer starts a category or challenge. Complete its activity before dismissing the card. Category rounds end on the first repeat or blank; no stopwatch or debate about how long someone hesitated. Temporary rules last as long as the card states, with explicit consequences in the card text. No rule requires app bookkeeping.

## Current content

Three opt-in packs. `core` (117 cards) is the generated main deck: the supplied sample set (34), trimmed classics (45), and the trimmed dice expansion (38). `house` (102 cards) is the supplied Sheet1 restored verbatim in `src/content/custom.ts`. `VIP night` (16 cards) covers birthdays and celebrations. Any combination of packs can be selected; at least one is required. All three packs comprise 47 sip, 42 group, 25 category, 83 challenge, and 30 rule cards. This distribution is an editorial starting point, not validated balance.

The main deck was trimmed hard on 2026-09-26: near-identical "roll d6, then one of two things" branches, duplicate call-outs and categories, and flavorless filler were deleted. Every remaining dice card resolves to one exact computed instruction (odds/evens, doubles, per-die amounts included) before it is read aloud. All cards are equally likely per shuffle cycle; a deck longer than the pool repeats cards only after exhausting it, and the cycle boundary never repeats immediately when the pool has multiple cards.

The supplied sheet is the authority for the House deck. `src/content/custom.ts` uses its 1-based row numbers in stable IDs (`house.sheet-003` through `house.sheet-105`, excluding blank row 75 and the description-less row 106; `vip.sheet-003` through `vip.sheet-006`). Titles, jokes, threats, and pours are transcribed as written, including the sheet's own typos in titles, with no permission-seeking or softened consequences. Rows that name dice keep the app roll and compute the pour. Repeated headings such as Categories and Call Out remain separate cards because their prompts differ.

Keep one primary instruction. Aim for 90 characters and 18 words; the build flags longer rules and rejects those over 120 characters or 24 words (long-word titles are rejected over 15 characters). Specify who starts and when an activity stops where relevant. Preserve stable IDs for unchanged concepts. Text revisions affect new sessions only; active sessions keep their snapshot.

## Review gate

Use the workshop to inspect every card at 320px and enlarged text. Play a Short (30) game with a real group, then sample more cards across several sessions. Use automated checks for the full 235-card shuffle cycle; a human need not draw 500 cards to review the deck. Record explanations, unclear endings, and repetition before changing the collection. Do not introduce weights or pacing rules without observed need. Lock copy and IDs before any further content work.
