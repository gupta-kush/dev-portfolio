// Re-encodes the originals in src/assets/photos to a sane source size.
// vite-imagetools still produces the 1600w WebP at deploy time; this just
// keeps the committed source files small.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import sharp from "sharp";

const DIR = resolve("src/assets/photos");
const MAX_EDGE = 2800;

const files = readdirSync(DIR).filter((f) => /\.(jpe?g|png)$/i.test(f));
let beforeBytes = 0;
let afterBytes = 0;

for (const f of files) {
  const path = join(DIR, f);
  const before = statSync(path).size;
  beforeBytes += before;
  const buf = readFileSync(path);
  const out = await sharp(buf)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  writeFileSync(path, out);
  afterBytes += out.length;
  console.log(
    `  ${f}  ${(before / 1024 / 1024).toFixed(1)}MB → ${(out.length / 1024).toFixed(0)}KB`,
  );
}

console.log(
  `\nTotal: ${(beforeBytes / 1024 / 1024).toFixed(1)}MB → ${(afterBytes / 1024 / 1024).toFixed(1)}MB`,
);
