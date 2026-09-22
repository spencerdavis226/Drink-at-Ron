/**
 * Resolves the deterministic imprint for a card.
 *
 * An explicit entry in `imprintAssignments` wins; everything else is derived
 * from a stable hash of the card id, so every card — including ones added
 * tomorrow — gets a consistent lattice, tint and geometry without any art
 * work. Never use `Math.random` here: the same card must look the same in
 * every session, on every device, in the workshop preview and in tests.
 */
import {
  imprintAssignments,
  imprintTints,
  defaultIcons,
  ornamentIcons,
  tintNames,
  type TintName,
} from "../content/imprint";

/** Imprint ink, matched to the rules text so the lattice reads as the paper. */
export const IMPRINT_INK = "#392713";

/** Lattice geometry in CSS pixels, tuned against the parchment panel. */
const CELL = 62;
const ICON_SIZE = 42;
const ORNAMENT_SIZE = 17;

const ICON_TURNS = [-12, 0, 0, 12] as const;
const EIGHTH_TURNS = [0, 45, 90, 135, 180, 225, 270, 315] as const;

export interface ResolvedImprint {
  icon: string;
  ornament: string;
  tint: TintName;
  tintColor: string;
  tintOpacity: number;
  iconRotation: number;
  ornamentRotation: number;
  cell: number;
  iconSize: number;
  ornamentSize: number;
  inkOpacity: number;
  /** Sub-cell offset so the lattice never starts identically on two cards. */
  phaseX: number;
  phaseY: number;
}

/** FNV-1a — small, stable, and identical in the browser and in node. */
export function fnv1a(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1)
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0;
}

const pick = <T>(list: readonly T[], hash: number, shift: number): T =>
  list[(hash >>> shift) % list.length];

export function resolveImprint(cardId: string): ResolvedImprint {
  const assignment = imprintAssignments[cardId];
  const hash = fnv1a(cardId);
  const tint =
    assignment?.tint && tintNames.includes(assignment.tint)
      ? assignment.tint
      : pick(tintNames, hash, 3);
  const wash = imprintTints[tint];
  return {
    icon: assignment?.icon ?? pick(defaultIcons, hash, 5),
    ornament: assignment?.ornament ?? pick(ornamentIcons, hash, 13),
    tint,
    tintColor: wash.color,
    tintOpacity: wash.opacity,
    iconRotation: pick(ICON_TURNS, hash, 19),
    ornamentRotation: pick(EIGHTH_TURNS, hash, 22),
    cell: CELL,
    iconSize: ICON_SIZE,
    ornamentSize: ORNAMENT_SIZE,
    inkOpacity: 0.055 + ((hash >>> 26) % 4) / 100,
    phaseX: (hash >>> 11) % CELL,
    phaseY: (hash >>> 17) % CELL,
  };
}
