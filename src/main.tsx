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
      matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 100
        : kind === "flip"
          ? 680
          : 460,
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
        {active ? (
          <>
            <span className="wordmark">Drink at Ron</span>
            <button
              className="icon-button menu-button"
              aria-label="Open game menu"
              disabled={!!motion}
              onClick={() => setModal("menu")}
            >
              <span className="menu-icon" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </button>
          </>
        ) : (
          <button
            className="icon-button install-button"
            aria-label="Install app"
            onClick={() => setModal("install")}
          >
            <svg
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5" />
            </svg>
          </button>
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
            <h1>
              Drink
              <br />
              <em>at Ron</em>
            </h1>
          </div>
          <div className="setup-section">
            <div className="section-label">
              <h2>Deck size</h2>
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
              <h2>Packs</h2>
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
                  <img src={asset("art/tankard.webp")} alt="" />
                </span>
                <span className="pack-copy">
                  <strong>{p.title}</strong>
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
            Play
          </button>
          {!selected.length && (
            <p className="notice" role="status">
              Choose at least one pack to play.
            </p>
          )}
        </section>
      ) : session.phase === "complete" ? (
        <section className="complete">
          <img src={asset("art/tankard.webp")} alt="" />
          <h1>
            To good
            <br />
            <em>company.</em>
          </h1>
          <p>{session.discarded} cards played</p>
          <button
            className="primary"
            onClick={() => commit(replaySession(session))}
          >
            Play again
          </button>
          <button className="text-button" onClick={() => commit(null)}>
            Change deck
          </button>
        </section>
      ) : (
        <section className="table">
          <div
            className="progress"
            aria-label={`Card ${session.discarded + 1} of ${session.config.limit ?? "endless"}`}
          >
            <span>
              {session.discarded + 1}{" "}
              <span className="muted">/ {session.config.limit ?? "∞"}</span>
            </span>
          </div>
          <div className={`card-stage ${motion ?? ""}`}>
            <div className="deck-under" aria-hidden="true" />
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
              <span
                className="card-rotator"
                key={`${session.cycle}-${session.position}`}
              >
                <span className="card-surface card-back" aria-hidden="true" />
                <span
                  className="card-surface card-front"
                  aria-hidden={session.phase !== "revealed"}
                >
                  <CardFace card={card!} />
                </span>
              </span>
            </button>
          </div>
        </section>
      )}
      {!active && needRefresh && (
        <button
          className="update"
          onClick={() => void updateServiceWorker(true)}
        >
          Update game
        </button>
      )}
      {modal === "install" && (
        <Modal title="Install app" onClose={() => setModal(null)}>
          <p>
            In Safari, open the Share menu, choose{" "}
            <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
            If offered, leave Open as Web App enabled.
          </p>
          <p role="status">
            {offlineReady || cachedReady
              ? "Ready for offline play"
              : "Preparing offline play…"}
          </p>
          <button className="primary" onClick={() => setModal(null)}>
            Got it
          </button>
        </Modal>
      )}
      {modal === "menu" && (
        <Modal title="Paused" onClose={() => setModal(null)}>
          <button className="primary" onClick={() => setModal(null)}>
            Resume game
          </button>
          <button
            className="menu-row"
            disabled={!session?.previousId}
            onClick={() => setModal("previous")}
          >
            Previous card
          </button>
          <button
            className="menu-row"
            aria-pressed={prefs.sound}
            onClick={() => setPrefs({ ...prefs, sound: !prefs.sound })}
          >
            Card sounds <span>{prefs.sound ? "On" : "Off"}</span>
          </button>
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
          <button className="primary" onClick={() => setModal(null)}>
            Back to game
          </button>
        </Modal>
      )}
      {modal === "end" && (
        <Modal title="Call it a night?" onClose={() => setModal("menu")}>
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
