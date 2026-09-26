import type { CSSProperties } from "react";
import type { PackDefinition } from "../game/types";
import { asset } from "../presentation/theme";
import { cardPacks } from "../presentation/packs";

const packSeals: Readonly<Record<string, string>> = {
  core: "art/packs/core-seal.svg",
  house: "art/packs/house-seal.svg",
  vip: "art/packs/vip-seal.svg",
  pokemon: "art/packs/pokemon-seal.svg",
};

export function PackLogo({
  pack,
  decorative = false,
  variant = "standard",
}: {
  pack: PackDefinition;
  decorative?: boolean;
  variant?: "standard" | "watermark";
}) {
  const seal = packSeals[pack.id] ?? pack.logo;
  return (
    <span
      className={`pack-logo ${variant === "watermark" ? "pack-logo-watermark" : ""}`}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : pack.title}
      title={pack.title}
      data-seal={variant === "watermark" && seal ? asset(seal) : undefined}
    >
      {variant === "watermark" ? (
        seal ? (
          <span
            className="pack-logo-seal"
            aria-hidden="true"
            style={{ "--pack-seal": `url("${asset(seal)}")` } as CSSProperties}
          />
        ) : (
          <span className="pack-logo-fallback" aria-hidden="true">
            {pack.title.slice(0, 1)}
          </span>
        )
      ) : (
        <>
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
        </>
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
        <PackLogo key={pack.id} pack={pack} variant="watermark" decorative />
      ))}
    </span>
  );
}
