import { useEffect, useRef, type ReactNode } from "react";
import type { SessionState, CardDefinition } from "../game/types";
import { currentCard } from "../game/engine";
import type { Motion } from "../presentation/controller";
import { cardPacks } from "../presentation/packs";
import { CardFace } from "../components/Cards";
export function Play({
  session,
  motion,
  transition,
  onTap,
  onFinish,
  renderFace,
}: {
  session: SessionState;
  motion: Motion | null;
  transition: number;
  onTap: () => void;
  onFinish: (id: number) => void;
  renderFace?: (card: CardDefinition) => ReactNode;
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
              : `${card.title}. ${card.rules} ${cardPacks(
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
                <CardFace card={card} packIds={session.config.packIds} />
              )}
            </span>
          </span>
        </button>
        <div className="reveal-glint" aria-hidden="true" />
      </div>
    </section>
  );
}
