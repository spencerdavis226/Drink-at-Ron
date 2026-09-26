import { readFile, writeFile } from "node:fs/promises";

/**
 * Parse Spencer's CABIIN 2.0 board-game card sheet into a readable JSON
 * reference. This is *reference material only* — nothing in `src/` imports it,
 * and it never enters the runtime bundle. See docs/CARD_VOICE_REFERENCE.md for
 * how the tone is (and is not) translated into Drink at Ron.
 *
 * Source : docs/cabiin-2/cards.csv   (one card per CSV cell: "Title\nBody")
 * Output : docs/cabiin-2/cards.json  (array of { index, title, body })
 *
 * Run `npm run cabiin:reference` after changing the CSV.
 */

const SOURCE = "docs/cabiin-2/cards.csv";
const OUTPUT = "docs/cabiin-2/cards.json";

/** Minimal RFC 4180 reader: handles quotes, escaped quotes and newlines. */
function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

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
