import { useEffect, useId, useState } from "react";
import {
  IMPRINT_INK,
  resolveImprint,
  type ResolvedImprint,
} from "../presentation/imprint";

type Geometry = Record<string, string>;

/**
 * One shared dynamic import for the whole document. The sprite is a lazy chunk
 * so it stays out of the critical path; the deal/flip motion comfortably covers
 * the load, and a card simply shows its tint until the geometry arrives.
 */
let sprite: Promise<Geometry> | null = null;
const loadGeometry = () =>
  (sprite ??= import("../presentation/imprint/icons.generated").then(
    (module) => module.imprintIcons,
  ));

/** Position one normalized 512×512 icon inside the lattice cell. */
function motif(
  geometry: string,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
): string {
  const scale = size / 512;
  return (
    `<g transform="rotate(${rotation} ${cx} ${cy}) ` +
    `translate(${cx - size / 2} ${cy - size / 2}) scale(${scale})">${geometry}</g>`
  );
}

/**
 * The repeating two-motif lattice — the card's icon in the middle of each cell
 * and a smaller ornament on the intersections, so tiling reads as woven
 * material rather than a single stamped logo.
 */
export function Lattice({
  imprint,
  icon,
  ornament,
  patternId,
  className = "card-imprint-lattice",
}: {
  imprint: ResolvedImprint;
  icon: string;
  ornament: string;
  patternId: string;
  className?: string;
}) {
  const { cell, iconSize, ornamentSize } = imprint;
  const content = [
    motif(icon, cell / 2, cell / 2, iconSize, imprint.iconRotation),
    motif(ornament, 0, 0, ornamentSize, imprint.ornamentRotation),
    motif(ornament, cell, 0, ornamentSize, imprint.ornamentRotation),
    motif(ornament, 0, cell, ornamentSize, imprint.ornamentRotation),
    motif(ornament, cell, cell, ornamentSize, imprint.ornamentRotation),
  ].join("");
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{ color: IMPRINT_INK, opacity: imprint.inkOpacity }}
    >
      <svg
        className="card-imprint-pattern"
        width="100%"
        height="100%"
        focusable="false"
      >
        <defs>
          <pattern
            id={patternId}
            width={cell}
            height={cell}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${imprint.phaseX} ${imprint.phaseY})`}
          >
            <g
              fill="currentColor"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </span>
  );
}

/**
 * Programmatic card personalisation: a paper wash plus the icon lattice,
 * imprinted behind the rules. Driven entirely by card id — no per-card branch,
 * no image generation, and nothing written into the session.
 */
export function CardImprint({ cardId }: { cardId: string }) {
  const imprint = resolveImprint(cardId);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const patternId = `imprint-${rawId}`;
  useEffect(() => {
    let live = true;
    void loadGeometry()
      .then((icons) => {
        if (live) setGeometry(icons);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);
  const icon = geometry?.[imprint.icon];
  const ornament = geometry?.[imprint.ornament];
  return (
    <>
      {imprint.tintOpacity > 0 && (
        <span
          className="card-imprint-tint"
          aria-hidden="true"
          style={{
            background: imprint.tintColor,
            opacity: imprint.tintOpacity,
          }}
        />
      )}
      {icon && ornament && (
        <Lattice
          imprint={imprint}
          icon={icon}
          ornament={ornament}
          patternId={patternId}
        />
      )}
    </>
  );
}
