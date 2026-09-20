import { createSession } from "../game/engine";
import { packs } from "../content/catalog";
import { save, SAVE_KEY } from "../app/persistence";
import { diceFixtures } from "./dice-fixtures";

/**
 * Dev-only review bootstrap. Seeds the real game with the dice fixtures so the
 * full-screen roll can be judged in context instead of in the workshop. Reached
 * through `?review=dice`; excluded from production builds.
 */
export function seedDiceReview() {
  const cards = diceFixtures;
  const session = createSession(
    { version: 1, packIds: [packs[0].id], limit: cards.length },
    cards,
    [{ ...packs[0], cardIds: cards.map((card) => card.id) }],
  );
  session.phase = "revealed";
  save(SAVE_KEY, session);
}
