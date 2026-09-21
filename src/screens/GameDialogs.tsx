import { useEffect, useState } from "react";
import type { SessionState } from "../game/types";
import { Button, Modal } from "../components/UI";
import { PackLogo } from "../components/PackMarks";
import { selectedPacks } from "../presentation/packs";
import { CardFrame } from "../components/Cards";
import { theme } from "../presentation/theme";
export type DialogName = "menu" | "previous" | "end" | "install" | null;
// Unmount just after the shared exit animation finishes. The timer is the
// bounded fallback, so a missing/again-changing animation can never strand the
// dialog open.
const EXIT_MS = theme.motion.dialogExit + 40;
export function GameDialogs({
  modal,
  setModal,
  session,
  offlineReady,
  onEnd,
}: {
  modal: DialogName;
  setModal: (modal: DialogName) => void;
  session: SessionState | null;
  offlineReady: boolean;
  onEnd: () => void;
}) {
  // Keep the last dialog mounted while it animates out, so pause states do not
  // pop away instantly.
  const [displayed, setDisplayed] = useState<DialogName>(modal);
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    if (modal) {
      setDisplayed(modal);
      setExiting(false);
      return;
    }
    if (!displayed) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setExiting(true);
    const timer = setTimeout(
      () => {
        setDisplayed(null);
        setExiting(false);
      },
      reduced ? 0 : EXIT_MS,
    );
    return () => clearTimeout(timer);
  }, [modal, displayed]);
  if (displayed === "install")
    return (
      <Modal
        title="Install app"
        onClose={() => setModal(null)}
        exiting={exiting}
      >
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
  if (displayed === "menu")
    return (
      <Modal title="Paused" onClose={() => setModal(null)} exiting={exiting}>
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
        <Button
          variant="menu-row"
          className="danger"
          onClick={() => setModal("end")}
        >
          End game
        </Button>
      </Modal>
    );
  if (displayed === "previous" && session?.previousId)
    return (
      <Modal
        title="Previous card"
        onClose={() => setModal("menu")}
        exiting={exiting}
      >
        <CardFrame
          roll={session.previousRoll}
          packIds={session.config.packIds}
          card={session.cards.find((c) => c.id === session.previousId)!}
        />
        <Button onClick={() => setModal(null)}>Back to game</Button>
      </Modal>
    );
  if (displayed === "end")
    return (
      <Modal
        title="Call it a night?"
        onClose={() => setModal("menu")}
        exiting={exiting}
      >
        <Button onClick={onEnd}>End game</Button>
        <Button variant="text-button" onClick={() => setModal(null)}>
          Keep playing
        </Button>
      </Modal>
    );
  return null;
}
