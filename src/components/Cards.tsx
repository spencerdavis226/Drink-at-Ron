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
    <>
      <Artwork className="card-art" src={asset(cardArt(card.artwork))} alt="" />
      <div className="card-copy">
        <h2>{card.title}</h2>
        <span className="divider" aria-hidden="true" />
        <p>{card.rules}</p>
        <CardPackMarks cardId={card.id} packIds={packIds} />
      </div>
    </>
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
