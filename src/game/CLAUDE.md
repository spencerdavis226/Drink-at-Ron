# src/game — pure engine

No DOM, React, `window`, or storage imports here, and nothing that depends on rendering. Randomness is injected (`Random = () => number`, default `Math.random`) so tests can seed it.

- `types.ts`: `CardDefinition`, `PackDefinition`, `SessionState` (schema v2), `DiceDefinition`, `DiceRoll`. Changing `SessionState` shape means a migration in `src/app/persistence.ts` and keeping `drink-at-ron.session.v1` as the storage key.
- `engine.ts`: `createSession` snapshots the chosen cards into the session, so saved games never change when the catalog does. `advance` is hidden → revealed → discard; a dice card cannot be discarded until `roll.returned`, except a choice card (`dice.choice`), which `skipRoll` puts aside unrolled while `awaitingChoice` (so a discarded choice card may have `previousRoll: null`). A finite game completes when `discarded === limit`; when the deck runs out first it reshuffles (`cycle++`) and never opens a new cycle with the card just played.
- `dice.ts`: only place that samples dice. `rollDice` commits faces and the exact resolved instruction before any animation; the renderer receives those values and must land on them. `validateDice` runs at build time; `validateRoll` re-derives the instruction on load, so changing `resolveInstruction` output invalidates saved rolls (it throws "Invalid saved dice result").
- Dice templates: `{total}` and `{first}`…`{fourth}`; outcomes by total with optional `step` for odds/evens and a `doubles` override. Legacy `instruction` strings stay valid for old saves.

Tests: `tests/engine.test.ts`, `tests/dice.test.ts`. Add a failing test before changing a saved-state invariant, and keep `parseSession` in lockstep with any new invariant.
