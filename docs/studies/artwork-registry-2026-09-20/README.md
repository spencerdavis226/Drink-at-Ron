# Artwork registry — task 5 evidence (2026-09-20)

Reproduces the before/after for task 5 (one artwork registry). Built with
`BASE_PATH=/Drink-at-Ron/ npm run build`; screenshots captured from the built
`dist` through `vite preview` at 390×844, Chromium.

## Change

- `src/presentation/artwork.ts` (new) is the single source of truth: a registry
  keyed by the stored `CardDefinition.artwork` string, plus `resolveArtwork`
  (render + preload) and `normalizeArtwork` (legacy strings).
- `src/presentation/frame-surfaces.ts` (new) owns the bundled `continuous-*`
  frame surfaces; the eager `import.meta.glob("presentation/art/*.webp")` in
  `main.tsx` is gone, so a new illustration under `presentation/art` can no
  longer be eagerly bundled or preloaded.
- `Cheers, Idiots`' individual illustration moved from the bundled
  `src/presentation/art/cheers-armor-v3.webp` to `public/art/cheers.webp` and is
  now selected by its `artwork` reference; `Cards.tsx` no longer branches on
  `card.id`.
- `scripts/validate-content.ts` resolves every card through the same registry
  and fails the build on an unregistered reference or missing file.

## Measurements (before → after)

| Metric | Before (`52e4a23`) | After | Note |
| --- | --- | --- | --- |
| Runtime bytes | 2599 KiB | 2599 KiB | unchanged |
| Initial JS gzip | 81.8 KiB | 81.8 KiB | unchanged |
| Lazy JS gzip | 146.2 KiB | 146.2 KiB | unchanged |
| Precache entries / bytes | 39 / 2580.56 KiB | 39 / 2580.66 KiB | same file count |
| Eagerly preloaded art files | 14 (7 theme + 7 glob) | 13 (7 theme + 6 frame) | illustration now on demand |
| Largest image | `art/card-back.webp` 302 KiB | `art/card-back.webp` 302 KiB | under 500 KiB |
| Card illustration | hashed `assets/cheers-armor-v3-*.webp` 59.9 KiB | `art/cheers.webp` 59.9 KiB | same bytes, stable path |

## Rendered proof

- `cheers-painted-phone.png` — `core.cheers-idiots`:
  `src=/Drink-at-Ron/art/cheers.webp`, `class=painted-scene`,
  `naturalWidth=768`, computed `object-fit: cover`.
- `placeholder-phone.png` — a placeholder card:
  `src=/Drink-at-Ron/art/tankard.webp`, `class=placeholder-scene`,
  `naturalWidth=640`, computed `object-fit: contain`.

Both the scene class and the computed fit now come from the registry entry
(scene + `fit`), not from a card-ID conditional.

## Checks

`npm test` 78 passed; `BASE_PATH=/Drink-at-Ron/ npm run build` passed (52 cards,
2 packs); full e2e 77 passed / 3 skipped; `test:update` passed;
`test:workshop` 10 passed.

## Open

- `public/art/packs/dice.svg` and `public/art/tankard.svg` remain unused; kept
  as historical/source assets rather than deleted in this task.
