import type { CardDefinition } from "../game/types";
import { asset, cardArt } from "../presentation/theme";
import { Artwork } from "./UI";
export function CardFace({ card }: { card: CardDefinition }) {
  return (
    <>
      <span className="card-category">{card.category}</span>
      <Artwork className="card-art" src={asset(cardArt(card.artwork))} alt="" />
      <div className="card-copy">
        <h2>{card.title}</h2>
        <span className="divider" aria-hidden="true" />
        <p>{card.rules}</p>
      </div>
    </>
  );
}
export function CardFrame({ card }: { card: CardDefinition }) {
  return (
    <article className="previous-card">
      <CardFace card={card} />
    </article>
  );
}
