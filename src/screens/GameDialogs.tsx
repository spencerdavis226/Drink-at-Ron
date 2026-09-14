import type { SessionState } from "../game/types";
import type { Preferences } from "../app/persistence";
import { Button, Modal, Toggle } from "../components/UI";
import { PackLogo } from "../components/PackMarks";
import { selectedPacks } from "../presentation/packs";
import { CardFrame } from "../components/Cards";
export type DialogName = "menu" | "previous" | "end" | "install" | null;
export function GameDialogs({
  modal,
  setModal,
  session,
  prefs,
  setPrefs,
  offlineReady,
  onEnd,
}: {
  modal: DialogName;
  setModal: (modal: DialogName) => void;
  session: SessionState | null;
  prefs: Preferences;
  setPrefs: (prefs: Preferences) => void;
  offlineReady: boolean;
  onEnd: () => void;
}) {
  if (modal === "install")
    return (
      <Modal title="Install app" onClose={() => setModal(null)}>
        <p>
          In Safari, open Share, choose <strong>Add to Home Screen</strong>,
          then <strong>Add</strong>. Leave Open as Web App enabled if offered.
        </p>
        <p role="status">
          {offlineReady
            ? "Ready for offline play"
            : import.meta.env.DEV
              ? "Offline play is available in the production build."
              : "Preparing offline play…"}
        </p>
        <Button onClick={() => setModal(null)}>Got it</Button>
      </Modal>
    );
  if (modal === "menu")
    return (
      <Modal title="Paused" onClose={() => setModal(null)}>
        <Button onClick={() => setModal(null)}>Resume game</Button>
        <Button
          variant="menu-row"
          disabled={!session?.previousId}
          onClick={() => setModal("previous")}
        >
          Previous card
        </Button>
        {session && (
          <div className="active-pack-list" aria-label="Packs in this game">
            {selectedPacks(session.config.packIds).map((pack) => (
              <div key={pack.id}>
                <PackLogo pack={pack} decorative />
                <span>{pack.title}</span>
              </div>
            ))}
          </div>
        )}
        <Toggle
          label="Effects"
          enabled={prefs.sound}
          onToggle={() => setPrefs({ ...prefs, sound: !prefs.sound })}
        />
        <Toggle
          label="Ambience"
          enabled={prefs.ambience}
          onToggle={() => setPrefs({ ...prefs, ambience: !prefs.ambience })}
        />
        <Toggle
          label="Atmosphere"
          enabled={prefs.atmosphere}
          onToggle={() => setPrefs({ ...prefs, atmosphere: !prefs.atmosphere })}
        />
        <Button
          variant="menu-row"
          className="danger"
          onClick={() => setModal("end")}
        >
          End game
        </Button>
      </Modal>
    );
  if (modal === "previous" && session?.previousId)
    return (
      <Modal title="Previous card" onClose={() => setModal("menu")}>
        <CardFrame
          packIds={session.config.packIds}
          card={session.cards.find((c) => c.id === session.previousId)!}
        />
        <Button onClick={() => setModal(null)}>Back to game</Button>
      </Modal>
    );
  if (modal === "end")
    return (
      <Modal title="Call it a night?" onClose={() => setModal("menu")}>
        <Button onClick={onEnd}>End game</Button>
        <Button variant="text-button" onClick={() => setModal(null)}>
          Keep playing
        </Button>
      </Modal>
    );
  return null;
}
