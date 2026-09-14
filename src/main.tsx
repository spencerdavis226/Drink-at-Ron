import React, { useEffect, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { useRegisterSW } from "virtual:pwa-register/react";
import { cards, packs } from "./content/catalog";
import { createSession, replaySession } from "./game/engine";
import {
  loadPreferences,
  loadSession,
  save,
  SAVE_KEY,
  SETTINGS_KEY,
} from "./app/persistence";
import { tavernAudio } from "./app/sound";
import { PresentationController } from "./presentation/controller";
import { usePresentation } from "./presentation/usePresentation";
import { theme, preloadArt } from "./presentation/theme";
import { Button, IconButton, Notice } from "./components/UI";
import { Atmosphere } from "./components/Atmosphere";
import { Setup } from "./screens/Setup";
import { Play } from "./screens/Play";
import { Completion } from "./screens/Completion";
import { GameDialogs, type DialogName } from "./screens/GameDialogs";
import "./style.css";
import "./presentation/theme.css";
function App() {
  const [loaded] = useState(loadSession),
    [corrupt, setCorrupt] = useState(loaded.corrupt),
    [notice, setNotice] = useState(loaded.unavailable),
    [prefs, setPrefs] = useState(loadPreferences),
    [cachedReady, setCachedReady] = useState(false),
    [modal, setModal] = useState<DialogName>(null),
    [hidden, setHidden] = useState(document.hidden);
  const { controller, session, outgoing, motion, transition } = usePresentation(
    () =>
      new PresentationController(
        loaded.session,
        (next) => {
          if (!save(SAVE_KEY, next)) setNotice(true);
        },
        (event) => tavernAudio.play(event),
      ),
  );
  const display = outgoing ?? session;
  const active = !!display && display.phase !== "complete";
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration?.active) setCachedReady(true);
    },
  });
  useEffect(() => {
    if (!save(SETTINGS_KEY, prefs)) setNotice(true);
    tavernAudio.configure(prefs.sound, prefs.ambience);
  }, [prefs]);
  useEffect(() => {
    Object.values(theme.assets).forEach((path) => void preloadArt(path));
    const onVisibility = () => {
      setHidden(document.hidden);
      tavernAudio.setHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      tavernAudio.dispose();
    };
  }, []);
  useEffect(() => {
    if (!session) return;
    for (const index of [
      session.position,
      (session.position + 1) % session.order.length,
    ]) {
      const card = session.cards.find((c) => c.id === session.order[index]);
      if (card) void preloadArt(card.artwork);
    }
  }, [session]);
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
            ? Number(prefs.customSize)
            : Number(prefs.choice),
    };
    setPrefs({ ...prefs, config });
    controller.start(createSession(config, cards, packs));
  };
  const finish = (id: number) => controller.finish(id);
  const styles = Object.fromEntries(
    Object.entries(theme.motion).map(([key, value]) => [
      `--motion-${key}`,
      `${value}ms`,
    ]),
  ) as CSSProperties;
  return (
    <>
      <Atmosphere enabled={prefs.atmosphere} hidden={hidden} />
      <main
        className={`${active ? "app playing" : "app"} ${prefs.atmosphere ? "atmosphere-on" : ""} ${hidden ? "suspended" : ""}`}
        style={styles}
        onPointerDownCapture={() => tavernAudio.unlock()}
        onKeyDownCapture={() => tavernAudio.unlock()}
      >
        <header className="topbar">
          {active ? (
            <>
              <span className="wordmark">Drink at Ron</span>
              <IconButton
                label="Open game menu"
                disabled={!!motion}
                onClick={() => setModal("menu")}
              >
                <span className="menu-icon" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </IconButton>
            </>
          ) : (
            <IconButton
              className="install-button"
              label="Install app"
              onClick={() => setModal("install")}
            >
              <span aria-hidden="true">↓</span>
            </IconButton>
          )}
        </header>
        {notice && (
          <Notice>
            Saving is unavailable. This game may not survive closing the app.
          </Notice>
        )}
        {corrupt ? (
          <section className="recovery">
            <h1>
              This save lost
              <br />
              its place.
            </h1>
            <p>We couldn’t restore the previous game.</p>
            <Button
              onClick={() => {
                controller.clear();
                setCorrupt(false);
              }}
            >
              Return to setup
            </Button>
          </section>
        ) : !display ? (
          <Setup
            prefs={prefs}
            packs={packs}
            onChange={setPrefs}
            onStart={start}
          />
        ) : display.phase === "complete" ? (
          <Completion
            count={display.discarded}
            celebrate={motion === "complete"}
            onReplay={() => controller.start(replaySession(display))}
            onSetup={() => controller.clear()}
            onFinish={() => finish(transition)}
          />
        ) : (
          <Play
            session={display}
            motion={motion}
            transition={transition}
            onTap={() => controller.tap()}
            onFinish={finish}
          />
        )}
        {!active && !motion && needRefresh && (
          <Button
            variant="text-button"
            className="update"
            onClick={() => void updateServiceWorker(true)}
          >
            Update game
          </Button>
        )}
        <GameDialogs
          modal={modal}
          setModal={setModal}
          session={session}
          prefs={prefs}
          setPrefs={setPrefs}
          offlineReady={offlineReady || cachedReady}
          onEnd={() => {
            controller.clear();
            setModal(null);
          }}
        />
      </main>
    </>
  );
}
document.documentElement.dataset.release =
  import.meta.env.VITE_RELEASE_ID || "development";
const root = createRoot(document.getElementById("root")!);
if (
  import.meta.env.DEV &&
  new URLSearchParams(location.search).get("workshop") === "1"
) {
  void import("./workshop/Workshop").then(({ default: Workshop }) =>
    root.render(
      <React.StrictMode>
        <Workshop />
      </React.StrictMode>,
    ),
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
