# Current status

## Release-ready baseline

- The shared painted continuous card frame is approved.
- Latest verified baseline: 72 unit passes; build and offline budgets pass; 43 browser passes, 3 skips; and 4 workshop passes.
- Saved sessions use schema v2 migration while retaining the existing storage key.

## WIP, not release-ready

- Dice work is preserved in checkpoint `489d0aa` (`chore: checkpoint dice WIP`). It is not approved for release.
- Dice exists in workshop fixtures, not the production Core.
- The outstanding card request is smaller cards with the fixed original 2:3 geometry.
- Known issue: Safari flattens the dice presentation.

## Dice browser-test repair (completed)

- Changed `src/presentation/dice/dice.css` so the transformed dice host has a 1px layout box while retaining its original `0 0` transform origin; it now renders as visible in Chromium and WebKit without moving the painted frame.
- Changed `tests/browser/dice.spec.ts` to prove cancellation/backgrounding happens while the card is rolling, and to reload after `serviceWorker.ready` before the Chromium offline test disconnects. This establishes control on a real page without changing service-worker update activation.
- Evidence: `BASE_PATH=/Drink-at-Ron/ npm run build` passed content validation and budgets; `npm test` passed 72 tests; and `CI=1 TEST_PORT=43313 BASE_PATH=/Drink-at-Ron/ npx playwright test --workers=1` passed the full browser suite (43 passed, 3 expected skips). The focused dice run across Chromium/WebKit also passed 9 tests with 1 expected WebKit offline skip.

## Next task

Review the preserved dice WIP against the approved frame and resolve the Safari dice flattening before considering any production promotion. The dice remains workshop-only and not release-ready.
