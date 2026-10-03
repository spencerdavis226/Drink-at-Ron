# src/presentation — look, motion, and the card state machine

- `controller.ts`: `PresentationController` is the only thing that advances a game from a tap. It persists first, then animates; animation completion never advances the deck. `finish(id)` ignores stale transition ids. Taps are ignored during motion except the dice "finish" tap.
- `usePresentation.ts`: timers and Reduced Motion/hidden-tab handling; backgrounding or Reduced Motion settles any motion immediately.
- `theme.ts`: motion durations and asset paths. They become `--motion-*` CSS variables in `main.tsx`; keep names in sync with the CSS fallbacks.
- `theme.css`, `card-front.css`, `../style.css`: the three stylesheets. `style.css` owns layout, safe areas, and the table backdrop; `theme.css` owns dialogs, atmosphere (fire, embers, dust, candle), and button chrome; `card-front.css` owns card text fitting.
- `frame-surfaces.ts`: the only list of bundled frame images. Do not add an eager glob of `art/`.
- `artwork.ts`, `imprint.ts`, `imprint/`: legacy artwork resolver and the generated icon sprite (`npm run imprint`). Keep both for saved-content compatibility; card fronts do not render illustrations.
- `dice/`: see its own CLAUDE.md.

## iOS constraints that bite here

- Use `dvh`/`svh` plus `env(safe-area-inset-*)`; `--top-safe` exists so tests can pose an inset. Installed iOS 27 apps get a system-owned frosted top strip and a bottom strip no DOM can reach (WebKit bug 301994). Keep controls out of the top inset; do not stack more speculative CSS to hide the bottom strip (see STATUS.md).
- WebKit can paint the back of a clipped 3D face; `Play.tsx` culls front/back by the rendered angle. Do not remove that when touching the flip.
- The approved 2:3 frame ratio, stationary-tap activation, and scrollable long rules must all keep working. A pointer that moves more than 8px or scrolls the rules must not activate the card.
- Looping ambient animations run for the whole session. Anything new that animates continuously must pause when `document.hidden` and respect `prefers-reduced-motion`.
