# src/workshop — development-only tools

Reached only in the dev server via `?workshop=1` (every-card viewer), `?preview=1` (state preview), `?review=1` (desktop card-review workspace, autosaves to localStorage key `drink-at-ron.card-review.v1`). `main.tsx` imports them behind `import.meta.env.DEV`, and `scripts/check-budget.ts` plus `tests/browser/pages.spec.ts` fail the build if workshop code or strings reach `dist`. Never import from here in production code; never put workshop assets in `public/`.

Playwright coverage lives in `tests/workshop` (`npm run test:workshop`, dev server on `:5175`, `reuseExistingServer: false`). The every-card geometry sweep is slow, especially in WebKit; run it for layout or content-wide changes, not on every edit.
