# Drink at Ron — current visual design standards

Updated 2026-09-20 after a production-browser visual audit. **This section is normative; the historical generation prompts below are archival.** Implementation tasks and priorities live only in [STATUS.md](STATUS.md). These standards refine the approved art direction; they do not authorize replacing the frame, characters or renderer wholesale.

## Creative direction and quality bar

An original, mischievous fantasy tavern collectible-card game. Weathered walnut, sculpted worn bronze, deep teal leather, warm parchment and painted expressive characters. Hearthstone is a craftsmanship/rendering reference, not a source of characters, symbols, compositions or copied UI. Humor can be broad and goofy in the spirit of tabletop fantasy parody; retain one immediately readable gag or action.

The approved card back, continuous-front silhouette, cheers illustration and tankard remain anchors. **Premium means coherent construction and effortless reading before it means more detail.** A visible seam, hidden instruction, stretched frame, unclear control or detached shadow fails the quality bar even when the source art is excellent. Automated functional tests alone cannot approve a visual release.

See [visual audit evidence](studies/visual-audit-2026-09-20/README.md) for current failures. Those captures are not approved golden images.

## Card construction

- One physical card, one outer **2:3 ratio** in play, back, Previous Card and workshop. Title or rule length cannot determine outer height. Correct ratio must be measured on the untransformed box; allow for rotation when checking viewport clearance.
- Use shared stage/frame geometry, not separate approximations per screen. Reserve safe areas, HUD and any bottom control before sizing the stage. Target roughly 20–24 CSS px side clearance on small portrait phones, consistent with the approved current margins.
- Continuous perimeter: no hard horizontal rail joints, doubled bevels, abrupt wood-grain changes or visible rectangular masking cuts. Corners and sculpted ornaments retain their proportions; stretch only deliberately plain runs. Check at actual 1× display size and at 2× inspection.
- Illustration sits behind the frame. Plaque reads as attached to the same frame. Parchment sits inside/behind the inner lip; its square edges must not overlay carved hardware.
- One consistent lighting direction (warm upper-left), one dark contact edge and restrained outer shadow. Do not stack arbitrary inner glows and dark outlines to conceal poor assembly.
- Pack identity occupies a small dedicated footer position, outside the rules scroller, without covering rules. It appears in setup and pause using the same mark. No category label above the rule, decorative stats, or symbols implying mechanics.

## Reading comes before illustration acreage

The player should read one actionable instruction without figuring out the layout. Hierarchy on reveal: illustration/title establish personality; the **rule is the task**. At settlement, the dice result and resolved action become primary.

- Space allocation is responsive within the fixed silhouette. The illustration must yield height on short phones/long titles before rule text gets clipped or shrunk. Current fixed art allocation is not a design contract.
- Default 390×844 acceptance target: every approved Core instruction is fully readable without inner scrolling at normal text size. At 320×568, optimize for the same and record specific exceptions for review. A mere `scrollHeight > clientHeight` is not proof of clipped rules: measure the paragraph, footer and padding separately.
- Scrolling is the accessibility/exception fallback, not the default presentation of a two-sentence card. At enlarged text, keep contained scroll functional and obvious through a quiet edge affordance. Never add permanent “scroll here” helper copy, crop the last line, clamp instructions, or use microcopy to make a test pass.
- Short prompts can be centered. Longer instructions should be tested left-aligned with a clean reading measure; do not force every paragraph into a centered zigzag. Keep consistent paragraph placement rather than floating each card's text arbitrarily.
- Long titles may occupy two lines. Reserve their space before allocating art/rules. Never ellipsize meaning-bearing titles, overlap ornament or squeeze letter spacing to force one line.
- Large empty HUD-to-card gaps are not inherently premium. Balance the entire viewport before making the rules panel smaller. Ordinary play must not require scrolling past a mostly empty header.
- Short-height landscape needs an intentional approved reading composition. Never shrink the full portrait card until text is tiny or leave the rule entirely below the initial screen. A compact card alongside an accessible reading area is a study candidate, not an already-approved new screen.

## Typography

Use locally bundled **Grenze** throughout, with its existing license. No font swap as an expedient fix.

