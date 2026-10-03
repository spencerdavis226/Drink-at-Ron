# reference — raw supplied sources

Read `README.md` here. Files are exactly as the user supplied them: do not edit, reformat, fix typos, or "correct" them to match shipping copy. To update one, replace the raw file and rerun its parser (`npm run house:reference`, `npm run cabiin:reference`), then diff the generated JSON before touching `src/content`.

Nothing here may be imported by `src/` or bundled. The Pokémon JSON has no parser; it is read by hand when editing `src/content/pokemon.ts`.
