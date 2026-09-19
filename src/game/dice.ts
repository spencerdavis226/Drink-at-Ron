import type { DiceDefinition, DiceRoll, SessionState } from "./types";
import { currentCard, type Random } from "./engine";

const templateIsValid = (text: unknown): text is string =>
  typeof text === "string" &&
  !!text.trim() &&
  !/[{}]/.test(text.replaceAll("{total}", ""));

export function validateDice(value: unknown): asserts value is DiceDefinition {
  const d = value as DiceDefinition;
  if (
    !d ||
    d.version !== 1 ||
    ![6, 20].includes(d.sides) ||
    !Number.isInteger(d.count) ||
    d.count < 1 ||
    d.count > 4
  )
    throw Error("Invalid dice: use one to four d6 or d20 dice");
  if (d.instruction !== undefined) {
    if (!templateIsValid(d.instruction) || d.outcomes !== undefined)
      throw Error("Invalid dice instruction");
    return;
  }
  if (!Array.isArray(d.outcomes) || !d.outcomes.length)
    throw Error("Missing dice outcomes");
  let next = d.count;
  for (const range of [...d.outcomes].sort((a, b) => a.min - b.min)) {
    if (
      !range ||
      !Number.isInteger(range.min) ||
      !Number.isInteger(range.max) ||
      range.min !== next ||
      range.max < range.min ||
      !templateIsValid(range.instruction)
    )
      throw Error("Dice outcomes must cover every total exactly once");
    next = range.max + 1;
  }
  if (next !== d.count * d.sides + 1)
    throw Error("Dice outcome range is incomplete");
}
export const diceNotation = (dice: DiceDefinition) =>
  `${dice.count}d${dice.sides}`;
export function resolveInstruction(
  dice: DiceDefinition,
  total: number,
): string {
  const text =
    dice.instruction ??
    dice.outcomes?.find((r) => total >= r.min && total <= r.max)?.instruction;
  if (!text) throw Error("No instruction for this roll");
  return text.replaceAll("{total}", String(total));
}
/** Only the engine samples randomness. Renderers receive these committed values. */
export function rollDice(
  session: SessionState,
  random: Random = Math.random,
): SessionState {
  const dice = currentCard(session).dice;
  if (!dice || session.phase !== "revealed" || session.roll) return session;
  const values = Array.from({ length: dice.count }, () => {
    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1)
      throw Error("Invalid dice randomness");
    return 1 + Math.floor(sample * dice.sides);
  });
  const total = values.reduce((a, b) => a + b, 0);
  return {
    ...session,
    roll: {
      values,
      total,
      instruction: resolveInstruction(dice, total),
      returned: false,
    },
  };
}
export function returnToCard(session: SessionState): SessionState {
  if (session.phase !== "revealed" || !session.roll || session.roll.returned)
    return session;
  return { ...session, roll: { ...session.roll, returned: true } };
}
export function validateRoll(
  roll: DiceRoll | null,
  dice: DiceDefinition | undefined,
) {
  if (roll === null) return;
  if (
    !dice ||
    !roll ||
    !Array.isArray(roll.values) ||
    roll.values.length !== dice.count ||
    roll.values.some((v) => !Number.isInteger(v) || v < 1 || v > dice.sides) ||
    roll.total !== roll.values.reduce((a, b) => a + b, 0) ||
    roll.instruction !== resolveInstruction(dice, roll.total) ||
    typeof roll.returned !== "boolean"
  )
    throw Error("Invalid saved dice result");
}
