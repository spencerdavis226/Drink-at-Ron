# Card motion model evidence — 2026-09-20

Before/after captures for task 1C (`../STATUS.md`). Production build at
`/Drink-at-Ron/`, Chromium, 390×844 CSS px, device scale factor 1. These freeze
live animations/transitions with the Web Animations API and set `currentTime`;
they are intermediate-compositing evidence, **not** frame-rate or physical-device
measurements.

- `flip-before-*.png` — the old 560ms turn with `cubic-bezier(0.2, 0.7, 0.2, 1)`.
  At 70ms the back is still flat and by 140ms the front is already fully
  presented, so nearly all rotation happens inside ~150ms and later motion only
  settles.
- `flip-after-*.png` — the same turn after the rework: the back is still face-on
  at 70ms, the lifted card is edge-on around 210ms (its shadow foreshortens with
  the surface instead of staying a rectangular slab), and the front lands by
  ~280–420ms.
- `dice-ready-before.png` / `dice-ready-after.png` — the readiness accent. The
  before state animated `box-shadow` continuously; the after state is the same
  gold inset frame driven by opacity only.

Automated equivalents live in `tests/browser/motion.spec.ts` (turn travel at
70ms/420ms, shadow ownership, glint containment, opacity-only accent, static
accent under Reduced Motion) and pass in Chromium and WebKit. The `-webkit-`
frames are WebKit's own freeze of the same turn; WebKit's `currentTime` seek is a
little less precise than Chromium's, so treat them as a second-engine sanity
check rather than time-aligned pairs.
