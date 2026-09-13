import { validateCatalog } from "../content/catalog";
import { validConfig } from "../game/engine";
import type { GameConfig, SessionState } from "../game/types";
export const SAVE_KEY = "drink-at-ron.session.v1";
export const SETTINGS_KEY = "drink-at-ron.settings.v1";
export interface Preferences {
  config: GameConfig;
  sound: boolean;
  ambience: boolean;
  atmosphere: boolean;
  choice: string;
  customSize: string;
}
export const defaults: Preferences = {
  config: { version: 1, packIds: ["core"], limit: 40 },
  sound: false,
  ambience: false,
  atmosphere: true,
  choice: "40",
  customSize: "40",
};
export function parseSession(raw: string): SessionState {
  const s = JSON.parse(raw) as SessionState;
  if (
    !s ||
    s.version !== 1 ||
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
    if (
      p &&
      validConfig(p.config) &&
      typeof p.sound === "boolean" &&
      ["20", "40", "60", "custom", "endless"].includes(p.choice)
    )
      return {
        ...p,
        ambience: typeof p.ambience === "boolean" ? p.ambience : false,
        atmosphere: typeof p.atmosphere === "boolean" ? p.atmosphere : true,
        customSize:
          typeof p.customSize === "string"
            ? p.customSize
            : String(p.config.limit ?? 40),
      };
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
