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
  artwork: "art/tankard.svg",
});
export const cards: CardDefinition[] = [
  card(
    "cheers",
    "A little cheers",
    "sip",
    "Raise your glass. Take one sip.",
    "A cheerful little tavern tankard.",
  ),
  card(
    "table",
    "The whole tavern",
    "group",
    "Everyone raises a glass and takes one sip together.",
    "A crowded table of friendly fantasy creatures.",
  ),
  card(
    "girls",
    "Ladies’ night",
    "group",
    "Anyone who identifies as a woman takes one sip.",
    "A trio of adventurers sharing a toast.",
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
    "Name an animal, then go clockwise. No repeats. The first person to repeat or run out of ideas takes one sip.",
    "Animals gathering around a tavern table.",
  ),
  card(
    "snacks",
    "Midnight menu",
    "category",
    "Take turns naming snacks, going clockwise. No repeats. The first person stuck takes one sip.",
    "A towering platter of fantastical snacks.",
  ),
  card(
    "rhyme",
    "Bard’s turn",
    "challenge",
    "Say a word. Going clockwise, each person says a word that rhymes. First repeat or missed rhyme: one sip.",
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
    "A storybook spilling playful creatures.",
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
];
export const packs: PackDefinition[] = [
  {
    version: 1,
    id: "core",
    title: "The house collection",
    description:
      "Toasts, tall tales, and a little tavern mischief. A sample pack to get us playing.",
    cardIds: cards.map((c) => c.id),
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
