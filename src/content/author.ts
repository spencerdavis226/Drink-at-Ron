import type { CardDefinition, Category, DiceDefinition } from "../game/types";

/**
 * Shared card authoring helpers.
 *
 * Cards are plain typed objects, never parsed data: TypeScript checks every
 * field at build time, comments and ordering stay reviewable in the source, and
 * there is no runtime JSON to validate before the engine sees it. A dice card
 * declares *which* dice to roll and how to read the total through the optional
 * structured `DiceDefinition` — not a boolean flag — so `count`, `sides` and the
 * outcome text travel together.
 */

export const PLACEHOLDER_ART = "art/tankard.webp";

export type CardFactory = (
  id: string,
  title: string,
  category: Category,
  rules: string,
  illustrationBrief: string,
  dice?: DiceDefinition,
  artwork?: string,
) => CardDefinition;

/**
 * Build a namespaced card builder (`core.*`, `vip.*`, ...). Every content
 * module uses this so IDs, defaults and the dice field stay consistent.
 */
export function cardFactory(namespace: string): CardFactory {
  return (
    id,
    title,
    category,
    rules,
    illustrationBrief,
    dice,
    artwork = PLACEHOLDER_ART,
  ) => ({
    version: 1,
    id: `${namespace}.${id}`,
    title,
    category,
    rules,
    illustrationBrief,
    artwork,
    ...(dice ? { dice } : {}),
  });
}

/**
 * A dice card read with one template: `count` dice of `sides` faces, with
 * `{total}` replaced by the committed roll. Keeps the common case one line.
 */
export const roll = (
  count: number,
  sides: 6 | 20,
  instruction: string,
): DiceDefinition => ({ version: 1, count, sides, instruction });

/**
 * A dice card whose result branches. Outcomes must cover every total exactly
 * once; `validateDice` enforces that at build time.
 */
export const rollTable = (
  count: number,
  sides: 6 | 20,
  outcomes: NonNullable<DiceDefinition["outcomes"]>,
): DiceDefinition => ({ version: 1, count, sides, outcomes });
