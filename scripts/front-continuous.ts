import sharp from "sharp";
const source = "assets/source/front-continuous-v3.png";
// Runtime front preserves the original 2:3 composition in one surface.
// Old slices remain source-history assets but are no longer shipped by CSS.
await sharp(source)
  .resize(768, 1152)
  .webp({ quality: 85 })
  .toFile("src/presentation/art/continuous-frame.webp");
await sharp("assets/source/cheers-armor-v3.png")
  .resize(768)
  .webp({ quality: 84 })
  .toFile("public/art/cheers.webp");
