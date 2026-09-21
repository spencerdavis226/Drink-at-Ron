# Finishing-glow removal and motion endpoints — 2026-09-21

Evidence for the “Remove finishing glow and eliminate motion jumps” pass. Captures
come from the dev server (`http://127.0.0.1:5199`) in both Chromium and WebKit at
390×844 unless the filename says otherwise. Browser captures are emulation, not
physical-device proof.

## What changed

- Removed the decorative dice border glow (`.study-face.dice-ready::before` and
  `@keyframes dice-ready-glow`) and the `dice-ready` class that only fed it.
- Removed the end-of-reveal `.reveal-glint` markup, CSS and `@keyframes glint`.
- Removed the redundant `card-settle` jump after completed deal/flip/discard:
  the controller now lands those actions directly on the resting transform.
  A settle remains only for returning a rolled card, where it also acts as the
  rapid-tap lockout, and it now starts and ends at rest.
- Removed `stack-settle`, which ended the exposed under card at `translateY(0)`
  while it rests at `translateY(3px)`, so removing the class no longer jumps.
- Removed the positional `:active` press lift on `.game-card`; press feedback is
  the existing brightness filter, so releasing a held pointer cannot step the card.

## Files

- `chromium-dice-390.png`, `webkit-dice-390.png` — dice card at rest: no luminous
  border or pulsing inset glow; painted bronze edges and contact shadow remain.
- `chromium-dice-320.png`, `chromium-dice-ipad.png`, `webkit-dice-320.png`,
  `webkit-dice-ipad.png` — same at 320×568 and 768×1024.
- `chromium-flip-mid-390.png`, `webkit-flip-mid-390.png` — reveal frozen mid-turn:
  no end-of-reveal glint wash; the front/back facing logic is unchanged.
- `chromium-discard-handoff-390.png`, `webkit-discard-handoff-390.png` — the
  handoff frame after discard: the exposed under card has not shifted.
- `chromium-previous-390.png`, `webkit-previous-390.png` — Previous Card keeps the
  2:3 frame and readable text with no residual glow.

## Automated checks

See `docs/STATUS.md` for the exact commands and counts. `tests/browser/motion.spec.ts`
now samples rendered frames after class removal to assert end-versus-rest position
drift (≤0.5 CSS px) and unchanged rotation/scale, plus press-release and
hidden-tab resync checks.
