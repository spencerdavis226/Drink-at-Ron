# Reference material

Raw, user-supplied sources for card titles and text. This folder is input
material, not game content:

- Nothing here is imported by `src/` or bundled at runtime.
- Files are preserved as supplied. **Never rewrite a reference file to match
  what the game ships**; replace it with the newer supplied version instead.
- The shipping copy lives in `src/content/` with stable IDs that map back to
  these sources (for example `house.sheet-003` = house sheet row 3).
- Parsed JSON companions are generated from the raw files by the npm scripts
  below. To update one, replace the raw file in place and rerun its parse.

## Contents

| File | What it is | Parse |
| --- | --- | --- |
| `cabiin-2/cards.csv` | Spencer's CABIIN 2.0 board-game sheet as supplied: 97 cells, one card per cell (`Title\nBody`). Tone reference for card voice. | `npm run cabiin:reference` |
| `cabiin-2/cards.json` | Parsed companion: `{ index, title, body }`. | — |
| `Drink at Ron - Sheet1.csv` | The supplied house sheet. Five columns: Main Title, Main Description, spacer, VIP Title, VIP Description. Rows 1–2 are headers, row 75 is blank, row 106 (`Debate`) is title-only. | `npm run house:reference` |
| `drink-at-ron-sheet1.json` | Parsed companion: `{ row, title, description }` entries, 103 house rows (including title-only row 106) and 4 VIP rows; each row number is the sheet row. | — |
| `drink_at_ron_sample_cards_40_v3.json` | The earlier 40-card translation of the CABIIN voice into this game; the seed of the Core deck. | — |

## How the sources map to the game

- **House**: `src/content/custom.ts` restores the 102 house rows that have a
  description (blank row 75 and title-only row 106 are excluded) as
  `house.sheet-003`…`house.sheet-105`. The 2026-09-26 logic pass made minimal
  clarity edits to six ambiguous rows; those edits exist only in the shipping
  source, never in this folder.
- **VIP**: the four VIP rows become `vip.sheet-003`…`vip.sheet-006` in the same
  file; the rest of `VIP night` is original.
- **CABIIN**: tone reference only; see `docs/CARD_VOICE_REFERENCE.md` for what
  does and does not carry over.
- **Sample 40**: the earlier design artifact; its copy was revised heavily in
  the shipping Core deck, so treat it as provenance rather than current text.

## Adding a new reference file

Drop the raw file in this folder with a descriptive name, add a row to the
table above, and (if it has a structured parse) add a small `scripts/*-reference.ts`
script plus an npm alias. Keep parsers read-only against the raw file and write
their JSON next to it. See `docs/AUTHORING.md` for House-content rules.
