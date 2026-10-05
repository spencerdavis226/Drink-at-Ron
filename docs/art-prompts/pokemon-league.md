# Pokémon League art prompts

Prompts for ChatGPT image generation. Generate each asset, then drop the files where the "File" line says and tell Claude; nothing here is wired into the app until the files exist.

## Shared style (paste at the top of every prompt)

> Painted game asset for a tavern-themed drinking card game. Hand-painted, slightly worn, warm candlelight from the upper left. Materials: aged brass, hammered gold, deep teal leather, cream parchment, dark walnut. Rich but not neon. Crisp silhouette that reads at small sizes. No text, no letters, no numbers, no logos, no watermark. Original design: do not copy any existing game, brand or official badge artwork.

Technical rules for every asset:

- PNG with a transparent background unless the prompt says otherwise.
- Square assets at 1024×1024; the app downsizes them (budget: each final file under 500 KiB after conversion to WebP).
- Subject centred with about 8% empty margin, so masks and drop shadows do not clip.
- One consistent light direction (upper left) across the whole set.

## 1. Gym badges (24), the badge case and the meter

Purpose: the badge meter shows the badge just earned, the gym leader ribbon gets a small badge icon, and the Hall of Fame screen lays out the badges you won. Each badge is a small enamelled brass pin, about the shape and finish of a military medal pin, seen straight on.

File: `public/art/badges/<id>.png` (ids below).

Prompt template:

> [Shared style] A single small enamelled brass pin badge, seen straight on, flat lighting with a soft highlight, thin dark outline. Shape and motif: **{motif}**. Enamel colours: **{colours}**. Centred on a transparent background.

| id | Badge | Motif | Colours |
| --- | --- | --- | --- |
| boulder | Boulder | a faceted octagon like a cut grey stone | slate grey, brass rim |
| cascade | Cascade | a single falling water droplet | sky blue, white highlight |
| thunder | Thunder | a sunburst with a jagged lightning bolt | gold, amber |
| rainbow | Rainbow | a flower of four petals in spectrum colours | green, red, yellow, violet |
| soul | Soul | a heart shape cut from a rounded square | magenta, pink |
| marsh | Marsh | two concentric golden rings | gold, pale yellow |
| volcano | Volcano | a flame rising from a cone | red, orange |
| earth | Earth | a leaf-shaped crest with veins | jade green |
| zephyr | Zephyr | a pair of swept wings | silver grey, white |
| hive | Hive | a ladybird-like domed shell with spots | red, black |
| plain | Plain | a rounded rectangle with a cow-bell notch | pale pink, cream |
| fog | Fog | a ghostly swirl inside a circle | lilac, grey |
| storm | Storm | a clenched fist inside a ring | brown, amber |
| mineral | Mineral | a polished steel hexagonal nut | steel grey, silver |
| glacier | Glacier | a six-point ice crystal | ice blue, white |
| rising | Rising | a dragon's eye in a diamond | navy, gold |
| stone | Stone | a geode cracked open | brown, amethyst |
| knuckle | Knuckle | a boxing glove seen from the side | red, cream |
| dynamo | Dynamo | a gear with a spark at its hub | yellow, bronze |
| heat | Heat | a flame inside a diamond | crimson, orange |
| balance | Balance | a scale with two even pans | silver, brass |
| feather | Feather | a single sweeping feather | white, sky blue |
| mind | Mind | two crescent moons facing each other | pink, gold |
| rain | Rain | a rain drop over a wave | deep blue, teal |

## 2. Badge case

Purpose: tapping the meter opens a badge case showing the run so far; the Hall of Fame screen reuses it.

File: `public/art/badge-case.png` (transparent, 1536×1024).

> [Shared style] An open hinged badge case seen from slightly above. Deep teal leather exterior with brass corners and a brass clasp; the inside is dark velvet with **eight empty circular recessed slots** in two rows of four, evenly spaced and the same size. Nothing in the slots. Transparent background around the case.

## 3. League mode emblem

Purpose: replaces the Pokémon mark on the setup screen's League mode button and the meter, so the mode has its own identity.

File: `public/art/packs/league.svg`. Single-colour silhouette only (the app tints it gold); ask ChatGPT for a **black-on-transparent PNG at 1024×1024** and Claude will trace it to SVG.

> Flat black silhouette on a transparent background, no shading, no gradients, bold simple shapes that read at 24 pixels: a trophy cup with two handles standing on a short plinth, a small four-point star above the cup. Centred, 8% margin.

## 4. Gauntlet title banners (3)

Purpose: a full-width banner that sweeps across the table when each gauntlet stage begins (the eighth badge, the first Elite Four member, the Champion). The app draws the words over the banner, so leave the middle empty.

File: `public/art/banners/{legendary,elite-four,champion}.png` (transparent, 2048×640).

Prompt template:

> [Shared style] A wide horizontal painted cloth banner with swallow-tail ends, hanging slightly curved, brass end caps. **Leave a large plain area across the middle for text.** Colour and ornament: **{ornament}**. Transparent background.

| file | Ornament |
| --- | --- |
| legendary | iridescent pearl-white cloth with faint feather and lightning motifs at both ends |
| elite-four | deep violet cloth with four small brass studs at each end |
| champion | crimson cloth with heavy gold fringe and a small laurel at each end |

## 5. Hall of Fame scene

Purpose: the completion screen after beating the Champion.

File: `public/art/hall-of-fame.webp` (opaque, 1536×2048 portrait).

> [Shared style] Opaque painted scene, portrait. A grand stone hall at night lit by tall braziers, a raised dais with an empty gilded frame in the centre (the app overlays text there), banners hanging from the rafters, confetti-like falling embers. Leave the middle third calm and dark enough for cream text to read over it.

## 6. Legendary, Elite Four and Champion card back (optional)

Purpose: the finale cards could flip from a special back so the table knows something big is coming. This is a change to the approved card frame, so it needs the owner's sign-off before it ships.

File: `public/art/card-back-league.webp` (opaque, 1024×1536, exactly 2:3).

> [Shared style] Opaque painted card back, portrait, exact 2:3. Matches a deep teal leather card back with an aged brass border and hop-vine filigree, but the centre medallion holds **a gold trophy cup with a four-point star above it** instead of a beer tankard, and the leather has a faint gold sheen. Symmetrical, no text.
