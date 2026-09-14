import sharp from "sharp";
// Orthographic export coordinates from the retained generated sheet; no repainting.
const pieces: [string, number, number, number, number][] = [
  ["surround", 8, 8, 610, 589],
  ["plaque", 638, 137, 603, 326],
  ["parchment", 8, 619, 610, 589],
];
for (const [name, left, top, width, height] of pieces) {
  await sharp("assets/source/front-study-sheet.png")
    .extract({ left, top, width, height })
    .webp({ quality: 85 })
    .toFile(`src/workshop/art/${name}.webp`);
}
await sharp("assets/source/cheers-mouse-v2.png")
  .resize(768)
  .webp({ quality: 84 })
  .toFile("src/workshop/art/cheers-mouse-v2.webp");
