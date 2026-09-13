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
  title: 'By the fireside',
  description: 'Stories and gentle mischief for a cozy table.',
  cardIds: exampleCards.map(card => card.id),
};
```

Use stable namespaced IDs; never recycle one for an unrelated card. Supported categories: `sip`, `group`, `category`, `challenge`, and `rule`. Rules are plain text, not HTML. Keep one clear instruction, generally under 45 words; long text may grow the card and scroll the page instead of shrinking the type. Illustration briefs remain authoring metadata. Do not bake rule text into artwork.

Overlapping packs share a card by ID; it enters the shuffle pool only once. New packs are off until selected. Pack choices affect the next game; an active session retains its snapshot. Keep previously published artwork available when possible. Ship expansions with a new build, not a remote download service.

Before the production content session: review variety, repetition, category stopping conditions, and ongoing-rule duration. Agree on final copy and stable IDs before commissioning or generating artwork.
