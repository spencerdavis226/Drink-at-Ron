import type { CardDefinition, PackDefinition, Category } from "../game/types";
import { customVipCards } from "./custom";

// VIP night: for a birthday, a bachelorette, or anyone whose night it is. The
// group crowns one guest of honor (the VIP) before playing, and every card in
// this pack favors, roasts, or ropes in that one person. Cards stay self-
// contained: each rule names the VIP and an immediate consequence.
const vipCard = (
  id: string,
  title: string,
  category: Category,
  rules: string,
): CardDefinition => ({
  version: 1,
  id: `vip.${id}`,
  title,
  category,
  rules,
  artwork: "art/tankard.webp",
});

export const vipCards: CardDefinition[] = [
  vipCard(
    "toast",
    "A toast to the VIP",
    "sip",
    "Toast the VIP by name. The VIP takes 1 sip; everyone joins them.",
  ),
  vipCard(
    "sidekick",
    "Choose a sidekick",
    "sip",
    "The VIP picks a sidekick until the next card. They both take one sip now.",
  ),
  vipCard(
    "tax",
    "The VIP tax",
    "sip",
    "The VIP takes 1 sip and names a privilege they'd trade away tonight.",
  ),
  vipCard(
    "fan-club",
    "Instant fan club",
    "group",
    "Clockwise, say why you're glad the VIP is here. Then the VIP takes 1 sip.",
  ),
  vipCard(
    "standing-ovation",
    "Standing ovation",
    "group",
    "Give the VIP a standing ovation. Last to stand takes 1 sip; so does the VIP.",
  ),
  vipCard(
    "favors",
    "Outstanding favors",
    "group",
    "Anyone who owes the VIP a favor takes 1 sip. The VIP takes 1 too.",
  ),
  vipCard(
    "gift",
    "A gift for the VIP",
    "category",
    "Clockwise, name gifts for the VIP. No repeats. First to repeat or pass takes 1 sip.",
  ),
  vipCard(
    "superlatives",
    "Class superlatives",
    "category",
    "Clockwise, name awards for the VIP. No repeats. First to repeat or pass takes 1 sip.",
  ),
  vipCard(
    "roast",
    "The loving roast",
    "challenge",
    "Clockwise, give the VIP a gentle roast. The VIP picks a favorite and takes 1 sip.",
  ),
  vipCard(
    "title",
    "A title for the VIP",
    "challenge",
    "Give the VIP a silly title. They take 1 sip and use it next time they speak.",
  ),
  vipCard(
    "excellency",
    "Your Excellency",
    "rule",
    "Call the VIP Your Excellency until the next card. Forget and take 1 sip.",
  ),
  vipCard(
    "never-alone",
    "Never drink alone",
    "rule",
    "Until the next card, the VIP picks someone to join each sip they take.",
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
