import { existsSync } from "node:fs";
import { cards, packs, validateCatalog } from "../src/content/catalog";
validateCatalog(cards, packs);
for (const c of cards)
  if (!existsSync(`public/${c.artwork}`))
    throw Error(`Missing artwork: ${c.artwork}`);
console.log(`Validated ${cards.length} cards in ${packs.length} pack(s).`);
