import { existsSync } from "node:fs";
import { cards, packs, validateCatalog } from "../src/content/catalog";
import { artworkRegistry, normalizeArtwork } from "../src/presentation/artwork";
import { theme } from "../src/presentation/theme";
validateCatalog(cards, packs);
// Card scenes resolve through the artwork registry: an unregistered reference
// or a missing file fails the build, while old saved strings still render at
// runtime through the same resolver.
for (const c of cards) {
  const spec = artworkRegistry[normalizeArtwork(c.artwork)];
  if (!spec) throw Error(`Unregistered artwork for ${c.id}: ${c.artwork}`);
  if (spec.publicPath && !existsSync(`public/${spec.publicPath}`))
    throw Error(`Missing artwork: ${spec.publicPath}`);
}
for (const [reference, spec] of Object.entries(artworkRegistry))
  if (spec.publicPath && !existsSync(`public/${spec.publicPath}`))
    throw Error(`Missing registered artwork: ${reference}`);
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
