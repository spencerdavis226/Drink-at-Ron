import { validateDice } from "../game/dice";
import type { CardDefinition, PackDefinition, Category } from "../game/types";
const card = (
  id: string,
  title: string,
  category: Category,
  rules: string,
  illustrationBrief: string,
): CardDefinition => ({
  version: 1,
  id: `core.${id}`,
  title,
  category,
  rules,
  illustrationBrief,
  artwork: "art/tankard.webp",
});
const diceCard = (
  id: string,
  title: string,
  category: Category,
  rules: string,
  illustrationBrief: string,
  dice: CardDefinition["dice"],
): CardDefinition => ({
  version: 1,
  id,
  title,
  category,
  rules,
  illustrationBrief,
  artwork: "art/tankard.webp",
  dice,
});
const plainCards: CardDefinition[] = [
  card(
    "cheers",
    "A little cheers",
    "sip",
    "Raise your glass. Take one sip.",
    "An original goofy enchanted copper suit of armor proudly raises a tiny wooden cup; expressive glowing eyes, quiet tavern background, broad painted forms and safe headroom.",
  ),
  card(
    "table",
    "The whole tavern",
    "group",
    "Everyone raises a glass and takes one sip together.",
    "Two simple wooden cups meeting in a centered toast against a quiet warm background.",
  ),
  card(
    "girls",
    "Ladies’ night",
    "group",
    "Anyone who identifies as a woman takes one sip.",
    "One cheerful human traveler in a simple green cape raising a cup, with generous headroom.",
  ),
  card(
    "colors",
    "Showing your colors",
    "group",
    "Anyone wearing something blue takes one sip.",
    "A wizard proudly displaying a blue cloak.",
  ),
  card(
    "animals",
    "Wild company",
    "category",
    "Name an animal, then go clockwise. No repeats. The first person to repeat or pass takes one sip; the round ends.",
    "One expressive sleepy fox curled on a plain tavern cushion, centered with clear silhouette.",
  ),
  card(
    "snacks",
    "Midnight menu",
    "category",
    "Take turns naming snacks, going clockwise. No repeats. The first person to repeat or pass takes one sip; the round ends.",
    "One oversized golden pretzel on a simple wooden plate, centered against a quiet backdrop.",
  ),
  card(
    "rhyme",
    "Bard’s turn",
    "challenge",
    "Say a word. Going clockwise, each person says a word that rhymes. The first person to repeat or pass takes one sip; the round ends.",
    "A small bard with an oversized lute.",
  ),
  card(
    "toast",
    "A toast to that",
    "challenge",
    "Give the group a dramatic, one-sentence toast. Everyone cheers.",
    "An adventurer standing on a stool to make a toast.",
  ),
  card(
    "left",
    "Left-handed magic",
    "rule",
    "Until the next card is revealed, everyone holds their drink in their left hand. Forget? Switch hands and carry on.",
    "A mischievous wizard enchanting a tankard.",
  ),
  card(
    "story",
    "Tall tale",
    "challenge",
    "Tell a story together, one word per person, going clockwise. After two rounds, toast your wonderfully terrible story.",
    "One open storybook with a single friendly moon shape rising above it, centered and uncluttered.",
  ),
  card(
    "water",
    "The wellspring",
    "sip",
    "A little intermission. Have some water and settle back in.",
    "A glowing freshwater spring in the tavern.",
  ),
  card(
    "compliment",
    "Good company",
    "challenge",
    "Give someone at the table a sincere compliment. They choose who draws next.",
    "Two unlikely adventurers smiling together.",
  ),
  card(
    "small-victory",
    "Small victory",
    "sip",
    "Take one sip to celebrate something good that happened today.",
    "A tiny knight proudly holding an enormous trophy.",
  ),
  card(
    "choose-toast",
    "Your round",
    "sip",
    "Choose someone to share a toast with. You both take one sip.",
    "Two mismatched mugs meeting in golden light.",
  ),
  card(
    "quiet-toast",
    "Silent salute",
    "sip",
    "Raise your glass without a word. Anyone who joins you takes one sip with you.",
    "A smiling rogue silently raising a glass.",
  ),
  card(
    "gentlemen",
    "Gentlemen’s hour",
    "group",
    "Anyone who identifies as a man takes one sip.",
    "One smiling human traveler in a simple waistcoat raising a cup, centered with clear headroom.",
  ),
  card(
    "glasses",
    "Looking sharp",
    "group",
    "Anyone wearing glasses takes one sip.",
    "An owl scholar polishing spectacles.",
  ),
  card(
    "pets",
    "Familiar faces",
    "group",
    "Anyone who has a pet takes one sip.",
    "One original traveler with a small cat perched on their shoulder, grouped centrally against a quiet background.",
  ),
  card(
    "siblings",
    "Family gathering",
    "group",
    "Anyone with a sibling takes one sip.",
    "Two original woodland travelers clinking cups.",
  ),
  card(
    "coffee",
    "Morning potion",
    "group",
    "Anyone who had coffee today takes one sip.",
    "A sleepy alchemist brewing coffee.",
  ),
  card(
    "fruit",
    "Market day",
    "category",
    "Name a fruit, then go clockwise. No repeats. The first person to repeat or pass takes one sip; the round ends.",
    "One bright oversized strawberry in a small wicker bowl, with broad shapes and a plain warm backdrop.",
  ),
  card(
    "movies",
    "Picture show",
    "category",
    "Name a movie, then go clockwise. No repeats. The first person to repeat or pass takes one sip; the round ends.",
    "A goblin projecting a shadow play.",
  ),
  card(
    "cities",
    "Far from home",
    "category",
    "Name a city, then go clockwise. No repeats. The first person to repeat or pass takes one sip; the round ends.",
    "A traveler unfolding a map of distant cities.",
  ),
  card(
    "instruments",
    "House band",
    "category",
    "Name a musical instrument, then go clockwise. No repeats. The first person to repeat or pass takes one sip; the round ends.",
    "One hand-carved wooden lute with a simple leaf accent, centered against a quiet backdrop.",
  ),
  card(
    "sports",
    "Tournament day",
    "category",
    "Name a sport, then go clockwise. No repeats. The first person to repeat or pass takes one sip; the round ends.",
    "A cheerful forest sprite holding one oversized wooden trophy.",
  ),
  card(
    "vote",
    "Dragon keeper",
    "challenge",
    "Point to whoever would make the best pet-dragon keeper. Whoever gets the most votes gives a one-sentence sales pitch. Ties give a pitch together.",
    "One original tiny round dragon perched on an open hand, with a curious expression and a quiet background.",
  ),
  card(
    "nickname",
    "A grand title",
    "challenge",
    "Give yourself a ridiculous tavern title. The person to your left introduces you with it, then draws next.",
    "A proud adventurer wearing a ludicrous ceremonial sash.",
  ),
  card(
    "pinky",
    "Fine company",
    "rule",
    "Until the next card is revealed, hold your pinky out whenever you lift your drink. Forget? Correct it and carry on.",
    "An ogre delicately raising one finger.",
  ),
  card(
    "names",
    "Your majesty",
    "rule",
    "Until the next card is revealed, address everyone as Your Majesty. Forget? Correct yourself and carry on.",
    "A table of adventurers wearing paper crowns.",
  ),
  card(
    "cheer-rule",
    "Hear, hear",
    "rule",
    "Until the next card is revealed, answer every toast with Hear, hear! Forget? Join in and carry on.",
    "One cheerful forest sprite cupping a hand beside its mouth, centered with a plain warm backdrop.",
  ),
];
// Provisional dice cards. Content and art are placeholders for the approved
// full-screen dice renderer; copy and illustrations still need a real pass.
// They live in their own pack so the validated 30-card Core is unaffected.
const diceCards: CardDefinition[] = [
  diceCard(
    "dice.toast",
    "A toast of fate",
    "challenge",
    "Roll 2d6. Your total decides who gives the toast.",
    "Two oversized ivory dice tumble from a tiny enchanted gauntlet. One clear silhouette, centered with generous crop margins; warm painted tavern style.",
    {
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
  ),
  diceCard(
    "dice.title",
    "Roll for royalty",
    "challenge",
    "Roll 1d20. Claim the title fate has picked for you until the next card is revealed.",
    "One lopsided paper crown on a proud enchanted helmet; goofy original fantasy, centered and legible at a glance.",
    {
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
  ),
];
export const cards: CardDefinition[] = [...plainCards, ...diceCards];
export const packs: PackDefinition[] = [
  {
    version: 1,
    id: "core",
    logo: "art/packs/core.svg",
    title: "The house collection",
    description:
      "Toasts, tall tales, and a little tavern mischief. Thirty cards for a classic party.",
    cardIds: plainCards.map((c) => c.id),
  },
  {
    version: 1,
    id: "dice",
    logo: "art/packs/dice.svg",
    title: "Dice (provisional)",
    description:
      "Provisional dice cards for trying the roll. Content and art are not final.",
    cardIds: diceCards.map((c) => c.id),
  },
];
export function validateCatalog(cs: CardDefinition[], ps: PackDefinition[]) {
  const fail = (message: string): never => {
    throw new Error(message);
  };
  const ids = new Set<string>();
  for (const c of cs) {
    if (
      !c ||
      c.version !== 1 ||
      typeof c.id !== "string" ||
      !/^[a-z0-9][a-z0-9.-]*$/.test(c.id) ||
      ids.has(c.id)
    )
      fail("Invalid or duplicate card ID");
    ids.add(c.id);
    if (c.dice !== undefined) validateDice(c.dice);
    if (!["sip", "group", "category", "challenge", "rule"].includes(c.category))
      fail(`Invalid category: ${c.id}`);
    for (const key of [
      "title",
      "rules",
      "artwork",
      "illustrationBrief",
    ] as const)
      if (typeof c[key] !== "string" || !c[key].trim())
        fail(`Missing ${key}: ${c.id}`);
    if (!/^art\/[a-zA-Z0-9/_-]+\.(svg|png|webp|avif)$/.test(c.artwork))
      fail(`Invalid artwork: ${c.id}`);
  }
  const packIds = new Set<string>();
  for (const p of ps) {
    if (
      !p ||
      p.version !== 1 ||
      typeof p.id !== "string" ||
      !p.id ||
      packIds.has(p.id) ||
      !p.title?.trim() ||
      !p.description?.trim()
    )
      fail("Invalid or duplicate pack");
    if (
      p.artwork !== undefined &&
      (typeof p.artwork !== "string" ||
        !/^art\/[a-zA-Z0-9/_-]+\.(svg|png|webp|avif)$/.test(p.artwork))
    )
      fail(`Invalid pack artwork: ${p.id}`);
    if (
      p.logo !== undefined &&
      (typeof p.logo !== "string" ||
        !/^art\/[a-zA-Z0-9/_-]+\.(svg|png|webp|avif)$/.test(p.logo))
    )
      fail(`Invalid pack logo: ${p.id}`);
    packIds.add(p.id);
    if (
      !Array.isArray(p.cardIds) ||
      !p.cardIds.length ||
      new Set(p.cardIds).size !== p.cardIds.length ||
      p.cardIds.some((id) => !ids.has(id))
    )
      fail(`Invalid card membership: ${p.id}`);
  }
}