| Role | Starting range | Treatment |
| --- | --- | --- |
| Card title | 28–40 CSS px; a reviewed compact exception may use 26px | 700; approximately 1.05–1.15 line height; maximum two normal-size lines |
| Rules / resolved instructions | 20–24 CSS px normal size | 400–500; approximately 1.3–1.4 line height; warm dark ink |
| Primary controls | 24–28 CSS px | 600–700; clear baseline, 44px minimum target |
| Secondary controls / pack names | 20–24 CSS px | 500–600; readable unselected state |
| Progress | 20–24 CSS px | Quiet; subordinate to card, not another headline |
| Dice result | Larger numeral with restrained emphasis | High contrast, one accent; instruction remains equally readable |

Ranges are design starting points, not permission to override user text enlargement. Use rem-aware sizing where suitable; verify actual computed sizes. Do not make all text bold/black. Avoid heavy shadows on body text; save embossed/shadowed treatment for titles and controls. Body text on parchment should have comfortable contrast without noisy textures behind individual letters. Functional labels remain plain English; theme does not justify obscure wording.

Accessible names and live announcements must contain the actual action/result. Visually hidden content stays available to assistive technology and consumes no visible layout space. Never use `display:none` to “fix” a live announcement or expose accessibility helper prose as game copy.

## Art and surface density

Follow [ILLUSTRATION_GUIDELINES.md](ILLUSTRATION_GUIDELINES.md) for focal-safe composition, original character design and briefs.

- Center the important subject/action inside the safe crop region; show the whole meaningful silhouette. One dominant subject, a few broad color/value groups, quiet context. Inspect at the real small card window before approving detail.
- Keep the visual joke legible from across a table; tiny costume trivia is not the primary storytelling device.
- The tabletop and text panels must be quieter than the card. Edge grain, scuffs and bronze highlights can be rich; avoid competing high-contrast grain directly behind UI text.
- Existing repeated tankard scenes are explicitly provisional. Do not bake titles, rules or pack symbols into illustrations. Use the shared artwork registry rather than component conditionals.
- No full-set art commission until text, frame/crop geometry and measured offline budget are stable. Preserve source images; only optimized runtime assets enter the build.

## Controls and secondary screens

- One strongest action per screen. Keep play HUD compact: progress and menu, plus the contextual dice action when needed. No new permanent instructions.
- Selected, unselected, pressed, focused and disabled are distinct states. **Unselected is not disabled:** keep its name/mark readable, use check/border/material treatment to communicate selection, and do not rely on color alone.
- Pack tiles have stable slots for artwork/mark, title and selection indicator. Logos must not accidentally become inline punctuation after a wrapped title. Avoid repeating the same hero illustration as the only differentiator.
- Use the same painted button vocabulary for Play, Roll, Continue and other primary actions. Avoid a clean gradient button dropped into an otherwise worn painted interface.
- Dice controls never cover actionable rules, pack marks or menu targets. Thumb reach does not justify a floating control over the paragraph.
- Text-bearing dialogs use quieter material than their edges. Maintain clear label baselines, consistent row spacing and 44px+ targets. Close/back controls remain reachable even with enlarged text; focus returns to a sensible control.
- Completion can feel warm and satisfying without loud confetti or extra mechanics. Recovery and installation remain clear and functional; explanations belong in those dialogs, not the main play surface.

## Motion direction: physical, restrained, coherent

The card is an object, not a web panel. Every phase should communicate an action: **deal, lift/turn, land, release/discard**. Stronger motion belongs to those actions; it should not compete continuously with reading.

