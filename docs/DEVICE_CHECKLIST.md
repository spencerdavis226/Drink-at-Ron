# Physical-device release checklist

Automated browser emulation is not evidence of actual iOS Home Screen behavior. Complete this on a real small iPhone, a large iPhone, and an iPad before sharing a polished release.

- [ ] Open HTTPS site in Safari. Check safe areas, browser toolbar expansion, no horizontal overflow, readable rules, and reachable controls.
- [ ] Install through Share → Add to Home Screen; open from icon and check standalone launch appearance.
- [ ] Wait for offline readiness, enable airplane mode, close and reopen. Reveal/discard multiple cards and verify artwork works.
- [ ] Reveal a card, switch apps, lock/unlock, and reopen. Same card and count persist.
- [ ] Rapidly tap during reveal and discard. Exactly one action occurs per transition.
- [ ] Interrupt a transition by closing the app. It restores the latest committed stable state, never a broken animation.
- [ ] Check Short (30), Long (60), Infinite, Core always included, and add-on toggles in the pack dialog. Confirm an existing custom-length active save retains its original limit.
- [ ] Confirm final card stays visible until dismissed; replay starts a fresh shuffle with the same setup.
- [ ] Previous Card is read-only; menu close restores focus; End Game can be canceled.
- [ ] Enlarge text and zoom, enable Reduce Motion and VoiceOver. Read full rules and operate all controls.
- [ ] Test portrait, landscape, iPad split view, and hardware keyboard where available.
- [ ] Reach a dice card, roll, and confirm the saved total matches the settled dice; Continue returns to the card and the later card action discards.
- [ ] Publish an update while a game is active: no mid-game reload. Finish/end game, apply offered update, then check offline relaunch.
- [ ] Measure interaction smoothness on real devices; target 60 fps. No performance claim until measured.

## Automated evidence

`npm test` covers shuffle cycles, finite/endless behavior, catalog validation and saved-state invariants. `npm run test:e2e` covers browser interaction, restoration, malformed saves, denied storage, responsive layouts, keyboard/reduced motion, and Chromium offline reload. WebKit service-worker testing is excluded from automation and belongs to the physical checks above.

## Unified tavern presentation

Sound has been removed; there are no audio checks. Verify the visual and dice items below.

- [ ] Check the new painted Home Screen icons and dark launch colors on actual iOS.
- [ ] Roll a dice card: the card tap target remains usable, dice settle above the card, and neither dice nor controls cover rules or the pack mark.
- [ ] Roll 20+ times across a session; watch for accumulating lag, a frozen canvas, or a lost WebGL context.
- [ ] Simulate a platform without WebGL: the saved result still appears and Continue remains usable (no forced replay).
- [ ] Rotate the device and let the Safari toolbar expand/collapse during and after a roll; the settled dice stay readable.
- [ ] Roll once installed and offline; reopen the app and confirm the saved roll is restored without replaying.
- [ ] Install a new release after a completed game and resume the saved session from the updated build.
- [ ] Ensure all rules remain clear in Grenze at larger text sizes. Check actual iPad split view and VoiceOver.
- [ ] Interrupt a discard: the save already contains the next card, and reopening must not repeat the discarded card or celebration.

## Core workshop milestone

Automated evidence is recorded in `docs/studies/README.md`. Keep the following pending until observed on physical hardware:

- [ ] Approve the short, long, and temporary-rule front studies on an iPhone and iPad.
- [ ] Play Short (30 cards from the 250-card Core deck) using the playtest record, then sample more cards in Infinite. Engine tests cover the full shuffle cycle.
- [ ] Verify the published `/Drink-at-Ron/` URL, Home Screen installation, offline relaunch, and updates on iOS.
- [ ] Evaluate the approved frame and live title sharpness, scrolling with enlarged text, and flip smoothness on physical devices.
