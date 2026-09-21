import type { CardDefinition, PackDefinition, Category } from "../game/types";

// VIP night: for a birthday, a bachelorette, or anyone whose night it is. The
// group crowns one guest of honor (the VIP) before playing, and every card in
// this pack favors, roasts, or ropes in that one person. Cards stay self-
// contained: each rule names the VIP and an immediate, single-sip consequence.
const vipCard = (
  id: string,
  title: string,
  category: Category,
  rules: string,
  illustrationBrief: string,
): CardDefinition => ({
  version: 1,
  id: `vip.${id}`,
  title,
  category,
  rules,
  illustrationBrief,
  artwork: "art/tankard.webp",
});

export const vipCards: CardDefinition[] = [
  vipCard(
    "toast",
    "A toast to the VIP",
    "sip",
    "Everyone raises a glass and toasts the VIP by name. The VIP takes one sip, and everyone joins them.",
    "An original goofy enchanted copper crown resting on a wooden cup while simple mismatched mugs rise around it in a toast; centered, warm tavern light.",
  ),
  vipCard(
    "sidekick",
    "Choose a sidekick",
    "sip",
    "The VIP picks a sidekick until the next card is revealed. They both take one sip now.",
    "One small round owl knight standing loyally beside a taller proud adventurer, both raising cups; compact centered group, quiet backdrop.",
  ),
  vipCard(
    "tax",
    "The VIP tax",
    "sip",
    "Even the VIP pays taxes. The VIP takes one sip and names one privilege they would trade away for the night.",
    "A weary but smiling royal figure dropping a single coin into an oversized brass collection plate; centered, warm painted tavern background.",
  ),
  vipCard(
    "fan-club",
    "Instant fan club",
    "group",
    "Going clockwise, each person shares one reason they are glad the VIP is here. The VIP takes one sip at the end.",
    "A small cluster of mismatched adventurers cheering toward one proud figure at the center; simple silhouettes, quiet backdrop.",
  ),
  vipCard(
    "standing-ovation",
    "Standing ovation",
    "group",
    "Everyone gives the VIP a standing ovation. The last person left sitting takes one sip, and the VIP takes one too.",
    "A tavern table of adventurers rising in an enthusiastic ovation toward one delighted hero; centered, broad painted forms.",
  ),
  vipCard(
    "favors",
    "Outstanding favors",
    "group",
    "Anyone who owes the VIP a favor takes one sip. The VIP takes one sip in happy anticipation.",
    "A smug adventurer holding an open ledger of tiny favors beside a hopeful friend; centered, simple readable shapes.",
  ),
  vipCard(
    "gift",
    "A gift for the VIP",
    "category",
    "Name a gift fit for the VIP, going clockwise. No repeats. The first person to repeat or pass takes one sip; the round ends.",
    "One overflowing treasure chest with an absurd oversized bow, centered against a plain warm backdrop.",
  ),
  vipCard(
    "superlatives",
    "Class superlatives",
    "category",
    "Name a superlative the VIP should win, going clockwise. No repeats. The first person to repeat or pass takes one sip; the round ends.",
    "A tiny trophy shelf holding one ridiculous golden cup with a ribbon, centered with a clear silhouette.",
  ),
  vipCard(
    "roast",
    "The loving roast",
    "challenge",
    "Going clockwise, give the VIP one affectionate roast each. The VIP picks the closest hit and takes one sip.",
    "A bard dramatically roasting a marshmallow over a candle while a friend laughs; centered, goofy original fantasy.",
  ),
  vipCard(
    "title",
    "A title for the VIP",
    "challenge",
    "Grant the VIP a ridiculous new title for the night. The VIP accepts it with one sip and uses it in their next sentence.",
    "A herald unfurling a long scroll while one proud figure wears an absurd ceremonial sash; centered composition.",
  ),
  vipCard(
    "excellency",
    "Your Excellency",
    "rule",
    "Until the next card is revealed, address the VIP as Your Excellency. Whoever forgets takes one sip.",
    "One imperious but friendly goblin in an oversized paper crown being bowed to by two adventurers; centered, quiet backdrop.",
  ),
  vipCard(
    "never-alone",
    "Never drink alone",
    "rule",
    "Until the next card is revealed, the VIP never drinks alone: whenever the VIP takes a sip, they choose someone to join them.",
    "Two mismatched cups clinking beside a small bronze crown, centered against a quiet tavern background.",
  ),
];

export const vipPack: PackDefinition = {
  version: 1,
  id: "vip",
  logo: "art/packs/vip.svg",
  title: "VIP night",
  description:
    "For a birthday, a bachelorette, or just someone's night. Crown one guest of honor and let every card favor or roast the VIP.",
  setupHint:
    "VIP night: choose one guest of honor (the VIP) before you play. Every card favors or roasts them.",
  cardIds: vipCards.map((card) => card.id),
};
