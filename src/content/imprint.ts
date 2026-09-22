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
 * icon; the first few below are worked examples of the shape.
 */
export const imprintAssignments: Record<string, ImprintAssignment> = {
  "core.house-special": { icon: "lorc/beer-stein", tint: "amber" },
  "core.last-call": { icon: "delapouite/tavern-sign", tint: "teal" },
  "core.baller": { icon: "delapouite/coins-pile", tint: "sepia" },
  "core.crypto-bro": { icon: "delapouite/coins-pile", tint: "sage" },
  "core.deez-nuts": { icon: "lorc/skull-crossed-bones", tint: "rose" },
  "core.cheers-idiots": { icon: "delapouite/beer-horn", tint: "amber" },
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
