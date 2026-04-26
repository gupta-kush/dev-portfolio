// Reads JPEGs from a source directory, extracts dimensions from the SOF
// marker (no native dependency), copies them to public/photos/, and emits
// a TypeScript array literal for src/photos.ts.

import { readdirSync, readFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, basename, extname, join } from "node:path";

const SRC = process.argv[2] || "/tmp/photos-extract";
const DEST = resolve("public/photos");

if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });

function jpegSize(buf) {
  // SOI marker
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null;
    let marker = buf[i + 1];
    // skip 0xFF padding
    while (marker === 0xff) {
      i++;
      marker = buf[i + 1];
    }
    // SOF markers: C0..C3, C5..C7, C9..CB, CD..CF (skip C4 DHT, C8 JPG, CC DAC)
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof) {
      const h = buf.readUInt16BE(i + 5);
      const w = buf.readUInt16BE(i + 7);
      return { w, h };
    }
    // SOI/EOI/RSTn have no length
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}

const files = readdirSync(SRC).filter((f) => /\.(jpe?g|JPE?G)$/.test(f));
files.sort();

const records = [];
for (const f of files) {
  const fullPath = join(SRC, f);
  const buf = readFileSync(fullPath);
  const dim = jpegSize(buf);
  if (!dim) {
    console.error("Could not parse", f);
    continue;
  }
  // Use lower-case slugified destination name.
  const ext = extname(f).toLowerCase();
  const slug = basename(f, extname(f)).toLowerCase();
  const destName = `${slug}${ext}`;
  copyFileSync(fullPath, join(DEST, destName));
  records.push({ src: `/photos/${destName}`, w: dim.w, h: dim.h, slug });
  console.log(`${f}  ${dim.w}x${dim.h}  →  /photos/${destName}`);
}

// Emit TS array with placeholder titles + EXIF (DSCF prefix → Fuji)
const out = records.map((r) => {
  const aspect = (r.w / r.h).toFixed(3);
  return `  { src: "${r.src}", title: "${r.slug}", aspect: ${aspect}, exif: { camera: "X-T50", focal: "35mm", aperture: "ƒ4", shutter: "1/250", iso: 200, date: "2025·07" } },`;
});

console.log("\n--- photos.ts entries ---");
console.log("export const GALLERY_PHOTOS: GalleryPhoto[] = [");
console.log(out.join("\n"));
console.log("];");
