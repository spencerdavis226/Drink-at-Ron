# Drink at Ron

A portrait-first party card game for one shared iPhone or iPad. Choose packs and a deck length, tap to reveal, then tap to discard. No accounts, backend, or paid services.

See the authoritative [current status, execution plan, and portable handoff](docs/STATUS.md). Agents should read [AGENTS.md](AGENTS.md) first.

## Run

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

For an offline-capable production preview:

```sh
npm run build
npm run preview
```

The Vite development server does not install a service worker. Offline play requires the production build over HTTPS, or localhost during development. The Install app dialog reports offline readiness after the service worker finishes precaching.

## Verify

```sh
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Browser tests exercise Chromium and WebKit. Installed Safari Home Screen behavior still needs the [physical-device checklist](docs/DEVICE_CHECKLIST.md).

## Project map

- `src/game`: versioned types, pure transitions, injectable shuffling.
- `src/content`: card and pack catalog plus validation.
- `src/app`: validated save/resume and preferences.
- `src/components`: replaceable card rendering and accessible native dialogs.
- `src/presentation`: theme manifest, artwork registry, animation controller, interruption handling, and local asset decoding.
- `src/screens`: setup, play, completion, and dialogs.
- `src/main.tsx`: saved preferences, visibility handling, and PWA orchestration.
- `public/art`: bundled original placeholder artwork; no remote asset dependency.

Setup offers Short (30 draws), Long (60 draws), and Infinite. Core is always included; optional packs are chosen in the Card packs dialog. Every shuffle cycle exhausts the selected unique cards before repeating, including when Long exceeds the catalog. Infinite cycles have bounded storage. Existing active saves keep their original length, including older custom limits. The group handles turns and ongoing rules. All cards have equal frequency per cycle.

Saves snapshot card content and order. Invalid/unsupported saves require explicit reset; storage failures leave play available with a notice. Settings and saves are local to the browser installation; Safari and Home Screen storage may differ. App updates are offered outside active games. The artwork registry remains for validation and older saved content; current card fronts use the approved ornate frame with plain parchment.

## Add content

See [the pack authoring guide](docs/AUTHORING.md). The always-included `core` deck has 250 cards across `src/content/sample.ts`, `classics.ts`, and `standard-expansion.ts`, with dice cards mixed in; `VIP night` adds 12 themed cards. The new material awaits group playtesting and copy review. The approved front keeps live titles and rules over plain parchment inside the ornate teal frame. Run `npm run cards:review` to regenerate the human review sheet (`docs/CARD_REVIEW.md` and `docs/card-review.csv`) from the live catalog before locking copy.

## Static deployment

The GitHub Pages workflow builds with the repository base path, runs the checks, and deploys `dist` from `main`. Repository settings, the recorded publish history, and the difference between a live deployment and branch HEAD are documented in [GitHub Pages release](docs/GITHUB_PAGES.md). Root user/organization Pages sites use `/`; repository sites use `/<repository>/`. For another static host, deploy `dist` and set `BASE_PATH` at build time if it uses a subdirectory. HTTPS is required for offline support outside localhost.

Regenerate app icons after editing the source in `scripts/icons.ts` with `npx tsx scripts/icons.ts`. The original SVG remains for compatibility. Painted artwork was generated using the built-in image-generation tool; source PNGs and optimized WebPs are included. See [art direction and prompts](docs/ART_DIRECTION.md). Grenze is bundled locally from Omnibus-Type with its SIL Open Font License. No remote font requests, stock assets, analytics, or runtime artwork services are used.


## Presentation

Game actions save immediately and exactly once; animations display an outgoing snapshot independently. End/cancel events settle transitions, with a bounded timeout fallback. Backgrounding clears unfinished visual transitions without drawing again. Existing version-1 sessions restore without effect replays.

All motion durations live in one manifest (`src/presentation/theme.ts`) and reach CSS as `--motion-*` variables, including dialog enter/exit. The atmosphere is always on (CSS-only warm lighting, embers, dust and a short reveal glint); Reduce Motion removes it, and a hidden app suspends it. Sound was removed entirely — there is no audio subsystem or Effects/Ambience switch.

Re-export the generated UI sheet with `npx tsx scripts/chrome.ts`; regenerate icons with `npm run generate:icons`. The full runtime remains offline-capable. Physical-device frame-rate and installed-iOS checks are still required before claiming native-level polish.

## Production workshop and release

Open `/?workshop=1` on the development server for isolated card previews, seeded sessions, and dice fixtures. The approved ornate teal front uses plain parchment; the retired imprint browser is no longer exposed. Workshop code and fixtures are excluded from production; the approved shared frame and its assets are shipped. The `core` pack holds 250 cards (dice cards included) and `VIP night` is an additional themed pack; group balance remains untested.

See [Game design](docs/GAME_DESIGN.md), [Playtest record](docs/PLAYTEST.md), and [GitHub Pages release](docs/GITHUB_PAGES.md). The unified front is approved and used throughout. Dice use the approved full-screen `@3d-dice/dice-box-threejs` overlay; dice cards are mixed into the `core` pack (see STATUS.md).

Illustrations follow [Image creation guidelines](docs/ILLUSTRATION_GUIDELINES.md): centered, crop-safe, simple, original fantasy. Pack logos are registered separately and appear consistently in selection, pause, and card footers.

## Card front

The approved ornate teal master is shared by gameplay, Previous Card and the workshop. Titles and rules are real HTML text. Parchment is plain: the icon-lattice/tint experiment is retired. Its vendored sources and attribution remain as project history; they are not shipped in the runtime. Legacy card artwork fields remain compatible with saved sessions but do not produce individual scenes on the front.

The next title-typography pass is specified in [STATUS.md](docs/STATUS.md). Development-only comparisons live at `/docs/studies/front-typography-2026-09-22/` when Vite is running.

## Credits and licences

- **Game icons** — [game-icons.net](https://game-icons.net) contributors, CC BY 3.0 (some CC0). Icons made by Lorc, Delapouite, Sbed, Skoll and the other artists listed in [the licence copy](docs/licenses/game-icons-CC-BY-3.0.txt). The vendored library lives in `assets/icons/game-icons` at a pinned commit (`PINNED.txt`) and is never served to the browser.
- **Grenze** — Omnibus-Type, SIL Open Font License (`public/fonts/OFL.txt`).
- **Three.js, cannon-es, @3d-dice/dice-box-threejs** — see `docs/licenses/`.
- Painted card surfaces, the tabletop and the placeholder tankard were generated with an image-generation tool; source PNGs are kept in `assets/source`.
