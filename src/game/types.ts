export const VERSION = 1 as const;
export type Category = "sip" | "group" | "category" | "challenge" | "rule";
export interface DiceDefinition {
  version: 1;
  count: number;
  sides: 6 | 20;
  instruction?: string;
  outcomes?: { min: number; max: number; instruction: string }[];
}
export interface DiceRoll {
  values: number[];
  total: number;
  instruction: string;
  returned: boolean;
}
export interface CardDefinition {
  version: 1;
  id: string;
  title: string;
  rules: string;
  category: Category;
  artwork: string;
  dice?: DiceDefinition;
}
export interface PackDefinition {
  version: 1;
  id: string;
  title: string;
  description: string;
  /** Optional one-line setup reminder shown when this pack is selected. */
  setupHint?: string;
  cardIds: string[];
  artwork?: string;
  logo?: string;
}
export interface GameConfig {
  version: 1;
  packIds: string[];
  limit: number | null;
}
export interface SessionState {
  version: 2;
  roll: DiceRoll | null;
  previousRoll: DiceRoll | null;
  config: GameConfig;
  cards: CardDefinition[];
  order: string[];
  position: number;
  cycle: number;
  discarded: number;
  phase: "hidden" | "revealed" | "complete";
  previousId: string | null;
}
