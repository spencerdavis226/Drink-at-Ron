// Bundled frame surfaces for the approved card front. They live in `src`
// because the card CSS composes them; card illustrations live in `public/art`
// and resolve through the artwork registry, never through this list.
import continuousBand from "./art/continuous-band.webp";
import continuousBottom from "./art/continuous-bottom.webp";
import continuousLeft from "./art/continuous-left.webp";
import continuousPaper from "./art/continuous-paper.webp";
import continuousRight from "./art/continuous-right.webp";
import continuousTop from "./art/continuous-top.webp";

/** Preloaded before card content so the painted frame is ready first. */
export const coreFrameSurfaces = [
  continuousPaper,
  continuousBand,
  continuousTop,
  continuousBottom,
  continuousLeft,
  continuousRight,
] as const;
