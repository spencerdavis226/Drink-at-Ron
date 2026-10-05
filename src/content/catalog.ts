import { coreCards, samplePack } from "./sample";
import { houseCards, housePack } from "./custom";
import { vipCards, vipPack } from "./vip";
import { pokemonCards, pokemonPack } from "./pokemon";
import { cabinCards, cabinPack } from "./cabin";
import { likelyCards, likelyPack } from "./likely";
import type { CardDefinition, PackDefinition } from "../game/types";
import { installCatalog } from "./registry";
export { validateCatalog } from "./validate";

// The runtime catalog. Six opt-in packs: the generated main deck, the
// supplied Sheet1 house deck (verbatim), VIP night, the Pokémon board-sheet
// translation, Cabin weekend (the CABIIN 2.0 board game, off the board),
// and Most Likely To (vote cards). Card content is provided sample material and is expected to change.
export const cards: CardDefinition[] = [
  ...coreCards,
  ...houseCards,
  ...vipCards,
  ...pokemonCards,
  ...cabinCards,
  ...likelyCards,
];
export const packs: PackDefinition[] = [
  samplePack,
  housePack,
  vipPack,
  pokemonPack,
  cabinPack,
  likelyPack,
];

// Importing the catalog installs it. The app loads this module lazily (see
// `registry.ts`) so card content stays out of the initial chunk.
installCatalog({ cards, packs });
