import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CardDefinition, DiceRoll as DiceRollValue } from "../game/types";
import { diceNotation } from "../game/dice";
import DiceRoll from "../presentation/dice/DiceRoll";
import "./fullscreen-dice.css";

/**
 * Card-forward roll overlay. There is no dialog and no dimming: the live 2:3
 * card stays readable behind a transparent stage, dice tumble over it, and a
 * single control drives the interaction. Dice animation is deterministic CSS 3D
 * (no WebGL), so it cannot plop or land on the wrong face.
 */
export default function FullScreenDice({
  card,
  roll,
  rolling,
  onTap,
  onFinish,
}: {
  card: CardDefinition;
  roll: DiceRollValue | null;
  rolling: boolean;
  onTap(): void;
  onFinish(): void;
}) {
  const stageId = `dice-stage-${useId().replace(/:/g, "")}`;
  const finish = useRef(onFinish);
  finish.current = onFinish;
  const [status, setStatus] = useState("static");
  const [stopReason, setStopReason] = useState("");
  const [timing, setTiming] = useState(0);
  // Whether to mount the dice at all: true once a real animation starts, and it
  // stays true so the settled dice remain until the player continues.
  const [animate, setAnimate] = useState(false);
  const settleRef = useRef<() => void>(() => {});
  // Dev-only: `?force-motion` plays the roll even when the OS asks for reduced
  // motion, so the animation can be reviewed on a machine with it enabled.
  const forceMotion =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).has("force-motion");
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    return () => {
      (previous && previous !== document.body
        ? previous
        : document.querySelector<HTMLElement>(".game-card")
      )?.focus();
    };
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Let an open modal (game menu, dialogs) own Escape instead.
      if (document.querySelector("dialog[open]")) return;
      event.preventDefault();
      if (rolling) finish.current();
      else if (roll) onTap();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [rolling, roll, onTap]);
  useEffect(() => {
    if (!rolling || !roll) return;
    const values = roll.values.join(",");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches && !forceMotion) {
      setStatus(`settled:${values}`);
      return;
    }
    const started = performance.now();
    setAnimate(true);
    setTiming(0);
    setStatus("rolling");
    // Backgrounding settles immediately: compositor animations can freeze.
    const onHidden = () => {
      if (!document.hidden) return;
      setStopReason("hidden");
      setStatus(`settled:${values}`);
      finish.current();
    };
    const onSettled = () => {
      setTiming(Math.round(performance.now() - started));
      setStatus(`settled:${values}`);
      finish.current();
    };
    document.addEventListener("visibilitychange", onHidden);
    settleRef.current = onSettled;
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [rolling, roll, forceMotion]);
  const values = roll?.values ?? [];
  const settled = status.startsWith("settled");
  const busy = rolling && !settled;
  return createPortal(
    <div className="roll-layer">
      <div className="roll-stage-band" aria-hidden="true">
        <div
          className="roll-stage"
          id={stageId}
          data-renderer={status}
          data-stop-reason={stopReason}
          data-startup-ms={timing}
        >
          {animate && card.dice && (
            <DiceRoll
              sides={(card.dice.sides === 20 ? 20 : 6) as 6 | 20}
              values={values}
              onDone={() => settleRef.current()}
            />
          )}
        </div>
      </div>
      <button type="button" className="roll-cta" disabled={busy} onClick={onTap}>
        {busy ? "Rolling…" : roll ? "Continue" : `Roll ${diceNotation(card.dice!)}`}
      </button>
    </div>,
    document.body,
  );
}
