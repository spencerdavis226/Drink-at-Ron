import { validateDice } from "../game/dice";
import { coreCards, samplePack } from "./sample";
import { vipCards, vipPack } from "./vip";
import type { CardDefinition, PackDefinition } from "../game/types";

// The runtime catalog. `samplePack` (Core) is always included and now carries
// the supplied sample set, the classic / King's Cup basics, the voice/dice
// expansion, and every supplied house row; VIP night is the only optional
// themed pack. Card content is provided sample material and is expected to
// change.
export const cards: CardDefinition[] = [...coreCards, ...vipCards];
export const packs: PackDefinition[] = [samplePack, vipPack];

export function validateCatalog(cs: CardDefinition[], ps: PackDefinition[]) {
  const fail = (message: string): never => {
    throw new Error(message);
  };
  const ids = new Set<string>();
  for (const c of cs) {
    if (
      !c ||
      c.version !== 1 ||
      typeof c.id !== "string" ||
      !/^[a-z0-9][a-z0-9.-]*$/.test(c.id) ||
      ids.has(c.id)
    )
      fail("Invalid or duplicate card ID");
    ids.add(c.id);
    if (c.dice !== undefined) validateDice(c.dice);
    if (!["sip", "group", "category", "challenge", "rule"].includes(c.category))
      fail(`Invalid category: ${c.id}`);
    for (const key of ["title", "rules", "artwork"] as const)
      if (typeof c[key] !== "string" || !c[key].trim())
        fail(`Missing ${key}: ${c.id}`);
    if (!/^art\/[a-zA-Z0-9/_-]+\.(svg|png|webp|avif)$/.test(c.artwork))
      fail(`Invalid artwork: ${c.id}`);
  }
  const packIds = new Set<string>();
  for (const p of ps) {
    if (
      !p ||
      p.version !== 1 ||
      typeof p.id !== "string" ||
      !p.id ||
      packIds.has(p.id) ||
      !p.title?.trim() ||
      !p.description?.trim()
    )
      fail("Invalid or duplicate pack");
    if (
      p.setupHint !== undefined &&
      (typeof p.setupHint !== "string" || !p.setupHint.trim())
    )
      fail(`Invalid pack setup hint: ${p.id}`);
    if (
      p.artwork !== undefined &&
      (typeof p.artwork !== "string" ||
        !/^art\/[a-zA-Z0-9/_-]+\.(svg|png|webp|avif)$/.test(p.artwork))
    )
      fail(`Invalid pack artwork: ${p.id}`);
    if (
      p.logo !== undefined &&
      (typeof p.logo !== "string" ||
        !/^art\/[a-zA-Z0-9/_-]+\.(svg|png|webp|avif)$/.test(p.logo))
    )
      fail(`Invalid pack logo: ${p.id}`);
    packIds.add(p.id);
    if (
      !Array.isArray(p.cardIds) ||
      !p.cardIds.length ||
      new Set(p.cardIds).size !== p.cardIds.length ||
      p.cardIds.some((id) => !ids.has(id))
    )
      fail(`Invalid card membership: ${p.id}`);
  }
}
