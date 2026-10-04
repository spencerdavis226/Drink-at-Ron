# src/screens — Setup, Play, Completion, dialogs

- `Setup.tsx`: length (Short 30 / Long 60 / Infinite) and an opt-in pack dialog; at least one pack is required. Pack selection never mutates a running game.
- `Play.tsx`: the table. It paints front or back by actual rotation angle (WebKit workaround), forwards animation end events to the controller, and mounts the lazy dice overlay only while a dice card is revealed and unreturned. A choice card (`dice.choice`) shows two `.card-choice` plaque buttons as siblings of the card once it lands face up; the card button is inert until one is picked. The card is a single `<button>` whose `aria-label` changes with state; keep it accurate when adding states.
- `Completion.tsx`: end screen; its celebration `onAnimationEnd` calls the controller `finish`.
- `GameDialogs.tsx`: install, pause menu, previous card, end game. A dialog stays mounted for its exit animation (`EXIT_MS`), with a timer fallback so it can never stick. The Install copy describes Add to Home Screen steps.

Screens receive state and callbacks; game decisions live in `src/game` and `src/presentation/controller.ts`, not here.
