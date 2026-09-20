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
- `src/app`: validated save/resume, preferences, optional sound.
- `src/components`: replaceable card rendering and accessible native dialogs.
- `src/presentation`: theme manifest, animation controller, interruption handling, and local asset decoding.
- `src/screens`: setup, play, completion, and dialogs.
- `src/main.tsx`: saved preferences, audio/visibility, and PWA orchestration.
- `public/art`: bundled original placeholder artwork; no remote asset dependency.

Finite decks contain 1–500 draws. Every shuffle cycle exhausts the selected unique cards before repeating, including when a finite deck is longer than the catalog. Endless cycles have bounded storage. The group handles turns and ongoing rules. All cards have equal frequency per cycle.

Saves snapshot card content and order. Invalid/unsupported saves require explicit reset; storage failures leave play available with a notice. Settings and saves are local to the browser installation; Safari and Home Screen storage may differ. App updates are offered outside active games. Historical artwork that no longer exists falls back to the bundled sample illustration.

## Add content

See [the pack authoring guide](docs/AUTHORING.md). The 30-card Core collection is a production candidate awaiting group playtesting. Most cards share a painted tankard placeholder; A little cheers has individual artwork. This visual pass adds original weathered card skins, a walnut tabletop, and a two-sided lift/flip/discard animation. Production card-specific illustrations and the full content collection remain for a later session.

## Static deployment

A GitHub Pages workflow is included, but no repository or public site is created by this implementation. After pushing to your chosen repository, set Settings → Pages → Source to GitHub Actions. The workflow builds with the repository path, runs unit tests, and deploys `dist`. Root user/organization Pages sites use `/`; repository sites use `/<repository>/`. For another static host, deploy `dist` and set `BASE_PATH` at build time if it uses a subdirectory. HTTPS is required for offline support outside localhost.

Regenerate app icons after editing the source in `scripts/icons.ts` with `npx tsx scripts/icons.ts`. The original SVG remains for compatibility. Painted artwork was generated using the built-in image-generation tool; source PNGs and optimized WebPs are included. See [art direction and prompts](docs/ART_DIRECTION.md). Grenze is bundled locally from Omnibus-Type with its SIL Open Font License. No remote font requests, stock assets, analytics, or runtime artwork services are used.


## Presentation and sound

Game actions save immediately and exactly once; animations display an outgoing snapshot independently. End/cancel events settle transitions, with a bounded timeout fallback. Backgrounding clears unfinished visual transitions without drawing again. Existing version-1 sessions restore without effects or replays.

The pause menu includes Effects, Ambience, and Atmosphere. Existing sound settings migrate; ambience defaults off, atmosphere on. Foley and fireplace ambience are synthesized locally, begin after interaction, stop when hidden, and tolerate unavailable audio. Reduce Motion disables continuous decoration and transitions.

Re-export the generated UI sheet with `npx tsx scripts/chrome.ts`; regenerate icons with `npm run generate:icons`. The full runtime remains offline-capable. Physical-device frame-rate, audio balance, and installed iOS checks are still required before claiming native-level polish.

## Production workshop and release

Open `/?workshop=1` on the development server for isolated card previews, seeded sessions, and dice fixtures. Workshop code and fixtures are excluded from production; the approved shared frame and its assets are shipped. The Core deck now contains 30 production-candidate cards; group balance remains untested.

See [Game design](docs/GAME_DESIGN.md), [Playtest record](docs/PLAYTEST.md), and [GitHub Pages release](docs/GITHUB_PAGES.md). The unified front is approved and used throughout the game. The dice presentation remains unapproved and is being redirected to a full-screen, library-first prototype; follow STATUS.md.

Illustrations follow [Image creation guidelines](docs/ILLUSTRATION_GUIDELINES.md): centered, crop-safe, simple, original fantasy. Pack logos are registered separately and appear consistently in selection, pause, and card footers.
