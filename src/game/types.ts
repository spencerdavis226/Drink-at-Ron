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
  /** A short gold ribbon on the card face, e.g. "Gym Leader · Boulder Badge". */
  ribbon?: string;
}
/** A pack's game mode: a table-wide meter that, on reaching its goal, deals
 * the finale, and the game ends when the finale is put aside. The finale is
 * authored with the pack's cards but is not in `cardIds`, so it never enters
 * the shuffle. */
export interface PackQuest {
  /** The mode's name on the setup screen, e.g. "Pokémon League". */
  mode: string;
  /** One short line under the mode's name. */
  summary: string;
  /** The meter's label, e.g. "Badges". */
  label: string;
  goal: number;
  /** The quest's cards are spread through this many draws, so the finale is
   * dealt by then. */
  length: number;
  /** Cards that only play in this mode (not in `cardIds`). */
  cardIds: string[];
  finaleId: string;
}
/** A quest's progress in one game. `due` means the finale is the card in
 * play (or the next one drawn). */
export interface QuestState {
  packId: string;
  label: string;
  goal: number;
  length: number;
  count: number;
  due: boolean;
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
  /** A quest mode: the id of the selected pack whose quest runs the game.
   * The game has no card limit; it ends on the quest's finale. */
  quest?: string;
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
  /** Present only in a quest mode; older saves omit it. */
  quest?: QuestState;
}
