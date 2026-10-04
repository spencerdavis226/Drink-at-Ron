import { useEffect, useLayoutEffect, useRef, useState } from "react";

const LANDSCAPE = "(orientation: landscape)";

function isMobileDevice() {
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  );
}

// Phones are blocked in landscape; the card is a fixed 2:3 and a phone's short
// side leaves no room for it. Tablets (short side of 600px or more) can seat a
// full card in landscape, so iPad play is never interrupted.
const PHONE_SHORT_SIDE = 600;

function mobileLandscape() {
  return (
    isMobileDevice() &&
    matchMedia(LANDSCAPE).matches &&
    Math.min(window.innerWidth, window.innerHeight) < PHONE_SHORT_SIDE
  );
}

function RotateDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="orientation-gate"
      role="alertdialog"
      aria-labelledby="orientation-title"
      aria-describedby="orientation-description"
      onCancel={(event) => event.preventDefault()}
    >
      <h2 id="orientation-title">Rotate to portrait</h2>
      <p id="orientation-description">
        Turn your device upright to keep playing. Your place will be here when
        you rotate back.
      </p>
    </dialog>
  );
}

export function PortraitGate() {
  const [blocked, setBlocked] = useState(mobileLandscape);
  useEffect(() => {
    const orientation = matchMedia(LANDSCAPE);
    const update = () => setBlocked(mobileLandscape());
    orientation.addEventListener("change", update);
    window.addEventListener("resize", update);
    // A rotation between the first render and this effect has no event.
    update();
    return () => {
      orientation.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return blocked ? <RotateDialog /> : null;
}
