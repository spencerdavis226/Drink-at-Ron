export const theme = {
  colors: {
    walnut: "#17100c",
    leather: "#16312e",
    bronze: "#bd9457",
    parchment: "#f4dfb4",
    ink: "#392713",
  },
  assets: {
    back: "art/card-back.webp",
    front: "art/card-front.webp",
    table: "art/table.webp",
    tankard: "art/tankard.webp",
    button: "art/button.webp",
    panel: "art/panel.webp",
    bezel: "art/bezel.webp",
  },
  motion: {
    deal: 560,
    flip: 560,
    discard: 420,
    settle: 160,
    complete: 600,
    roll: 2600,
  },
} as const;
export const asset = (path: string) =>
  path.startsWith("/") ? path : `${import.meta.env.BASE_URL}${path}`;
export const cardArt = (path: string) =>
  path === "art/tankard.svg" ? theme.assets.tankard : path;
const decoded = new Map<string, Promise<void>>();
export function preloadArt(path: string): Promise<void> {
  const url = asset(cardArt(path));
  if (decoded.has(url)) return decoded.get(url)!;
  const img = new Image();
  img.src = url;
  const promise = img.decode().catch(() => undefined);
  decoded.set(url, promise);
  return promise;
}
