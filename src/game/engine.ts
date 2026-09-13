import type {
  CardDefinition,
  GameConfig,
  PackDefinition,
  SessionState,
} from "./types";
export type Random = () => number;
export function shuffle(
  ids: string[],
  random: Random = Math.random,
  previous: string | null = null,
): string[] {
  const next = [...ids];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  if (next.length > 1 && next[0] === previous) {
    const j = 1 + Math.floor(random() * (next.length - 1));
    [next[0], next[j]] = [next[j], next[0]];
  }
  return next;
}
export function validConfig(c: GameConfig): boolean {
  return (
    !!c &&
    c.version === 1 &&
    Array.isArray(c.packIds) &&
    c.packIds.every((id) => typeof id === "string") &&
    new Set(c.packIds).size === c.packIds.length &&
    (c.limit === null ||
      (Number.isInteger(c.limit) && c.limit >= 1 && c.limit <= 500))
  );
}
export function createSession(
  config: GameConfig,
  catalog: CardDefinition[],
  packs: PackDefinition[],
  random: Random = Math.random,
): SessionState {
  if (
    !validConfig(config) ||
    !config.packIds.length ||
    config.packIds.some((id) => !packs.some((p) => p.id === id))
  )
    throw new Error("Choose a valid deck and at least one pack.");
  const selected = new Set(
    packs
      .filter((p) => config.packIds.includes(p.id))
      .flatMap((p) => p.cardIds),
  );
  const cards = catalog
    .filter((c) => selected.has(c.id))
    .map((c) => ({ ...c }));
  if (!cards.length) throw new Error("This deck has no cards.");
  return {
    version: 1,
    config: { ...config, packIds: [...config.packIds] },
    cards,
    order: shuffle(
      cards.map((c) => c.id),
      random,
    ),
    position: 0,
    cycle: 0,
    discarded: 0,
    phase: "hidden",
    previousId: null,
  };
}
export function currentCard(s: SessionState) {
  return s.cards.find((c) => c.id === s.order[s.position])!;
}
export function advance(
  s: SessionState,
  random: Random = Math.random,
): SessionState {
  if (s.phase === "complete") return s;
  if (s.phase === "hidden") return { ...s, phase: "revealed" };
  const discarded = s.discarded + 1,
    previousId = currentCard(s).id;
  if (s.config.limit !== null && discarded === s.config.limit)
    return { ...s, phase: "complete", discarded, previousId };
  if (s.position + 1 === s.order.length)
    return {
      ...s,
      discarded,
      previousId,
      phase: "hidden",
      cycle: s.cycle + 1,
      position: 0,
      order: shuffle(s.order, random, previousId),
    };
  return {
    ...s,
    discarded,
    previousId,
    phase: "hidden",
    position: s.position + 1,
  };
}

export function replaySession(
  s: SessionState,
  random: Random = Math.random,
): SessionState {
  return {
    ...s,
    config: { ...s.config, packIds: [...s.config.packIds] },
    cards: s.cards.map((c) => ({ ...c })),
    order: shuffle(
      s.cards.map((c) => c.id),
      random,
    ),
    position: 0,
    cycle: 0,
    discarded: 0,
    phase: "hidden",
    previousId: null,
  };
}
