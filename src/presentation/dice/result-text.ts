import type { CardDefinition, DiceRoll } from "../../game/types";

/** Present legacy snapshots without rewriting their committed outcomes. */
export function diceResultText(card: CardDefinition, roll: DiceRoll): string {
  const text = roll.instruction;
  if (/that number/i.test(text))
    return text.replace(/that number/gi, String(roll.total));
  if (/your roll/i.test(text))
    return text
      .replace(/half your roll/gi, `half of ${roll.total}`)
      .replace(/your roll/gi, String(roll.total));
  const template =
    card.dice?.instruction ??
    card.dice?.outcomes?.find(
      (range) => roll.total >= range.min && roll.total <= range.max,
    )?.instruction;
  return template?.includes("{total}") ? text : `On ${roll.total}: ${text}`;
}
