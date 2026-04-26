// Reads JPEGs from a source directory, extracts dimensions and EXIF
// orientation from the JPEG header (no native dependency), copies them
// to src/assets/photos/, and emits a TypeScript array literal for
// src/photos.ts. vite-imagetools picks up the dest dir at build time.

import { readdirSync, readFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, basename, extname, join } from "node:path";

const SRC = process.argv[2] || "/tmp/photos-extract";
const DEST = resolve("src/assets/photos");

if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });

// PNG dimensions: signature is 8 bytes, then 4-byte chunk length, "IHDR",
// then 13 bytes of header data with width/height as big-endian uint32 at
// offsets 16 and 20 from start of file.
function pngSize(buf) {
  if (
    buf[0] !== 0x89 ||
    buf[1] !== 0x50 ||
    buf[2] !== 0x4e ||
    buf[3] !== 0x47 ||
    buf[4] !== 0x0d ||
    buf[5] !== 0x0a ||
    buf[6] !== 0x1a ||
    buf[7] !== 0x0a
  )
    return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// WebP dimensions live in either VP8 / VP8L / VP8X chunks at offset 12.
function webpSize(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    // simple: 14 bytes in, 16-bit width and height
    const w = buf.readUInt16LE(26) & 0x3fff;
    const h = buf.readUInt16LE(28) & 0x3fff;
    return { w, h };
  }
  if (chunk === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    // 24 bytes in, then 3-byte width-1 and 3-byte height-1
    const w = (buf.readUIntLE(24, 3)) + 1;
    const h = (buf.readUIntLE(27, 3)) + 1;
    return { w, h };
  }
  return null;
}

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

const SUPPORTED = /\.(jpe?g|png|webp)$/i;
// Formats we explicitly call out as not importable through this script.
const NEEDS_PRECONVERT = /\.(heic|heif)$/i;
const RAW = /\.(raf|nef|cr2|cr3|arw|dng|orf|rw2|pef)$/i;

const files = readdirSync(SRC).filter((f) => {
  if (NEEDS_PRECONVERT.test(f)) {
    console.warn(`! ${f}: HEIC/HEIF — convert to JPEG first (Photos app or 'heif-convert').`);
    return false;
  }
  if (RAW.test(f)) {
    console.warn(`! ${f}: RAW files aren't web-deliverable. Develop in your editor and export to JPEG.`);
    return false;
  }
  return SUPPORTED.test(f);
});
files.sort();

const records = [];
for (const f of files) {
  const fullPath = join(SRC, f);
  const buf = readFileSync(fullPath);
  const ext = extname(f).toLowerCase();
  let dim = null;
  if (/^\.jpe?g$/.test(ext)) dim = jpegSize(buf);
  else if (ext === ".png") dim = pngSize(buf);
  else if (ext === ".webp") dim = webpSize(buf);
  if (!dim) {
    console.error("Could not parse", f);
    continue;
  }
  // EXIF orientation only meaningful for JPEG.
  const orient = /^\.jpe?g$/.test(ext) ? exifOrientation(buf) : 1;
  const swap = orient >= 5 && orient <= 8;
  const w = swap ? dim.h : dim.w;
  const h = swap ? dim.w : dim.h;
  const slug = basename(f, extname(f)).toLowerCase();
  const destName = `${slug}${ext}`;
  copyFileSync(fullPath, join(DEST, destName));
  records.push({ src: `./assets/photos/${destName}`, w, h, slug, ext: ext.slice(1) });
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
