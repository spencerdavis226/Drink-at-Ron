# GitHub Pages release

Repository: `spencerdavis226/Drink-at-Ron`.
Live URL: https://spencerdavis226.github.io/Drink-at-Ron/
Published via **GitHub Actions** on 2026-09-25 (merge commit `7dad3ee`, workflow run `36210874943`). The repository's Pages source is "GitHub Actions". A fresh browser confirmed that release ID, the three packs, a controlling service worker, and an offline reload. Later documentation commits can advance the live release ID without changing the game; verify the live ID before naming a specific build as deployed.

In repository Settings → Pages, select GitHub Actions as the build source. The workflow checks pull requests and main. Only main can publish, and only after all checks succeed. No backend, environment secrets, remote fonts, or paid services are needed. Enable required status checks for the build job in repository branch protection if desired.

## Local release checks

Use Node 22.12 or later:

```sh
npm ci
npx playwright install chromium webkit
npm test
BASE_PATH=/Drink-at-Ron/ npm run build
BASE_PATH=/Drink-at-Ron/ CI=1 TEST_PORT=4398 npm run test:release
BASE_PATH=/Drink-at-Ron/ npm run test:update
```

`TEST_PORT=4183` can select an unused production-test port. CI never attaches to an existing server. Local development uses `/`; production uses `/Drink-at-Ron/`. All public screens remain at that base URL. Changing the repository name or adding a custom domain requires updating the workflow base path and retesting manifest scope and installation identity.

The normal PR/main workflow uses the tagged Chromium/WebKit release smoke suite, unit tests, Pages build/budgets, and two-build update check. To run the full production browser suite and every-card workshop sweeps, manually dispatch the same workflow with `full_validation` enabled. Those longer checks are for layout/engine work and dedicated card review, not routine publication. A passing smoke suite is a scoped release gate; report any known full-suite failure separately.

The deployment uploads the exact `dist` artifact tested by browser checks. The two-build update test builds its second release in a temporary directory and never modifies that artifact. `VITE_RELEASE_ID` uses the commit SHA in CI and is exposed only as an HTML data attribute for diagnostics.

Build budgets (`scripts/check-budget.ts`): at most 3 MiB total runtime files (a conservative precache upper bound), 500 KiB per image, at most 100 KiB gzip initial (entry) JavaScript, and at most 200 KiB gzip lazy feature JavaScript. The build rejects workshop code in shipped JavaScript. Workshop assets live outside public and are not shipped. Future illustrated packs require reviewing these budgets and caching strategy deliberately.

The service worker caches local fonts and artwork. Updates remain pending during gameplay and are offered between games. Saved sessions and preferences are retained. GitHub Pages cannot supply custom cache headers; rely on Vite's hashed bundles and the service-worker release lifecycle.

After first publishing, verify the live URL on physical iPhone/iPad using DEVICE_CHECKLIST.md. Local tests do not prove live repository configuration or installed iOS behavior.
