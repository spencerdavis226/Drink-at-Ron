import type { CardDefinition, PackDefinition, Category } from "../game/types";
import { customVipCards } from "./custom";

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
    "Toast the VIP by name. The VIP takes 1 sip; everyone joins them.",
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
    "The VIP takes 1 sip and names a privilege they'd trade away tonight.",
    "A weary but smiling royal figure dropping a single coin into an oversized brass collection plate; centered, warm painted tavern background.",
  ),
  vipCard(
    "fan-club",
    "Instant fan club",
    "group",
    "Clockwise, say why you're glad the VIP is here. Then the VIP takes 1 sip.",
    "A small cluster of mismatched adventurers cheering toward one proud figure at the center; simple silhouettes, quiet backdrop.",
  ),
  vipCard(
    "standing-ovation",
    "Standing ovation",
    "group",
    "Give the VIP a standing ovation. Last to stand takes 1 sip; so does the VIP.",
    "A tavern table of adventurers rising in an enthusiastic ovation toward one delighted hero; centered, broad painted forms.",
  ),
  vipCard(
    "favors",
    "Outstanding favors",
    "group",
    "Anyone who owes the VIP a favor takes 1 sip. The VIP takes 1 too.",
    "A smug adventurer holding an open ledger of tiny favors beside a hopeful friend; centered, simple readable shapes.",
  ),
  vipCard(
    "gift",
    "A gift for the VIP",
    "category",
    "Clockwise, name gifts for the VIP. No repeats. First to repeat or pass takes 1 sip.",
    "One overflowing treasure chest with an absurd oversized bow, centered against a plain warm backdrop.",
  ),
  vipCard(
    "superlatives",
    "Class superlatives",
    "category",
    "Clockwise, name awards for the VIP. No repeats. First to repeat or pass takes 1 sip.",
    "A tiny trophy shelf holding one ridiculous golden cup with a ribbon, centered with a clear silhouette.",
  ),
  vipCard(
    "roast",
    "The loving roast",
    "challenge",
    "Clockwise, give the VIP a gentle roast. The VIP picks a favorite and takes 1 sip.",
    "A bard dramatically roasting a marshmallow over a candle while a friend laughs; centered, goofy original fantasy.",
  ),
  vipCard(
    "title",
    "A title for the VIP",
    "challenge",
    "Give the VIP a silly title. They take 1 sip and use it next time they speak.",
    "A herald unfurling a long scroll while one proud figure wears an absurd ceremonial sash; centered composition.",
  ),
  vipCard(
    "excellency",
    "Your Excellency",
    "rule",
    "Call the VIP Your Excellency until the next card. Forget and take 1 sip.",
    "One imperious but friendly goblin in an oversized paper crown being bowed to by two adventurers; centered, quiet backdrop.",
  ),
  vipCard(
    "never-alone",
    "Never drink alone",
    "rule",
    "Until the next card, the VIP picks someone to join each sip they take.",
    "Two mismatched cups clinking beside a small bronze crown, centered against a quiet tavern background.",
  ),
  ...customVipCards,
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
