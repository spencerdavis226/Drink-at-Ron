import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CardDefinition, DiceRoll } from "../game/types";
import { forceMotion } from "../presentation/motion";
import "./fullscreen-dice.css";

type Stage = Awaited<
  ReturnType<typeof import("../presentation/dice/library").createDiceStage>
>;

/** Transparent, full-viewport dice. Saved outcomes never depend on WebGL. */
export default function FullScreenDice({
  card,
  roll,
  rolling,
  finishing,
  onTap,
  onFinish,
}: {
  card: CardDefinition;
  roll: DiceRoll | null;
  rolling: boolean;
  finishing: boolean;
  onTap(): void;
  onFinish(): void;
}) {
  const stageId = `dice-stage-${useId().replace(/:/g, "")}`;
  const callbacks = useRef({ onTap, onFinish });
  callbacks.current = { onTap, onFinish };
  const stage = useRef<Stage | null>(null);
  const ready = useRef<Promise<Stage | null> | null>(null);
  const expedited = useRef(false);
  const stopped = useRef(false);
  const initial = useRef({ roll, rolling });
  const [status, setStatus] = useState("static");
  const [stopReason, setStopReason] = useState("");
  const [timing, setTiming] = useState(0);
  const [rollMs, setRollMs] = useState(0);

  // Warm the lazy renderer while the revealed card is being read. A restored
  // result stays static; it never replays or allocates a WebGL context.
  useEffect(() => {
    stopped.current = false;
    if (
      (initial.current.roll && !initial.current.rolling) ||
      document.hidden ||
      (matchMedia("(prefers-reduced-motion: reduce)").matches && !forceMotion())
    )
      return;
    let canceled = false;
    const started = performance.now();
    setStatus("loading");
    ready.current = import("../presentation/dice/library")
      .then(({ createDiceStage }) =>
        canceled || stopped.current
          ? null
          : createDiceStage(`#${CSS.escape(stageId)}`),
      )
      .then((created) => {
        if (canceled || stopped.current) {
          created?.dispose();
          return null;
        }
        stage.current = created;
        document
          .querySelector(
            `#${CSS.escape(stageId)} canvas:not(.dice-shadow-layer)`,
          )
          ?.addEventListener(
            "webglcontextlost",
            () => {
              if (canceled || stopped.current) return;
              setStatus("fallback");
              setStopReason("webgl");
            },
            { once: true },
          );
        setTiming(Math.round(performance.now() - started));
        setStatus("ready");
        return created;
      })
      .catch(() => {
        if (!canceled) {
          setStatus("fallback");
          setStopReason("webgl");
        }
        return null;
      });
    return () => {
      canceled = true;
      stage.current?.dispose();
      stage.current = null;
    };
  }, [stageId]);

  useEffect(
    () => () => {
      if (!document.querySelector("dialog[open]"))
        document
          .querySelector<HTMLElement>(".game-card")
          ?.focus({ preventScroll: true });
    },
    [],
  );

  useEffect(() => {
    if (!finishing) return;
    expedited.current = true;
    stage.current?.finish();
  }, [finishing]);

  useEffect(() => {
    if (!roll) return;
    if (!rolling) {
      if (!expedited.current) return;
      // Give the landing a brief readable beat before clearing the table.
      const timer = setTimeout(() => callbacks.current.onTap(), 180);
      return () => clearTimeout(timer);
    }
    let canceled = false;
    const started = performance.now();
    const stop = (reason: string) => {
      if (canceled) return;
      canceled = true;
      stopped.current = true;
      stage.current?.dispose();
      stage.current = null;
      setStatus("fallback");
      setStopReason(reason);
      callbacks.current.onFinish();
    };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (document.hidden || (reduced.matches && !forceMotion())) {
      stop(document.hidden ? "hidden" : "reduced");
      return;
    }
    const hidden = () => {
      if (document.hidden) stop("hidden");
    };
    const onReduced = () => {
      if (reduced.matches && !forceMotion()) stop("reduced");
    };
    const width = window.innerWidth;
    const height = window.innerHeight;
    const resize = () => {
      // Ignore URL-bar height jitter; the fixed canvas can stretch vertically.
      if (
        Math.abs(window.innerWidth - width) > 2 ||
        Math.abs(window.innerHeight - height) > 180
      )
        stop("resize");
    };
    const timeout = setTimeout(() => stop("timeout"), 6000);
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("resize", resize);
    reduced.addEventListener("change", onReduced);
    void (async () => {
      const renderer = await ready.current;
      if (canceled) return;
      if (!renderer) {
        stop("webgl");
        return;
      }
      if (expedited.current) renderer.finish();
      setStatus("rolling");
      const actual = await renderer.roll(card.dice!.sides, roll.values);
      if (canceled) return;
      clearTimeout(timeout);
      setRollMs(Math.round(performance.now() - started));
      setStatus(`settled:${actual.join(",")}`);
      callbacks.current.onFinish();
    })().catch(() => stop("error"));
    return () => {
      canceled = true;
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("resize", resize);
      reduced.removeEventListener("change", onReduced);
    };
  }, [rolling, roll, card.dice]);

  useEffect(() => {
    if (!roll) return;
    const key = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || document.querySelector("dialog[open]"))
        return;
      event.preventDefault();
      callbacks.current.onTap();
    };
    // The card keeps its native keyboard and scroll/tap handling. Stationary
    // taps elsewhere on the table can finish/dismiss the dice too.
    let down = { x: 0, y: 0 };
    const pointer = (event: PointerEvent) => {
      down = { x: event.clientX, y: event.clientY };
    };
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        document.querySelector("dialog[open]") ||
        (event.target as Element).closest("button, a, input, select, dialog") ||
        Math.hypot(event.clientX - down.x, event.clientY - down.y) > 8
      )
        return;
      callbacks.current.onTap();
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("click", click);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", pointer);
      document.removeEventListener("click", click);
    };
  }, [roll]);

  const staticResult = roll && !rolling && !status.startsWith("settled:");
  return createPortal(
    <div className="roll-layer" aria-hidden="true">
      <div className="roll-stage-band">
        <div
          className="roll-stage"
          id={stageId}
          data-renderer={status}
          data-stop-reason={stopReason}
          data-startup-ms={timing}
          data-roll-ms={rollMs}
        />
      </div>
      {staticResult && (
        <div className="roll-static-result">
          {roll.values.map((value, index) => (
            <span key={index}>{value}</span>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
