import { writeFile } from "node:fs/promises";
import { packs } from "../src/content/catalog";
import { renderManifest } from "./manifest-render";

await writeFile(
  "src/content/manifest.generated.ts",
  await renderManifest(packs),
);
console.log(`Wrote src/content/manifest.generated.ts (${packs.length} packs).`);
