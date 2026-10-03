import { useEffect } from "react";

/**
 * Keep the screen awake while a game is on the table. The lock is released by
 * the system whenever the page is hidden, so it is re-requested on return.
 * Unsupported or refused requests (Low Power Mode, older iOS) are ignored.
 */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let live = true;
    const acquire = async () => {
      if (!live || document.hidden || sentinel) return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (!live || sentinel) {
          void lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
        lock.addEventListener("release", () => {
          if (sentinel === lock) sentinel = null;
        });
      } catch {
        /* refused: the screen simply follows the system timeout */
      }
    };
    const onVisibility = () => {
      if (!document.hidden) void acquire();
    };
    void acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      live = false;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [enabled]);
}
