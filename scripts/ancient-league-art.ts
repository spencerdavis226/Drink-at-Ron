import sharp from "sharp";
import { readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

// Review-only outputs stay outside public/ and the production bundle.
const root = "assets/source/league-ancient-2026-10-06";
type Art = { source: string; output: string; prompt: string };
const manifest: { assets: { front: Art; back: Art } } = JSON.parse(
  await readFile(join(root, "pair.json"), "utf8"),
);
for (const [side, art] of Object.entries(manifest.assets)) {
  const source = join(root, art.source);
  const dimensions = await sharp(source).metadata();
  if (
    !dimensions.width ||
    !dimensions.height ||
    Math.abs(dimensions.width / dimensions.height - 2 / 3) > 0.002
  )
    throw new Error(
      `${side}: source is not 2:3; revise the image instead of cropping its frame`,
    );
  await sharp(source)
    .resize(768, 1152)
    .webp({ quality: 82, effort: 6 })
    .toFile(join(root, art.output));
  const bytes = (await stat(join(root, art.output))).size;
  if (bytes > 500 * 1024)
    throw new Error(`${side}: over the 500 KiB image limit`);
  console.log(
    `${side}: 768×1152, ${(bytes / 1024).toFixed(1)} KiB, review only`,
  );
}

const data = async (path: string, mime: string) =>
  `data:${mime};base64,${(await readFile(path)).toString("base64")}`;
const [front, back, base, titleFont, tavernFont, css] = await Promise.all([
  data(join(root, manifest.assets.front.output), "image/webp"),
  data(join(root, manifest.assets.back.output), "image/webp"),
  data("src/presentation/art/ornate-teal-frame.webp", "image/webp"),
  data("public/fonts/source-serif-4-bold.woff2", "font/woff2"),
  data("public/fonts/grenze.woff2", "font/woff2"),
  readFile("src/presentation/card-front.css", "utf8"),
]);
const face = (label: string, id: string, background: string) =>
  `<figure><figcaption>${label}</figcaption><div class="card" id="${id}"><div class="study-face has-ribbon" style="background-image:url('${background}')"><div class="study-title"><h2>Mewtwo</h2></div><div class="study-body"><p class="card-ribbon"><span>Legendary Encounter</span></p><div class="study-rules"><p class="sample-rules">Roll d20. Under 12: drink 5. 12 or more: give 5.</p></div><div class="card-footer">Pokémon League</div></div><div class="guide guide-title"></div><div class="guide guide-body"></div></div></div></figure>`;
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ancient League — frame review</title><style>
@font-face{font-family:"Source Serif 4 Title";src:url('${titleFont}');font-weight:700}
@font-face{font-family:Grenze;src:url('${tavernFont}');font-weight:100 900}
:root{--font-card-title:"Source Serif 4 Title",serif;--font-tavern:Grenze,serif;--color-card-title:#fff0cf;--width:320px}
${css}
*{box-sizing:border-box}body{margin:0;padding:24px;background:#211c17;color:#f4dfb4;font-family:system-ui,sans-serif}h1{font-size:22px;margin:0 0 16px}.controls{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:16px}.controls label{display:grid;gap:5px;font-size:13px}.controls .checkbox{display:flex;align-items:center}input[type=text],textarea{width:290px;max-width:100%;background:#322b24;color:#fff0cf;border:1px solid #a58a59;border-radius:5px;padding:7px;font:inherit}textarea{height:65px}.gallery{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start}figure{margin:0;max-width:100%}figcaption{font-size:14px;font-weight:600;margin:0 0 10px}.card{width:min(var(--width),calc(100vw - 48px));aspect-ratio:2/3;container-type:inline-size;position:relative}.card>img{display:block;width:100%;height:100%;border-radius:3.2cqw}.study-face{text-align:center}.study-title h2{color:#fff0cf}.card-footer{font:600 max(10px,2.55cqw)/1.2 Grenze,serif;opacity:.55}.guide{position:absolute;pointer-events:none;display:none;z-index:10;background:#56dcbd10;border:1px dashed #56dcbd}.show-guides .guide{display:block}.guide-title{inset:9.75% 21% auto;height:11.75%}.guide-body{inset:32% 12% 12.5%}footer{font-size:12px;max-width:780px;line-height:1.5;margin-top:20px;color:#c3b496}
</style><h1>Ancient League · matching frame study</h1><div class="controls"><label>Card width <input id="width" type="range" min="220" max="768" value="320"><output id="width-label">320 px</output></label><label class="checkbox"><input id="guides" type="checkbox">Show text guides</label><label>Sample title<input id="title" type="text" value="Mewtwo"></label><label>Sample rules<textarea id="rules">Roll d20. Under 12: drink 5. 12 or more: give 5.</textarea></label></div><main class="gallery">${face("Base front", "base-front", base)}${face("Ancient front", "ancient-front", front)}<figure><figcaption>Ancient back</figcaption><div class="card" id="ancient-back"><img src="${back}" alt="Teal, walnut and bronze card back with an ancient engraved Mew seal"></div></figure></main><footer>Review drafts. The fronts use the current card-front.css, unchanged title/body positions, local fonts and live text. The guides show the fixed boxes. This standalone file embeds its assets and works offline; production card surfaces are unchanged.</footer><script>
function fitTitles(){document.querySelectorAll('.study-title').forEach(box=>{const heading=box.querySelector('h2');heading.style.removeProperty('font-size');const base=parseFloat(getComputedStyle(heading).fontSize);const fits=size=>{heading.style.fontSize=size+'px';const line=parseFloat(getComputedStyle(heading).lineHeight);return heading.getBoundingClientRect().height<=box.clientHeight+1&&heading.scrollWidth<=box.clientWidth+1&&heading.getBoundingClientRect().height/line<=2.1};if(fits(base)){heading.style.removeProperty('font-size');return}let low=Math.min(base,18),high=base;if(!fits(low))return;for(let i=0;i<8;i++){const middle=(low+high)/2;if(fits(middle))low=middle;else high=middle}heading.style.fontSize=Math.floor(low*10)/10+'px'})}
document.fonts.ready.then(fitTitles);window.addEventListener('resize',fitTitles);
const width=document.getElementById('width');width.oninput=()=>{document.documentElement.style.setProperty('--width',width.value+'px');document.getElementById('width-label').textContent=width.value+' px';fitTitles()};
document.getElementById('guides').onchange=e=>document.body.classList.toggle('show-guides',e.target.checked);
document.getElementById('title').oninput=e=>{document.querySelectorAll('.study-title h2').forEach(el=>el.textContent=e.target.value);fitTitles()};
document.getElementById('rules').oninput=e=>document.querySelectorAll('.sample-rules').forEach(el=>el.textContent=e.target.value);
</script></html>`;
await writeFile(join(root, "review.html"), html);
console.log(
  "Saved standalone review.html with the current front CSS, live text and fixed safe-area guides",
);
