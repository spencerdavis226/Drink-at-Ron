import { asset, theme } from "./theme";

/** A finished illustration versus the shared placeholder tankard. */
export type ArtworkScene = "painted" | "placeholder";

/** How a scene fills its illustration window. */
export type ArtworkFit = "cover" | "contain";

export interface ArtworkSpec {
  /** Base-relative public path (or bundled URL) that renders this scene. */
  src: string;
  scene: ArtworkScene;
  /** Public path checked by the build; omitted when the source is bundled. */
  publicPath?: string;
  /** Runtime fallback when the primary asset fails to load. */
  fallback?: string;
  fit: ArtworkFit;
}

/**
 * The single source of truth for card scene artwork. `CardDefinition.artwork`
 * and saved snapshots store a registry key; rendering, validation and preload
 * all resolve through `resolveArtwork`, so adding an illustration is content
 * plus an entry here rather than a `CardFace` branch.
 */
export const artworkRegistry: Record<string, ArtworkSpec> = {
  "art/tankard.webp": {
    src: "art/tankard.webp",
    scene: "placeholder",
    publicPath: "art/tankard.webp",
    fit: "contain",
  },
  "art/cheers.webp": {
    src: "art/cheers.webp",
    scene: "painted",
    publicPath: "art/cheers.webp",
    fit: "cover",
  },
};

/** Historical artwork strings that may still appear in saved snapshots. */
const legacyArtwork: Record<string, string> = {
  "art/tankard.svg": "art/tankard.webp",
};

/** Map a stored artwork string onto its current registry key. */
export const normalizeArtwork = (reference: string): string =>
  legacyArtwork[reference] ?? reference;

export interface ResolvedArtwork {
  url: string;
  scene: ArtworkScene;
  fit: ArtworkFit;
  fallbackUrl: string;
}

/**
 * Resolve a stored artwork reference for rendering or preload. Unknown and
 * legacy references never throw: they render as the placeholder scene and fall
 * back to the tankard, so old snapshots stay readable.
 */
export function resolveArtwork(reference: string): ResolvedArtwork {
  const key = normalizeArtwork(reference);
  const spec = artworkRegistry[key];
  return {
    url: asset(spec?.src ?? key),
    scene: spec?.scene ?? "placeholder",
    fit: spec?.fit ?? "contain",
    fallbackUrl: asset(
      normalizeArtwork(spec?.fallback ?? theme.assets.tankard),
    ),
  };
}

const decoded = new Map<string, Promise<void>>();

/** Decode an already-resolved (or public) URL once per session. */
export function preloadUrl(url: string): Promise<void> {
  const absolute = asset(url);
  const cached = decoded.get(absolute);
  if (cached) return cached;
  const img = new Image();
  img.src = absolute;
  const promise = img.decode().catch(() => undefined);
  decoded.set(absolute, promise);
  return promise;
}

/** Decode a card artwork reference (or any public path) once per session. */
export function preloadArt(reference: string): Promise<void> {
  return preloadUrl(resolveArtwork(reference).url);
}
