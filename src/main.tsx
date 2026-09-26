import React, { useEffect, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { useRegisterSW } from "virtual:pwa-register/react";
import { cards, packs } from "./content/catalog";
import { createSession, replaySession } from "./game/engine";
import {
  loadPreferences,
  loadSession,
  MODE_LIMITS,
  save,
  SAVE_KEY,
  SETTINGS_KEY,
} from "./app/persistence";
import { PresentationController } from "./presentation/controller";
import { usePresentation } from "./presentation/usePresentation";
import { theme } from "./presentation/theme";
import { preloadUrl } from "./presentation/artwork";
import { coreFrameSurfaces } from "./presentation/frame-surfaces";
import { Button, IconButton, Notice } from "./components/UI";
import { Atmosphere } from "./components/Atmosphere";
import { Setup } from "./screens/Setup";
import { Play } from "./screens/Play";
import { Completion } from "./screens/Completion";
import { GameDialogs, type DialogName } from "./screens/GameDialogs";
import { PortraitGate } from "./components/PortraitGate";
import "./style.css";
import "./presentation/theme.css";
import "./presentation/card-front.css";
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
      new PresentationController(loaded.session, (next) => {
        if (!save(SAVE_KEY, next)) setNotice(true);
      }),
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
  }, [prefs]);
  useEffect(() => {
    // Shared surfaces only: hero illustrations are retired from card fronts.
    for (const src of coreFrameSurfaces) void preloadUrl(src);
    for (const path of Object.values(theme.assets)) void preloadUrl(path);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  const start = () => {
    const config = {
      ...prefs.config,
      packIds: [
        "core",
        ...prefs.config.packIds.filter(
          (id) => id !== "core" && packs.some((p) => p.id === id),
        ),
      ],
      limit: MODE_LIMITS[prefs.choice],
    };
    setPrefs({ ...prefs, config });
    controller.start(createSession(config, cards, packs));
  };
  const finish = (id: number) => controller.finish(id);
  const styles = Object.fromEntries(
    Object.entries(theme.motion).map(([key, value]) => [
      // camelCase keys become kebab-case CSS variables (dialogExit -> --motion-dialog-exit).
      `--motion-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`,
      `${value}ms`,
    ]),
  ) as CSSProperties;
  return (
    <>
      <Atmosphere hidden={hidden} />
      <PortraitGate />
      <main
        className={`${active ? "app playing" : "app"} ${hidden ? "suspended" : ""}`}
        style={styles}
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
const params = new URLSearchParams(location.search);
const renderApp = () =>
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
if (import.meta.env.DEV && params.get("preview") === "1") {
  void import("./workshop/Preview").then(({ default: Preview }) =>
    root.render(
      <React.StrictMode>
        <Preview />
      </React.StrictMode>,
    ),
  );
} else if (import.meta.env.DEV && params.get("workshop") === "1") {
  void import("./workshop/Workshop").then(({ default: Workshop }) =>
    root.render(
      <React.StrictMode>
        <Workshop />
      </React.StrictMode>,
    ),
  );
} else {
  renderApp();
}
