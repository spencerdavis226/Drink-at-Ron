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
 * Spread a quest's cards through its run: move enough of them into the draws
 * before the run's last one that the goal is met and the finale still lands
 * in time. The rest of the shuffle is untouched.
 */
export function paceQuest(
  order: string[],
  cards: CardDefinition[],
  quest: QuestState | undefined,
  random: Random = Math.random,
): string[] {
  if (!quest) return order;
  const next = [...order];
  const window = Math.min(quest.length - 1, next.length);
  const tagged = new Set(
    cards.filter((c) => c.quest === quest.packId).map((c) => c.id),
  );
  const spots = (from: number, to: number, want: boolean) => {
    const found = [];
    for (let i = from; i < to; i++)
      if (tagged.has(next[i]) === want) found.push(i);
    return found;
  };
  let short = quest.goal - spots(0, window, true).length;
  while (short-- > 0) {
    const out = spots(window, next.length, true);
    const into = spots(0, window, false);
    if (!out.length || !into.length) break;
    const a = out[Math.floor(random() * out.length)],
      b = into[Math.floor(random() * into.length)];
    [next[a], next[b]] = [next[b], next[a]];
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
      (Number.isInteger(c.limit) && c.limit >= 1 && c.limit <= 500)) &&
    (c.quest === undefined ||
      (typeof c.quest === "string" &&
        c.packIds.includes(c.quest) &&
        c.limit === null))
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
  // A quest mode also deals its own pack's quest-only cards.
  const selected = new Set(
    packs
      .filter((p) => config.packIds.includes(p.id))
      .flatMap((p) => [
        ...p.cardIds,
        ...(p.id === config.quest ? (p.quest?.cardIds ?? []) : []),
      ]),
  );
  const cards = catalog
    .filter((c) => selected.has(c.id))
    .map((c) => structuredClone(c));
  if (!cards.length) throw new Error("This deck has no cards.");
  let quest: QuestState | undefined;
  if (config.quest) {
    const rules = packs.find((p) => p.id === config.quest)?.quest;
    const finale = catalog.find((c) => c.id === rules?.finaleId);
    if (!rules || !finale) throw new Error("This pack has no quest.");
    const { label, goal, length } = rules;
    quest = {
      packId: config.quest,
      label,
      goal,
      length,
      count: 0,
      due: false,
      finale: structuredClone(finale),
    };
  }
  return {
    version: 2,
    config: { ...config, packIds: [...config.packIds] },
    cards,
    order: paceQuest(
      shuffle(
        cards.map((c) => c.id),
        random,
      ),
      cards,
      quest,
      random,
    ),
    position: 0,
    cycle: 0,
    discarded: 0,
    phase: "hidden",
    previousId: null,
    roll: null,
    previousRoll: null,
    ...(quest ? { quest } : {}),
  };
}
/** The quest's finale is dealt between deck cards and takes no position. */
export function currentCard(s: SessionState) {
  return s.quest?.due
    ? s.quest.finale
    : s.cards.find((c) => c.id === s.order[s.position])!;
}
/** A deck card or the quest finale, for history such as the previous card. */
export function findCard(s: SessionState, id: string | null) {
  return (
    s.cards.find((c) => c.id === id) ??
    (s.quest?.finale.id === id ? s.quest.finale : undefined)
  );
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
  const card = currentCard(s);
  const discarded = s.discarded + 1,
    previousId = card.id;
  // A quest mode ends when its finale is put aside; a finite game at its limit.
  if (s.quest?.due || (s.config.limit !== null && discarded === s.config.limit))
    return {
      ...s,
      previousRoll: s.roll,
      phase: "complete",
      discarded,
      previousId,
    };
  if (s.quest && card.quest === s.quest.packId) {
    const count = s.quest.count + 1;
    s = { ...s, quest: { ...s.quest, count, due: count >= s.quest.goal } };
  }
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
    order: paceQuest(
      shuffle(
        s.cards.map((c) => c.id),
        random,
      ),
      s.cards,
      s.quest,
      random,
    ),
    position: 0,
    cycle: 0,
    discarded: 0,
    phase: "hidden",
    previousId: null,
    roll: null,
    previousRoll: null,
    ...(s.quest
      ? {
          quest: {
            ...s.quest,
            finale: structuredClone(s.quest.finale),
            count: 0,
            due: false,
          },
        }
      : {}),
  };
}
