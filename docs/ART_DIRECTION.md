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

## Richer front study — pending approval

The study is isolated in the developer workshop. It is not yet the shipping card frame. Review `core.cheers`, `core.animals`, and `core.left` at Small phone and iPad sizes, then try enlarged text and Replay reveal. Approval is required before promoting this front into gameplay and Previous Card.

Composition: upper painted scene, raised teal title plaque, pale parchment instruction panel. Bronze hop-leaf corners, walnut rails, and contact shadows tie the front to the approved back. Nine-slice borders retain corner craftsmanship; rules remain real Grenze text and the card grows for long content. Categories stay in authoring metadata; the card footer carries the pack logo. Scene art is separate from frame and text.

New source artwork was generated with the built-in image generation tool, using `assets/source/card-back.png` and `assets/source/card-front.png` as references. Original PNGs are retained; optimized slices and the illustration live under `src/workshop/art` until approval.

### Frame sheet prompt

Create a production UI asset sheet for an original painted fantasy tavern card game. References establish exact weathered bronze, carved walnut, teal leather, warm parchment painterly craftsmanship. Output ONE square sheet with FOUR separate rectangular pieces arranged 2x2, gutters plain dark charcoal. Top left: ornate empty illustration surround, rectangular with arched ornamental top, dark teal blank interior, carved walnut outer rails and bronze hop-leaf corner hardware. Top right: wide blank teal leather title plaque with bronze beveled edge, no text. Bottom left: parchment rules panel, pale luminous blank readable center, intricate bronze and walnut edges, subtle hops corner carving. Bottom right: detailed small bronze hop-leaf ornament on dark teal. All front-facing orthographic flat assets, no perspective, no words, letters, numbers, stats, gems or logos. Each piece fully inside its quadrant with margins. Rich hand painted not vector. UI pieces for slicing, illustration goes into upper frame later. Match reference materials.

Saved source: `assets/source/front-study-sheet.png`. Extracted rectangles in source pixels: surround (8,8,610,589), plaque (638,137,603,326), parchment (8,619,610,589). WebP quality 85. The bottom-right ornament is retained in source for potential later use.

### A little cheers — revised original illustration

The dwarf study was rejected for excessive detail, franchise resemblance, and poor crop safety. It is no longer used. `ILLUSTRATION_GUIDELINES.md` is now the governing image-creation document. Categories remain metadata only; the action area shows rules and a pack logo. Core's four-point diamond matches setup and the pause legend.

Normal-size study cards share a common silhouette at each viewport. The art window is approximately 1.4:1; the scene never drives layout dimensions. Enlarged text may extend the frame instead of clipping or shrinking the rules.

Generated with the built-in image generation tool using the approved card back as a palette/material reference. New source: `assets/source/cheers-mouse-v2.png`; 768px-wide WebP: `src/workshop/art/cheers-mouse-v2.webp`.

#### Exact replacement prompt

Create an ORIGINAL whimsical storybook fantasy card illustration, landscape 3:2 composition, no border or text. 'A little cheers': one cheerful round field-mouse traveler in a simple moss-green cape raising a small bronze cup in a toast. Large readable rounded shapes, gentle expression, oversized round ears, simple silhouette. Mouse and raised cup form ONE compact centrally grouped subject entirely inside the middle 60 percent of the canvas horizontally and vertically. Show whole head and both ears with generous empty space ABOVE them; show complete cup. Main subject modest scale occupying only central 60 percent, never close-up cropped. Quiet soft warm ochre backdrop suggesting a tavern alcove through just one broad arch shape, no other characters, no tiny objects, no shelves, no candles, no particles, no crowd, no intricate costume. Three main color groups: warm chestnut fur, muted moss-teal cape, warm parchment-colored backdrop. Hand-painted gouache/oil storybook surface with broad brushwork, soft edge hierarchy, strong subject/background value separation. Readable at 120 pixels and at arm's length. Use supplied card-back ONLY as a palette and hand-crafted material reference, NOT composition or character style. Independently designed woodland fantasy character, no dwarf, no recognizable franchise characters, no Warcraft/Hearthstone character proportions, armor, logos, symbols, motifs or imitation. Friendly small adventure-book spirit, not photoreal, not vector. Essential subject safely centered so a small arched window can crop all four outer edges without losing ears, face or cup.

