# Presentation timing + performance baseline (task 6, 2026-09-20)

This is **engineering evidence from desktop browser emulation**, not a
physical-device measurement. The iPhone/iPad frame-time gate remains open
(see below).

## Environment

- Host: macOS, Node 26.9.0, Vite 6.4.3 production build
  (`BASE_PATH=/Drink-at-Ron/`), served with `vite preview`.
- Browsers: headless Playwright Chromium and WebKit, viewport 390×844,
  deviceScaleFactor 2 (software rendering).
- Method: `requestAnimationFrame` deltas sampled across one card reveal
  (560 ms flip) and across ~1.1 s idle after the flip settles. `performance.now`
  deltas in ms.

## Results

| Browser | Phase | frames | p50 | p95 | max | >32 ms |
| --- | --- | --- | --- | --- | --- | --- |
| Chromium | flip | 52 | 16.7 | 16.7 | 16.8 | 0 |
| Chromium | idle | 58 | 16.7 | 16.8 | 16.8 | 0 |
| WebKit | flip | 51 | 17.0 | 18.0 | 23.0 | 0 |
| WebKit | idle | 58 | 17.0 | 18.0 | 18.0 | 0 |

Idle `document.getAnimations()`: 8 running CSS animations (the always-on
atmosphere), no frames over 32 ms. Atmosphere is pure CSS (no JS timer or rAF);
it pauses under Reduced Motion and while `document.hidden`.

## Dialog timing consolidation

`EXIT_MS = 200` in `GameDialogs`, the CSS exit (`panel-exit 180ms`) and the
entry fallback (`--motion-dialog, 220ms`) were three separate numbers. They now
come from one manifest:

- `theme.motion.dialog = 220`, `theme.motion.dialogExit = 180`.
- `main.tsx` derives `--motion-dialog` / `--motion-dialog-exit` from the
  manifest (camelCase → kebab-case), so CSS and JS share the values.
- `GameDialogs` unmounts at `dialogExit + 40ms`, a bounded fallback that cannot
  strand the dialog open.
- An exiting dialog is `inert` and `pointer-events: none`, so its controls can
  no longer trigger while it animates out.

## Not measured here

- A real dice roll: the settled stage already stops its shadow `requestAnimationFrame`
  at rest (`library.ts` `stopShadows()`), and task 2 covers context/leak cleanup.
  Device frame timing during the throw is still unmeasured.
- Physical iPhone/iPad Safari and installed-PWA behavior.

## Hardware gate (pending)

Recorded on desktop emulation only. Before release, measure flip/discard/deal, a
dice roll and idle atmosphere on actual iPhone and iPad (device/OS/build), and
confirm startup/background behavior. Do not cite these numbers as device FPS.
