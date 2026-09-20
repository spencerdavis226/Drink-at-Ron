import sharp from "sharp";
const source = "assets/source/front-continuous-v3.png";
const pieces: [string, number, number, number, number][] = [
  ["top", 0, 0, 1024, 220],
  ["bottom", 0, 1286, 1024, 250],
  // Full-height rails: extracting the exact source columns avoids the vertical
  // stretch that made the side rails streak and break the corner grain.
  ["left", 0, 0, 100, 1536],
  ["right", 924, 0, 100, 1536],
  ["band", 0, 654, 1024, 142],
  ["paper", 160, 850, 700, 400],
];
for (const [name, left, top, width, height] of pieces)
  await sharp(source)
    .extract({ left, top, width, height })
    .webp({ quality: 85 })
    .toFile(`src/presentation/art/continuous-${name}.webp`);
await sharp("assets/source/cheers-armor-v3.png")
  .resize(768)
  .webp({ quality: 84 })
  .toFile("src/presentation/art/cheers-armor-v3.webp");
