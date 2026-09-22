import { useEffect, useRef, useState } from "react";
import type { CardDefinition, DiceRoll } from "../game/types";
import { resolveArtwork } from "../presentation/artwork";
import { diceResultText } from "../presentation/dice/result-text";
import { CardPackMarks } from "./PackMarks";
import { CardImprint } from "./CardImprint";
import { Artwork } from "./UI";
type Overflow = "none" | "top" | "bottom" | "both";
export function CardFace({
  card,
  packIds,
  roll = null,
  rolling = false,
}: {
  card: CardDefinition;
  packIds?: readonly string[];
  roll?: DiceRoll | null;
  rolling?: boolean;
}) {
  const gesture = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startScrollTop: number;
    cancelClick: boolean;
  } | null>(null);
  const rulesRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<Overflow>("none");
  const markGesture = (pointerId: number) => {
    if (gesture.current?.pointerId === pointerId)
      gesture.current.cancelClick = true;
  };
  const cancelGestureByScroll = () => {
    if (gesture.current) gesture.current.cancelClick = true;
  };
  const updateOverflow = () => {
    const el = rulesRef.current;
    if (!el) return;
    const atTop = el.scrollTop <= 2;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    setOverflow(
      atTop && atBottom ? "none" : atTop ? "bottom" : atBottom ? "top" : "both",
    );
  };
  // Show the resolved outcome once the dice settle (the overlay owns the roll).
  const resolved = !!roll && !rolling;
  useEffect(() => {
    updateOverflow();
    const el = rulesRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);
    // Web fonts change the wrapped line count without resizing the scroller
    // box, so observe the content and re-measure once fonts settle.
    for (const child of el.children) observer.observe(child);
    document.fonts?.ready.then(updateOverflow).catch(() => undefined);
    return () => observer.disconnect();
  }, [resolved, card.id]);
  const art = resolveArtwork(card.artwork);
  return (
    <div
      className="study-face"
      // A drag anywhere on the face (rules or an enlarged title) must scroll or
      // scrub, never activate the card action. A stationary tap still passes.
      onPointerDown={(event) => {
        gesture.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startScrollTop: rulesRef.current?.scrollTop ?? 0,
          cancelClick: false,
        };
      }}
      onPointerMove={(event) => {
        const active = gesture.current;
        if (
          active?.pointerId === event.pointerId &&
          Math.hypot(
            event.clientX - active.startX,
            event.clientY - active.startY,
          ) > 8
        )
          active.cancelClick = true;
      }}
      onPointerCancel={(event) => markGesture(event.pointerId)}
      onClick={(event) => {
        const cancelClick = gesture.current?.cancelClick;
        gesture.current = null;
        if (cancelClick) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <div className="study-illustration">
        <Artwork
          key={art.url}
          src={art.url}
          fallback={art.fallbackUrl}
          alt=""
          className={
            art.scene === "painted" ? "painted-scene" : "placeholder-scene"
          }
          style={{ objectFit: art.fit }}
        />
      </div>
      <div className="study-title" onScroll={cancelGestureByScroll}>
        <h2>{card.title}</h2>
      </div>
      <div className="study-body">
        <CardImprint cardId={card.id} />
        <div
          ref={rulesRef}
          className={`study-rules ${resolved ? "rules-resolved" : ""}`}
          data-overflow={overflow}
          onScroll={(event) => {
            const active = gesture.current;
            if (
              active &&
              event.currentTarget.scrollTop !== active.startScrollTop
            )
              active.cancelClick = true;
            updateOverflow();
          }}
        >
          {resolved ? (
            <p className="resolved-instruction">
              {diceResultText(card, roll!)}
            </p>
          ) : (
            <p>{card.rules}</p>
          )}
        </div>
        <div className="card-footer">
          <CardPackMarks cardId={card.id} packIds={packIds} />
        </div>
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
