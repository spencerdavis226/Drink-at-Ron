/** Replay the library's own pre-simulation, so timing can change without
 * changing collisions or the face it chose. No second physics simulation. */
export function installTrajectoryPlayback(box: any, paintShadows: () => void) {
  type Pose = { position: any; quaternion: any };
  let frames: Pose[][] = [];
  let frame = 0;
  let disposed = false;
  let fast = false;
  let fail: (error: unknown) => void = () => {};
  const failure = new Promise<never>((_resolve, reject) => {
    fail = reject;
  });
  const capture = (): Pose[] =>
    box.diceList.map((die: any) => ({
      position: die.position.clone().copy(die.body.position),
      quaternion: die.quaternion.clone().copy(die.body.quaternion),
    }));
  const simulate = box.simulateThrow.bind(box);
  box.simulateThrow = () => {
    frames = [capture()];
    const step = box.world.step;
    box.world.step = function (...args: unknown[]) {
      step.apply(this, args);
      frames.push(capture());
    };
    try {
      simulate();
    } finally {
      box.world.step = step;
    }
    // Remove the sleep timer's stationary tail, retaining the final rest pose.
    while (frames.length > 2) {
      const a = frames[frames.length - 2],
        b = frames[frames.length - 1];
      if (
        a.some(
          (pose, i) =>
            pose.position.distanceTo(b[i].position) > 0.03 ||
            Math.abs(pose.quaternion.dot(b[i].quaternion)) < 0.999999,
        )
      )
        break;
      frames.splice(frames.length - 2, 1);
    }
  };
  box.animateThrow = (_id: number, complete: () => void) => {
    const duration = Math.min(
      2600,
      Math.max(1500, (frames.length * 1000) / 60),
    );
    const started = performance.now();
    let acceleratedAt = 0,
      acceleratedFrom = 0,
      progress = 0;
    const paint = (now: number) => {
      if (disposed) return;
      if (fast && !acceleratedAt) {
        acceleratedAt = now;
        acceleratedFrom = progress;
      }
      progress = Math.max(
        0,
        Math.min(
          1,
          acceleratedAt
            ? acceleratedFrom +
                ((1 - acceleratedFrom) * (now - acceleratedAt)) / 240
            : (now - started) / duration,
        ),
      );
      const position = progress * (frames.length - 1);
      const lower = Math.floor(position),
        upper = Math.min(lower + 1, frames.length - 1);
      for (let i = 0; i < box.diceList.length; i++) {
        const die = box.diceList[i],
          a = frames[lower][i],
          b = frames[upper][i];
        die.position.lerpVectors(a.position, b.position, position - lower);
        die.quaternion.slerpQuaternions(
          a.quaternion,
          b.quaternion,
          position - lower,
        );
        die.body.position.copy(die.position);
        die.body.quaternion.copy(die.quaternion);
      }
      box.renderer.render(box.scene, box.camera);
      paintShadows();
      if (progress < 1) frame = requestAnimationFrame(tick);
      else {
        frame = 0;
        box.running = box.rolling = false;
        // Upstream clears result history when it swaps a forced face. Its
        // normal replay stores that face at rest; do the same at our endpoint.
        for (const die of box.diceList) {
          die.result = [];
          die.storeRolledValue("forced");
        }
        complete.call(box);
      }
    };
    const tick = (now: number) => {
      try {
        paint(now);
      } catch (error) {
        fail(error);
      }
    };
    frame = requestAnimationFrame(tick);
  };
  return {
    failure,
    finish() {
      fast = true;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      frames = [];
    },
  };
}
