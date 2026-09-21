import { expect, test } from "vitest";
import { cards } from "../src/content/catalog";
import {
  artworkRegistry,
  normalizeArtwork,
  resolveArtwork,
} from "../src/presentation/artwork";

const paintedKeys = Object.entries(artworkRegistry)
  .filter(([, spec]) => spec.scene === "painted")
  .map(([key]) => key);

test("every catalog card resolves through a registered scene", () => {
  expect(paintedKeys.length).toBeGreaterThan(0);
  for (const card of cards) {
    const spec = artworkRegistry[normalizeArtwork(card.artwork)];
    expect(spec, `${card.id} -> ${card.artwork}`).toBeDefined();
    expect(resolveArtwork(card.artwork).scene).toBe(spec.scene);
  }
});

test("scene comes from the artwork reference, not the card id", () => {
  const cheers = cards.find((c) => c.id === "core.cheers-idiots")!;
  expect(paintedKeys).toContain(normalizeArtwork(cheers.artwork));
  expect(resolveArtwork(cheers.artwork).scene).toBe("painted");
  // The resolver never receives a card id, so any card sharing the reference
  // renders the same scene.
  expect(resolveArtwork(paintedKeys[0])).toEqual(
    resolveArtwork(cheers.artwork),
  );
});

test("the placeholder scene never borrows the painted illustration", () => {
  const placeholder = cards.find((c) => c.artwork === "art/tankard.webp")!;
  expect(resolveArtwork(placeholder.artwork).scene).toBe("placeholder");
  for (const key of paintedKeys) expect(key).not.toBe(placeholder.artwork);
});

test("legacy and unknown references fall back instead of throwing", () => {
  expect(normalizeArtwork("art/tankard.svg")).toBe("art/tankard.webp");
  const legacy = resolveArtwork("art/tankard.svg");
  expect(legacy.scene).toBe("placeholder");
  expect(legacy.url).toBe(resolveArtwork("art/tankard.webp").url);

  const unknown = resolveArtwork("art/not-in-the-registry.webp");
  expect(unknown.scene).toBe("placeholder");
  expect(unknown.fallbackUrl).toContain("art/tankard.webp");
});
