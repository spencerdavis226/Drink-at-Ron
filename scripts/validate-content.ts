import { existsSync } from "node:fs";
import { cards, packs, validateCatalog } from "../src/content/catalog";
import { theme } from "../src/presentation/theme";
validateCatalog(cards, packs);
for (const c of cards)
  if (!existsSync(`public/${c.artwork}`))
    throw Error(`Missing artwork: ${c.artwork}`);
console.log(`Validated ${cards.length} cards in ${packs.length} pack(s).`);

for (const p of packs)
  if (p.artwork && !existsSync(`public/${p.artwork}`))
    throw Error(`Missing pack artwork: ${p.artwork}`);

for (const path of [
  ...Object.values(theme.assets),
  "fonts/grenze.woff2",
  "fonts/grenze-italic.woff2",
  "fonts/OFL.txt",
])
  if (!existsSync(`public/${path}`))
    throw Error(`Missing theme asset: ${path}`);

const logos = new Set<string>();
for (const pack of packs) {
  if (!pack.logo || !existsSync(`public/${pack.logo}`))
    throw Error(`Missing pack logo: ${pack.id}`);
  if (logos.has(pack.logo))
    throw Error(`Packs must have distinct logos: ${pack.id}`);
  logos.add(pack.logo);
}
