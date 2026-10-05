import type { CardDefinition, PackDefinition } from "../game/types";

/**
 * The installed card catalog. Card content is the largest part of the app's
 * code, so `catalog.ts` is a lazy chunk: `main.tsx` awaits `loadCatalog()`
 * before the first render, alongside the art that render already waits for.
 * Everything that runs after that reads it synchronously through `catalog()`.
 */
export interface Catalog {
  cards: CardDefinition[];
  packs: PackDefinition[];
}

let installed: Catalog | null = null;

export function installCatalog(value: Catalog) {
  installed = value;
}

export function loadCatalog(): Promise<Catalog> {
  return import("./catalog").then(() => catalog());
}

export function catalog(): Catalog {
  if (!installed) throw Error("Card catalog used before it loaded");
  return installed;
}
