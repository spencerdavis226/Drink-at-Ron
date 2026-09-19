import type { CardDefinition } from "../game/types";
/** Review fixtures only. No dice cards enter the production Core until the study is approved. */
export const diceFixtures: CardDefinition[] = [
  {
    version: 1,
    id: "core.dice-toast-study",
    title: "A toast of fate",
    category: "challenge",
    rules: "Roll 2d6. Your total decides who gives the toast.",
    artwork: "art/tankard.webp",
    illustrationBrief:
      "Two oversized ivory dice tumble from a tiny enchanted gauntlet. One clear silhouette, centered with generous crop margins; warm painted tavern style.",
    dice: {
      version: 1,
      count: 2,
      sides: 6,
      outcomes: [
        {
          min: 2,
          max: 6,
          instruction: "Give the group a toast to a tiny victory.",
        },
        {
          min: 7,
          max: 12,
          instruction: "Choose someone to give the group a grand toast.",
        },
      ],
    },
  },
  {
    version: 1,
    id: "core.dice-title-study",
    title: "Roll for royalty",
    category: "challenge",
    rules:
      "Roll 1d20. Claim the title fate has picked for you until the next card is revealed.",
    artwork: "art/tankard.webp",
    illustrationBrief:
      "One lopsided paper crown on a proud enchanted helmet; goofy original fantasy, centered and legible at a glance.",
    dice: {
      version: 1,
      count: 1,
      sides: 20,
      outcomes: [
        {
          min: 1,
          max: 10,
          instruction:
            "You are the Royal Crumb Inspector until the next card is revealed. Introduce yourself with dignity.",
        },
        {
          min: 11,
          max: 19,
          instruction:
            "You are the Grand Duke of Snacks until the next card is revealed. Introduce yourself with dignity.",
        },
        {
          min: 20,
          max: 20,
          instruction:
            "You are the Supreme Ruler of This Table until the next card is revealed. Give your shortest royal speech.",
        },
      ],
    },
  },
];
