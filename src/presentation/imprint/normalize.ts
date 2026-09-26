/**
 * Reduces a vendored game-icons `W/B` file to drawable geometry that inherits
 * `currentColor`. The library is unusually uniform — one 512×512 viewBox of
 * `path`/`circle` elements, no transforms, defs or strokes — so stripping the
 * background plate and the explicit white fill is enough. Shared by
 * `scripts/imprint.ts` and the dev-only workshop icon browser.
 */

/** The full-bleed background rect every game-icons W/B file starts with. */
const BACKGROUND_RECT = /<path\b[^>]*\bd="M0 0h512v512H0z"[^>]*\/?>/;

export function normalizeIcon(slug: string, source: string): string {
  const viewBox = source.match(/<svg[^>]*\bviewBox="([^"]+)"/)?.[1];
  if (viewBox !== "0 0 512 512")
    throw Error(`${slug}: unexpected viewBox "${viewBox ?? "missing"}"`);
  const body = source.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1];
  if (!body) throw Error(`${slug}: no SVG body`);
  const geometry = body
    .replace(BACKGROUND_RECT, "")
    .replace(/\s(?:fill|style|class|stroke)="[^"]*"/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
  if (!geometry.includes("<path") && !geometry.includes("<circle"))
    throw Error(`${slug}: no drawable geometry`);
  return geometry;
}
