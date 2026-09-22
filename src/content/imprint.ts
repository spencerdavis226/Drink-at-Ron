/**
 * Card imprint content: which icon and paper tint a card carries.
 *
 * This is presentation data only. It is deliberately kept out of
 * `CardDefinition` so session schema v2, saved snapshots and the pure engine
 * stay untouched — an imprint can be added, changed or removed without a
 * migration and without invalidating an in-progress game.
 *
 * Assignments are optional. Any card without an entry falls back to a stable
 * value derived from its id, so adding new cards never blocks on artwork.
 * Slugs are `<artist>/<icon>` from the vendored game-icons library in
 * `assets/icons/game-icons`; `scripts/imprint.ts` validates them at build time.
 */

/** Paper washes applied under the lattice. `none` leaves the parchment bare. */
export const imprintTints = {
  none: { color: "#f4dfb4", opacity: 0 },
  amber: { color: "#d9a355", opacity: 0.18 },
  rose: { color: "#c98a7a", opacity: 0.16 },
  sage: { color: "#8fa07a", opacity: 0.16 },
  teal: { color: "#6f8f8a", opacity: 0.16 },
  sepia: { color: "#b98a5e", opacity: 0.18 },
  plum: { color: "#9c7f96", opacity: 0.16 },
  ash: { color: "#9a9488", opacity: 0.14 },
} as const;

export type TintName = keyof typeof imprintTints;

export const tintNames = Object.keys(imprintTints) as TintName[];

export interface ImprintAssignment {
  /** Main motif slug, e.g. `lorc/beer-stein`. */
  icon?: string;
  /** Small connective motif slug repeated at the lattice intersections. */
  ornament?: string;
  tint?: TintName;
}

/**
 * Per-card overrides. Empty is a valid, intentional state: every card still
 * gets a deterministic lattice. Add an entry when a card deserves a specific
 * icon; the current catalog below has curated assignments.
 */
