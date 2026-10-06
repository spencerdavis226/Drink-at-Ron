import sharp from "sharp";
import { readFile, stat } from "node:fs/promises";
const root = "assets/source/title-crest-2026-10-06";
const art = JSON.parse(await readFile(`${root}/selected.json`, "utf8"));
await sharp(`${root}/${art.source}`)
  .resize({ width: art.width - art.padding * 2 })
  .extend({
    top: art.padding,
    bottom: art.padding,
    left: art.padding,
    right: art.padding,
    background: "#00000000",
  })
  .webp({ quality: art.quality, alphaQuality: 90, effort: 6 })
  .toFile(art.output);
const bytes = (await stat(art.output)).size;
if (bytes > 60 * 1024)
  throw new Error("Title crest exceeds its 60 KiB allocation");
console.log(`Title crest: ${(bytes / 1024).toFixed(1)} KiB`);
