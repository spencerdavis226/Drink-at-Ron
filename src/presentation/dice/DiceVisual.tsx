import { useEffect, useRef, type CSSProperties } from "react";
import { dieFaces, landingTransform } from "./geometry";
import { theme } from "../theme";

const rollKeyframes = (
  sides: 6 | 20,
  value: number,
  direction: number,
): Keyframe[] => {
  const landing = pose(sides, value);
  return [
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
  ];
};

const faceVisibility = (transform: string, normal: readonly number[]) =>
  new DOMPoint(normal[0], normal[1], normal[2], 0).matrixTransform(
    new DOMMatrix(transform),
  ).z > 0
    ? "visible"
    : "hidden";

const decomposedPose = (transform: string) => {
  const matrix = new DOMMatrix(transform);
  const scale = Math.hypot(matrix.m11, matrix.m12, matrix.m13);
  const r00 = matrix.m11 / scale;
  const r01 = matrix.m21 / scale;
  const r02 = matrix.m31 / scale;
  const r10 = matrix.m12 / scale;
  const r11 = matrix.m22 / scale;
  const r12 = matrix.m32 / scale;
  const r20 = matrix.m13 / scale;
  const r21 = matrix.m23 / scale;
  const r22 = matrix.m33 / scale;
  let w: number, x: number, y: number, z: number;
  const trace = r00 + r11 + r22;
  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2;
    w = s / 4;
    x = (r21 - r12) / s;
    y = (r02 - r20) / s;
    z = (r10 - r01) / s;
  } else if (r00 > r11 && r00 > r22) {
    const s = Math.sqrt(1 + r00 - r11 - r22) * 2;
    w = (r21 - r12) / s;
    x = s / 4;
    y = (r01 + r10) / s;
    z = (r02 + r20) / s;
  } else if (r11 > r22) {
    const s = Math.sqrt(1 + r11 - r00 - r22) * 2;
    w = (r02 - r20) / s;
    x = (r01 + r10) / s;
    y = s / 4;
    z = (r12 + r21) / s;
  } else {
    const s = Math.sqrt(1 + r22 - r00 - r11) * 2;
    w = (r10 - r01) / s;
    x = (r02 + r20) / s;
    y = (r12 + r21) / s;
    z = s / 4;
  }
  if (w < 0) [w, x, y, z] = [-w, -x, -y, -z];
  const angle = 2 * Math.acos(Math.min(1, Math.max(-1, w)));
  const divisor = Math.sqrt(Math.max(0, 1 - w * w));
  const axis =
    divisor < 0.000001 ? [0, 0, 1] : [x / divisor, y / divisor, z / divisor];
  return {
    translate: `${matrix.m41}px ${matrix.m42}px ${matrix.m43}px`,
    rotate: `${axis.join(" ")} ${angle}rad`,
    scale,
  };
};

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
    typeof DOMMatrix !== "undefined" &&
    typeof DOMPoint !== "undefined" &&
    CSS.supports("rotate", "1 0 0 1rad") &&
    CSS.supports("translate", "0 0 1px");
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
        !supported
      ) {
        finish.current(transition);
        return;
      }
      elements.forEach((el, i) => {
        const direction = i % 2 ? -1 : 1;
        const keyframes = rollKeyframes(sides, values[i], direction);
        el.querySelectorAll<HTMLElement>(".die-facet").forEach((facet, j) => {
          const { normal } = dieFaces(sides)[j];
          animations.push(
            facet.animate(
              keyframes.map((keyframe) => {
                const transform = keyframe.transform as string;
                const { transform: _, ...rest } = keyframe;
                return {
                  ...rest,
                  ...decomposedPose(transform),
                  visibility: faceVisibility(transform, normal),
                };
              }),
              {
                duration: theme.motion.roll - i * 70,
                easing: "linear",
                fill: "both",
              },
            ),
          );
        });
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
  }, [rolling, transition, sides, values, supported]);
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
      {values.map((value, i) => {
        const finalTransform = pose(sides, value);
        const finalPose = decomposedPose(finalTransform);
        return (
          <div className="die-space" key={i}>
            <span className="die-shadow" />
            <div
              className={`die-camera die-model die-d${sides}`}
              data-value={value}
            >
              {dieFaces(sides).map((f) => (
                <span
                  className="die-facet"
                  key={f.value}
                  data-face-value={f.value}
                  style={
                    {
                      width: f.width,
                      height: f.height,
                      transform: f.transform,
                      clipPath: f.polygon,
                      visibility: faceVisibility(finalTransform, f.normal),
                      ...finalPose,
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
        );
      })}
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
