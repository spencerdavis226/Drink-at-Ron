/** Original small polyhedron renderer. Geometry has no gameplay or random state. */
type Vec = [number, number, number];
const add = (a: Vec, b: Vec): Vec => a.map((x, i) => x + b[i]) as Vec;
const scale = (a: Vec, k: number): Vec => a.map((x) => x * k) as Vec;
const sub = (a: Vec, b: Vec) => add(a, scale(b, -1));
const dot = (a: Vec, b: Vec) => a.reduce((s, x, i) => s + x * b[i], 0);
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (a: Vec) => scale(a, 1 / Math.hypot(...a));
export interface DieFace {
  value: number;
  width: number;
  height: number;
  transform: string;
  landing: string;
  polygon: string;
  labelX: number;
  labelY: number;
  light: number;
  normal: Vec;
}
function matrix(u: Vec, v: Vec, n: Vec, center: Vec) {
  return `matrix3d(${[...u, 0, ...v, 0, ...n, 0, ...center, 1].map((x) => +x.toFixed(7)).join(",")})`;
}
function face(
  value: number,
  center: Vec,
  u: Vec,
  v: Vec,
  n: Vec,
  points: [number, number][],
): DieFace {
  const minX = Math.min(...points.map((p) => p[0])),
    minY = Math.min(...points.map((p) => p[1]));
  const width = Math.max(...points.map((p) => p[0])) - minX,
    height = Math.max(...points.map((p) => p[1])) - minY;
  return {
    value,
    width,
    height,
    normal: n,
    transform: matrix(
      u,
      v,
      n,
      add(center, add(scale(u, minX), scale(v, minY))),
    ),
    // Transpose the orthonormal face basis: the requested face lands upright toward the viewer.
    landing: matrix(
      [u[0], v[0], n[0]],
      [u[1], v[1], n[1]],
      [u[2], v[2], n[2]],
      [0, 0, 0],
    ),
    polygon: `polygon(${points.map(([x, y]) => `${((x - minX) / width) * 100}% ${((y - minY) / height) * 100}%`).join(",")})`,
    labelX: (-minX / width) * 100,
    labelY: (-minY / height) * 100,
    light: 0.82 + dot(n, normalize([-1, -2, 4])) * 0.18,
  };
}
function cube(): DieFace[] {
  const normals: Vec[] = [
    [0, 0, 1],
    [1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [-1, 0, 0],
    [0, 0, -1],
  ];
  return normals.map((n, i) => {
    const v: Vec = Math.abs(n[1]) === 1 ? [0, 0, -n[1]] : [0, 1, 0];
    const u = cross(v, n);
    return face(i + 1, scale(n, 32), u, v, n, [
      [-32, -32],
      [32, -32],
      [32, 32],
      [-32, 32],
    ]);
  });
}
function icosahedron(): DieFace[] {
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices: Vec[] = [];
  for (const a of [-1, 1])
    for (const b of [-phi, phi]) vertices.push([0, a, b], [a, b, 0], [b, 0, a]);
  const points = vertices.map((p) => scale(normalize(p), 45));
  const faces: DieFace[] = [];
  for (let i = 0; i < 12; i++)
    for (let j = i + 1; j < 12; j++)
      for (let k = j + 1; k < 12; k++) {
        const tri = [points[i], points[j], points[k]];
        const center = scale(tri.reduce(add, [0, 0, 0] as Vec), 1 / 3);
        let n = normalize(cross(sub(tri[1], tri[0]), sub(tri[2], tri[0])));
        if (dot(n, center) < 0) n = scale(n, -1);
        if (points.some((p) => dot(sub(p, tri[0]), n) > 0.001)) continue;
        const v = normalize(sub(tri[0], center)),
          u = cross(v, n);
        faces.push(
          face(
            0,
            center,
            u,
            v,
            n,
            tri.map((p) => [dot(sub(p, center), u), dot(sub(p, center), v)]),
          ),
        );
      }
  let value = 1;
  for (const f of faces) {
    if (f.value) continue;
    f.value = value;
    faces.find((other) => dot(f.normal, other.normal) < -0.999)!.value =
      21 - value;
    value++;
  }
  return faces;
}
const meshes = { 6: cube(), 20: icosahedron() };
export const dieFaces = (sides: 6 | 20) => meshes[sides];
export const landingTransform = (sides: 6 | 20, value: number) =>
  meshes[sides].find((f) => f.value === value)!.landing;
