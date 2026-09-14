# Adding a card pack

1. Add card definitions and a pack definition in a module under `src/content`.
2. Import and append them to the exported `cards` and `packs` arrays in `catalog.ts`.
3. Put referenced artwork under `public/art`. References use `art/name.svg`, `.png`, `.webp`, or `.avif`, without a leading slash.
4. Run `npm test` and `npm run build`. The build checks fields, IDs, membership, and local artwork existence.
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
  artwork: 'art/tankard.svg',
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

Use stable namespaced IDs; never recycle one for an unrelated card. Supported categories: `sip`, `group`, `category`, `challenge`, and `rule`. Rules are plain text, not HTML. Keep one clear instruction, generally under 45 words; long text may grow the card and scroll the page instead of shrinking the type. Illustration briefs remain authoring metadata. Do not bake rule text into artwork.

Overlapping packs share a card by ID; it enters the shuffle pool only once. New packs are off until selected. Pack choices affect the next game; an active session retains its snapshot. Keep previously published artwork available when possible. Ship expansions with a new build, not a remote download service.

Before the production content session: review variety, repetition, category stopping conditions, and ongoing-rule duration. Agree on final copy and stable IDs before commissioning or generating artwork.

Packs can optionally specify `artwork: 'art/your-pack.webp'`. The file must exist and follow the same local path rules as card artwork. Omit it to use the painted tankard. Shared pack controls and card frames are automatic; packs do not carry UI components, animation logic, or fonts.

## Card workshop

Run `npm run dev`, then open `http://127.0.0.1:5173/?workshop=1`. Search and filter the catalog, pick a card, adjust preview width or enlarged text, and tap the card to exercise the actual flip/discard controller. Replay reveal deals the selected card facedown. The seed reproduces shuffle order; the chosen card is moved to the front without changing pool membership. No workshop actions write game saves or preferences.

The new front study is on by default here only. Turn it off to compare the current shipping frame. The study uses one finished illustration for `core.cheers`; remaining cards keep placeholder artwork. Study assets and code are removed from production builds. See GAME_DESIGN.md for the editorial rubric and PLAYTEST.md before commissioning the full collection.

## Illustration and pack identity

Follow `ILLUSTRATION_GUIDELINES.md` before generating any new art. The old dwarf direction is rejected. Use original, centered, simple fantasy subjects and test the illustration in the real small frame.

Each registered pack now needs a distinct `logo`, such as `logo: 'art/packs/core.svg'`. Keep logo paths stable and add the file under public/art/packs; the build rejects missing files and reused logo paths. The same mark appears in setup, the pause legend, and card footers. The Core diamond is reserved for Core. Optional typing keeps older pack fixtures compatible, but release validation requires explicit logos for all registered packs.

A shared card shows marks for selected packs containing it, in catalog order. Marks follow the installed catalog as cosmetic metadata; they do not alter or rewrite a saved session. Stable namespaced IDs preserve the known origin's mark for retired cards in older saves. Unknown removed packs do not acquire an invented Core mark. Keep old pack metadata and logo assets available across releases when possible. Gameplay, snapshots, and shuffled order are unchanged.
