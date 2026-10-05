import type {
  CardDefinition,
  GameConfig,
  PackDefinition,
  QuestState,
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
/**
 * In a finite game, make every quest finishable: move enough of its cards
 * into the draws before the last one that the goal can be met and its finale
 * still dealt. The rest of the shuffle is untouched, and an endless game is
 * left to chance.
 */
export function paceQuests(
  order: string[],
  cards: CardDefinition[],
  quests: readonly QuestState[] | undefined,
  limit: number | null,
  random: Random = Math.random,
): string[] {
  if (limit === null || !quests?.length) return order;
  const next = [...order];
  const window = Math.min(limit - 1, next.length);
  const questOf = new Map(cards.map((c) => [c.id, c.quest]));
  for (const { packId, goal } of quests) {
    const tagged = (i: number) => questOf.get(next[i]) === packId;
    const inside = () =>
      next.slice(0, window).filter((_, i) => tagged(i)).length;
    const pick = (from: number, to: number, want: boolean) => {
      const spots = [];
      for (let i = from; i < to; i++)
        if (tagged(i) === want && !(want === false && questOf.get(next[i])))
          spots.push(i);
      return spots[Math.floor(random() * spots.length)];
    };
    while (inside() < goal) {
      const out = pick(window, next.length, true);
      const into = pick(0, window, false);
      if (out === undefined || into === undefined) break;
      [next[out], next[into]] = [next[into], next[out]];
    }
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
    .map((c) => structuredClone(c));
  if (!cards.length) throw new Error("This deck has no cards.");
  // A quest runs only when its finale was loaded with the cards; a partial
  // catalog (a single-card fixture) simply plays without it.
  const quests: QuestState[] = packs.flatMap((p) => {
    const finale =
      p.quest &&
      config.packIds.includes(p.id) &&
      catalog.find((c) => c.id === p.quest!.finaleId);
    if (!finale) return [];
    const { label, goal } = p.quest!;
    return [
      {
        packId: p.id,
        label,
        goal,
        count: 0,
        due: false,
        shown: 0,
        finale: structuredClone(finale),
      },
    ];
  });
  return {
    version: 2,
    config: { ...config, packIds: [...config.packIds] },
    cards,
    order: paceQuests(
      shuffle(
        cards.map((c) => c.id),
        random,
      ),
      cards,
      quests,
      config.limit,
      random,
    ),
    position: 0,
    cycle: 0,
    discarded: 0,
    phase: "hidden",
    previousId: null,
    roll: null,
    previousRoll: null,
    ...(quests.length ? { quests } : {}),
  };
}
/** The quest whose finale is in play, if any. */
export function dueQuest(s: SessionState) {
  return s.quests?.find((q) => q.due);
}
export function currentCard(s: SessionState) {
  return (
    dueQuest(s)?.finale ?? s.cards.find((c) => c.id === s.order[s.position])!
  );
}
/** A deck card or a quest finale, for history such as the previous card. */
export function findCard(s: SessionState, id: string | null) {
  return (
    s.cards.find((c) => c.id === id) ??
    s.quests?.find((q) => q.finale.id === id)?.finale
  );
}
/** Finales put aside so far; they count as draws but take no deck position. */
export function finalesShown(s: SessionState) {
  return (s.quests ?? []).reduce((sum, q) => sum + q.shown, 0);
}
/** A revealed choice card whose option has not been picked yet. */
export function awaitingChoice(s: SessionState) {
  return s.phase === "revealed" && !s.roll && !!currentCard(s).dice?.choice;
}
export function advance(
  s: SessionState,
  random: Random = Math.random,
): SessionState {
  if (s.phase === "complete") return s;
  if (s.phase === "hidden") return { ...s, phase: "revealed" };
  if (currentCard(s).dice && !s.roll?.returned) return s;
  return discard(s, random);
}
/** Take the no-roll option of a choice card: it is put aside unrolled. */
export function skipRoll(
  s: SessionState,
  random: Random = Math.random,
): SessionState {
  return awaitingChoice(s) ? discard(s, random) : s;
}
function discard(s: SessionState, random: Random): SessionState {
  const history = { previousRoll: s.roll, roll: null };
  const card = currentCard(s),
    due = dueQuest(s);
  const discarded = s.discarded + 1,
    previousId = card.id;
  if (s.config.limit !== null && discarded === s.config.limit)
    return {
      ...s,
      previousRoll: s.roll,
      phase: "complete",
      discarded,
      previousId,
    };
  // A finale is drawn between deck cards: the deck position stays put and
  // its meter starts over, so a long game can earn it again.
  if (due)
    return {
      ...s,
      ...history,
      discarded,
      previousId,
      phase: "hidden",
      quests: s.quests!.map((q) =>
        q === due ? { ...q, count: 0, due: false, shown: q.shown + 1 } : q,
      ),
    };
  const quests = s.quests?.map((q) =>
    q.packId === card.quest
      ? { ...q, count: q.count + 1, due: q.count + 1 >= q.goal }
      : q,
  );
  if (quests) s = { ...s, quests };
  if (s.position + 1 === s.order.length)
    return {
      ...s,
      ...history,
      discarded,
      previousId,
      phase: "hidden",
      cycle: s.cycle + 1,
      position: 0,
      order: shuffle(s.order, random, previousId),
    };
  return {
    ...s,
    ...history,
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
    cards: s.cards.map((c) => structuredClone(c)),
    order: paceQuests(
      shuffle(
        s.cards.map((c) => c.id),
        random,
      ),
      s.cards,
      s.quests,
      s.config.limit,
      random,
    ),
    position: 0,
    cycle: 0,
    discarded: 0,
    phase: "hidden",
    previousId: null,
    roll: null,
    previousRoll: null,
    ...(s.quests
      ? {
          quests: s.quests.map((q) => ({
            ...q,
            finale: structuredClone(q.finale),
            count: 0,
            due: false,
            shown: 0,
          })),
        }
      : {}),
  };
}
