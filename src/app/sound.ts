let context: AudioContext | undefined;
export function playSound(kind: "reveal" | "discard", enabled: boolean) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const oscillator = context.createOscillator(),
      gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.type = "sine";
    const now = context.currentTime;
    oscillator.frequency.setValueAtTime(kind === "reveal" ? 520 : 260, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      kind === "reveal" ? 780 : 130,
      now + 0.09,
    );
    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    oscillator.start();
    oscillator.stop(now + 0.12);
  } catch {
    /* Optional audio must never interrupt play. */
  }
}
