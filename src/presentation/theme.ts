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
