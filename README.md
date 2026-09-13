# Drink at Ron

A portrait-first party card game for one shared iPhone or iPad. Choose packs and a deck length, tap to reveal, then tap to discard. No accounts, backend, or paid services.

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

The Vite development server does not install a service worker. Offline play requires the production build over HTTPS, or localhost during development. The app reports readiness only after its service worker finishes precaching.

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
- `src/main.tsx`: setup, game presentation, menu, and PWA lifecycle.
- `public/art`: bundled original placeholder artwork; no remote asset dependency.

Finite decks contain 1–500 draws. Every shuffle cycle exhausts the selected unique cards before repeating, including when a finite deck is longer than the catalog. Endless cycles have bounded storage. The group handles turns and ongoing rules. All cards have equal frequency per cycle.

Saves snapshot card content and order. Invalid/unsupported saves require explicit reset; storage failures leave play available with a notice. Settings and saves are local to the browser installation; Safari and Home Screen storage may differ. App updates are offered outside active games. Historical artwork that no longer exists falls back to the bundled sample illustration.

## Add content

See [the pack authoring guide](docs/AUTHORING.md). The 12-card house collection is development content, not the final collaboratively authored collection. Every card currently uses one original placeholder illustration. Art direction and production card content are deliberately reserved for later sessions.

## Static deployment

A GitHub Pages workflow is included, but no repository or public site is created by this implementation. After pushing to your chosen repository, set Settings → Pages → Source to GitHub Actions. The workflow builds with the repository path, runs unit tests, and deploys `dist`. Root user/organization Pages sites use `/`; repository sites use `/<repository>/`. For another static host, deploy `dist` and set `BASE_PATH` at build time if it uses a subdirectory. HTTPS is required for offline support outside localhost.

Regenerate app icons after editing the source in `scripts/icons.ts` with `npx tsx scripts/icons.ts`. All bundled SVG art was created for this foundation. No external fonts, stock assets, analytics, or artwork services are used.
