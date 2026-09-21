import DiceBox from "@3d-dice/dice-box-threejs";
import paperBumpUrl from "./assets/paper-bump.webp";
import paperUrl from "./assets/paper.webp";

/**
 * Roll feel. Tuned for a craps-table toss: dice cross the screen and carom off
 * the walls before settling. Gravity and throw stay constant; the library's own
 * impulse already scales with the box.
 */
const GRAVITY_MULTIPLIER = 450;
const THROW_FORCE = 1.5;
const CONTACT_RESTITUTION = 0.35;
const CONTACT_FRICTION = 0.7;
const WALL_RESTITUTION = 0.75;
const WALL_FRICTION = 0.3;
// The library derives throw speed from a random offset, so a near-zero offset
// produces a weak "plop". Enforce a floor on horizontal speed and spin; this
// runs before pre-simulation so the replay and its forced faces stay in sync.
const MIN_THROW_SPEED = 1250;
const MIN_SPIN = 6;

/**
 * Snap every die to the face nearest to straight up once physics has stopped.
 * The library forces the value by swapping face materials, but a die can still
 * settle balanced on an edge; rotating it flat keeps the forced value and
 * removes the cocked look.
 */
function snapDiceFlat(box: any) {
  for (const die of box.diceList ?? []) {
    const body = die?.body;
    if (!body?.quaternion || !die.geometry) continue;
    const Vec3 = body.position.constructor;
    const Quaternion = body.quaternion.constructor;
    const up = new Vec3(0, 0, 1);
    const normals = die.geometry.getAttribute("normal").array;
    let bestNormal: any = null;
    let bestDot = -Infinity;
    for (let group = 0; group < die.geometry.groups.length; group++) {
      if (die.geometry.groups[group].materialIndex === 0) continue;
      const offset = group * 9;
      const local = new Vec3(
        normals[offset],
        normals[offset + 1],
        normals[offset + 2],
      );
      const world = new Vec3();
      body.quaternion.vmult(local, world);
      if (world.z > bestDot) {
        bestDot = world.z;
        bestNormal = world;
      }
    }
    // Already resting flat (within ~14 degrees): leave it alone.
    if (!bestNormal || bestDot > 0.97) continue;
    const delta = new Quaternion();
    delta.setFromVectors(bestNormal, up);
    const snapped = new Quaternion();
    delta.mult(body.quaternion, snapped);
    body.quaternion.copy(snapped);
    body.angularVelocity.set(0, 0, 0);
    body.velocity.set(0, 0, 0);
    die.quaternion.copy(snapped);
    die.position.copy(body.position);
  }
  box.renderer?.render(box.scene, box.camera);
}

