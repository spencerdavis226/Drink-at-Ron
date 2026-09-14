import { createSession } from "../game/engine";
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
export function workshopSession(seed: string, first: string, revealed = true) {
  const random = seededRandom(seed);
  const session = createSession(
    { version: 1, packIds: packs.map((p) => p.id), limit: null },
    cards,
    packs,
    random,
  );
  if (session.order.includes(first))
    session.order = [first, ...session.order.filter((id) => id !== first)];
  if (revealed) session.phase = "revealed";
  return { session, random };
}
