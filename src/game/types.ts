export const VERSION = 1 as const;
export type Category = "sip" | "group" | "category" | "challenge" | "rule";
export interface CardDefinition {
  version: 1;
  id: string;
  title: string;
  rules: string;
  category: Category;
  artwork: string;
  illustrationBrief: string;
}
export interface PackDefinition {
  version: 1;
  id: string;
  title: string;
  description: string;
  cardIds: string[];
}
export interface GameConfig {
  version: 1;
  packIds: string[];
  limit: number | null;
}
export interface SessionState {
  version: 1;
  config: GameConfig;
  cards: CardDefinition[];
  order: string[];
  position: number;
  cycle: number;
  discarded: number;
  phase: "hidden" | "revealed" | "complete";
  previousId: string | null;
}
