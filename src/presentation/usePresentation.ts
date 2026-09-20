import { useEffect, useState, useSyncExternalStore } from "react";
import { PresentationController } from "./controller";
import { theme } from "./theme";
export function usePresentation(create: () => PresentationController) {
  const [controller] = useState(create);
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
  );
  useEffect(() => {
    if (!state.motion) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (document.hidden) {
      controller.settleAll();
      return;
    }
    const timeout = setTimeout(
      () => controller.finish(state.transition),
      reduced.matches
        ? 0
        : (state.motion === "roll" ? 12000 : theme.motion[state.motion]) + 200,
    );
    const skip = () => {
      if (document.hidden || reduced.matches) controller.settleAll();
    };
    document.addEventListener("visibilitychange", skip);
    reduced.addEventListener("change", skip);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", skip);
      reduced.removeEventListener("change", skip);
    };
  }, [controller, state.motion, state.transition]);
  return { controller, ...state };
}