- Front/back, thickness and lifted-card shadow must behave as one object. Remaining deck has its own subtle stationary contact shadow. A full-width lifted-card shadow behind an edge-on card reads as a compositing error.
- Highlights belong to the moving material and clip to its silhouette. No glint sweeping bare tabletop, floating rectangular sheen or front/back bleed through the turn.
- Show a meaningful part of the turn, not an immediate front followed by a long idle settle. Inspect at 0/25/50/75/100% and normal speed. Maintain one turn direction and one small believable lift; no ornamental extra wobble.
- Discard follows a clear outward trajectory. It exposes the next back coherently; fading supports leaving the field and cannot hide a discontinuous swap.
- One shared duration/easing owner per semantic phase. Current code tokens are deal 560ms, flip 560ms, discard 420ms, settle 160ms, completion 600ms. These are the baseline to review, not proof that the feel is approved. Measure effective CSS and lifecycle completion together before changing timings.
- Animations use transform/opacity where feasible. Do not animate box-shadow/filter/blur continuously to simulate expensive polish. Keep will-change scoped to active motion rather than every UI element forever.
- Atmosphere is sparse and low contrast; off really means off for decoration. Reduced Motion removes decorative movement; hidden app suspends effects. Do not apply a dev-only override inconsistently across renderer and controller.
- Input locks last only through their intended transition. All accepted actions save once before animation; cancellation/hidden/reload restores the committed state. No animation polish may change this contract.

## Dice-specific composition

Keep the approved transparent full-screen library roll over the live card. Do not restore the rejected dimmed-dialog or custom CSS renderer.

- Dice may cross the screen while tumbling, but readable results must take precedence once settled. Measure title/rule/CTA occlusion. Propose any resting-position change with visual evidence; do not manipulate physics differently between pre-simulation and replay to move dice away.
- The result is unambiguous: saved values match final upward faces, total is easy to read, resolved instruction is available, Continue does not discard, and the later card action does.
- One coherent material and contact-shadow treatment; match the tavern's warm lighting without excessive grime/noise on numerals. Confirm d20 numerals at small sizes.
- Collision sound follows actual impacts, respects Effects and foreground state, and is unlocked from either actual user control. Failure/Reduced Motion yields the same readable saved result without a forced animation replay.

## Visual release gate

For every frame/layout/motion change, keep before/after evidence and review:

1. 320×568 and 390×844 phone, 768×1024 iPad, 844×390 landscape, split view, enlarged text and Reduced Motion.
2. Setup including unselected packs; back; short/long/two-line-title/category/rule fronts; dice ready/moving/settled; Previous Card; pause/install/completion/recovery.
3. Mid-turn, edge-on and discard frames as well as stable screenshots. Review a normal-speed recording separately; frozen CSS frames do not measure FPS.
4. No hard frame seams, stretched ornaments, hidden instructions, overlapping CTA, disappearing pack identity, ambiguous disabled styling, backface bleed, or detached moving-card shadow.
5. Browser assertions measure paragraph visibility, control overlap and all card-context ratios, not only outer containment. Accessibility announcements, focus, touch/scroll gestures and exactly-once actions remain correct.
6. Physical iPhone/iPad Safari/Home Screen results, frame timing, audio and VoiceOver are recorded separately. A desktop screenshot cannot certify native-quality performance.

Only user-approved revised compositions become golden references. Do not bless current broken screenshots just to make a regression suite pass. Keep one current design system and one implementation plan.

---

## Historical assets and generation record — not current layout instructions

The following preserves provenance and earlier prompts, including rejected/pending studies. Statements below about growing a card, pending frame approval, older timing, or replacement mouse art are historical and superseded by the current standards above and STATUS. Do not reimplement them.

### Original visual pass assets

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

## Continuous front and goofy fantasy revision — approved 2026-09-14

The user reaffirmed the cohesive Hearthstone-inspired material/rendering language, with more goofy tavern and dungeon-crawl humor where appropriate (Heroes of Barcadia / Munchkin as tone references). Original character identity is required, not a departure into quiet woodland storybook art. The mouse is superseded by an original enchanted copper armor toast study. The old assets remain checkpoint history, not the current direction.

The new master has one outer perimeter. The illustrated region and parchment are inset; a teal band attaches to the side rails with bronze brackets. `scripts/front-continuous.ts` exports top/bottom/side rails, band, and parchment from `assets/source/front-continuous-v3.png`. CSS masks interior portions of the perimeter exports so they do not cover art or the pack mark. No whole-card texture stretching; text remains DOM. The user approved this unified frame on 2026-09-14. The shared CardFace now supplies gameplay, Previous Card, and workshop previews.

