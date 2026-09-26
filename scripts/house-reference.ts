import { readFile, writeFile } from "node:fs/promises";
import { parseCsv } from "./csv";

/**
 * Parse the supplied `Drink at Ron - Sheet1.csv` house sheet into a readable
 * JSON reference with separate `house` and `vip` blocks. This is *reference
 * material only* — nothing in `src/` imports it, and it never enters the
 * runtime bundle. The shipping copy lives in `src/content/custom.ts` and
 * `src/content/vip.ts`; this file preserves what the sheet actually said.
 *
 * Source : reference/Drink at Ron - Sheet1.csv
 *          Five columns: Main Title, Main Description, spacer, VIP Title,
 *          VIP Description. Rows 1–2 are headers; data starts at row 3.
 * Output : reference/drink-at-ron-sheet1.json
 *          `{ row, title, description }` entries with 1-based sheet rows.
 *          Fully blank rows (75) are omitted; title-only row 106 is kept.
 *
 * Reference files are raw sources: replace the CSV with a newer supplied
 * version and rerun; never rewrite the CSV or the JSON to match the shipping
 * catalog. Run `npm run house:reference` after replacing the sheet.
 */

const SOURCE = "reference/Drink at Ron - Sheet1.csv";
const OUTPUT = "reference/drink-at-ron-sheet1.json";
const HEADER_ROWS = 2;

type SheetEntry = { row: number; title: string; description: string };

let source: string;
try {
  source = await readFile(SOURCE, "utf8");
} catch {
  throw new Error(
    `Expected the supplied house sheet at ${SOURCE}. Replace it in place with the newer supplied CSV and rerun.`,
  );
}
const rows = parseCsv(source);

const header = (rows[1] ?? []).map((cell) => cell.trim().toLowerCase());
if (
  !header[0]?.includes("title") ||
  !header[1]?.includes("description") ||
  !header[3]?.includes("title") ||
  !header[4]?.includes("description")
) {
  throw new Error(
    `Unexpected header row in ${SOURCE}: expected Main Title/Description and VIP Title/Description columns in rows 1-2.`,
  );
}

const house: SheetEntry[] = [];
const vip: SheetEntry[] = [];

rows.forEach((cells, index) => {
  const row = index + 1;
  if (row <= HEADER_ROWS) return;
  const mainTitle = (cells[0] ?? "").trim();
  const mainDescription = (cells[1] ?? "").trim();
  const vipTitle = (cells[3] ?? "").trim();
  const vipDescription = (cells[4] ?? "").trim();
  if (mainTitle || mainDescription) {
    house.push({ row, title: mainTitle, description: mainDescription });
  }
  if (vipTitle || vipDescription) {
    vip.push({ row, title: vipTitle, description: vipDescription });
  }
});

const reference = {
  $comment:
    "Reference material parsed from the supplied Sheet1 house sheet. Not game content and not imported at runtime; the shipping copy lives in src/content/custom.ts and src/content/vip.ts. Rows are 1-based sheet row numbers (card IDs derive from them). Fully blank rows are omitted; the title-only row 106 is kept as supplied. Never edit this file to match the game: replace the CSV and rerun npm run house:reference.",
  source: SOURCE,
  counts: { house: house.length, vip: vip.length },
  house,
  vip,
};

await writeFile(OUTPUT, `${JSON.stringify(reference, null, 2)}\n`);
console.log(
  `Wrote ${OUTPUT} (${house.length} house rows, ${vip.length} VIP rows).`,
);