export const imprintAssignments: Record<string, ImprintAssignment> = {
  "core.house-special": { icon: "lorc/beer-stein", tint: "amber" },
  "core.bar-tab": { icon: "delapouite/coins-pile", tint: "sepia" },
  "core.bad-influence": { icon: "lorc/poison-bottle", tint: "plum" },
  "core.last-call": { icon: "delapouite/tavern-sign", tint: "teal" },
  "core.you-specifically": { icon: "lorc/crossed-swords", tint: "rose" },
  "core.cheap-date": { icon: "delapouite/wine-bottle", tint: "sage" },
  "core.baller": { icon: "delapouite/coins-pile", tint: "amber" },
  "core.group-project": { icon: "sbed/hand", tint: "teal" },
  "core.bad-text": { icon: "lorc/quill", tint: "rose" },
  "core.hr-violation": { icon: "lorc/handcuffs", tint: "plum" },
  "core.fake-sick": { icon: "lorc/poison-bottle", tint: "sage" },
  "core.crypto-bro": { icon: "lorc/crown-coin", tint: "sage" },
  "core.deez-nuts": { icon: "lorc/skull-crossed-bones", tint: "rose" },
  "core.smooth-brain": { icon: "lorc/brain", tint: "plum" },
  "core.would-you": { icon: "lorc/conversation", tint: "rose" },
  "core.cheers-idiots": { icon: "delapouite/beer-horn", tint: "amber" },
  "core.dice-tax": { icon: "lorc/scales", tint: "sepia" },
  "core.give-a-shit": { icon: "delapouite/dice-fire", tint: "amber" },
  "core.fuckin-math": { icon: "lorc/scales", tint: "teal" },
  "core.low-roller": { icon: "delapouite/dice-six-faces-one", tint: "ash" },
  "core.high-roller": { icon: "lorc/crown", tint: "amber" },
  "core.same-shit": { icon: "delapouite/dice-fire", tint: "plum" },
  "core.two-beers-math": { icon: "lorc/beer-stein", tint: "amber" },
  "core.snake-eyes": { icon: "lorc/snake", tint: "sage" },
  "core.lucky-bastard": { icon: "lorc/clover", tint: "sage" },
  "core.fuck-around": { icon: "lorc/crossed-swords", tint: "rose" },
  "core.crit-fail": { icon: "lorc/skull-crossed-bones", tint: "ash" },
  "core.chosen-one": { icon: "sbed/shield", tint: "teal" },
  "core.categories": { icon: "lorc/book-cover", tint: "sepia" },
  "core.rhyme-time": { icon: "lorc/quill", tint: "plum" },
  "core.questions-only": { icon: "lorc/conversation", tint: "teal" },
  "core.name-3": { icon: "lorc/book-cover", tint: "sage" },
  "core.rock-paper-drink": { icon: "lorc/crossed-swords", tint: "amber" },
  "core.never-have-i": { icon: "lorc/conversation", tint: "rose" },
  "core.rulemaster": { icon: "lorc/scroll-unfurled", tint: "sepia" },
  "core.no-names": { icon: "lorc/quill", tint: "ash" },
  "core.potty-mouth": { icon: "lorc/castle", tint: "teal" },
  "core.captain-dumbass": { icon: "sbed/shield", tint: "amber" },
  "core.cursed-number": { icon: "lorc/skull-crossed-bones", tint: "plum" },
  "core.dice-lord": { icon: "lorc/crown", tint: "teal" },
  "vip.toast": { icon: "delapouite/beer-horn", tint: "amber" },
  "vip.sidekick": { icon: "sbed/shield", tint: "sage" },
  "vip.tax": { icon: "lorc/crown-coin", tint: "sepia" },
  "vip.fan-club": { icon: "lorc/crowned-heart", tint: "rose" },
  "vip.standing-ovation": { icon: "sbed/hand", tint: "amber" },
  "vip.favors": { icon: "lorc/key", tint: "teal" },
  "vip.gift": { icon: "lorc/gift-of-knowledge", tint: "plum" },
  "vip.superlatives": { icon: "delapouite/round-star", tint: "amber" },
  "vip.roast": { icon: "lorc/heartburn", tint: "rose" },
  "vip.title": { icon: "lorc/scroll-unfurled", tint: "plum" },
  "vip.excellency": { icon: "lorc/crown", tint: "teal" },
  "vip.never-alone": { icon: "lorc/beer-stein", tint: "sage" },
};

/**
 * Motif pools used by the deterministic fallback. Keep these broad and
 * thematic; every entry is shipped in the generated sprite, so the pool is a
 * direct cost against the lazy JavaScript budget.
 */
export const defaultIcons = [
  "lorc/beer-stein",
  "delapouite/beer-horn",
  "delapouite/mug-shot",
  "lorc/crown",
  "delapouite/dice-fire",
  "lorc/crossed-swords",
  "sbed/shield",
  "delapouite/wine-bottle",
  "delapouite/tavern-sign",
  "delapouite/hops",
  "delapouite/coins-pile",
  "lorc/skull-crossed-bones",
  "lorc/key",
  "lorc/treasure-map",
  "delapouite/round-star",
  "lorc/castle",
] as const;

/** Small ornaments placed at the lattice intersections. */
export const ornamentIcons = [
  "lorc/cut-diamond",
  "lorc/checkered-diamond",
  "delapouite/flower-emblem",
  "lorc/fluffy-trefoil",
  "lorc/fluffy-swirl",
  "skoll/diamonds",
  "delapouite/star-formation",
  "delapouite/deer-track",
] as const;

/** Every slug that must exist in the generated sprite. */
export function imprintIconSlugs(): string[] {
  const slugs = new Set<string>([...defaultIcons, ...ornamentIcons]);
  for (const assignment of Object.values(imprintAssignments)) {
    if (assignment.icon) slugs.add(assignment.icon);
    if (assignment.ornament) slugs.add(assignment.ornament);
  }
  return [...slugs].sort();
}
