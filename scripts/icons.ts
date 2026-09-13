import sharp from "sharp";
const frame = await sharp("public/art/bezel.webp")
  .resize(512, 512)
  .png()
  .toBuffer();
const mug = await sharp("public/art/tankard.webp")
  .resize(330, 330)
  .png()
  .toBuffer();
const icon = await sharp(frame)
  .composite([{ input: mug, left: 91, top: 91 }])
  .png()
  .toBuffer();
for (const [name, size] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["icon-maskable.png", 512],
  ["apple-touch-icon.png", 180],
] as const)
  await sharp(icon)
    .resize(size, size)
    .png({ palette: true, quality: 95 })
    .toFile(`public/${name}`);
