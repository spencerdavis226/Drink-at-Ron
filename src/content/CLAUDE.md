# src/content — card and pack data

Read `docs/AUTHORING.md` and `docs/CARD_VOICE_REFERENCE.md` before editing. Cards are title + rules + category (`sip|group|category|challenge|rule`) + optional `dice`. No illustration text.

| File | Pack | Cards |
| --- | --- | --- |
| `sample.ts`, `classics.ts`, `standard-expansion.ts` | `core` | 117 |
| `custom.ts` | `house` (sheet rows, verbatim) and four `vip.sheet-*` | 102 |
| `vip.ts` (+ the four in `custom.ts`) | `vip` | 16 |
| `pokemon.ts` | `pokemon` | 134 |

Rules enforced by `npm run build` (`scripts/validate-content.ts`) and unit tests:

- Stable namespaced IDs, never recycled. House IDs encode the source sheet row (`house.sheet-003`).
- Titles: at most 22 characters and 15 per word. Rules: aim for 90 characters / 18 words; over 120 characters or 24 words fails.
- Every card says who acts. A lasting rule lasts the rest of the game or until the drawing player's next turn, never "until the next card" (`tests/card-logic.test.ts`; documented exceptions: `core.buffalo`, `house.sheet-015`).
- Every dice card resolves to one exact instruction. No odds/evens, "otherwise", or dice notation left for the table to interpret.
- Every new card needs an entry in `imprint.ts` (category motif); `tests/imprint.test.ts` fails without it.
- Each pack needs a distinct `logo` under `public/art/packs`.
- House and Pokémon copy is source-faithful: change it only for unclear actor or duration, and record the change in `reference/README.md` and `docs/AUTHORING.md`. Cards the user denied in review stay removed.

After any content change run `npm test`, `npm run cards:review` (regenerates `docs/CARD_REVIEW.md` and `docs/card-review.csv`; never hand-edit them), and a build. Update the card-count assertions in `tests/workshop.test.ts` when totals change. Existing saves keep their snapshot; do not try to rewrite them.
