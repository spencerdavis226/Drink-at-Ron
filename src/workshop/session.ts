import { createSession, finaleCardIds } from "../game/engine";
import { cards, packs } from "../content/catalog";
export function seededRandom(seed: string) {
  let state = 2166136261;
  for (const char of seed)
    state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => {
    state += 0x6d2b79f5;
    let n = state;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}
export const workshopCards = cards;
export const workshopPacks = packs;
export function workshopSession(seed: string, first: string, revealed = true) {
  const random = seededRandom(seed);
  // A quest finale is never in the deck order: preview it in its quest mode,
  // as dealt.
  // Quest-only cards (gym leaders) and finales preview in their quest mode.
  const quest = packs.find(
    (p) =>
      !!p.quest &&
      (p.quest.cardIds.includes(first) ||
        finaleCardIds(p.quest).includes(first)),
  )?.id;
  const session = createSession(
    {
      version: 1,
      packIds: packs.map((p) => p.id),
      limit: null,
      ...(quest ? { quest } : {}),
    },
    workshopCards,
    workshopPacks,
    random,
  );
  if (session.order.includes(first))
    session.order = [first, ...session.order.filter((id) => id !== first)];
  // A finale card previews as dealt: swap it into its own stage's picks and
  // make that the step in play.
  const q = session.quest;
  const stage = q?.stages.findIndex((s) => s.cards.some((c) => c.id === first));
  if (q && stage !== undefined && stage >= 0) {
    const start = q.stages.slice(0, stage).reduce((sum, s) => sum + s.pick, 0);
    const picks = q.finale.slice(start, start + q.stages[stage].pick);
    const rest = picks.filter((id) => id !== first);
    const finale = [...q.finale];
    finale.splice(
      start,
      picks.length,
      first,
      ...rest.slice(0, picks.length - 1),
    );
    Object.assign(q, { count: q.goal, due: true, finale, step: start });
  }
  if (revealed) session.phase = "revealed";
  return { session, random };
}
