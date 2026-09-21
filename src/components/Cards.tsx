import { useEffect, useRef, useState } from "react";
import type { CardDefinition, DiceRoll } from "../game/types";
import { resolveArtwork } from "../presentation/artwork";
import { CardPackMarks } from "./PackMarks";
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
  const rulesGesture = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startScrollTop: number;
    cancelClick: boolean;
  } | null>(null);
  const rulesRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<Overflow>("none");
  const markRulesGesture = (pointerId: number) => {
    if (rulesGesture.current?.pointerId === pointerId)
      rulesGesture.current.cancelClick = true;
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
    <div className={`study-face ${card.dice && !roll ? "dice-ready" : ""}`}>
      <div className="study-illustration">
        <Artwork
          src={art.url}
          fallback={art.fallbackUrl}
          alt=""
          className={
            art.scene === "painted" ? "painted-scene" : "placeholder-scene"
          }
          style={{ objectFit: art.fit }}
        />
      </div>
      <div className="study-title">
        <h2>{card.title}</h2>
      </div>
      <div className="study-body">
        <div
          ref={rulesRef}
          className={`study-rules ${resolved ? "rules-resolved" : ""}`}
          data-overflow={overflow}
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
            updateOverflow();
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
          {resolved ? (
            <>
              <strong className="rolled-total">
                Rolled <span className="roll-number">{roll!.total}</span>
              </strong>
              <p className="resolved-instruction">{roll!.instruction}</p>
            </>
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
