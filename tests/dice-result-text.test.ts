import { describe, it, expect } from "vitest";
import { diceResultText } from "../src/presentation/dice/result-text";
import { cards } from "../src/content/catalog";
import type { DiceRoll } from "../src/game/types";
const base = cards.find((c) => c.dice)!;
const roll = (instruction: string): DiceRoll => ({
  values: [2],
  total: 2,
  instruction,
  returned: true,
});
describe("inline dice outcomes", () => {
  it("keeps legacy banned numbers explicit without mutating saved text", () => {
    const saved = roll("That number is banned. Say it: drink 2.");
    expect(diceResultText(base, saved)).toBe("2 is banned. Say it: drink 2.");
    expect(saved.instruction).toBe("That number is banned. Say it: drink 2.");
  });
  it("replaces references to the roll and keeps fixed-branch totals visible", () => {
    expect(
      diceResultText(base, roll("Drink half your roll, rounded up.")),
    ).toBe("Drink half of 2, rounded up.");
    expect(
      diceResultText(
        {
          ...base,
          dice: {
            version: 1,
            count: 1,
            sides: 6,
            outcomes: [{ min: 1, max: 6, instruction: "Give 3." }],
          },
        },
        roll("Give 3."),
      ),
    ).toBe("On 2: Give 3.");
  });
  it("does not repeat totals already interpolated by the engine", () => {
    expect(
      diceResultText(
        {
          ...base,
          dice: {
            version: 1,
            count: 1,
            sides: 6,
            instruction: "Give {total}.",
          },
        },
        roll("Give 2."),
      ),
    ).toBe("Give 2.");
  });
});
