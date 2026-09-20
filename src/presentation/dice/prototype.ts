/** Explicit opt-in study; normal releases tree-shake the library integration. */
const params = new URLSearchParams(location.search);
export const libraryDice =
  import.meta.env.VITE_DICE_PROTOTYPE === "1" ||
  (import.meta.env.DEV &&
    (params.get("dice") === "library" || params.get("review") === "dice"));
