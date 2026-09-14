import type { CardDefinition } from "../game/types";
import { Artwork } from "../components/UI";
import { asset, cardArt } from "../presentation/theme";
import cheers from "./art/cheers-armor-v3.webp";
import { CardPackMarks } from "../components/PackMarks";
export function StudyFace({ card }: { card: CardDefinition }) {
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
        <CardPackMarks cardId={card.id} />
      </div>
    </div>
  );
}
