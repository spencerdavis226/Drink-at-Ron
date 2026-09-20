import cheers from "../presentation/art/cheers-armor-v3.webp";
import { useRef } from "react";
import { DiceOverlay } from "./DiceOverlay";
import type { CardDefinition, DiceRoll } from "../game/types";
import { asset, cardArt } from "../presentation/theme";
import { CardPackMarks } from "./PackMarks";
import { Artwork } from "./UI";
export function CardFace({
  card,
  packIds,
  roll = null,
  rolling = false,
  transition = 0,
  onFinish = () => {},
}: {
  card: CardDefinition;
  packIds?: readonly string[];
  roll?: DiceRoll | null;
  rolling?: boolean;
  transition?: number;
  onFinish?: (id: number) => void;
}) {
  const rulesGesture = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startScrollTop: number;
    cancelClick: boolean;
  } | null>(null);
  const markRulesGesture = (pointerId: number) => {
    if (rulesGesture.current?.pointerId === pointerId)
      rulesGesture.current.cancelClick = true;
  };
  return (
    <div
      className={`study-face ${card.dice ? `dice-card ${!roll?.returned ? "dice-pending" : ""} ${card.dice.count > 2 ? "dice-four" : ""}` : ""}`}
    >
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
        {card.dice && !roll?.returned && (
          <DiceOverlay
            dice={card.dice}
            roll={roll}
            rolling={rolling}
            transition={transition}
            onFinish={onFinish}
          />
        )}
      </div>
      <div className="study-title">
        <h2>{card.title}</h2>
      </div>
      <div
        className="study-rules"
        onPointerDown={(event) => {
          rulesGesture.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startScrollTop: event.currentTarget.scrollTop,
            cancelClick: false,
          };
        }}
        onPointerMove={(event) => {
          const gesture = rulesGesture.current;
          if (
            gesture?.pointerId === event.pointerId &&
            Math.hypot(
              event.clientX - gesture.startX,
              event.clientY - gesture.startY,
            ) > 8
          )
            gesture.cancelClick = true;
        }}
        onPointerCancel={(event) => markRulesGesture(event.pointerId)}
        onScroll={(event) => {
          const gesture = rulesGesture.current;
          if (
            gesture &&
            event.currentTarget.scrollTop !== gesture.startScrollTop
          )
            gesture.cancelClick = true;
        }}
        onClick={(event) => {
          const cancelClick = rulesGesture.current?.cancelClick;
          rulesGesture.current = null;
          if (cancelClick) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {roll?.returned && (
          <strong className="rolled-total">Rolled {roll.total}</strong>
        )}
        <p className={roll?.returned ? "resolved-instruction" : undefined}>
          {roll?.returned ? roll.instruction : card.rules}
        </p>
        <CardPackMarks cardId={card.id} packIds={packIds} />
      </div>
    </div>
  );
}
export function CardFrame({
  card,
  packIds,
  roll,
}: {
  card: CardDefinition;
  packIds?: readonly string[];
  roll?: DiceRoll | null;
}) {
  return (
    <article className="previous-card">
      <CardFace card={card} packIds={packIds} roll={roll} />
    </article>
  );
}
