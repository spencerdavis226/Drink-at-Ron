import { packs, validateCatalog } from "../content/catalog";
import { validateRoll } from "../game/dice";
import { validConfig } from "../game/engine";
import type { GameConfig, SessionState } from "../game/types";
export const SAVE_KEY = "drink-at-ron.session.v1";
export const SETTINGS_KEY = "drink-at-ron.settings.v1";
export type DeckChoice = "short" | "long" | "infinite";
export const MODE_LIMITS: Record<DeckChoice, number | null> = {
  short: 30,
  long: 60,
  infinite: null,
};
export interface Preferences {
  config: GameConfig;
  choice: DeckChoice;
}
export const defaults: Preferences = {
  config: { version: 1, packIds: ["core"], limit: 30 },
  choice: "short",
};
/** Keep only installed packs; never let a stale selection empty the deck. */
const knownPackIds = (ids: readonly string[]) => {
  const known = packs.map((pack) => pack.id).filter((id) => ids.includes(id));
  return known.length ? known : [packs[0].id];
};
export function parseSession(raw: string): SessionState {
  const parsed = JSON.parse(raw);
  // Retain the storage key so existing installs discover and migrate their saves.
  // Legacy snapshots cannot have dice mechanics retroactively attached to them.
  if (parsed?.version === 1 && Array.isArray(parsed.cards)) {
    if (
      parsed.cards.some((c: { dice?: unknown } | null) => c?.dice !== undefined)
    )
      throw Error("Invalid legacy dice save");
    parsed.version = 2;
    parsed.roll = null;
    parsed.previousRoll = null;
  }
  const s = parsed as SessionState;
  if (
    !s ||
    s.version !== 2 ||
    !validConfig(s.config) ||
    !s.config.packIds.length ||
    !Array.isArray(s.cards) ||
    !s.cards.length
  )
    throw Error("Invalid save");
  validateCatalog(s.cards, []);
  if (
    !Array.isArray(s.order) ||
    s.order.length !== s.cards.length ||
    new Set(s.order).size !== s.order.length ||
    s.order.some((id) => !s.cards.some((c) => c.id === id))
  )
    throw Error("Invalid order");
  if (
    !Number.isSafeInteger(s.position) ||
    s.position < 0 ||
    s.position >= s.order.length ||
    !Number.isSafeInteger(s.cycle) ||
    s.cycle < 0 ||
    !Number.isSafeInteger(s.discarded) ||
    s.discarded < 0 ||
    !["hidden", "revealed", "complete"].includes(s.phase)
  )
    throw Error("Invalid progress");
  if (s.previousId !== null && !s.cards.some((c) => c.id === s.previousId))
    throw Error("Invalid previous card");
  if ((s.discarded === 0) !== (s.previousId === null))
    throw Error("Invalid history");
  if (s.phase === "complete") {
    if (
      s.config.limit === null ||
      s.discarded !== s.config.limit ||
      s.discarded !== s.cycle * s.cards.length + s.position + 1 ||
      s.previousId !== s.order[s.position]
    )
      throw Error("Invalid completion");
  } else if (
    s.discarded !== s.cycle * s.cards.length + s.position ||
    (s.config.limit !== null && s.discarded >= s.config.limit)
  )
    throw Error("Invalid count");
  const current = s.cards.find((c) => c.id === s.order[s.position])!;
  const previous = s.cards.find((c) => c.id === s.previousId);
  validateRoll(s.roll, current.dice);
  validateRoll(s.previousRoll, previous?.dice);
  if (
    (s.phase === "hidden" && s.roll !== null) ||
    (previous?.dice && !s.previousRoll?.returned) ||
    (s.previousRoll && !s.previousRoll.returned) ||
    (s.phase === "complete" &&
      current.dice &&
      (!s.roll?.returned ||
        JSON.stringify(s.roll) !== JSON.stringify(s.previousRoll)))
  )
    throw Error("Invalid dice progress");
  return s;
}
export function loadSession(): {
  session: SessionState | null;
  corrupt: boolean;
  unavailable: boolean;
} {
  let raw;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return { session: null, corrupt: false, unavailable: true };
  }
  try {
    return {
      session: raw ? parseSession(raw) : null,
      corrupt: false,
      unavailable: false,
    };
  } catch {
    return { session: null, corrupt: true, unavailable: false };
  }
}
export function loadPreferences(): Preferences {
  try {
    const p = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    // Legacy saves may still carry sound/ambience/atmosphere; they are ignored.
    if (p && validConfig(p.config)) {
      let choice: DeckChoice;
      if (["short", "long", "infinite"].includes(p.choice)) {
        choice = p.choice;
      } else if (p.choice === "endless") {
        choice = "infinite";
      } else if (["20", "40", "60", "custom"].includes(p.choice)) {
        const size =
          p.choice === "custom" ? Number(p.customSize) : Number(p.choice);
        const finite =
          Number.isInteger(size) && size >= 1 && size <= 500
            ? size
            : p.config.limit;
        choice = finite === null ? "infinite" : finite <= 45 ? "short" : "long";
      } else {
        return defaults;
      }
      return {
        config: {
          ...p.config,
          packIds: knownPackIds(p.config.packIds),
          limit: MODE_LIMITS[choice],
        },
        choice,
      };
    }
  } catch {
    /* defaults */
  }
  return defaults;
}
export function save(key: string, value: unknown): boolean {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
