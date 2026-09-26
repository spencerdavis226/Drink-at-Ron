import type { CardDefinition, DiceRoll } from "../../game/types";

/** Resolve the authored rule for display without rewriting a saved outcome.
 * These are the catalog's explicit rule forms, not an expression evaluator. */
export function diceResultText(card: CardDefinition, roll: DiceRoll): string {
  let text = roll.instruction;
  if (/^Drink half your roll, rounded up\.$/i.test(text))
    return `Drink ${Math.ceil(roll.total / 2)}.`;
  if (/^Drink 7 minus your roll\.$/i.test(text))
    return `Drink ${7 - roll.total}.`;
  const doubles = text.match(/^Doubles: (.+) Otherwise (.+)$/i);
  if (doubles)
    text = roll.values.every((value) => value === roll.values[0])
      ? doubles[1]
      : doubles[2];
  // Older parity cards encoded prose (or a coarse range) rather than separate
  // outcomes. Resolve the original rule from the immutable card snapshot.
  const parity = card.rules.match(/Odd: (.+?)\. Even: (.+?)(?:\.|$)(.*)/i);
  if (parity) text = `${roll.total % 2 ? parity[1] : parity[2]}.${parity[3]}`;
  const split = text.match(/^Give (.+) on 1[–-]3; give (.+) on 4[–-]6\.$/i);
  if (split) text = `Give ${roll.total <= 3 ? split[1] : split[2]}.`;
  text = text
    .replace(/that number/gi, String(roll.total))
    .replace(/your roll/gi, String(roll.total));
  if (card.dice)
    text = text.replace(
      new RegExp(`\\b${card.dice.count}d${card.dice.sides}\\b`, "gi"),
      String(roll.total),
    );
  return text.charAt(0).toUpperCase() + text.slice(1);
}
