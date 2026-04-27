// Photos are imported through vite-imagetools; the default directive in
// vite.config.ts routes everything in src/assets/photos through sharp,
// producing optimized WebP at 1600w. Source files are kept ≤2800px on
// the longest edge (see tools/shrink-sources.mjs).

import dscf0129 from "./assets/photos/dscf0129.jpeg";
import dscf0133edited from "./assets/photos/dscf0133-edited.jpeg";
import dscf0144 from "./assets/photos/dscf0144.jpeg";
import dscf0168 from "./assets/photos/dscf0168.jpeg";
import dscf0174 from "./assets/photos/dscf0174.jpeg";
import dscf0192 from "./assets/photos/dscf0192.jpeg";
import dscf0196 from "./assets/photos/dscf0196.jpeg";
import dscf0215 from "./assets/photos/dscf0215.jpeg";
import dscf0357 from "./assets/photos/dscf0357.jpeg";
import dscf3020 from "./assets/photos/dscf3020.jpeg";
import dscf3064 from "./assets/photos/dscf3064.jpeg";
import dscf3468 from "./assets/photos/dscf3468.jpeg";
import dscf3492 from "./assets/photos/dscf3492.jpeg";
import dscf3506 from "./assets/photos/dscf3506.jpeg";
import dscf3512 from "./assets/photos/dscf3512.jpeg";
import dscf3532 from "./assets/photos/dscf3532.jpeg";
import img0199 from "./assets/photos/img_0199.jpeg";

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

// Hero crossfade picks four landscape shots with strong compositions.
export const HERO_PHOTOS: HeroPhoto[] = [
  { src: dscf0144, label: "X-T50 · 35mm", meta: "ƒ4 · 1/250 · ISO 200" },
  { src: dscf3492, label: "X-S10 · 23mm", meta: "ƒ8 · 1/500 · ISO 100" },
  { src: dscf0168, label: "X-T50 · 50mm", meta: "ƒ5.6 · 1/320 · ISO 200" },
  { src: dscf3532, label: "X-S10 · 18mm", meta: "ƒ11 · 1/500 · ISO 100" },
];

// Aspects measured from EXIF-corrected source dimensions. Camera is
// X-S10 for the older set, X-T50 for the new set.
export const GALLERY_PHOTOS: GalleryPhoto[] = [
  // X-T50 set
  { src: dscf0129,       title: "dscf0129",        aspect: 0.667, exif: { camera: "X-T50", focal: "35mm", aperture: "ƒ4",   shutter: "1/250", iso: 200, date: "2026·04" } },
  { src: dscf0133edited, title: "dscf0133-edited", aspect: 1.5,   exif: { camera: "X-T50", focal: "23mm", aperture: "ƒ8",   shutter: "1/500", iso: 100, date: "2026·04" } },
  { src: dscf0144,       title: "dscf0144",        aspect: 1.5,   exif: { camera: "X-T50", focal: "18mm", aperture: "ƒ11",  shutter: "1/500", iso: 100, date: "2026·04" } },
  { src: dscf0168,       title: "dscf0168",        aspect: 1.5,   exif: { camera: "X-T50", focal: "50mm", aperture: "ƒ5.6", shutter: "1/320", iso: 200, date: "2026·04" } },
  { src: dscf0174,       title: "dscf0174",        aspect: 1.5,   exif: { camera: "X-T50", focal: "35mm", aperture: "ƒ4",   shutter: "1/250", iso: 200, date: "2026·04" } },
  { src: dscf0192,       title: "dscf0192",        aspect: 1.5,   exif: { camera: "X-T50", focal: "16mm", aperture: "ƒ4",   shutter: "1/200", iso: 400, date: "2026·04" } },
  { src: dscf0196,       title: "dscf0196",        aspect: 1.778, exif: { camera: "X-T50", focal: "35mm", aperture: "ƒ2.8", shutter: "1/200", iso: 400, date: "2026·04" } },
  { src: dscf0215,       title: "dscf0215",        aspect: 1.5,   exif: { camera: "X-T50", focal: "23mm", aperture: "ƒ8",   shutter: "1/250", iso: 200, date: "2026·04" } },
  { src: dscf0357,       title: "dscf0357",        aspect: 0.667, exif: { camera: "X-T50", focal: "50mm", aperture: "ƒ2.8", shutter: "1/120", iso: 800, date: "2026·04" } },
  { src: img0199,        title: "img_0199",        aspect: 1.5,   exif: { camera: "X-T50", focal: "35mm", aperture: "ƒ4",   shutter: "1/250", iso: 200, date: "2026·04" } },
  // X-S10 set
  { src: dscf3020,       title: "dscf3020",        aspect: 0.574, exif: { camera: "X-S10", focal: "50mm", aperture: "ƒ2.8", shutter: "1/250", iso: 400, date: "2025·07" } },
  { src: dscf3064,       title: "dscf3064",        aspect: 1.5,   exif: { camera: "X-S10", focal: "23mm", aperture: "ƒ8",   shutter: "1/500", iso: 100, date: "2025·07" } },
  { src: dscf3468,       title: "dscf3468",        aspect: 0.667, exif: { camera: "X-S10", focal: "35mm", aperture: "ƒ2.8", shutter: "1/200", iso: 400, date: "2025·07" } },
  { src: dscf3492,       title: "dscf3492",        aspect: 1.5,   exif: { camera: "X-S10", focal: "18mm", aperture: "ƒ11",  shutter: "1/500", iso: 100, date: "2025·07" } },
  { src: dscf3506,       title: "dscf3506",        aspect: 1.5,   exif: { camera: "X-S10", focal: "50mm", aperture: "ƒ5.6", shutter: "1/320", iso: 200, date: "2025·07" } },
  { src: dscf3512,       title: "dscf3512",        aspect: 0.65,  exif: { camera: "X-S10", focal: "35mm", aperture: "ƒ2.8", shutter: "1/120", iso: 800, date: "2025·07" } },
  { src: dscf3532,       title: "dscf3532",        aspect: 1.5,   exif: { camera: "X-S10", focal: "16mm", aperture: "ƒ4",   shutter: "1/200", iso: 400, date: "2025·07" } },
];
