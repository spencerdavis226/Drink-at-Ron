export const VERSION = 1 as const;
export type Category = "sip" | "group" | "category" | "challenge" | "rule";
export interface DiceOutcome {
  min: number;
  max: number;
  /** Repeat step so a table can cover every other total (odds, evens). */
  step?: number;
  instruction: string;
}
export interface DiceDefinition {
  version: 1;
  count: number;
  sides: 6 | 20;
  instruction?: string;
  /** Replaces the normal instruction when every die shows the same face. */
  doubles?: string;
  outcomes?: DiceOutcome[];
  /** The roll is one of two options. `skip` labels the option that puts the
   * card aside without rolling; `roll` labels the option that rolls. */
  choice?: { skip: string; roll: string };
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
  /** The id of the pack whose quest meter this card advances when it is put
   * aside (a gym battle earns a badge). */
  quest?: string;
}
/** A pack mechanic: a table-wide meter that, on reaching its goal, makes the
 * finale the next card. The finale is authored with the pack's cards but is
 * not in `cardIds`, so it never enters the shuffle. */
export interface PackQuest {
  label: string;
  goal: number;
  finaleId: string;
}
/** A quest's progress in one game. `due` means the finale is the card in
 * play (or the next one drawn); `shown` counts finales already put aside. */
export interface QuestState {
  packId: string;
  label: string;
  goal: number;
  count: number;
  due: boolean;
  shown: number;
  finale: CardDefinition;
}
export interface PackDefinition {
  version: 1;
  id: string;
  title: string;
  description: string;
  cardIds: string[];
  artwork?: string;
  /** One single-colour silhouette; the app tints it wherever it appears. */
  logo?: string;
  quest?: PackQuest;
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
  /** Present only when a selected pack has a quest; older saves omit it. */
  quests?: QuestState[];
}
