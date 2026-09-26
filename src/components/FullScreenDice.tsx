import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CardDefinition, DiceRoll } from "../game/types";
import { forceMotion } from "../presentation/motion";
import "./fullscreen-dice.css";

// Probe WebGL once per session and release the probe context immediately, so
// repeated rolls do not allocate a new context just to test support.
let webglSupport: boolean | undefined;
const supportsWebGL = () => {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    webglSupport = !!gl;
    (gl as WebGLRenderingContext | null)
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
};

/**
 * Card-forward roll overlay. There is no dialog and no dimming: the live 2:3
 * card stays readable behind a transparent 3D stage, dice tumble over it, and a
 * tap on the card drives the whole interaction. The card button remains the
 * accessible control; this layer only adds the visual affordance and result.
 */
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
  const stageId = `dice-stage-${useId().replace(/:/g, "")}`;
  const finish = useRef(onFinish);
  finish.current = onFinish;
  const retained = useRef<{ dispose(): void } | null>(null);
  const [status, setStatus] = useState("static");
  const [stopReason, setStopReason] = useState("");
  const [timing, setTiming] = useState(0);
  const [rollMs, setRollMs] = useState(0);
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
    if (
      !rolling ||
      !roll ||
      (matchMedia("(prefers-reduced-motion: reduce)").matches &&
        !forceMotion()) ||
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
    const stop = (reason: string) => {
      if (canceled) return;
      canceled = true;
      stage?.dispose();
      setStatus("fallback");
      setStopReason(reason);
      finish.current();
    };
    // Platforms without WebGL (e.g. Linux CI WebKit) degrade instantly, before
    // installing any listeners or timers, so nothing leaks on this path.
    if (!supportsWebGL()) {
      stop("webgl");
      return;
    }
    const hidden = () => {
      if (document.hidden) stop("hidden");
    };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const onReducedChange = () => {
      if (!forceMotion()) stop("reduced");
    };
    const timeout = setTimeout(() => stop("timeout"), 12000);
    // Only a real size change settles the roll: the library cannot resize
    // mid-throw, but mobile URL-bar jitter fires spurious resize events.
    const startWidth = window.innerWidth;
    const startHeight = window.innerHeight;
    const onResize = () => {
      if (
        window.innerWidth !== startWidth ||
        window.innerHeight !== startHeight
      )
        stop("resize");
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", hidden);
    reduced.addEventListener("change", onReducedChange);
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
        canvas?.addEventListener("webglcontextlost", () => stop("webgl"), {
          once: true,
        });
        const actual = await stage.roll(card.dice!.sides, roll.values);
        if (canceled) return;
        completed = true;
        // A lost context after settling must not leave a frozen canvas.
        canvas?.addEventListener(
          "webglcontextlost",
          () => {
            stage?.dispose();
            retained.current = null;
          },
          { once: true },
        );
        setRollMs(Math.round(performance.now() - started));
        setStatus(`settled:${actual.join(",")}`);
        clearTimeout(timeout);
        finish.current();
      })
      .catch(() => stop("error"));
    return () => {
      canceled = true;
      clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", hidden);
      reduced.removeEventListener("change", onReducedChange);
      // Preserve the settled canvas until the overlay closes. See separate owner below.
      if (stage) {
        if (!completed) {
          stage.dispose();
        } else {
          retained.current?.dispose();
          retained.current = stage;
        }
      }
    };
  }, [rolling, roll, card.dice, stageId]);
  useEffect(() => () => retained.current?.dispose(), []);
  return createPortal(
    <div className="roll-layer">
      <div className="roll-stage-band" aria-hidden="true">
        <div
          className="roll-stage"
          id={stageId}
          data-renderer={status}
          data-stop-reason={stopReason}
          data-startup-ms={timing}
          data-roll-ms={rollMs}
        />
      </div>
    </div>,
    document.body,
  );
}
