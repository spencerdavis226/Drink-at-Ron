import { useEffect, useRef, type CSSProperties } from "react";
import { dieFaces, landingTransform } from "./geometry";
import "./dice-roll.css";

/**
 * Deterministic full-screen dice. The engine fixes the values; this component
 * only animates toward the matching landing orientation, so it can never plop
 * weakly or show the wrong face. No WebGL, no physics engine: compositor-driven
 * CSS 3D keeps it lean and smooth on phones and accepts a custom texture later.
 */
type Pose = { translate: string; rotate: string; scale: number };

const decompose = (transform: string): Pose => {
  const m = new DOMMatrix(transform);
  const scale = Math.hypot(m.m11, m.m12, m.m13) || 1;
  const r00 = m.m11 / scale,
    r01 = m.m21 / scale,
    r02 = m.m31 / scale,
    r10 = m.m12 / scale,
    r11 = m.m22 / scale,
    r12 = m.m32 / scale,
    r20 = m.m13 / scale,
    r21 = m.m23 / scale,
    r22 = m.m33 / scale;
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
    translate: `${m.m41}px ${m.m42}px ${m.m43}px`,
    rotate: `${axis.join(" ")} ${angle}rad`,
    scale,
  };
};

const faceVisibility = (transform: string, normal: readonly number[]) =>
  new DOMPoint(normal[0], normal[1], normal[2], 0).matrixTransform(
    new DOMMatrix(transform),
  ).z > 0
    ? "visible"
    : "hidden";

const pose = (sides: 6 | 20, value: number) =>
  `${sides === 6 ? "rotateX(-16deg) rotateY(-19deg) rotateZ(-5deg) " : "rotateZ(-6deg) "}${landingTransform(sides, value)}`;

type Frame = {
  offset: number;
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  opacity: number;
  /** Final frames use the exact landing matrix instead of raw rotations. */
  settle?: "mid" | true;
};

const trajectory = (
  width: number,
  height: number,
  restX: number,
  restY: number,
  direction: number,
): Frame[] => [
  {
    offset: 0,
    x: direction * width * 0.62,
    y: -height * 0.34,
    z: 280,
    rx: 20,
    ry: direction * 40,
    rz: direction * 30,
    scale: 0.5,
    opacity: 0,
  },
  {
    offset: 0.15,
    x: direction * width * 0.24,
    y: -height * 0.08,
    z: 150,
    rx: 250,
    ry: direction * 200,
    rz: -40,
    scale: 1.12,
    opacity: 1,
  },
  {
    offset: 0.31,
    x: -direction * width * 0.14,
    y: restY - height * 0.1,
    z: 0,
    rx: 520,
    ry: direction * 360,
    rz: 24,
    scale: 1.16,
    opacity: 1,
  },
  {
    offset: 0.45,
    x: direction * width * 0.1,
    y: restY - height * 0.17,
    z: 90,
    rx: 780,
    ry: direction * 540,
    rz: -18,
    scale: 1.02,
    opacity: 1,
  },
  {
    offset: 0.6,
    x: restX * 1.12,
    y: restY - height * 0.05,
    z: 0,
    rx: 1010,
    ry: direction * 700,
    rz: 12,
    scale: 1.08,
    opacity: 1,
  },
  {
    offset: 0.74,
    x: restX,
    y: restY - 12,
    z: 14,
    rx: 0,
    ry: 0,
    rz: direction * -4,
    scale: 1.03,
    opacity: 1,
    settle: "mid",
  },
  {
    offset: 0.87,
    x: restX,
    y: restY - 3,
    z: 3,
    rx: 0,
    ry: 0,
    rz: direction * 2,
    scale: 1,
    opacity: 1,
    settle: true,
  },
  {
    offset: 1,
    x: restX,
    y: restY,
    z: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 1,
    opacity: 1,
    settle: true,
  },
];

const frameTransform = (frame: Frame, landing: string) =>
  frame.settle
    ? `translate3d(${frame.x}px,${frame.y}px,${frame.z}px) ${
        frame.settle === "mid" ? `rotateZ(${frame.rz}deg) ` : ""
      }${landing}`
    : `translate3d(${frame.x}px,${frame.y}px,${frame.z}px) rotateX(${frame.rx}deg) rotateY(${frame.ry}deg) rotateZ(${frame.rz}deg) scale(${frame.scale})`;