/** All upstream lifecycle work stays here. Outcomes are supplied by our engine. */
export async function createDiceStage(selector: string) {
  const container = document.querySelector<HTMLElement>(selector)!;
  const box = new DiceBox(selector, {
    sounds: false,
    // The library's shadow map is wasted here: we hide its table plane and
    // paint our own contact shadows, and the map is the biggest mobile GPU
    // cost. Disabling it is the single largest perf win on phones.
    shadows: false,
    // Size dice to a share of the box so two can travel and carom.
    baseScale: Math.min(260, Math.max(110, container.clientHeight * 0.24)),
    strength: THROW_FORCE,
    gravity_multiplier: GRAVITY_MULTIPLIER,
    light_intensity: 0.85,
    color_spotlight: 0xfff1d6,
    theme_customColorset: {
      name: "Ron",
      foreground: "#3a2712",
      background: "#e6d3a8",
      outline: "#7a5a2e",
      edge: "#c9a15c",
      texture: "paper",
      material: "none",
    },
  });
  // Upstream installs an anonymous, unremovable resize listener. Our overlay
  // instead settles on resize, then disposes this entire stage.
  box.resizeWorld = () => {};
  // The library resolves textures through its bundled assetPath, but our dice
  // textures are Vite assets: they ship only inside this (tree-shaken) chunk
  // instead of the production public folder. Redirect those two sources.
  const textureUrls: Record<string, string> = {
    "textures/paper.webp": paperUrl,
    "textures/paper-bump.webp": paperBumpUrl,
  };
  const loadImage = box.DiceColors.loadImage.bind(box.DiceColors);
  box.DiceColors.loadImage = (source: string) => {
    const url = textureUrls[source];
    if (!url) return loadImage(source);
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
  };
  // Pull spawn points in from the walls before the throw is pre-simulated. The
  // library spawns dice flush against them, so a large die can be clipped by
  // the viewport edge. Doing this here (not after) keeps the replay and its
  // forced faces consistent.
  const startThrow = box.startClickThrow.bind(box);
  box.startClickThrow = (notation: string) => {
    const vectors = startThrow(notation);
    const maxX = container.clientWidth * 0.34;
    const maxY = container.clientHeight * 0.34;
    for (const vector of vectors?.vectors ?? []) {
      const pos = vector?.pos;
      if (pos) {
        pos.x = Math.max(-maxX, Math.min(maxX, pos.x));
        pos.y = Math.max(-maxY, Math.min(maxY, pos.y));
      }
      const velocity = vector?.velocity;
      if (velocity) {
        const speed = Math.hypot(velocity.x, velocity.y);
        if (speed < MIN_THROW_SPEED) {
          if (speed < 0.001) {
            const heading = Math.random() * Math.PI * 2;
            velocity.x = Math.cos(heading) * MIN_THROW_SPEED;
            velocity.y = Math.sin(heading) * MIN_THROW_SPEED;
          } else {
            const boost = MIN_THROW_SPEED / speed;
            velocity.x *= boost;
            velocity.y *= boost;
          }
        }
      }
      const spin = vector?.angle;
      if (spin) {
        const rate = Math.hypot(spin.x, spin.y, spin.z ?? 0);
        if (rate < MIN_SPIN) {
          if (rate < 0.001) {
            spin.x = MIN_SPIN * 0.6;
            spin.y = MIN_SPIN;
            spin.z = 0;
          } else {
            const boost = MIN_SPIN / rate;
            spin.x *= boost;
            spin.y *= boost;
            if (spin.z != null) spin.z *= boost;
          }
        }
      }
    }
    return vectors;
  };
  let disposed = false;
  let shadowFrame = 0;
  let shadowCanvas: HTMLCanvasElement | null = null;
  const stopShadows = () => {
    if (shadowFrame) cancelAnimationFrame(shadowFrame);
    shadowFrame = 0;
  };
  const animate = box.animateThrow.bind(box);
  box.animateThrow = (...args: unknown[]) => {
    if (!disposed) animate(...args);
  };
  const after = box.animateAfterThrow.bind(box);
  box.animateAfterThrow = (...args: unknown[]) => {
    if (!disposed) after(...args);
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stopShadows();
    shadowCanvas?.remove();
    box.running = false;
    box.rolling = false;
    box.scene.traverse(
      (object: { geometry?: { dispose(): void }; material?: any }) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        for (const material of materials)
          if (material) {
            for (const value of Object.values(material))
              if (value && typeof value === "object" && "isTexture" in value)
                (value as unknown as { dispose(): void }).dispose();
            material.dispose();
          }
      },
    );
    if (box.renderer) {
      // clearDice schedules a delayed render; make that callback harmless too.
      box.renderer.render = () => {};
      box.renderer.dispose();
      box.renderer.forceContextLoss();
      box.renderer.domElement.remove();
    }
  };
  try {
    await box.initialize();
    box.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    box.renderer.setSize(box.container.clientWidth, box.container.clientHeight);
    // Tune contacts: grippy floor, lively walls so dice rebound off the
    // backboard instead of dying on contact.
    for (const contact of box.world?.contactmaterials ?? []) {
      if (contact.restitution > 0.8) {
        contact.restitution = WALL_RESTITUTION;
        contact.friction = WALL_FRICTION;
      } else {
        contact.restitution = Math.min(
          contact.restitution,
          CONTACT_RESTITUTION,
        );
        contact.friction = Math.max(contact.friction, CONTACT_FRICTION);
      }
    }
    // The library paints an opaque "table" plane. Hide it so the dice tumble
    // over the live card (transparent canvas) instead of a second surface.
    if (box.desk) box.desk.visible = false;
    // Dependency-free contact shadows: project each die onto the floor plane
    // and paint a soft blob beneath it. Grounds the dice without dimming the
    // card or bundling a second Three copy for ShadowMaterial.
    const context = (shadowCanvas = document.createElement("canvas")).getContext(
      "2d",
    );
    shadowCanvas.className = "dice-shadow-layer";
    const pixelRatio = Math.min(devicePixelRatio, 1.5);
    shadowCanvas.width = Math.round(container.clientWidth * pixelRatio);
    shadowCanvas.height = Math.round(container.clientHeight * pixelRatio);
    container.insertBefore(shadowCanvas, container.firstChild);
    const paintShadows = () => {
      if (disposed || !context || !shadowCanvas) return;
      const { width, height } = shadowCanvas;
      context.clearRect(0, 0, width, height);
      for (const die of box.diceList ?? []) {
        if (!die?.position || !die.geometry || !box.camera) continue;
        const radius = die.geometry.boundingSphere?.radius ?? 40;
        const center = die.position.clone();
        center.z = 0;
        const centerNdc = center.project(box.camera);
        const edge = die.position.clone();
        edge.x += radius;
        edge.z = 0;
        const edgeNdc = edge.project(box.camera);
        const cx = (centerNdc.x * 0.5 + 0.5) * width;
        const cy = (1 - (centerNdc.y * 0.5 + 0.5)) * height;
        const spread = Math.abs(edgeNdc.x - centerNdc.x) * 0.5 * width * 1.1;
        if (!(spread > 0)) continue;
        const lift = Math.max(0, die.position.z);
        const opacity = Math.max(0.12, 0.45 - lift / 1100);
        const gradient = context.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          spread,
        );
        gradient.addColorStop(0, `rgba(16,9,4,${opacity})`);
        gradient.addColorStop(0.65, `rgba(16,9,4,${opacity * 0.45})`);
        gradient.addColorStop(1, "rgba(16,9,4,0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.ellipse(cx, cy, spread, spread * 0.6, 0, 0, Math.PI * 2);
        context.fill();
      }
      shadowFrame = requestAnimationFrame(paintShadows);
    };
    shadowFrame = requestAnimationFrame(paintShadows);
  } catch (error) {
    dispose();
    throw error;
  }
  return {
    async roll(sides: number, values: readonly number[]) {
      // Note: per-body damping/sleep must NOT be changed here. The library
      // pre-simulates the throw to fix the result, then replays it; altering
      // the bodies between those runs makes the animation diverge and land on
      // a different face.
      const rolling = box.roll(
        `${values.length}d${sides}@${values.join(",")}`,
      );
      const result = await rolling;
      snapDiceFlat(box);
      // Verify the actual rendered upward face after the flat-snap, not only the
      // library's returned result array.
      const rendered = (box.diceList ?? []).map((die: any) => {
        try {
          return die?.getFaceValue?.()?.value;
        } catch {
          return undefined;
        }
      });
      if (
        rendered.length === values.length &&
        rendered.every((value: unknown) => typeof value === "number") &&
        rendered.join(",") !== values.join(",")
      )
        throw new Error("Dice rendered face mismatch");
      // Dice are at rest; stop repainting shadows every frame.
      stopShadows();
      const actual = result.sets.flatMap(
        (set: { rolls: { value: number }[] }) =>
          set.rolls.map((roll) => roll.value),
      );
      if (actual.join(",") !== values.join(","))
        throw new Error("Dice face mismatch");
      return actual as number[];
    },
    dispose,
  };
}
