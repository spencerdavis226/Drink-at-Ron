import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CardDefinition, DiceRoll } from "../game/types";
import { diceNotation } from "../game/dice";
import "./fullscreen-dice.css";

export default function FullScreenDice({
  card,
  roll,
  rolling,
  onTap,
  onFinish,
}: {
  card: CardDefinition;
  roll: DiceRoll | null;
  rolling: boolean;
  onTap(): void;
  onFinish(): void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stageId = `dice-stage-${useId().replace(/:/g, "")}`;
  const finish = useRef(onFinish);
  finish.current = onFinish;
  const [rendered, setRendered] = useState(false);
  const [status, setStatus] = useState("static");
  const [timing, setTiming] = useState(0);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current!;
    element.showModal();
    return () => {
      element.close();
      (previous && previous !== document.body
        ? previous
        : document.querySelector<HTMLElement>(".game-card")
      )?.focus();
    };
  }, []);
  useEffect(() => {
    if (
      !rolling ||
      !roll ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.hidden
    )
      return;
    let canceled = false;
    let completed = false;
    let stage:
      | Awaited<
          ReturnType<
            typeof import("../presentation/dice/library").createDiceStage
          >
        >
      | undefined;
    const started = performance.now();
    const stop = () => {
      if (canceled) return;
      canceled = true;
      stage?.dispose();
      setRendered(false);
      setStatus("fallback");
      finish.current();
    };
    const hidden = () => {
      if (document.hidden) stop();
    };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const timeout = setTimeout(stop, 12000);
    window.addEventListener("resize", stop);
    document.addEventListener("visibilitychange", hidden);
    reduced.addEventListener("change", stop);
    setStatus("loading");
    void import("../presentation/dice/library")
      .then(async ({ createDiceStage }) => {
        if (canceled) return;
        stage = await createDiceStage(`#${CSS.escape(stageId)}`);
        if (canceled) {
          stage.dispose();
          return;
        }
        setTiming(Math.round(performance.now() - started));
        setStatus("rolling");
        const canvas = document.querySelector(`#${CSS.escape(stageId)} canvas`);
        canvas?.addEventListener("webglcontextlost", stop, { once: true });
        const actual = await stage.roll(card.dice!.sides, roll.values);
        if (canceled) return;
        completed = true;
        setRendered(true);
        setStatus(`settled:${actual.join(",")}`);
        clearTimeout(timeout);
        finish.current();
      })
      .catch(stop);
    return () => {
      canceled = true;
      clearTimeout(timeout);
      window.removeEventListener("resize", stop);
      document.removeEventListener("visibilitychange", hidden);
      reduced.removeEventListener("change", stop);
      // Preserve the settled canvas until the overlay closes. See separate owner below.
      if (stage) {
        if (!completed) {
          stage.dispose();
          setRendered(false);
        } else {
          retained.current?.dispose();
          retained.current = stage;
        }
      }
    };
  }, [rolling, roll, card.dice, stageId]);
  const retained = useRef<{ dispose(): void } | null>(null);
  useEffect(() => () => retained.current?.dispose(), []);
  return createPortal(
    <dialog
      ref={dialog}
      className="full-dice"
      aria-labelledby={`${stageId}-title`}
      onCancel={(event) => {
        event.preventDefault();
        if (rolling) finish.current();
        else if (roll) onTap();
      }}
    >
      <h2 id={`${stageId}-title`}>{card.title}</h2>
      <div
        className="full-dice-stage"
        id={stageId}
        data-renderer={status}
        data-startup-ms={timing}
        aria-hidden="true"
      >
        {!rolling && !rendered && (
          <div className="full-dice-values">
            {roll ? roll.values.join(" + ") : diceNotation(card.dice!)}
          </div>
        )}
      </div>
      <div className="full-dice-rules">
        <div className="full-dice-copy">
          <p>{card.rules}</p>
          <p role="status">
            {roll && !rolling ? (
              <strong>
                {roll.total} · {roll.instruction}
              </strong>
            ) : (
              ""
            )}
          </p>
        </div>
        <button autoFocus disabled={rolling} onClick={onTap}>
          {rolling ? "Rolling…" : roll ? "Return to card" : "ROLL"}
        </button>
      </div>
    </dialog>,
    document.body,
  );
}
