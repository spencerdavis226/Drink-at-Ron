# Drink at Ron — agent entry point

Read `docs/STATUS.md` before planning or editing. It is the single current handoff (evidence, approved constraints, next task); it supersedes historical plans/study notes, and direct user instructions take precedence. Update it in place at handoff with changed files, commit, verification, risks, and next task — do not add competing plan documents.

## Constraints

- Preserve the current branch (`codex/finish-v1`), HEAD, and all untracked work; never discard work in progress.
- Work on one assigned task at a time; do not repeat completed milestones or replace the stack on your own.
- Keep the pure engine (`src/game`) and saved outcomes independent of rendering. Preserve session schema v2 + v1 migration and the `drink-at-ron.session.v1` storage key; rendering changes must not force a migration.
- Preserve the approved painted frame and constant 2:3 outer ratio (front/back/Previous Card agree). Stationary taps must keep working while long rules stay scrollable.
- Keep assets local and GitHub Pages/offline compatible — no CDN or runtime services.
- Merge, push, and publication need explicit user authorization; ordinary local edits/checks do not.

## Commands (Node 22.12+, `npm ci`)

```sh
npm run dev            # vite on 127.0.0.1; no service worker — offline needs a production build/preview
npm run dev:phone      # vite on 0.0.0.0; open the printed Network URL from a phone on the same Wi-Fi (HTTP: no service worker/offline)
npm test               # vitest; only tests/**/*.test.ts (unit)
BASE_PATH=/Drink-at-Ron/ npm run build    # validate-content -> tsc -b -> vite -> check-budget
npx playwright install chromium webkit
CI=1 BASE_PATH=/Drink-at-Ron/ TEST_PORT=4398 npm run test:e2e -- --workers=2
BASE_PATH=/Drink-at-Ron/ npm run test:update   # two-build update/PWA flow
npm run test:workshop  # dev server on :5175
```

- Playwright specs (`*.spec.ts`) are not run by `npm test`. E2E serves `dist` through `npm run preview`; build first. Locally `reuseExistingServer` is on, so a stale preview on the default `:4173` will silently serve an old build — set `TEST_PORT`.
- `?workshop=1` and `npm run test:workshop` use the dev server, not `dist`; workshop code must never reach production.
- CI (`.github/workflows/pages.yml`) runs test -> build -> e2e -> update -> workshop, builds with `BASE_PATH=/Drink-at-Ron/`, and deploys `dist` to Pages only from `main`.

## Budgets and dice prototype

- `scripts/check-budget.ts` enforces tiered release budgets on `dist`: initial (critical-path) JS ≤ 100 KiB gzip, lazy feature JS ≤ 200 KiB gzip, runtime ≤ 3 MiB, any image ≤ 500 KiB, and no workshop strings in production. "Initial" = chunks referenced by `dist/index.html`; everything else is lazy. Heavy optional features (e.g. the dice library) belong in lazy chunks, not the initial tier. Measure the built output instead of guessing, and do not change limits without user approval.
- The full-screen `@3d-dice/dice-box-threejs` overlay is the default dice renderer (`src/components/FullScreenDice.tsx`, adapter `src/presentation/dice/library.ts`); it is lazy-loaded and must be fed predetermined results from `src/game/dice.ts`. `src/content/sample.ts` holds the current standard 40-card set (dice cards included) as pack `core`; `src/content/vip.ts` is an additional themed pack. Both are supplied sample content that may be replaced — keep engine/state contracts and saved-order behavior unchanged. Do not reintroduce a second renderer, and do not change per-body damping/sleep between the library's pre-simulation and its replay — that diverges the forced face.
- The approved front is `src/presentation/art/ornate-teal-frame.webp`, with live titles/rules and plain parchment (no scene illustration or imprint lattice). Preserve legacy `artwork` fields and the resolver for saved content/validation compatibility; do not reintroduce them in CardFace. Bundled frame surfaces live only in `src/presentation/frame-surfaces.ts`; do not restore an eager glob of `presentation/art`.

## Evidence

- Chromium/WebKit emulation is not physical iOS evidence; device-only checks live in `docs/DEVICE_CHECKLIST.md`.
- Report failures honestly, including untracked tests. Never call checks green while any suite (including uncommitted ones) fails.
