import { readFile, writeFile } from "node:fs/promises";
import { parseCsv } from "./csv";

/**
 * Parse Spencer's CABIIN 2.0 board-game card sheet into a readable JSON
 * reference. This is *reference material only* — nothing in `src/` imports it,
 * and it never enters the runtime bundle. See docs/CARD_VOICE_REFERENCE.md for
 * how the tone is (and is not) translated into Drink at Ron.
 *
 * Source : reference/cabiin-2/cards.csv   (one card per CSV cell: "Title\nBody")
 * Output : reference/cabiin-2/cards.json  (array of { index, title, body })
 *
 * Reference files are raw sources: replace the CSV with a newer supplied
 * version and rerun; never rewrite it to match the shipping catalog. Run
 * `npm run cabiin:reference` after replacing the CSV.
 */

const SOURCE = "reference/cabiin-2/cards.csv";
const OUTPUT = "reference/cabiin-2/cards.json";

const csv = await readFile(SOURCE, "utf8");
const cells = parseCsv(csv)
  .flat()
  .map((cell) => cell.trim())
  .filter(Boolean);

const cards = cells.map((cell, offset) => {
  const newline = cell.indexOf("\n");
  const title = (newline === -1 ? cell : cell.slice(0, newline)).trim();
  const body = newline === -1 ? "" : cell.slice(newline + 1).trim();
  return { index: offset + 1, title, body };
});

const reference = {
  $comment:
    "Reference material parsed from Spencer's CABIIN 2.0 board game. Not game content and not imported at runtime. Board/team/zone/movement rules are intentionally not carried into Drink at Ron; see docs/CARD_VOICE_REFERENCE.md.",
  source: SOURCE,
  count: cards.length,
  cards,
};

await writeFile(OUTPUT, `${JSON.stringify(reference, null, 2)}\n`);
console.log(`Wrote ${OUTPUT} (${cards.length} cards).`);
