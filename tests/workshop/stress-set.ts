import { cards, packs } from "../../src/content/catalog";

/**
 * The cards that can actually break the shared card template: every card
 * renders in one frame, so sweeping all of them re-proves the same layout
 * hundreds of times. This set keeps the extremes (longest rules and titles),
 * every do-it-or-roll card (plaques shrink the rules panel), dice cards with
 * the most dice, quest finales, and one card per pack for its mark.
 */
const longest = (key: "rules" | "title", n: number) =>
  [...cards].sort((a, b) => b[key].length - a[key].length).slice(0, n);

export const stressCards = [
  ...new Map(
    [
      ...longest("rules", 12),
      ...longest("title", 6),
      ...cards.filter((c) => c.dice?.choice),
      ...[...cards]
        .filter((c) => c.dice)
        .sort((a, b) => b.dice!.count - a.dice!.count)
        .slice(0, 3),
      // One card of each finale stage.
      ...packs.flatMap((p) =>
        (p.quest?.finale ?? []).map((stage) =>
          cards.find((c) => c.id === stage.cardIds[0])!,
        ),
      ),
      ...packs.map((p) => cards.find((c) => c.id === p.cardIds[0])!),
    ].map((c) => [c.id, c]),
  ).values(),
];

/** The packs whose marks a card carries (a quest finale belongs by prefix). */
export const packsOf = (id: string) =>
  packs.filter((p) => p.cardIds.includes(id) || id.startsWith(`${p.id}.`));
