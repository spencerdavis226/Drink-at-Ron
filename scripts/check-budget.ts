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
const files = await walk("dist");
let cache = 0,
  js = 0;
for (const file of files) {
  const size = (await stat(file)).size;
  if (/\.(js|css|html|svg|png|webp|avif|woff2)$/.test(file)) cache += size;
  if (/\.(png|webp|avif|svg)$/.test(file) && size > 500 * 1024)
    throw Error(`Image exceeds 500 KiB: ${file}`);
  if (file.startsWith("dist/assets/") && file.endsWith(".js")) {
    const code = await readFile(file, "utf8");
    js += gzipSync(code).length;
    if (
      /Card workshop|Front study|workshop-viewport|core\.dice-toast-study|core\.dice-title-study/.test(
        code,
      )
    )
      throw Error("Developer workshop leaked into production");
  }
}
// Conservatively count all runtime files, including SW, rather than undercount precache.
if (cache > 3 * 1024 * 1024)
  throw Error(`Runtime cache exceeds 3 MiB: ${cache}`);
if (js > 120 * 1024) throw Error(`JavaScript exceeds 120 KiB gzip: ${js}`);
console.log(
  `Budgets passed: ${(cache / 1024).toFixed(0)} KiB runtime; ${(js / 1024).toFixed(1)} KiB gzip JavaScript. Workshop excluded.`,
);
