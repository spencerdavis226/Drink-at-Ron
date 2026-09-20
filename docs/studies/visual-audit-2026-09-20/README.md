# Visual review evidence — 2026-09-20

Baseline: `333d4e7`, production build at `/Drink-at-Ron/`. These are **before-fix** captures, not approved golden images. The fixes and their priorities live only in `../../STATUS.md`; current visual standards live in `../../ART_DIRECTION.md`.

Chromium CSS-pixel viewports: 320×568, 390×844, 768×1024 and 844×390; device scale factor 1. Enlarged category uses 24px root text. WebKit 390×844 short-card appearance was also inspected and showed the same composition. This is desktop browser evidence, not physical iOS.

Captured setup, back, short/category/temporary-rule fronts, enlarged text, menu/install/previous/completion/recovery, dice ready/moving/settled and flip/discard. Representative problem states are retained here; temporary captures are under `/tmp/ron-visual-audit/` while this machine retains them.

`flip-frozen-70/140.png` pause the live CSS animations/transitions and set their currentTime to the named milliseconds. They expose intermediate compositing; they are not performance or frame-rate measurements. Real-time flip/discard captures were inspected too.

`card-metrics.json` measures all 32 cards at 320 and 390px. Rules scroll overflow includes padding/pack marks: **it does not mean every instruction is clipped**. `metrics.json` measures the temporary-rule card at three sizes. Previous Card measurement in card-metrics is the short cheers card; the saved previous-card screenshot is a longer dice result, illustrating content-dependent height.

Synthetic sessions were seeded only in isolated Playwright browser contexts. No user saves were changed. PNGs/metrics here are documentation assets and do not enter the runtime precache.
