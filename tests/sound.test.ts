import { afterEach, describe, expect, it, vi } from "vitest";
import { TavernAudio } from "../src/app/sound";

const node = () => ({
  connect: vi.fn((next: unknown) => next),
  disconnect: vi.fn(),
});

function audioContext() {
  const oscillators: unknown[] = [];
  const context = {
    state: "running",
    currentTime: 0,
    sampleRate: 100,
    destination: {},
    createBuffer: vi.fn(() => ({
      getChannelData: () => new Float32Array(10),
    })),
    createBufferSource: vi.fn(() => ({
      ...node(),
      buffer: null,
      loop: false,
      onended: null,
      start: vi.fn(),
      stop: vi.fn(),
    })),
    createBiquadFilter: vi.fn(() => ({
      ...node(),
      type: "lowpass",
      frequency: { value: 0 },
    })),
    createGain: vi.fn(() => ({
      ...node(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    })),
    createOscillator: vi.fn(() => {
      const oscillator = {
        ...node(),
        type: "triangle",
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        onended: null,
        start: vi.fn(),
        stop: vi.fn(),
      };
      oscillators.push(oscillator);
      return oscillator;
    }),
    resume: vi.fn(() => Promise.resolve()),
    suspend: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
  };
  return { context, oscillators };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("dice audio cancellation", () => {
  it("clears pending impacts on cancellation, backgrounding, and sound disable", () => {
    vi.useFakeTimers();
    const { context, oscillators } = audioContext();
    vi.stubGlobal(
      "AudioContext",
      vi.fn(function AudioContextMock() {
        return context;
      }),
    );
    const audio = new TavernAudio();
    audio.configure(true, false);
    audio.unlock();

    audio.play("roll");
    expect(vi.getTimerCount()).toBe(4);
    vi.advanceTimersByTime(360);
    expect(oscillators).toHaveLength(1);
    audio.play("roll-cancel");
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(2_000);
    expect(oscillators).toHaveLength(1);

    audio.play("roll");
    audio.setHidden(true);
    expect(vi.getTimerCount()).toBe(0);
    expect(context.suspend).toHaveBeenCalledOnce();

    audio.setHidden(false);
    audio.play("roll");
    audio.configure(false, false);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(2_000);
    expect(oscillators).toHaveLength(1);
    audio.dispose();
  });
});
