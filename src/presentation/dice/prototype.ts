/** Explicit opt-in study; normal releases tree-shake the library integration. */
export const libraryDice =
  import.meta.env.VITE_DICE_PROTOTYPE === "1" ||
  (import.meta.env.DEV &&
    new URLSearchParams(location.search).get("dice") === "library");
