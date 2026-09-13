import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useRegisterSW } from "virtual:pwa-register/react";
import { cards, packs } from "./content/catalog";
import {
  advance,
  createSession,
  currentCard,
  replaySession,
} from "./game/engine";
import type { SessionState } from "./game/types";
import {
  loadPreferences,
  loadSession,
  save,
  SAVE_KEY,
  SETTINGS_KEY,
} from "./app/persistence";
import { playSound } from "./app/sound";
import "./style.css";
import { CardFace, Modal } from "./components/Cards";
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
function App() {
  const [loaded] = useState(loadSession),
    [session, setSession] = useState<SessionState | null>(loaded.session),
    [corrupt, setCorrupt] = useState(loaded.corrupt),
    [notice, setNotice] = useState(loaded.unavailable),
    [prefs, setPrefs] = useState(loadPreferences),
    [cachedReady, setCachedReady] = useState(false);
  const custom = prefs.customSize;
  const [modal, setModal] = useState<
      "menu" | "previous" | "end" | "install" | null
    >(null),
    [motion, setMotion] = useState<"flip" | "discard" | null>(null);
  const lock = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // An active worker completed installation and its atomic precache.
      if (registration?.active) setCachedReady(true);
    },
  });
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!save(SETTINGS_KEY, prefs)) setNotice(true);
  }, [prefs]);
  useEffect(() => {
    if (session) {
      const next = session.cards.find(
        (c) =>
          c.id === session.order[(session.position + 1) % session.order.length],
      );
      if (next) {
        const img = new Image();
        img.src = asset(next.artwork);
      }
    }
  }, [session]);
  const commit = (next: SessionState | null) => {
    if (!save(SAVE_KEY, next)) setNotice(true);
    setSession(next);
  };
  const start = () => {
    const config = {
      ...prefs.config,
      packIds: prefs.config.packIds.filter((id) =>
        packs.some((p) => p.id === id),
      ),
      limit:
        prefs.choice === "endless"
          ? null
          : prefs.choice === "custom"
            ? Number(custom)
            : Number(prefs.choice),
    };
    setPrefs({ ...prefs, config });
    commit(createSession(config, cards, packs));
  };
  const tap = () => {
    if (!session || lock.current || session.phase === "complete") return;
    lock.current = true;
    const kind = session.phase === "hidden" ? "flip" : "discard";
    playSound(kind === "flip" ? "reveal" : "discard", prefs.sound);
    setMotion(kind);
    if (kind === "flip") commit(advance(session));
    timer.current = setTimeout(
      () => {
        if (kind === "discard") commit(advance(session));
        setMotion(null);
        lock.current = false;
      },
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 420,
    );
  };
  const active = !!session && session.phase !== "complete";
  const validCustom =
    /^\d+$/.test(custom) && Number(custom) >= 1 && Number(custom) <= 500;
  const selected = prefs.config.packIds.filter((id) =>
    packs.some((p) => p.id === id),
  );
  const card = session ? currentCard(session) : null;
  return (
    <main className={active ? "app playing" : "app"}>
      <header className="topbar">
        <span className="wordmark">
          DRINK AT RON<span className="tiny-star">✦</span>
        </span>
        {active ? (
          <button
            className="icon-button menu-button"
            aria-label="Open game menu"
            disabled={!!motion}
            onClick={() => setModal("menu")}
          >
            ☰
          </button>
        ) : (
          <span className="edition">THE TAVERN EDITION</span>
        )}
      </header>
      {notice && (
        <p className="notice" role="status">
          Saving is unavailable. You can still play, but this game may not
          survive closing the app.
        </p>
      )}
      {corrupt ? (
        <section className="setup">
          <span className="eyebrow">LET’S START FRESH</span>
          <h1>
            This save lost
            <br />
            its place.
          </h1>
          <p>
            We couldn’t restore the previous game. Your deck settings are still
            here.
          </p>
          <button
            className="primary"
            onClick={() => {
              commit(null);
              setCorrupt(false);
            }}
          >
            Return to setup
          </button>
        </section>
      ) : !session ? (
        <section className="setup">
          <div className="intro">
            <span className="eyebrow">GOOD COMPANY. A LITTLE CHAOS.</span>
            <h1>
              One more
              <br />
              <em>card?</em>
            </h1>
            <p>Gather your people. Shuffle things up.</p>
          </div>
          <div className="setup-section">
            <div className="section-label">
              <h2>Your deck</h2>
              <span>MAKE A NIGHT OF IT</span>
            </div>
            <div className="lengths">
              {[
                ["20", "20"],
                ["40", "40"],
                ["60", "60"],
                ["custom", "Custom"],
                ["endless", "∞"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  aria-label={
                    value === "endless"
                      ? "Endless"
                      : value === "custom"
                        ? "Custom deck size"
                        : `${value} cards`
                  }
                  aria-pressed={prefs.choice === value}
                  onClick={() => setPrefs({ ...prefs, choice: value })}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="helper">
              {prefs.choice === "endless"
                ? "Keep the cards coming. End whenever you like."
                : prefs.choice === "custom"
                  ? "Pick your own pace. Between 1 and 500 cards."
                  : `${prefs.choice} cards, shuffled fresh. Repeats only after a full cycle.`}
            </p>
            {prefs.choice === "custom" && (
              <label className="custom-label">
                Number of cards
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="500"
                  value={custom}
                  onChange={(e) =>
                    setPrefs({ ...prefs, customSize: e.target.value })
                  }
                  aria-invalid={!validCustom}
                />
                {!validCustom && (
                  <span role="alert">Enter a whole number from 1 to 500.</span>
                )}
              </label>
            )}
          </div>
          <div className="setup-section">
            <div className="section-label">
              <h2>On the house</h2>
              <span>CHOOSE YOUR PACKS</span>
            </div>
            {packs.map((p) => (
              <button
                key={p.id}
                className="pack"
                aria-pressed={selected.includes(p.id)}
                onClick={() =>
                  setPrefs({
                    ...prefs,
                    config: {
                      ...prefs.config,
                      packIds: selected.includes(p.id)
                        ? selected.filter((id) => id !== p.id)
                        : [...selected, p.id],
                    },
                  })
                }
              >
                <span className="pack-art">
                  <img src={asset("art/tankard.svg")} alt="" />
                </span>
                <span className="pack-copy">
                  <strong>{p.title}</strong>
                  <span>{p.description}</span>
                  <small>{p.cardIds.length} CARDS</small>
                </span>
                <span className="checkbox" aria-hidden="true">
                  {selected.includes(p.id) ? "✓" : "+"}
                </span>
              </button>
            ))}
          </div>
          <button
            className="primary"
            disabled={
              !selected.length || (prefs.choice === "custom" && !validCustom)
            }
            onClick={start}
          >
            Shuffle & play <span>↗</span>
          </button>
          {!selected.length && (
            <p className="helper" role="status">
              Choose at least one pack to play.
            </p>
          )}
          <p className="footnote">
            One device. Everyone’s invited. Play at your own pace.
          </p>
          <button className="text-button" onClick={() => setModal("install")}>
            Add a little tavern to your Home Screen
          </button>
          <p className="offline" role="status">
            {offlineReady || cachedReady
              ? "✓ Ready for offline play"
              : "Offline play becomes available after the first complete load."}
          </p>
        </section>
      ) : session.phase === "complete" ? (
        <section className="complete">
          <span className="eyebrow">THAT’S A GOOD DECK.</span>
          <img src={asset("art/tankard.svg")} alt="" />
          <h1>
            To good
            <br />
            <em>company.</em>
          </h1>
          <p>{session.discarded} cards. A story or two to keep.</p>
          <button
            className="primary"
            onClick={() => commit(replaySession(session))}
          >
            Play again <span>↗</span>
          </button>
          <button className="text-button" onClick={() => commit(null)}>
            Change deck
          </button>
        </section>
      ) : (
        <section className="table">
          <div className="progress">
            <span>
              {session.phase === "revealed" ? "ON THE TABLE" : "IN THE DECK"}
            </span>
            <span>
              {session.discarded + 1}{" "}
              <span className="muted">/ {session.config.limit ?? "∞"}</span>
            </span>
          </div>
          <div className={`card-stage ${motion ?? ""}`}>
            <button
              className={`game-card ${session.phase === "revealed" ? "face" : "back"}`}
              onClick={tap}
              aria-disabled={!!motion}
              aria-label={
                session.phase === "hidden"
                  ? "Reveal card"
                  : `${card!.title}. ${card!.rules} Tap to put this card aside.`
              }
            >
              {session.phase === "hidden" ? (
                <>
                  <span className="back-top">THE TAVERN COLLECTION</span>
                  <div className="back-mark">
                    <span>✦</span>
                    <img src={asset("art/tankard.svg")} alt="" />
                    <h2>
                      Drink
                      <br />
                      <em>at Ron</em>
                    </h2>
                  </div>
                  <span className="back-bottom">
                    GOOD FORTUNE · GREAT COMPANY
                  </span>
                </>
              ) : (
                <CardFace card={card!} />
              )}
            </button>
          </div>
          <p className="tap-hint" aria-live="polite">
            {session.phase === "hidden"
              ? "Tap to turn your luck"
              : session.discarded + 1 === session.config.limit
                ? "Tap to finish the deck"
                : "Tap to put this card aside"}
          </p>
        </section>
      )}
      {!active && needRefresh && (
        <button
          className="update"
          onClick={() => void updateServiceWorker(true)}
        >
          A fresh version is ready · Update
        </button>
      )}
      {modal === "install" && (
        <Modal title="Your pocket tavern" onClose={() => setModal(null)}>
          <p>
            In Safari, open the Share menu, choose{" "}
            <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
            If offered, leave Open as Web App enabled.
          </p>
          <p>
            Open it once while connected and wait for “Ready for offline play”
            before heading offline.
          </p>
          <button className="primary" onClick={() => setModal(null)}>
            Got it
          </button>
        </Modal>
      )}
      {modal === "menu" && (
        <Modal title="Take a breather" onClose={() => setModal(null)}>
          <button className="primary" onClick={() => setModal(null)}>
            Resume game
          </button>
          <button
            className="menu-row"
            disabled={!session?.previousId}
            onClick={() => setModal("previous")}
          >
            Previous card <span>↗</span>
          </button>
          <button
            className="menu-row"
            aria-pressed={prefs.sound}
            onClick={() => setPrefs({ ...prefs, sound: !prefs.sound })}
          >
            Card sounds <span>{prefs.sound ? "On" : "Off"}</span>
          </button>
          <p className="helper">
            The group keeps track of turns and ongoing rules.
          </p>
          <button className="menu-row danger" onClick={() => setModal("end")}>
            End game
          </button>
        </Modal>
      )}
      {modal === "previous" && session && (
        <Modal title="Previous card" onClose={() => setModal("menu")}>
          <article className="previous-card">
            <CardFace
              card={session.cards.find((c) => c.id === session.previousId)!}
            />
          </article>
          <p className="helper">Just a look back. Your deck hasn’t moved.</p>
          <button className="primary" onClick={() => setModal(null)}>
            Back to game
          </button>
        </Modal>
      )}
      {modal === "end" && (
        <Modal title="Call it a night?" onClose={() => setModal("menu")}>
          <p>
            This ends your current game. Your pack and deck settings will be
            kept.
          </p>
          <button
            className="primary"
            onClick={() => {
              commit(null);
              setModal(null);
            }}
          >
            End game
          </button>
          <button className="text-button" onClick={() => setModal(null)}>
            Keep playing
          </button>
        </Modal>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