## Continuous front and goofy fantasy revision — pending approval

The user reaffirmed the cohesive Hearthstone-inspired material/rendering language, with more goofy tavern and dungeon-crawl humor where appropriate (Heroes of Barcadia / Munchkin as tone references). Original character identity is required, not a departure into quiet woodland storybook art. The mouse is superseded by an original enchanted copper armor toast study. The old assets remain checkpoint history, not the current direction.

The new master has one outer perimeter. The illustrated region and parchment are inset; a teal band attaches to the side rails with bronze brackets. `scripts/front-continuous.ts` exports top/bottom/side rails, band, and parchment from `assets/source/front-continuous-v3.png`. CSS masks interior portions of the perimeter exports so they do not cover art or the pack mark. No whole-card texture stretching; text remains DOM. The current study remains development-only pending visual approval.

Built-in image generation was used for both new assets and the illustration correction. Final source illustration: `assets/source/cheers-armor-v3.png`; optimized files are in `src/workshop/art` with continuous-* and cheers-armor-v3 names. Reproduce with `npx tsx scripts/front-continuous.ts`.

### Exact frame prompt

Production card FRONT master asset for the same original fantasy tavern game as reference. Portrait 2:3, orthographic edge-to-edge card, single object. EXACTLY ONE uninterrupted carved walnut perimeter with worn bronze hardware at its FOUR outer corners. Side rails run continuously top to bottom. Inside: upper 45 percent blank dark teal illustration opening, lower half blank pale luminous parchment for rules. At the boundary a BLANK teal leather title band runs edge to edge into the outer rails, fastened with small bronze brackets on left and right. The title band has no independent rectangular border, no corner caps, no bottom-row duplicate corners. Parchment tucks under this band and inside same outer rail. Strong original painterly fantasy collectible-card richness, sculpted scuffed bevels, warm upper left lighting, dimensional contact shadows, tasteful hop leaf details at outer corners only. No stats, gems, numbers, logos, text or actual illustration. Flat reusable UI skin, not scene/mockup. Crucial: unified SINGLE CARD not two stacked bordered panels. Border 6 percent wide, central parchment extremely quiet. Reference is material/lighting language, preserve bronze walnut and teal craftsmanship.

### Exact illustration prompt

Original premium painted fantasy party-game card illustration, landscape 3:2. Goofy bold heroic tavern comedy. One squat enchanted suit of dented copper armor with a wide bucket-shaped helmet, two expressive glowing amber eyes inside a dark visor and comically tiny feather, solemnly raising ONE comically tiny wooden cup with an oversized gauntlet. A ridiculous proud little toast, instantly readable visual joke. No human face or beard, no mouse or woodland-storybook character. No copied characters, insignia or franchise designs. Sculptural exaggerated shapes, confident broad digital oil brushwork, rich dimensional warm highlights and deep teal shadows, luxurious collectible-card painting, NOT thin ink drawing or flat vector. Keep COMPLETE helmet feather and cup well within central 65 percent with generous headroom and margins. One compact chest-up character clearly centered, about 65 percent image height; no cropped head. Quiet blurred walnut tavern backdrop, just large light/shadow masses, no clutter, shelves, crowd, scattered particles or miniature details. Reference only supplies bronze/walnut/teal materials and tactile richness. Goofy expressive silhouette with strong value separation and easy small-screen readability. No text, numbers, symbols, frame, stats, logos.

### Exact composition correction

Revise this original enchanted armor illustration. Keep the same character, expression, toast, palette, painterly style and simple background. ZOOM OUT substantially: shrink entire character and raised mug to approximately 65% of their current size and center the group. Add quiet blurred tavern background around them, especially 20% clear headroom above the feather and 15% empty margin left of the mug. Show the full feather and mug comfortably inside a central safe rectangle. Make the mug half its current size, amusingly tiny relative to the giant gauntlet. Simplify chest and shoulder ornament into broad plain copper and teal surfaces, fewer chips and etched details. Keep the dimensional painted finish and goofy friendly expression. Landscape 3:2. No words, logos, borders.