const pipPositions: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [
    [29, 29],
    [71, 71],
  ],
  3: [
    [29, 29],
    [50, 50],
    [71, 71],
  ],
  4: [
    [29, 29],
    [71, 29],
    [29, 71],
    [71, 71],
  ],
  5: [
    [29, 29],
    [71, 29],
    [50, 50],
    [29, 71],
    [71, 71],
  ],
  6: [
    [29, 26],
    [71, 26],
    [29, 50],
    [71, 50],
    [29, 74],
    [71, 74],
  ],
};

export default function DiceRoll({
  sides,
  values,
  onDone,
}: {
  sides: 6 | 20;
  values: number[];
  onDone: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const field = root.current;
    if (!field) return;
    const width = field.clientWidth || window.innerWidth;
    const height = field.clientHeight || window.innerHeight;
    const k = Math.min(
      3,
      Math.max(1.4, Math.min(width, height) / (sides === 6 ? 230 : 300)),
    );
    field.style.setProperty("--die-scale", String(k));
    const base = (sides === 6 ? 64 : 90) * k;
    const spacing = base * 1.2;
    const faces = dieFaces(sides);
    const dice = Array.from(field.querySelectorAll<HTMLElement>(".die-space"));
    const animations: Animation[] = [];
    let canceled = false;
    dice.forEach((space, i) => {
      const direction = i % 2 ? -1 : 1;
      const restX = (i - (values.length - 1) / 2) * spacing;
      const restY = (i % 2 ? -1 : 1) * base * 0.06;
      const landing = pose(sides, values[i]);
      const frames = trajectory(width, height, restX, restY, direction);
      const duration = 1850 - i * 70;
      const facets = Array.from(
        space.querySelectorAll<HTMLElement>(".die-facet"),
      );
      facets.forEach((facet, j) => {
        const normal = faces[j]?.normal ?? [0, 0, 1];
        animations.push(
          facet.animate(
            frames.map((frame) => {
              const transform = frameTransform(frame, landing);
              return {
                offset: frame.offset,
                ...decompose(transform),
                visibility: faceVisibility(transform, normal),
                opacity: frame.opacity,
              };
            }),
            { duration, easing: "linear", fill: "both" },
          ),
        );
      });
      const shadow = space.querySelector<HTMLElement>(".die-shadow");
      if (shadow)
        animations.push(
          shadow.animate(
            frames.map((frame) => ({
              offset: frame.offset,
              transform: `translate3d(${frame.x}px, ${restY}px, 0) scale(${(0.72 + frame.z / 900).toFixed(3)})`,
              opacity: Math.max(0, 0.46 - frame.z / 1500) * frame.opacity,
            })),
            { duration, easing: "linear", fill: "both" },
          ),
        );
    });
    Promise.all(animations.map((a) => a.finished))
      .then(() => {
        if (!canceled) done.current();
      })
      .catch(() => {
        if (!canceled) done.current();
      });
    return () => {
      canceled = true;
      animations.forEach((a) => a.cancel());
    };
  }, [sides, values]);
  return (
    <div
      ref={root}
      className={`dice-field dice-count-${values.length}`}
      aria-hidden="true"
    >
      {values.map((value, i) => (
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
                    transform: `scale(var(--die-scale, 1.4)) ${f.transform}`,
                    clipPath: f.polygon,
                    "--face-light": f.light,
                  } as CSSProperties
                }
              >
                <span className="die-enamel" style={{ clipPath: f.polygon }} />
                {sides === 6 ? (
                  <span className={`die-pips pips-${f.value}`}>
                    {pipPositions[f.value].map(([x, y], index) => (
                      <i key={index} style={{ left: `${x}%`, top: `${y}%` }} />
                    ))}
                  </span>
                ) : (
                  <span
                    className="die-number"
                    style={{ left: `${f.labelX}%`, top: `${f.labelY}%` }}
                  >
                    {f.value}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
