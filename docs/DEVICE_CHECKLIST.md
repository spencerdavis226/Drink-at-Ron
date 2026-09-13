# Physical-device release checklist

Automated browser emulation is not evidence of actual iOS Home Screen behavior. Complete this on a real small iPhone, a large iPhone, and an iPad before sharing a polished release.

- [ ] Open HTTPS site in Safari. Check safe areas, browser toolbar expansion, no horizontal overflow, readable rules, and reachable controls.
- [ ] Install through Share → Add to Home Screen; open from icon and check standalone launch appearance.
- [ ] Wait for offline readiness, enable airplane mode, close and reopen. Reveal/discard multiple cards and verify artwork works.
- [ ] Reveal a card, switch apps, lock/unlock, and reopen. Same card and count persist.
- [ ] Rapidly tap during reveal and discard. Exactly one action occurs per transition.
- [ ] Interrupt a transition by closing the app. It restores the latest committed stable state, never a broken animation.
- [ ] Check 20, 40, 60, Custom, Endless, no selected packs, and numeric keyboard validation.
- [ ] Confirm final card stays visible until dismissed; replay starts a fresh shuffle with the same setup.
- [ ] Previous Card is read-only; menu close restores focus; End Game can be canceled.
- [ ] Enlarge text and zoom, enable Reduce Motion and VoiceOver. Read full rules and operate all controls.
- [ ] Test portrait, landscape, iPad split view, and hardware keyboard where available.
- [ ] Turn sounds on/off; interrupt audio by switching apps and verify gameplay remains responsive.
- [ ] Publish an update while a game is active: no mid-game reload. Finish/end game, apply offered update, then check offline relaunch.
- [ ] Measure interaction smoothness on real devices; target 60 fps. No performance claim until measured.

## Automated evidence

`npm test` covers shuffle cycles, finite/endless behavior, catalog validation and saved-state invariants. `npm run test:e2e` covers browser interaction, restoration, malformed saves, denied storage, responsive layouts, keyboard/reduced motion, and Chromium offline reload. WebKit service-worker testing is excluded from automation and belongs to the physical checks above.

## Unified tavern presentation

- [ ] Check the new painted Home Screen icons and dark launch colors on actual iOS.
- [ ] With headphones and device speakers, tune card rustle, wood taps, magical accents, and fireplace ambience. Verify Effects/Ambience toggles are independent.
- [ ] Enable ambience, background/lock the device, and confirm it stops. Return and verify it resumes only where browser policy allows, without errors.
- [ ] Verify Atmosphere off removes edge lighting, embers, and glints. Reduce Motion removes continuous effects regardless of the saved toggle.
- [ ] Ensure all rules remain clear in Grenze at larger text sizes. Check actual iPad split view and VoiceOver.
- [ ] Interrupt a discard: the save already contains the next card, and reopening must not repeat the discarded card or celebration.
