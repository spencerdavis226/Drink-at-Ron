import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
async function walk(dir: string): Promise<string[]> {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
      ),
    )
  ).flat();
}
// Budgets match how the app loads: the critical-path entry stays small, while
// lazily-loaded feature chunks (e.g. the 3D dice library) get their own tier.
const RUNTIME_LIMIT = 3 * 1024 * 1024;
const IMAGE_LIMIT = 500 * 1024;
const INITIAL_JS_LIMIT = 100 * 1024;
const LAZY_JS_LIMIT = 200 * 1024;

const files = await walk("dist");
// Chunks referenced directly by index.html are the critical path; every other
// JS file in dist/assets is fetched on demand.
const html = await readFile("dist/index.html", "utf8");
const initialChunks = new Set(
  [...html.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map((match) =>
    match[1].split("/").at(-1),
  ),
);
let cache = 0,
  initialJs = 0,
  lazyJs = 0;
for (const file of files) {
  const size = (await stat(file)).size;
  if (/\.(js|css|html|svg|png|webp|avif|woff2)$/.test(file)) cache += size;
  if (/\.(png|webp|avif|svg)$/.test(file) && size > IMAGE_LIMIT)
    throw Error(`Image exceeds 500 KiB: ${file}`);
  if (file.startsWith("dist/assets/") && file.endsWith(".js")) {
    const code = await readFile(file, "utf8");
    const gzip = gzipSync(code).length;
    const name = file.split("/").at(-1);
    if (name && initialChunks.has(name)) initialJs += gzip;
    else lazyJs += gzip;
    if (
      /Card workshop|Front study|workshop-viewport|core\.dice-toast-study|core\.dice-title-study/.test(
        code,
      )
    )
      throw Error("Developer workshop leaked into production");
  }
}
// Conservatively count all runtime files, including SW, rather than undercount precache.
if (cache > RUNTIME_LIMIT)
  throw Error(`Runtime cache exceeds 3 MiB: ${cache}`);
if (initialJs > INITIAL_JS_LIMIT)
  throw Error(`Initial JavaScript exceeds 100 KiB gzip: ${initialJs}`);
if (lazyJs > LAZY_JS_LIMIT)
  throw Error(`Lazy JavaScript exceeds 200 KiB gzip: ${lazyJs}`);
console.log(
  `Budgets passed: ${(cache / 1024).toFixed(0)} KiB runtime; ${(initialJs / 1024).toFixed(1)} KiB gzip initial + ${(lazyJs / 1024).toFixed(1)} KiB gzip lazy JavaScript. Workshop excluded.`,
);
