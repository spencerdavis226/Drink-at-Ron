# Adding a card pack

1. Add card definitions and a pack definition in a module under `src/content`.
2. Import and append them to the exported `cards` and `packs` arrays in `catalog.ts`.
3. Put referenced artwork under `public/art`. A card's `artwork` must be a key in the registry in `src/presentation/artwork.ts`; the shared placeholder is `art/tankard.webp`. To ship a finished illustration, add the file and a registry entry (public path plus `scene: 'painted'`) instead of branching on a card ID in `CardFace`.
4. Run `npm test` and `npm run build`. The build checks fields, IDs, membership, and resolves every card's artwork through that same registry, failing on an unregistered reference or a missing file.
5. Inspect each card at small iPhone size and enlarged text. The group should understand a rule on one reading.

Example (not enabled in the catalog):

```ts
import type { CardDefinition, PackDefinition } from '../game/types';
export const exampleCards: CardDefinition[] = [{
  version: 1,
  id: 'fireside.story',
  title: 'Fireside story',
  rules: 'Going clockwise, each person adds one sentence to a story. End after one round.',
  category: 'challenge',
  artwork: 'art/tankard.webp',
  illustrationBrief: 'A friendly dragon telling a story beside a tiny fireplace.',
}];
export const examplePack: PackDefinition = {
  version: 1,
  id: 'fireside',
  logo: 'art/packs/fireside.svg', // Create a distinct small pack mark.
  title: 'By the fireside',
  description: 'Stories and gentle mischief for a cozy table.',
  cardIds: exampleCards.map(card => card.id),
};
```

Use stable namespaced IDs; never recycle one for an unrelated card. Supported categories: `sip`, `group`, `category`, `challenge`, and `rule`. Rules are plain text, not HTML. Keep one clear instruction. Aim for 120 characters and 24 words or less; the build flags longer copy for review and rejects rules over 180 characters or 35 words. Specify who starts and when the activity ends. Long text stays inside the fixed 2:3 card and scrolls within the rules panel at enlarged settings; the card never grows for content. Illustration briefs remain authoring metadata. Do not bake rule text into artwork.

Card titles have a hard authoring limit of 22 characters and 12 characters per word. The title starts at a size proportional to card width and shrinks only if its rendered text would exceed the two-line teal band, down to 18px. The workshop/browser fit check is still required because equal-length words can render at different widths. Existing saved titles are never shortened or renamed; unusually long legacy titles remain scrollable.

Overlapping packs share a card by ID; it enters the shuffle pool only once. New packs are off until selected. Pack choices affect the next game; an active session retains its snapshot. Keep previously published artwork available when possible. Ship expansions with a new build, not a remote download service.

Before the production content session: review variety, repetition, category stopping conditions, and ongoing-rule duration. Agree on final copy and stable IDs before commissioning or generating artwork.

For an incoming CSV, review column mapping, stable IDs, duplicate concepts, pack membership, dice outcomes, and the text limits before adding anything to the catalog. Preview every accepted card in the workshop at small-phone width and enlarged text. Update `docs/PLAYTEST.md` to match the accepted catalog; do not silently rewrite an active game's saved card snapshot.

Packs can optionally specify `artwork: 'art/your-pack.webp'`. The file must exist and follow the same local path rules as card artwork. Omit it to use the painted tankard. Shared pack controls and card frames are automatic; packs do not carry UI components, animation logic, or fonts.

## Card workshop

Run `npm run dev`, then open `http://127.0.0.1:5173/?workshop=1`. Search and filter the catalog, pick a card, set the preview viewport width and height or enlarged text, and tap the card to exercise the actual flip/discard controller. The preview renders the real shipping `Play` component and frame — there is no separate front-study toggle. Replay reveal deals the selected card facedown. The seed reproduces shuffle order and dice outcomes; the chosen card is moved to the front without changing pool membership. No workshop actions write game saves or preferences. See GAME_DESIGN.md for the editorial rubric and PLAYTEST.md before commissioning the full collection.

## Illustration and pack identity

Follow `ILLUSTRATION_GUIDELINES.md` before generating any new art. The old dwarf direction is rejected. Use original, centered, simple fantasy subjects and test the illustration in the real small frame.

Each registered pack now needs a distinct `logo`, such as `logo: 'art/packs/core.svg'`. Keep logo paths stable and add the file under public/art/packs; the build rejects missing files and reused logo paths. The same mark appears in setup, the pause legend, and card footers. The Core diamond is reserved for Core. Optional typing keeps older pack fixtures compatible, but release validation requires explicit logos for all registered packs.

A shared card shows marks for selected packs containing it, in catalog order. Marks follow the installed catalog as cosmetic metadata; they do not alter or rewrite a saved session. Stable namespaced IDs preserve the known origin's mark for retired cards in older saves. Unknown removed packs do not acquire an invented Core mark. Keep old pack metadata and logo assets available across releases when possible. Gameplay, snapshots, and shuffled order are unchanged.
