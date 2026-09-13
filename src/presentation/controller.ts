import { advance, type Random } from "../game/engine";
import type { SessionState } from "../game/types";
import { theme } from "./theme";
export type Motion = keyof typeof theme.motion;
export type Effect = "deal" | "reveal" | "discard" | "complete" | "press";
export interface Presentation {
  session: SessionState | null;
  outgoing: SessionState | null;
  motion: Motion | null;
  transition: number;
}
/** Durable actions happen on acceptance. Animation completion never advances a deck. */
export class PresentationController {
  private state: Presentation;
  private listeners = new Set<() => void>();
  constructor(
    initial: SessionState | null,
    private persist: (session: SessionState | null) => void,
    private effect: (event: Effect) => void = () => {},
    private random: Random = Math.random,
  ) {
    this.state = {
      session: initial,
      outgoing: null,
      motion: null,
      transition: 0,
    };
  }
  getSnapshot = () => this.state;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  private publish(next: Presentation) {
    this.state = next;
    this.listeners.forEach((fn) => fn());
  }
  private transition(
    session: SessionState | null,
    motion: Motion | null,
    outgoing: SessionState | null = null,
  ) {
    this.publish({
      session,
      motion,
      outgoing,
      transition: this.state.transition + 1,
    });
  }
  start(session: SessionState) {
    if (this.state.motion) return;
    this.persist(session);
    this.transition(session, "deal");
    this.effect("deal");
  }
  clear() {
    if (this.state.motion) return;
    this.persist(null);
    this.transition(null, null);
  }
  tap() {
    const { session, motion } = this.state;
    if (!session || motion || session.phase === "complete") return;
    const next = advance(session, this.random);
    this.persist(next);
    const revealing = session.phase === "hidden";
    this.transition(
      next,
      revealing ? "flip" : "discard",
      revealing ? null : session,
    );
    this.effect(revealing ? "reveal" : "discard");
  }
  finish(id: number) {
    if (id !== this.state.transition || !this.state.motion) return;
    const { session, motion } = this.state;
    if (motion === "discard" && session?.phase === "complete") {
      this.transition(session, "complete");
      this.effect("complete");
    } else if (motion === "flip" || motion === "discard" || motion === "deal")
      this.transition(session, "settle");
    else this.transition(session, null);
  }
  settleAll() {
    if (this.state.motion) this.transition(this.state.session, null);
  }
}
