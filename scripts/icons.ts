import sharp from "sharp";
const icon = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#172d2c"/><rect x="119" y="87" width="274" height="338" rx="36" fill="#d9b46f"/><rect x="134" y="102" width="244" height="308" rx="26" fill="#24514b"/><path d="M190 188h102v122q-51 27-102 0zm102 20h30q35 0 35 39t-35 39h-30" fill="#d9b46f" stroke="#d9b46f" stroke-width="15" stroke-linejoin="round"/><path d="M184 186q-10-29 22-29 16-31 41-12 30-17 40 14 25 0 18 29" fill="#fff0cf"/></svg>`,
);
for (const [name, size] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["icon-maskable.png", 512],
  ["apple-touch-icon.png", 180],
] as const)
  await sharp(icon).resize(size, size).png().toFile(`public/${name}`);
