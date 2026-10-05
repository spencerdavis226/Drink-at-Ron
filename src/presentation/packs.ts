import type { PackDefinition } from "../game/types";
import { catalog as installed } from "../content/registry";
/** Cosmetic identity comes from the installed catalog, never changes the saved draw order. */
export function cardPacks(
  cardId: string,
  selected?: readonly string[],
  catalog: readonly PackDefinition[] = installed().packs,
) {
  return catalog.filter(
    (pack) =>
      (!selected || selected.includes(pack.id)) &&
      (pack.cardIds.includes(cardId) || cardId.startsWith(`${pack.id}.`)),
  );
}
export function selectedPacks(ids: readonly string[]) {
  return installed().packs.filter((pack) => ids.includes(pack.id));
}
