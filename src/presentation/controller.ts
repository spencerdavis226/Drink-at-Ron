import { rollDice, returnToCard } from "../game/dice";
import { advance, currentCard, type Random } from "../game/engine";
import type { SessionState } from "../game/types";
import { theme } from "./theme";
// Card motion phases. The dialog enter/exit tokens share the manifest but are
// not card animations, so they are excluded from the controller's Motion.
export type Motion = Exclude<
  keyof typeof theme.motion,
  "dialog" | "dialogExit"
>;
export type Effect =
  | "deal"
  | "reveal"
  | "discard"
  | "complete"
  | "press"
  | "roll"
  | "dice-impact"
  | "dice-settle"
  | "roll-cancel";
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
    private diceRandom: Random = Math.random,
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
    if (
      session.phase === "revealed" &&
      currentCard(session).dice &&
      !session.roll?.returned
    ) {
      const rolling = !session.roll;
      const next = rolling
        ? rollDice(session, this.diceRandom)
        : returnToCard(session);
      this.persist(next);
      // Returning a rolled card starts a short non-positional settle that also
      // locks out a double tap from discarding the card immediately.
      this.transition(next, rolling ? "roll" : "settle");
      this.effect(rolling ? "roll" : "press");
      return;
    }
    const next = advance(session, this.random);
    if (next === session) return;
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
    if (motion === "roll") this.effect("dice-settle");
    if (motion === "discard" && session?.phase === "complete") {
      this.transition(session, "complete");
      this.effect("complete");
    } else this.transition(session, null);
  }
  settleAll() {
    if (this.state.motion === "roll") this.effect("roll-cancel");
    if (this.state.motion) this.transition(this.state.session, null);
  }
}
