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
  it("computes drink amounts and keeps only the resolved branch", () => {
    expect(
      diceResultText(base, roll("Drink half your roll, rounded up.")),
    ).toBe("Drink 1.");
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
    ).toBe("Give 3.");
  });
  it("resolves doubles and arithmetic while leaving the saved instruction intact", () => {
    const saved = {
      ...roll("Doubles: give 7. Otherwise drink 3."),
      total: 7,
      values: [3, 4],
    };
    expect(diceResultText(base, saved)).toBe("Drink 3.");
    expect(
      diceResultText(base, {
        ...saved,
        values: [4, 4],
        total: 8,
        instruction: "Doubles: give 8. Otherwise drink 3.",
      }),
    ).toBe("Give 8.");
    expect(diceResultText(base, roll("Drink 7 minus your roll."))).toBe(
      "Drink 5.",
    );
    expect(saved.instruction).toBe("Doubles: give 7. Otherwise drink 3.");
  });
  it("resolves authored parity and range rules using the saved faces", () => {
    const card = { ...base, rules: "Roll d6. Odd: give 1 sip. Even: give 2." };
    expect(diceResultText(card, roll("Odd: give 1 sip. Even: give 2."))).toBe(
      "Give 2.",
    );
    expect(
      diceResultText(
        { ...card, rules: "Roll d6." },
        roll("Give 1 sip on 1–3; give 2 on 4–6."),
      ),
    ).toBe("Give 1 sip.");
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
