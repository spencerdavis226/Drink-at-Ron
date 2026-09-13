# Visual pass assets

Generated with the built-in image-generation tool. Original PNGs are preserved in `assets/source`; runtime WebP assets live in `public/art`. Resizing and WebP encoding use Sharp (no visual edits). The tankard preserves alpha. These are original fantasy-tavern assets, with no borrowed characters or logos.

## back

Create a production game asset: a single full-bleed portrait 2:3 fantasy tavern playing-card BACK texture. The image itself IS the card surface, edge to edge, straight-on orthographic, no surrounding scene, no perspective. Original painterly Hearthstone-like richness, handcrafted worn dark teal leather inset, chunky antique carved bronze and wood border, scuffed irregular bevels, tiny chips, warm edge highlights and deep crevices, lovingly handled rather than filthy. Central circular hammered-bronze medallion embossed with a cheerful foaming beer tankard, subtle turquoise enamel. Embossed flowing ornamental scrollwork, asymmetric handpainted imperfections. Luxurious restrained palette teal, walnut, old gold. NO text, NO letters, NO numbers, NO logo, NO sharp vector lines, NO photorealism. Border about 7 percent of width, keep corners almost square with gently rounded tips. Single usable card texture, not mockup.

## table

Production game background asset, portrait 2:3, top-down orthographic close-up of a dark weathered walnut tavern table. Hand-painted premium fantasy card-game style like Hearthstone, original artwork. Broad chunky old wooden planks with restrained carved grain, rubbed edges, shallow dents, occasional faint ring stain; warm brown highlights with deep neutral charcoal shadows. Calm large dark center where cards and UI will sit; brighter subtle amber grazing light along outer sides only. Full bleed surface, no objects, no cards, no glasses, no candles, no text, no borders, no scene perspective. Painterly tangible materials, low contrast and beautifully quiet, no perfect vector lines, no busy props. NOT photorealistic. Only the usable tabletop texture.

## front

Production game UI asset: a full-bleed portrait 2:3 empty fantasy card FRONT surface. Image itself is card face, flat orthographic edge-to-edge with no external backdrop, no perspective. Original Hearthstone-like hand-painted tactile style. Thick roughly sculpted walnut and tarnished bronze frame hugging outer 6 percent of image, softly chipped beveled corners, tiny scratches, rubbed golden highlights. Interior entirely empty warm antique cream parchment, subtly mottled fibrous paper, lightly stained toward edges but very calm bright readable center. Interior fills 85 percent of width and height, no inset windows or subdivisions. Empty parchment for live text and separate artwork to be placed on it. No illustrations, no objects, no symbols, no text, no letters, no UI, no perfect vector lines. Warm old gold and ivory with brown worn edges. Border near rectangular with gently rounded tips. Single usable card skin, not a mockup.

## mug

Single game card illustration, square format with genuinely transparent background and alpha. A charming chunky wooden fantasy tavern tankard filled with soft overflowing cream foam, battered hammered brass bands and a small round turquoise enamel ornament, sitting at a playful slight tilt. Original handpainted Hearthstone-style premium fantasy game art, rich brushstrokes, chiseled stylized forms, warm amber highlights, sculpted shadows, worn wood grain and nicked metal, beautiful painterly edges. Three tiny floating amber sparks and subtle grounding shadow only. Centered entire tankard visible with generous transparent margin. No text, no letters, no frame, no scene, no vector outlines, not photorealistic. This replaces a flat vector mug with expensive-looking original painted game art.


## Unified design system

The approved card back, parchment, tankard, and tabletop remain the permanent reference. Extend weathered walnut, dark teal leather, nicked bronze, and warm cream parchment; use the same upper-left lighting, restrained contact shadows, and worn edges. Functional labels stay plain and large. Keep background decoration away from the central card text.

- Shared asset, color, and motion definitions: `src/presentation/theme.ts`; shared CSS: `src/presentation/theme.css`.
- Grenze throughout: variable upright and italic WOFF2 files from the official Omnibus-Type repository, bundled locally with `public/fonts/OFL.txt`. Titles use 700–800, controls 500–700, and rules 400. Rule text is 20–24 px at normal scale and grows with text enlargement.
- Nine-slice borders preserve the painted frame corners on buttons, choice tiles, pack tiles, dialogs, recovery panels, and card fronts. Do not stretch a whole panel image around long content.
- Primary controls use worn gold. Secondary surfaces use quiet teal leather. Functional icon symbols sit inside the generated bezel and retain accessible names.
- Motion durations: deal 620 ms, flip 680 ms, discard 460 ms, settle 140 ms, completion 650 ms. CSS consumes the manifest values. Reduced Motion disables animation; browser cancellation and visibility changes settle to saved state.
- Effects and Ambience default off (existing effects preferences survive); Atmosphere defaults on. Atmospheric movement is sparse: warm edge lighting, six small embers at the outer edges, and a short reveal glint. Suspend when hidden.
- Audio is original procedural Web Audio foley and fireplace ambience, with no sampled recordings, music, speech, licensing service, or network dependency. On-device listening remains part of release QA.

## Reusable control artwork

Built-in image-generation tool, using the approved card back and front as reference inputs. `assets/source/ui-chrome.png` preserves the first generation; `assets/source/ui-chrome-final.png` preserves the final dark-background sheet. `scripts/chrome.ts` exports the observed button, panel, and bezel rectangles to `public/art/button.webp`, `panel.webp`, and `bezel.webp`. `scripts/icons.ts` composites the painted tankard inside the bezel and exports optimized PNG Home Screen icons.

Generation prompt:

> Create a SINGLE production UI asset sheet for the fantasy tavern game using the attached approved card materials as strict art-direction references. Original handpainted bronze walnut teal leather, chipped and rubbed, same lighting and colors, never clean vector lines. Transparent background. Canvas 1024x1024. Arrange THREE distinct isolated usable components with generous blank transparent gutters: TOP HALF a wide horizontal rectangular gold/brass primary button plate with rounded chipped corners, raised bronze edging, luminous worn gold interior completely blank for live text. LOWER LEFT a square dark walnut panel with bronze corner brackets and flat quiet dark teal leather center, for a scalable nine-slice dialog panel. LOWER RIGHT a small square hammered bronze icon-button bezel, dark center completely blank for an overlaid functional symbol. Orthographic front view, all aligned, no perspective, no cast shadow outside component. NO words, NO letters, NO icons, NO text, NO mockup. All shapes self contained and not touching. This is reusable game chrome, not cards.

Correction prompt (the first output rendered a checkerboard instead of alpha):

> Edit this UI asset sheet only: replace ALL gray-and-white checkerboard background with a uniform solid very dark warm brown #17100c. Keep the three painted components exactly unchanged, at exactly the same positions and dimensions, with identical artwork, edges and colors. No checkerboard anywhere, no transparency needed. Do not add or remove or move anything.
