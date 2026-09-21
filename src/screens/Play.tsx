import { lazy, Suspense, useEffect, useRef, type ReactNode } from "react";
import type { SessionState, CardDefinition } from "../game/types";
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
      <section
        className={`table ${session.phase === "revealed" && card.dice && !session.roll?.returned ? "dice-active" : ""}`}
      >
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
              }. ${session.roll.instruction}`
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
                  : `${card.title}. ${session.roll?.returned ? `Rolled ${session.roll.total}. ${session.roll.instruction}` : card.rules} ${cardPacks(
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
                <div className="reveal-glint" aria-hidden="true" />
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
