import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
async function walk(path: string): Promise<string[]> {
  return (
    await Promise.all(
      (await readdir(path, { withFileTypes: true })).map((entry) =>
        entry.isDirectory()
          ? walk(join(path, entry.name))
          : [join(path, entry.name)],
      ),
    )
  ).flat();
}
for (const dir of ["dist", "dist-dice-prototype"]) {
  const files = await walk(dir);
  let runtime = 0,
    allJs = 0,
    initialJs = 0,
    largestImage = 0;
  const html = await readFile(join(dir, "index.html"), "utf8");
  const initial = [...html.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map(
    (match) => match[1].split("/").at(-1),
  );
  for (const file of files) {
    const size = (await stat(file)).size;
    if (/\.(js|css|html|svg|png|webp|avif|woff2)$/.test(file)) runtime += size;
    if (/\.(png|webp|avif|svg)$/.test(file))
      largestImage = Math.max(largestImage, size);
    if (file.includes("/assets/") && file.endsWith(".js")) {
      const gzip = gzipSync(await readFile(file)).length;
      allJs += gzip;
      if (initial.includes(file.split("/").at(-1))) initialJs += gzip;
    }
  }
  console.log(
    JSON.stringify(
      {
        build: dir,
        runtimeBytes: runtime,
        initialJsGzipBytes: initialJs,
        lazyJsGzipBytes: allJs - initialJs,
        allJsGzipBytes: allJs,
        largestImageBytes: largestImage,
        passesCurrentBudgets:
          runtime <= 3 * 1024 * 1024 &&
          initialJs <= 100 * 1024 &&
          allJs - initialJs <= 200 * 1024 &&
          largestImage <= 500 * 1024,
      },
      null,
      2,
    ),
  );
}
