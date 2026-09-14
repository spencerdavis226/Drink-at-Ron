import cheers from "../presentation/art/cheers-armor-v3.webp";
import type { CardDefinition } from "../game/types";
import { asset, cardArt } from "../presentation/theme";
import { CardPackMarks } from "./PackMarks";
import { Artwork } from "./UI";
export function CardFace({
  card,
  packIds,
}: {
  card: CardDefinition;
  packIds?: readonly string[];
}) {
  return (
    <div className="study-face">
      <div className="study-illustration">
        <Artwork
          src={
            card.id === "core.cheers" ? cheers : asset(cardArt(card.artwork))
          }
          alt=""
          className={
            card.id === "core.cheers" ? "painted-scene" : "placeholder-scene"
          }
        />
      </div>
      <div className="study-title">
        <h2>{card.title}</h2>
      </div>
      <div className="study-rules">
        <p>{card.rules}</p>
        <CardPackMarks cardId={card.id} packIds={packIds} />
      </div>
    </div>
  );
}
export function CardFrame({
  card,
  packIds,
}: {
  card: CardDefinition;
  packIds?: readonly string[];
}) {
  return (
    <article className="previous-card">
      <CardFace card={card} packIds={packIds} />
    </article>
  );
}
