// Photos are imported through vite-imagetools; the default directive in
// vite.config.ts routes everything in src/assets/photos through sharp,
// producing optimized WebP at 1600w. Original JPEGs are 3-15 MB; outputs
// are typically <300 KB.

import dscf3020 from "./assets/photos/dscf3020.jpeg";
import dscf3064 from "./assets/photos/dscf3064.jpeg";
import dscf3468 from "./assets/photos/dscf3468.jpeg";
import dscf3492 from "./assets/photos/dscf3492.jpeg";
import dscf3506 from "./assets/photos/dscf3506.jpeg";
import dscf3512 from "./assets/photos/dscf3512.jpeg";
import dscf3532 from "./assets/photos/dscf3532.jpeg";

export type Exif = {
  camera: string;
  focal: string;
  aperture: string;
  shutter: string;
  iso: number;
  date: string;
};

export type HeroPhoto = {
  src: string;
  label: string;
  meta: string;
};

export type GalleryPhoto = {
  src: string;
  title: string;
  /** Natural width / height. The gallery sizes each photo by aspect so a
   *  landscape shot reads as a landscape rectangle, not a cropped square. */
  aspect: number;
  exif: Exif;
};

const CAMERA = "X-S10";

export const HERO_PHOTOS: HeroPhoto[] = [
  { src: dscf3064, label: `${CAMERA} · 35mm`, meta: "ƒ4 · 1/250 · ISO 200" },
  { src: dscf3492, label: `${CAMERA} · 23mm`, meta: "ƒ8 · 1/500 · ISO 100" },
  { src: dscf3506, label: `${CAMERA} · 50mm`, meta: "ƒ5.6 · 1/320 · ISO 200" },
  { src: dscf3532, label: `${CAMERA} · 18mm`, meta: "ƒ11 · 1/500 · ISO 100" },
];

// Aspects measured from EXIF-corrected source dimensions (see
// tools/import-photos.mjs). dscf3468 has EXIF orientation 8 so its raw
// 6240x4160 pixels are actually a portrait when displayed.
export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { src: dscf3020, title: "dscf3020", aspect: 0.574, exif: { camera: CAMERA, focal: "50mm", aperture: "ƒ2.8", shutter: "1/250", iso: 400, date: "2025·07" } },
  { src: dscf3064, title: "dscf3064", aspect: 1.5,   exif: { camera: CAMERA, focal: "23mm", aperture: "ƒ8",   shutter: "1/500", iso: 100, date: "2025·07" } },
  { src: dscf3468, title: "dscf3468", aspect: 0.667, exif: { camera: CAMERA, focal: "35mm", aperture: "ƒ2.8", shutter: "1/200", iso: 400, date: "2025·07" } },
  { src: dscf3492, title: "dscf3492", aspect: 1.5,   exif: { camera: CAMERA, focal: "18mm", aperture: "ƒ11",  shutter: "1/500", iso: 100, date: "2025·07" } },
  { src: dscf3506, title: "dscf3506", aspect: 1.5,   exif: { camera: CAMERA, focal: "50mm", aperture: "ƒ5.6", shutter: "1/320", iso: 200, date: "2025·07" } },
  { src: dscf3512, title: "dscf3512", aspect: 0.65,  exif: { camera: CAMERA, focal: "35mm", aperture: "ƒ2.8", shutter: "1/120", iso: 800, date: "2025·07" } },
  { src: dscf3532, title: "dscf3532", aspect: 1.5,   exif: { camera: CAMERA, focal: "16mm", aperture: "ƒ4",   shutter: "1/200", iso: 400, date: "2025·07" } },
];
