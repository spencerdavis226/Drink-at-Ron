# Front-study review

Status: awaiting user visual approval. These are real browser renders, not generated UI mockups. Generated images supply only the materials and one illustration; all titles and instructions are live DOM text.

Open the development workshop at http://127.0.0.1:5173/?workshop=1. Choose any of the three study-example buttons. Use Replay reveal to deal that card facedown, then tap to see the actual flip. Tap again to discard. Switch Viewport to iPad or Small phone, and toggle Enlarged text. The study is not enabled in the public game.

| Example | Small phone | iPad |
| --- | --- | --- |
| Short instruction | [A little cheers](phone-cheers.png) | [A little cheers](ipad-cheers.png) |
| Longer category | [Wild company](phone-animals.png) | [Wild company](ipad-animals.png) |
| Temporary rule | [Left-handed magic](phone-left.png) | [Left-handed magic](ipad-left.png) |

Additional captures: [enlarged text](phone-enlarged.png), [back](back.png), [flip](mid-flip.png). Screenshots were captured on desktop Chromium at simulated widths. They do not establish physical iOS performance.

## Automated checks

- 36 unit tests passed, including deterministic workshop sessions and exact 30-card category composition.
- Pages-path production suite: 34 passed; two installed-Safari offline cases remain explicitly skipped by the harness.
- Chromium and WebKit workshop tests cover save isolation, real motion, and the full Core catalog across five sizes at normal and enlarged text.
- Two actual production builds verified: update stays pending during a game, is offered after completion, and preserves the saved session.
- Production budget checks passed: approximately 1.63 MiB runtime and 80.4 KiB gzip JavaScript. The workshop and new illustration/frame assets are not in production bundles.

## Pending

User approval of the reusable front; promotion into gameplay and Previous Card; post-promotion budget/build/browser verification; milestone commit. Physical-device tests, live Pages publishing, and real group playtesting are separate unverified steps.

Source images and exact generation prompts are documented in ../ART_DIRECTION.md. Reproduce optimized exports with `npx tsx scripts/front-study.ts`.

## Review revision

The rejected dwarf has been replaced with a centered original field-mouse traveler. Its complete head and cup remain visible in the small illustration window. Source and prompt: `../ART_DIRECTION.md`; governing rules: `../ILLUSTRATION_GUIDELINES.md`.

The category heading is removed. Core's footer diamond is now the real pack identity, shared with setup and the pause legend. Normal card heights match across all 30 cards at each preview size; enlarged text may expand the frame. The WebKit regression check also returns from enlarged to normal text to catch a stale-height hidden back.
