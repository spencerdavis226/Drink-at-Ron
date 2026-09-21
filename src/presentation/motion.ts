/**
 * Dev-only override that plays motion even when the OS asks for reduced motion,
 * so the flip and the dice roll can be reviewed on a machine with it enabled.
 * Production always honors Reduced Motion. Reads the top window so the workshop
 * preview (an iframe) can pass `?force-motion` through.
 */
export function forceMotion(): boolean {
  if (!import.meta.env.DEV) return false;
  let search = location.search;
  try {
    if (window.top) search = window.top.location.search;
  } catch {
    /* cross-origin top: keep our own search */
  }
  return new URLSearchParams(search).has("force-motion");
}
