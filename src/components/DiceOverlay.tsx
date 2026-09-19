import { Component, lazy, Suspense, type ReactNode } from "react";
import type { DiceDefinition, DiceRoll } from "../game/types";
import { diceNotation } from "../game/dice";
import "../presentation/dice/dice.css";
const DiceVisual = lazy(() => import("../presentation/dice/DiceVisual"));
class DiceBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export function DiceOverlay({
  dice,
  roll,
  rolling,
  transition,
  onFinish,
}: {
  dice: DiceDefinition;
  roll: DiceRoll | null;
  rolling: boolean;
  transition: number;
  onFinish: (id: number) => void;
}) {
  const values =
    roll?.values ?? Array.from({ length: dice.count }, () => dice.sides);
  const fallback = (
    <span className="dice-static" aria-hidden="true">
      {values.join(" · ")}
    </span>
  );
  return (
    <div
      className={`dice-overlay ${rolling ? "is-rolling" : ""}`}
      data-dice-state={!roll ? "prompt" : rolling ? "rolling" : "result"}
    >
      {!roll ? (
        <>
          <span className="dice-sigil" aria-hidden="true">
            ✦
          </span>
          <strong className="roll-word">Roll</strong>
          <span className="dice-notation">{diceNotation(dice)}</span>
        </>
      ) : (
        <>
          <DiceBoundary fallback={fallback}>
            <Suspense fallback={fallback}>
              <DiceVisual
                sides={dice.sides}
                values={values}
                rolling={rolling}
                transition={transition}
                onFinish={onFinish}
              />
            </Suspense>
          </DiceBoundary>
          <span
            className={`dice-total ${rolling ? "pending" : ""}`}
            aria-hidden="true"
          >
            {values.length > 1 && (
              <span className="dice-equation">{values.join(" + ")} = </span>
            )}
            <strong>{roll.total}</strong>
          </span>
          {!rolling && (
            <span className="dice-return" aria-hidden="true">
              Continue <span>↩</span>
            </span>
          )}
        </>
      )}
    </div>
  );
}