Built-in image generation was used for both new assets and the illustration correction. Final source illustration: `assets/source/cheers-armor-v3.png`; approved optimized files are in `src/presentation/art` with continuous-* and cheers-armor-v3 names. Reproduce with `npx tsx scripts/front-continuous.ts`.

### Exact frame prompt

Production card FRONT master asset for the same original fantasy tavern game as reference. Portrait 2:3, orthographic edge-to-edge card, single object. EXACTLY ONE uninterrupted carved walnut perimeter with worn bronze hardware at its FOUR outer corners. Side rails run continuously top to bottom. Inside: upper 45 percent blank dark teal illustration opening, lower half blank pale luminous parchment for rules. At the boundary a BLANK teal leather title band runs edge to edge into the outer rails, fastened with small bronze brackets on left and right. The title band has no independent rectangular border, no corner caps, no bottom-row duplicate corners. Parchment tucks under this band and inside same outer rail. Strong original painterly fantasy collectible-card richness, sculpted scuffed bevels, warm upper left lighting, dimensional contact shadows, tasteful hop leaf details at outer corners only. No stats, gems, numbers, logos, text or actual illustration. Flat reusable UI skin, not scene/mockup. Crucial: unified SINGLE CARD not two stacked bordered panels. Border 6 percent wide, central parchment extremely quiet. Reference is material/lighting language, preserve bronze walnut and teal craftsmanship.

### Exact illustration prompt

Original premium painted fantasy party-game card illustration, landscape 3:2. Goofy bold heroic tavern comedy. One squat enchanted suit of dented copper armor with a wide bucket-shaped helmet, two expressive glowing amber eyes inside a dark visor and comically tiny feather, solemnly raising ONE comically tiny wooden cup with an oversized gauntlet. A ridiculous proud little toast, instantly readable visual joke. No human face or beard, no mouse or woodland-storybook character. No copied characters, insignia or franchise designs. Sculptural exaggerated shapes, confident broad digital oil brushwork, rich dimensional warm highlights and deep teal shadows, luxurious collectible-card painting, NOT thin ink drawing or flat vector. Keep COMPLETE helmet feather and cup well within central 65 percent with generous headroom and margins. One compact chest-up character clearly centered, about 65 percent image height; no cropped head. Quiet blurred walnut tavern backdrop, just large light/shadow masses, no clutter, shelves, crowd, scattered particles or miniature details. Reference only supplies bronze/walnut/teal materials and tactile richness. Goofy expressive silhouette with strong value separation and easy small-screen readability. No text, numbers, symbols, frame, stats, logos.

### Exact composition correction

Revise this original enchanted armor illustration. Keep the same character, expression, toast, palette, painterly style and simple background. ZOOM OUT substantially: shrink entire character and raised mug to approximately 65% of their current size and center the group. Add quiet blurred tavern background around them, especially 20% clear headroom above the feather and 15% empty margin left of the mug. Show the full feather and mug comfortably inside a central safe rectangle. Make the mug half its current size, amusingly tiny relative to the giant gauntlet. Simplify chest and shoulder ornament into broad plain copper and teal surfaces, fewer chips and etched details. Keep the dimensional painted finish and goofy friendly expression. Landscape 3:2. No words, logos, borders.

## Approved frame rollout — 2026-09-14

The unified front is approved and promoted to the shared `CardFace`: gameplay, Previous Card, and the workshop now render the same components and CSS. Approved optimized surfaces live in `src/presentation/art`; `src/presentation/card-front.css` loads after the legacy theme so old parchment borders cannot show through. The illustration stays centered, rules stay real text, and the Core diamond retains its footer position. Source artwork remains archived under `assets/source`.

Front surfaces are preloaded/decoded and included in the production offline cache. GitHub Pages build: 1,931 KiB runtime assets, 80.8 KiB gzip JavaScript, within existing budgets. Verification covers 36 unit tests, Chromium/WebKit gameplay checks, all 30 workshop cards at five sizes with normal/enlarged text, and a two-build offline update preserving the session. Physical iPhone/iPad Home Screen and performance checks remain outstanding. Dice is a separate planned milestone; this rollout changes no engine rules or saved-session schema.
