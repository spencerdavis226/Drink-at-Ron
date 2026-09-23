import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CardDefinition, DiceRoll } from "../game/types";
import { diceResultText } from "../presentation/dice/result-text";
import { CardPackMarks } from "./PackMarks";
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
  const titleRef = useRef<HTMLDivElement>(null);
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
  useLayoutEffect(() => {
    const title = titleRef.current;
    const heading = title?.querySelector<HTMLElement>("h2");
    if (!title || !heading) return;
    let live = true;
    const fits = (size: number) => {
      heading.style.fontSize = `${size}px`;
      const lineHeight = parseFloat(getComputedStyle(heading).lineHeight);
      return (
        heading.offsetHeight <= title.clientHeight + 1 &&
        heading.scrollWidth <= title.clientWidth + 1 &&
        heading.offsetHeight / lineHeight <= 2.1
      );
    };
    const measure = () => {
      if (!live) return;
      heading.style.removeProperty("font-size");
      const base = parseFloat(getComputedStyle(heading).fontSize);
      if (fits(base)) {
        heading.style.removeProperty("font-size");
        return;
      }
      const minimum = Math.min(base, 18);
      if (!fits(minimum)) return; // Keep the full title scrollable for old saves.
      let low = minimum;
      let high = base;
      for (let i = 0; i < 8; i++) {
        const middle = (low + high) / 2;
        if (fits(middle)) low = middle;
        else high = middle;
      }
      heading.style.fontSize = `${Math.floor(low * 10) / 10}px`;
    };
    measure();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(title);
    document.fonts
      ?.load('700 30px "Source Serif 4 Title"')
      .then(measure)
      .catch(() => undefined);
    return () => {
      live = false;
      observer?.disconnect();
    };
  }, [card.title]);
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
      <div
        ref={titleRef}
        className="study-title"
        onScroll={cancelGestureByScroll}
      >
        <h2>{card.title}</h2>
      </div>
      <div className="study-body">
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
