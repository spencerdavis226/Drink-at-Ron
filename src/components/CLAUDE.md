# src/components — shared UI

- `Cards.tsx` (`CardFace`, `CardFrame`): live title fit (shrinks to 18px, never truncates), scrollable rules with an overflow affordance, resolved dice result. The pointer handlers deliberately cancel the card's click when a drag or rules scroll happened; a stationary tap must still pass through to the card button. Previous Card and the workshop reuse this component, so a change here changes all three.
- `FullScreenDice.tsx`: portals a transparent full-viewport stage to `document.body`; owns the roll lifecycle (warm while reading, roll, settle 700 ms, fade 180 ms, reveal). It must fall back to the saved values on hidden, resize, Reduced Motion, timeout, or WebGL loss. Keep the lazy `import()`.
- `UI.tsx`: `Button` focuses itself on click (preserve this; Safari does not focus buttons on tap, and `Modal` restores focus to the opener), `Modal` is a native `<dialog>` with `showModal()` and an exit animation, `IconButton` requires a label.
- `PortraitGate.tsx`: blocks play in phone landscape (user-agent sniff, `orientation: landscape`, and a short side under 600px). iPad landscape plays.
- `PackMarks.tsx`: paints each pack's single-colour `logo` as a CSS mask (gilded in setup and menus, debossed in card footers). A new pack needs only its SVG and `logo` path; no mapping here.
- `Atmosphere.tsx`: decorative looping background; `aria-hidden`, paused when the page is hidden.

Buttons should be at least 44px touch targets, labelled, and free of outer focus rings (the project uses a brightness shift). Do not add hover-only affordances; this is a touch app.
