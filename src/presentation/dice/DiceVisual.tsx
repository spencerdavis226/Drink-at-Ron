import { useEffect, useRef, type CSSProperties } from "react";
import { dieFaces, landingTransform } from "./geometry";
import { theme } from "../theme";

/** The adapter accepts fixed results; it can never sample or change a roll. */
export default function DiceVisual({
  sides,
  values,
  rolling,
  transition,
  onFinish,
}: {
  sides: 6 | 20;
  values: number[];
  rolling: boolean;
  transition: number;
  onFinish: (id: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const supported =
    typeof CSS !== "undefined" &&
    CSS.supports("transform-style", "preserve-3d");
  const finish = useRef(onFinish);
  finish.current = onFinish;
  useEffect(() => {
    if (!rolling) return;
    const elements = root.current?.querySelectorAll<HTMLElement>(".die-model");
    const animations: Animation[] = [];
    let canceled = false;
    try {
      if (
        !elements?.length ||
        matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !CSS.supports("transform-style", "preserve-3d")
      ) {
        finish.current(transition);
        return;
      }
      elements.forEach((el, i) => {
        const landing = pose(sides, values[i]);
        const direction = i % 2 ? -1 : 1;
        animations.push(
          el.animate(
            [
              {
                transform: `translate3d(${direction * 85}px,-100px,110px) rotateX(35deg) rotateY(-40deg) rotateZ(${direction * 25}deg) scale(.65)`,
                opacity: 0,
                offset: 0,
              },
              {
                transform: `translate3d(${direction * 26}px,-42px,65px) rotateX(210deg) rotateY(${direction * 155}deg) rotateZ(-40deg) scale(1.12)`,
                opacity: 1,
                offset: 0.17,
              },
              {
                transform: `translate3d(${-direction * 12}px,12px,0) rotateX(380deg) rotateY(${direction * 290}deg) rotateZ(30deg)`,
                offset: 0.37,
              },
              {
                transform: `translate3d(${direction * 7}px,-24px,30px) rotateX(540deg) rotateY(${direction * 420}deg) rotateZ(-18deg)`,
                offset: 0.56,
              },
              {
                transform: `translate3d(0,4px,0) rotateZ(${direction * 9}deg) ${landing}`,
                offset: 0.78,
              },
              {
                transform: `translate3d(0,-3px,4px) rotateZ(${-direction * 3}deg) ${landing}`,
                offset: 0.9,
              },
              { transform: landing, offset: 1 },
            ],
            {
              duration: theme.motion.roll - i * 70,
              easing: "linear",
              fill: "both",
            },
          ),
        );
      });
      Promise.all(animations.map((a) => a.finished))
        .then(() => {
          if (!canceled) finish.current(transition);
        })
        .catch(() => {
          if (!canceled) finish.current(transition);
        });
    } catch {
      animations.forEach((a) => a.cancel());
      finish.current(transition);
    }
    return () => {
      canceled = true;
      animations.forEach((a) => a.cancel());
    };
  }, [rolling, transition, sides, values]);
  if (!supported)
    return (
      <span className="dice-static" aria-hidden="true">
        {values.join(" · ")}
      </span>
    );
  return (
    <div
      ref={root}
      className={`dice-row ${rolling ? "dice-tumbling" : ""} dice-count-${values.length}`}
      aria-hidden="true"
    >
      {values.map((value, i) => (
        <div className="die-space" key={i}>
          <span className="die-shadow" />
          <div className="die-camera">
            <div
              className={`die-model die-d${sides}`}
              data-value={value}
              style={{ transform: pose(sides, value) }}
            >
              {dieFaces(sides).map((f) => (
                <span
                  className="die-facet"
                  key={f.value}
                  style={
                    {
                      width: f.width,
                      height: f.height,
                      transform: f.transform,
                      clipPath: f.polygon,
                      "--face-light": f.value === value ? 1.1 : 0.84,
                    } as CSSProperties
                  }
                >
                  <span
                    className="die-enamel"
                    style={{ clipPath: f.polygon }}
                  />
                  {sides === 6 ? (
                    <span className={`die-pips pips-${f.value}`}>
                      {pipPositions[f.value].map(([x, y], index) => (
                        <i
                          key={index}
                          style={{ left: `${x}%`, top: `${y}%` }}
                        />
                      ))}
                    </span>
                  ) : (
                    <span
                      className="die-number"
                      style={{ left: `${f.labelX}%`, top: `${f.labelY}%` }}
                    >
                      {f.value}
                      {[6, 9].includes(f.value) && <i />}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const pose = (sides: 6 | 20, value: number) =>
  `${sides === 6 ? "rotateX(-16deg) rotateY(-19deg) rotateZ(-5deg) " : "rotateZ(-6deg) "}${landingTransform(sides, value)}`;
const pipPositions: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72],
  ],
  6: [
    [28, 25],
    [72, 25],
    [28, 50],
    [72, 50],
    [28, 75],
    [72, 75],
  ],
};
