// Reads photos from a source directory, normalizes them to JPEG (decoding
// HEIC via sharp; extracting Fuji RAF's embedded full-res JPEG preview),
// detects EXIF orientation so portraits aren't mis-tagged as landscapes,
// copies the result into src/assets/photos/, and prints a TypeScript
// array literal ready to paste into src/photos.ts.
//
// Usage:
//   node tools/import-photos.mjs <srcDir> [cameraLabel]
//
// e.g. node tools/import-photos.mjs drive-download X-T50

import {
  readdirSync,
  readFileSync,
  copyFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { resolve, basename, extname, join } from "node:path";
import sharp from "sharp";

const SRC = process.argv[2] || "/tmp/photos-extract";
const CAMERA = process.argv[3] || "X-S10";
const DEST = resolve("src/assets/photos");

if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });

// ─── format parsers ────────────────────────────────────────────────────────

function pngSize(buf) {
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
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
    if (isSof) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}

// EXIF orientation tag 0x0112 (1, 3, 6, 8 are the rotations Fuji uses).
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
          if (r16(e) === 0x0112) return r16(e + 8);
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

// Fuji RAF format: header "FUJIFILMCCD-RAW", then at offset 0x54 a big-
// endian uint32 pointing at the embedded full-resolution JPEG preview,
// with its byte length at 0x58. We extract that JPEG verbatim.
function extractRafJpeg(buf) {
  if (buf.toString("ascii", 0, 15) !== "FUJIFILMCCD-RAW") return null;
  const offset = buf.readUInt32BE(0x54);
  const length = buf.readUInt32BE(0x58);
  if (offset === 0 || length === 0 || offset + length > buf.length) return null;
  const jpeg = buf.slice(offset, offset + length);
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) return null;
  return jpeg;
}

// ─── slug + filename helpers ───────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── importer ─────────────────────────────────────────────────────────────

const SUPPORTED_RE = /\.(jpe?g|png|webp|heic|heif|raf)$/i;

const files = readdirSync(SRC)
  .filter((f) => SUPPORTED_RE.test(f))
  .sort();

if (files.length === 0) {
  console.log("No supported files found in", SRC);
  process.exit(0);
}

console.log(`Importing ${files.length} files from ${SRC} (camera label: ${CAMERA})\n`);

const records = [];

for (const f of files) {
  const fullPath = join(SRC, f);
  const ext = extname(f).toLowerCase();
  const slug = slugify(basename(f, extname(f)));
  let jpegBuf = null;
  let outExt = ".jpeg";

  try {
    const raw = readFileSync(fullPath);

    if (/^\.jpe?g$/.test(ext)) {
      jpegBuf = raw;
    } else if (ext === ".png") {
      // Keep PNG as-is. vite-imagetools handles it.
      const dim = pngSize(raw);
      if (!dim) throw new Error("could not parse PNG header");
      const destName = `${slug}.png`;
      copyFileSync(fullPath, join(DEST, destName));
      records.push({ slug, destName, w: dim.w, h: dim.h, ext: "png" });
      console.log(`  ${f}  ${dim.w}x${dim.h}  (png, copied)`);
      continue;
    } else if (ext === ".heic" || ext === ".heif") {
      // Decode via sharp; .rotate() bakes EXIF orientation into pixels so
      // the resulting JPEG doesn't need an orientation flag.
      console.log(`  ${f}  decoding HEIC...`);
      jpegBuf = await sharp(raw).rotate().jpeg({ quality: 92, mozjpeg: true }).toBuffer();
    } else if (ext === ".raf") {
      console.log(`  ${f}  extracting embedded JPEG preview...`);
      jpegBuf = extractRafJpeg(raw);
      if (!jpegBuf) throw new Error("RAF has no embedded JPEG preview");
    } else if (ext === ".webp") {
      // WebP passes through unchanged; vite-imagetools re-encodes to spec.
      const destName = `${slug}.webp`;
      copyFileSync(fullPath, join(DEST, destName));
      // We don't know dimensions without parsing — best-effort: skip and
      // ask user to fill aspect manually.
      records.push({ slug, destName, w: 0, h: 0, ext: "webp", noAspect: true });
      console.log(`  ${f}  (webp copied, aspect unknown)`);
      continue;
    } else {
      console.warn(`  skip ${f}: unsupported extension`);
      continue;
    }

    // At this point jpegBuf is a JPEG buffer. Parse dimensions + orientation.
    const dim = jpegSize(jpegBuf);
    if (!dim) throw new Error("could not parse JPEG header after decode");
    const orient = exifOrientation(jpegBuf);
    const swap = orient >= 5 && orient <= 8;
    const w = swap ? dim.h : dim.w;
    const h = swap ? dim.w : dim.h;

    const destName = `${slug}${outExt}`;
    writeFileSync(join(DEST, destName), jpegBuf);
    records.push({ slug, destName, w, h, ext: "jpeg" });
    const sizeKB = (jpegBuf.length / 1024).toFixed(1);
    console.log(
      `  ${f}  ${dim.w}x${dim.h}${swap ? " (orient=" + orient + ", swapped)" : ""} → ${w}x${h}  ${sizeKB}KB`,
    );
  } catch (err) {
    console.error(`  ! ${f}: ${err.message}`);
  }
}

// ─── emit photos.ts entries ───────────────────────────────────────────────

console.log("\n--- copy these into src/photos.ts ---\n");
console.log("// imports");
for (const r of records) {
  if (r.noAspect) continue;
  const importName = r.slug.replace(/[^a-z0-9]/g, "");
  console.log(`import ${importName} from "./assets/photos/${r.destName}";`);
}
console.log("\n// gallery entries");
for (const r of records) {
  if (r.noAspect) {
    console.log(`// ${r.destName} — please set aspect manually`);
    continue;
  }
  const importName = r.slug.replace(/[^a-z0-9]/g, "");
  const aspect = (r.w / r.h).toFixed(3);
  console.log(
    `  { src: ${importName}, title: "${r.slug}", aspect: ${aspect}, exif: { camera: "${CAMERA}", focal: "35mm", aperture: "ƒ4", shutter: "1/250", iso: 200, date: "2025·07" } },`,
  );
}
