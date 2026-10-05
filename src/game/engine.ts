import type {
  CardDefinition,
  GameConfig,
  PackDefinition,
  PackQuest,
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
    if (!rules) throw new Error("This pack has no quest.");
    const stages = rules.finale.map(({ label, pick, cardIds }) => {
      const pool = cardIds.map((id) => catalog.find((c) => c.id === id));
      if (pool.some((c) => !c)) throw new Error("A finale card is missing.");
      return {
        label,
        pick,
        cards: (pool as CardDefinition[]).map((c) => structuredClone(c)),
      };
    });
    const { label, goal, length } = rules;
    quest = {
      packId: config.quest,
      label,
      goal,
      length,
      count: 0,
      due: false,
      stages,
      finale: pickFinale(stages, random),
      step: 0,
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
/** Every card a pack can deal: its deck, its quest-only cards and its
 * quest's finale. */
export function packCardIds(pack: PackDefinition): string[] {
  return [
    ...pack.cardIds,
    ...(pack.quest
      ? [...pack.quest.cardIds, ...finaleCardIds(pack.quest)]
      : []),
  ];
}
/** Every card a quest's finale stages can deal. */
export function finaleCardIds(rules: PackQuest): string[] {
  return rules.finale.flatMap((stage) => stage.cardIds);
}
/** Draw each stage's cards at random, in stage order. */
export function pickFinale(
  stages: QuestState["stages"],
  random: Random = Math.random,
): string[] {
  return stages.flatMap(({ pick, cards }) =>
    shuffle(
      cards.map((c) => c.id),
      random,
    ).slice(0, pick),
  );
}
/** The stage a finale card belongs to (`stage` counts from 0), and its place
 * within that stage. */
export function finaleStage(quest: QuestState, step = quest.step) {
  let first = 0;
  for (const [number, stage] of quest.stages.entries()) {
    if (step < first + stage.pick)
      return {
        label: stage.label,
        stage: number,
        index: step - first,
        size: stage.pick,
      };
    first += stage.pick;
  }
  throw new Error("Invalid finale step");
}
/** A quest run so far, for the badge case and the Hall of Fame: the meter's
 * count, the quest cards behind it that are still in this cycle's order (an
 * endless game reshuffles, so earlier ones can be gone), and each finale
 * stage with the cards already put aside. Picks not yet dealt stay hidden. */
export function questRecord(s: SessionState) {
  const q = s.quest;
  if (!q) return null;
  const earned = s.order
    .slice(0, s.position)
    .map((id) => s.cards.find((c) => c.id === id)!)
    .filter((c) => c.quest === q.packId)
    .slice(0, q.count);
  const won = q.due && s.phase === "complete";
  const beaten = won ? q.finale.length : q.due ? q.step : 0;
  let first = 0;
  const stages = q.stages.map((stage) => {
    const cards = q.finale
      .slice(first, Math.min(first + stage.pick, beaten))
      .map((id) => finaleCard(q, id)!);
    first += stage.pick;
    return { label: stage.label, size: stage.pick, cards };
  });
  return { label: q.label, goal: q.goal, count: q.count, earned, stages, won };
}
const finaleCard = (quest: QuestState, id: string) =>
  quest.stages.flatMap((stage) => stage.cards).find((c) => c.id === id);
/** Finale cards are dealt between deck cards and take no deck position. */
export function currentCard(s: SessionState) {
  return s.quest?.due
    ? finaleCard(s.quest, s.quest.finale[s.quest.step])!
    : s.cards.find((c) => c.id === s.order[s.position])!;
}
/** A deck card or a finale card, for history such as the previous card. */
export function findCard(s: SessionState, id: string | null) {
  return (
    s.cards.find((c) => c.id === id) ??
    (s.quest && id !== null ? finaleCard(s.quest, id) : undefined)
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
  const lastFinale =
    !!s.quest?.due && s.quest.step === s.quest.finale.length - 1;
  // A quest mode ends when its last finale card is put aside; a finite game
  // at its limit.
  if (lastFinale || (s.config.limit !== null && discarded === s.config.limit))
    return {
      ...s,
      previousRoll: s.roll,
      phase: "complete",
      discarded,
      previousId,
    };
  // The next finale card is dealt; the deck waits where it is.
  if (s.quest?.due)
    return {
      ...s,
      ...history,
      discarded,
      previousId,
      phase: "hidden",
      quest: { ...s.quest, step: s.quest.step + 1 },
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
            stages: structuredClone(s.quest.stages),
            finale: pickFinale(s.quest.stages, random),
            count: 0,
            due: false,
            step: 0,
          },
        }
      : {}),
  };
}
