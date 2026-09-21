import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import type { SessionState, CardDefinition } from "../game/types";
import { diceResultText } from "../presentation/dice/result-text";
import { diceNotation } from "../game/dice";
import { currentCard } from "../game/engine";
import type { Motion } from "../presentation/controller";
import { cardPacks } from "../presentation/packs";
import { CardFace } from "../components/Cards";
const FullScreenDice = lazy(() => import("../components/FullScreenDice"));
export function Play({
  session,
  motion,
  transition,
  onTap,
  onFinish,
  renderFace,
  overlay = true,
}: {
  session: SessionState;
  motion: Motion | null;
  transition: number;
  onTap: () => void;
  onFinish: (id: number) => void;
  renderFace?: (card: CardDefinition) => ReactNode;
  overlay?: boolean;
}) {
  const card = currentCard(session),
    ref = useRef<HTMLButtonElement>(null);
  // WebKit can paint the reverse of a nested, clipped 3D face despite
  // backface-visibility. Cull by the actual rendered angle, not a timer, so
  // interrupted/reduced-motion turns cannot expose mirrored card text.
  useLayoutEffect(() => {
    const el = ref.current;
    const rotator = el?.querySelector<HTMLElement>(".card-rotator");
    const front = el?.querySelector<HTMLElement>(".card-front");
    const back = el?.querySelector<HTMLElement>(".card-back");
    if (!rotator || !front || !back) return;
    let frame = 0;
    let live = true;
    const paint = () => {
      frame = 0;
      if (!live) return;
      const transform = getComputedStyle(rotator).transform;
      const frontFacing =
        motion === "flip"
          ? transform !== "none" && new DOMMatrixReadOnly(transform).m11 < 0
          : session.phase === "revealed";
      front.style.visibility = frontFacing ? "visible" : "hidden";
      back.style.visibility = frontFacing ? "hidden" : "visible";
      // Don't keep a per-frame loop alive on a hidden tab; resync on return.
      if (motion === "flip" && !document.hidden)
        frame = requestAnimationFrame(paint);
    };
    const onVisibility = () => {
      if (!document.hidden) paint();
    };
    paint();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [session.phase, transition, motion]);
  useEffect(() => {
    const el = ref.current;
    if (!el || !motion) return;
    const finish = (event: AnimationEvent) => {
      if (
        event.target === el &&
        event.animationName ===
          (
            {
              deal: "deal-in",
              flip: "lift-turn",
              discard: "discard",
              settle: "card-settle",
              complete: "celebration",
              // Roll completion is owned by the dice overlay, not a keyframe.
              roll: "dice-roll",
            } as const
          )[motion]
      )
        onFinish(transition);
    };
    el.addEventListener("animationend", finish);
    el.addEventListener("animationcancel", finish);
    return () => {
      el.removeEventListener("animationend", finish);
      el.removeEventListener("animationcancel", finish);
    };
  }, [transition, motion, onFinish]);
  return (
    <>
      <section className="table">
        <div
          className="progress"
          aria-label={`Card ${session.discarded + 1} of ${session.config.limit ?? "endless"}`}
        >
          <span>
            {session.discarded + 1}{" "}
            <span className="muted">/ {session.config.limit ?? "∞"}</span>
          </span>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {session.phase === "revealed" &&
          session.roll &&
          !session.roll.returned &&
          motion !== "roll"
            ? `Rolled ${session.roll.values.join(" plus ")}${
                session.roll.values.length > 1
                  ? `, total ${session.roll.total}`
                  : ""
              }. ${diceResultText(card, session.roll)}`
            : ""}
        </span>
        <div className={`card-stage ${motion ?? ""}`}>
          <div className="deck-under" aria-hidden="true" />
          <button
            ref={ref}
            className={`game-card ${session.phase === "revealed" ? "face" : "back"}`}
            onClick={onTap}
            aria-disabled={!!motion}
            aria-label={
              session.phase === "hidden"
                ? "Reveal card"
                : card.dice && !session.roll?.returned
                  ? session.roll
                    ? motion === "roll"
                      ? "Rolling dice"
                      : `Rolled ${session.roll.total}. Return to card`
                    : `Roll ${diceNotation(card.dice)}. ${card.rules}`
                  : `${card.title}. ${session.roll?.returned ? `Rolled ${session.roll.total}. ${diceResultText(card, session.roll)}` : card.rules} ${cardPacks(
                      card.id,
                      session.config.packIds,
                    )
                      .map((pack) => pack.title)
                      .join(", ")}. Tap to put this card aside.`
            }
          >
            <span
              className="card-rotator"
              key={`${session.cycle}-${session.position}`}
            >
              <span className="card-surface card-back" aria-hidden="true" />
              <span
                className="card-surface card-front"
                aria-hidden={session.phase !== "revealed"}
              >
                {renderFace ? (
                  renderFace(card)
                ) : (
                  <CardFace
                    card={card}
                    packIds={session.config.packIds}
                    roll={session.roll}
                    rolling={motion === "roll"}
                  />
                )}
              </span>
            </span>
          </button>
        </div>
      </section>
      {overlay &&
        session.phase === "revealed" &&
        card.dice &&
        !session.roll?.returned &&
        (!motion || motion === "roll") && (
          <Suspense fallback={null}>
            <FullScreenDice
              card={card}
              roll={session.roll}
              rolling={motion === "roll"}
              onTap={onTap}
              onFinish={() => onFinish(transition)}
            />
          </Suspense>
        )}
    </>
  );
}
