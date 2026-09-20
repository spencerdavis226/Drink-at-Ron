import DiceBox from "@3d-dice/dice-box-threejs";

/**
 * Roll feel. Tuned for a craps-table toss: dice enter from the edges, cross the
 * screen, and rebound off the walls before settling. Gravity and throw scale
 * with the (now full-screen) stage so the pace stays consistent.
 */
const GRAVITY_MULTIPLIER = 950;
const THROW_FORCE = 2.4;
const CONTACT_RESTITUTION = 0.3;
const CONTACT_FRICTION = 0.85;
const WALL_RESTITUTION = 0.68;
const WALL_FRICTION = 0.4;
const SLEEP_TIME_LIMIT = 0.5;
const ANGULAR_DAMPING = 0.14;
const LINEAR_DAMPING = 0.08;

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
  // The stage is full-screen, so the library's throw impulse and travel
  // distances scale with the viewport. Scale gravity and throw with it to keep
  // the roll's timing consistent.
  const spanScale =
    Math.max(container.clientWidth, container.clientHeight) / 300;
  const box = new DiceBox(selector, {
    sounds: false,
    baseScale: Math.min(
      340,
      Math.max(110, container.clientHeight * 0.29),
    ),
    strength: Math.min(1.5, Math.max(0.6, THROW_FORCE / spanScale)),
    gravity_multiplier: Math.round(GRAVITY_MULTIPLIER * spanScale),
    light_intensity: 0.85,
    color_spotlight: 0xfff1d6,
    theme_customColorset: {
      name: "Ron",
      foreground: "#33220f",
      background: "#e9dcbc",
      outline: "#6d4d24",
      edge: "#d8b26a",
      texture: "marble",
    },
  });
  // Upstream installs an anonymous, unremovable resize listener. Our overlay
  // instead settles on resize, then disposes this entire stage.
  box.resizeWorld = () => {};
  let disposed = false;
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
    box.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    box.renderer.setSize(box.container.clientWidth, box.container.clientHeight);
    // Tune contacts: grippy floor and dice-dice, lively walls so dice rebound
    // off the backboard instead of dying on contact.
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
  } catch (error) {
    dispose();
    throw error;
  }
  return {
    async roll(sides: number, values: readonly number[]) {
      const rolling = box.roll(`${values.length}d${sides}@${values.join(",")}`);
      // Dice bodies spawn synchronously; tune their settle after the toss.
      for (const die of box.diceList ?? []) {
        if (!die?.body) continue;
        die.body.sleepTimeLimit = SLEEP_TIME_LIMIT;
        die.body.angularDamping = ANGULAR_DAMPING;
        die.body.linearDamping = LINEAR_DAMPING;
      }
      const result = await rolling;
      snapDiceFlat(box);
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
