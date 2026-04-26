// Reads JPEGs from a source directory, extracts dimensions and EXIF
// orientation from the JPEG header (no native dependency), copies them
// to src/assets/photos/, and emits a TypeScript array literal for
// src/photos.ts. vite-imagetools picks up the dest dir at build time.

import { readdirSync, readFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, basename, extname, join } from "node:path";

const SRC = process.argv[2] || "/tmp/photos-extract";
const DEST = resolve("src/assets/photos");

if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });

function jpegSize(buf) {
  // SOI marker
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null;
    let marker = buf[i + 1];
    while (marker === 0xff) {
      i++;
      marker = buf[i + 1];
    }
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
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}

// Read EXIF orientation (tag 0x0112) from APP1 segment. Values 5-8 mean
// the photo is rotated relative to its raw pixel data, so width/height
// from the SOF marker need to swap. Without this, portraits stored as
// landscape-on-disk would be detected as landscape aspect.
function exifOrientation(buf) {
  let i = 2;
  while (i < buf.length - 4) {
    if (buf[i] !== 0xff) return 1;
    let marker = buf[i + 1];
    while (marker === 0xff) {
      i++;
      marker = buf[i + 1];
    }
    if (marker === 0xe1) {
      // APP1
      const segLen = buf.readUInt16BE(i + 2);
      if (buf.toString("ascii", i + 4, i + 10) === "Exif\0\0") {
        const tiff = i + 10;
        const le = buf.toString("ascii", tiff, tiff + 2) === "II";
        const r16 = (off) => (le ? buf.readUInt16LE(off) : buf.readUInt16BE(off));
        const r32 = (off) => (le ? buf.readUInt32LE(off) : buf.readUInt32BE(off));
        const ifd0 = tiff + r32(tiff + 4);
        const n = r16(ifd0);
        for (let j = 0; j < n; j++) {
          const e = ifd0 + 2 + j * 12;
          const tag = r16(e);
          if (tag === 0x0112) {
            return r16(e + 8);
          }
        }
        return 1;
      }
      i += 2 + segLen;
      continue;
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return 1;
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
  const orient = exifOrientation(buf);
  // Orientation 5-8 means the photo is rotated 90/270 from its raw pixels.
  const swap = orient >= 5 && orient <= 8;
  const w = swap ? dim.h : dim.w;
  const h = swap ? dim.w : dim.h;
  const ext = extname(f).toLowerCase();
  const slug = basename(f, extname(f)).toLowerCase();
  const destName = `${slug}${ext}`;
  copyFileSync(fullPath, join(DEST, destName));
  records.push({ src: `/photos/${destName}`, w, h, slug });
  console.log(`${f}  ${dim.w}x${dim.h} (orient=${orient}${swap ? ", swap" : ""}) → ${w}x${h}`);
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
