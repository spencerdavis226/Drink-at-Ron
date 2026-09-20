import DiceBox from "@3d-dice/dice-box-threejs";

/** All upstream lifecycle work stays here. Outcomes are supplied by our engine. */
export async function createDiceStage(selector: string) {
  const container = document.querySelector<HTMLElement>(selector)!;
  const box = new DiceBox(selector, {
    sounds: false,
    baseScale: Math.min(
      220,
      Math.max(
        75,
        Math.min(container.clientWidth, container.clientHeight) * 0.25,
      ),
    ),
    strength: 1,
    theme_customColorset: {
      name: "Ron",
      foreground: "#302016",
      background: "#e9c885",
      outline: "#71471f",
      edge: "#947045",
      texture: "none",
      material: "plastic",
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
  } catch (error) {
    dispose();
    throw error;
  }
  return {
    async roll(sides: number, values: readonly number[]) {
      const result = await box.roll(
        `${values.length}d${sides}@${values.join(",")}`,
      );
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
