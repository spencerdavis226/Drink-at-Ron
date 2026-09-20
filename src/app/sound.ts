import type { Effect } from "../presentation/controller";
/** Original synthesized foley. No network, media playback, or dependency on audio availability. */
export class TavernAudio {
  private rollTimers: ReturnType<typeof setTimeout>[] = [];
  private stopRoll() {
    this.rollTimers.forEach(clearTimeout);
    this.rollTimers = [];
  }
  private context: AudioContext | undefined;
  private effects = false;
  private ambience = false;
  private unlocked = false;
  private hidden = false;
  private bed: AudioBufferSourceNode | undefined;
  private bedGain: GainNode | undefined;
  private crackle: ReturnType<typeof setInterval> | undefined;
  configure(effects: boolean, ambience: boolean) {
    if (!effects) this.stopRoll();
    this.effects = effects;
    this.ambience = ambience;
    this.sync();
  }
  unlock() {
    this.unlocked = true;
    this.sync();
  }
  setHidden(hidden: boolean) {
    if (hidden) this.stopRoll();
    this.hidden = hidden;
    this.sync();
  }
  private getContext() {
    try {
      this.context ??= new AudioContext();
      return this.context;
    } catch {
      return undefined;
    }
  }
  private noise(
    ctx: AudioContext,
    duration: number,
    volume: number,
    frequency: number,
    loop = false,
  ) {
    const buffer = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * duration),
      ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = frequency;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    if (!loop)
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration,
      );
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    source.start();
    if (!loop) source.stop(ctx.currentTime + duration);
    return { source, gain };
  }
  private tap(
    ctx: AudioContext,
    frequency: number,
    duration: number,
    volume: number,
  ) {
    const osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      frequency * 0.55,
      ctx.currentTime + duration,
    );
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }
  play(event: Effect) {
    if (event === "roll-cancel") {
      this.stopRoll();
      return;
    }
    if (!this.unlocked || this.hidden || !this.effects) return;
    const ctx = this.getContext();
    if (!ctx || ctx.state !== "running") return;
    try {
      if (event === "roll") {
        this.stopRoll();
        this.noise(ctx, 0.22, 0.045, 1200);
      } else if (event === "dice-impact") {
        this.tap(ctx, 185, 0.09, 0.032);
        this.noise(ctx, 0.045, 0.035, 1000);
      } else if (event === "dice-settle") {
        this.stopRoll();
        this.tap(ctx, 145, 0.09, 0.022);
        this.tap(ctx, 880, 0.24, 0.005);
      } else if (event === "deal") {
        this.noise(ctx, 0.38, 0.1, 1700);
        this.tap(ctx, 150, 0.14, 0.035);
      } else if (event === "reveal") {
        this.noise(ctx, 0.2, 0.07, 2600);
        this.tap(ctx, 660, 0.18, 0.006);
      } else if (event === "discard") {
        this.noise(ctx, 0.24, 0.065, 1400);
        this.tap(ctx, 130, 0.12, 0.04);
      } else if (event === "complete") {
        this.tap(ctx, 660, 0.35, 0.018);
        this.tap(ctx, 990, 0.5, 0.012);
      } else this.tap(ctx, 160, 0.09, 0.025);
    } catch {
      /* foley never blocks an action */
    }
  }
  /**
   * Dice-on-table clack driven by a real collision. `strength` is 0..1 from the
   * impact speed, so hard hits are louder and brighter than soft ones.
   */
  diceImpact(strength: number) {
    if (!this.unlocked || this.hidden || !this.effects) return;
    const ctx = this.getContext();
    if (!ctx || ctx.state !== "running") return;
    try {
      const s = Math.min(1, Math.max(0, strength));
      this.tap(ctx, 150 + 90 * s, 0.05 + 0.05 * s, 0.012 + 0.03 * s);
      this.noise(ctx, 0.03, 0.018 + 0.022 * s, 900 + 1300 * s);
    } catch {
      /* foley never blocks an action */
    }
  }
  private stopBed() {
    if (this.crackle) clearInterval(this.crackle);
    this.crackle = undefined;
    try {
      this.bed?.stop();
    } catch {
      /* already ended */
    }
    this.bed = undefined;
    this.bedGain = undefined;
  }
  private sync() {
    if (this.hidden || !this.unlocked || (!this.effects && !this.ambience)) {
      this.stopBed();
      void this.context?.suspend().catch(() => {});
      return;
    }
    const ctx = this.getContext();
    if (!ctx) return;
    void ctx
      .resume()
      .then(() => {
        if (this.hidden || !this.unlocked || !this.ambience || this.bed) return;
        try {
          const bed = this.noise(ctx, 3, 0.035, 170, true);
          this.bed = bed.source;
          this.bedGain = bed.gain;
          this.crackle = setInterval(() => {
            if (this.hidden || !this.ambience) return;
            try {
              this.noise(
                ctx,
                0.035 + Math.random() * 0.09,
                0.008 + Math.random() * 0.018,
                1000 + Math.random() * 2000,
              );
              if (Math.random() < 0.08) this.tap(ctx, 90, 0.35, 0.007);
            } catch {
              /* quiet failure */
            }
          }, 700);
        } catch {
          /* ambience is optional */
        }
      })
      .catch(() => {});
    if (!this.ambience) this.stopBed();
  }
  dispose() {
    this.stopRoll();
    this.unlocked = false;
    this.stopBed();
    void this.context?.close().catch(() => {});
    this.context = undefined;
  }
}
export const tavernAudio = new TavernAudio();
