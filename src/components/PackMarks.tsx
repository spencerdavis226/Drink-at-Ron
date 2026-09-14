import type { PackDefinition } from "../game/types";
import { asset } from "../presentation/theme";
import { cardPacks } from "../presentation/packs";
export function PackLogo({
  pack,
  decorative = false,
}: {
  pack: PackDefinition;
  decorative?: boolean;
}) {
  return (
    <span
      className="pack-logo"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : pack.title}
      title={pack.title}
    >
      <span className="pack-logo-fallback" aria-hidden="true">
        {pack.title.slice(0, 1)}
      </span>
      {pack.logo && (
        <img
          src={asset(pack.logo)}
          alt=""
          aria-hidden="true"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </span>
  );
}
export function CardPackMarks({
  cardId,
  packIds,
}: {
  cardId: string;
  packIds?: readonly string[];
}) {
  return (
    <span className="card-pack-marks">
      {cardPacks(cardId, packIds).map((pack) => (
        <PackLogo key={pack.id} pack={pack} />
      ))}
    </span>
  );
}
