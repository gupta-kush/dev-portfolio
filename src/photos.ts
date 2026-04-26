// Photos served from /public/photos. Aspect ratios were measured from the
// originals via tools/import-photos.mjs.

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

// Hero crossfade still uses Unsplash placeholders for now — real hero shots
// can be slotted in by changing src here.
export const HERO_PHOTOS: HeroPhoto[] = [
  { src: "/photos/dscf3064.jpeg", label: "X-T50 · 35mm", meta: "ƒ4 · 1/250 · ISO 200" },
  { src: "/photos/dscf3468.jpeg", label: "X-T50 · 23mm", meta: "ƒ8 · 1/500 · ISO 100" },
  { src: "/photos/dscf3506.jpeg", label: "X-T50 · 50mm", meta: "ƒ5.6 · 1/320 · ISO 200" },
  { src: "/photos/dscf3532.jpeg", label: "X-T50 · 18mm", meta: "ƒ11 · 1/500 · ISO 100" },
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { src: "/photos/dscf3020.jpeg", title: "dscf3020", aspect: 0.574, exif: { camera: "X-T50", focal: "50mm", aperture: "ƒ2.8", shutter: "1/250", iso: 400, date: "2025·07" } },
  { src: "/photos/dscf3064.jpeg", title: "dscf3064", aspect: 1.5,   exif: { camera: "X-T50", focal: "23mm", aperture: "ƒ8",   shutter: "1/500", iso: 100, date: "2025·07" } },
  { src: "/photos/dscf3468.jpeg", title: "dscf3468", aspect: 1.5,   exif: { camera: "X-T50", focal: "35mm", aperture: "ƒ4",   shutter: "1/250", iso: 200, date: "2025·07" } },
  { src: "/photos/dscf3492.jpeg", title: "dscf3492", aspect: 1.5,   exif: { camera: "X-T50", focal: "18mm", aperture: "ƒ11",  shutter: "1/500", iso: 100, date: "2025·07" } },
  { src: "/photos/dscf3506.jpeg", title: "dscf3506", aspect: 1.5,   exif: { camera: "X-T50", focal: "50mm", aperture: "ƒ5.6", shutter: "1/320", iso: 200, date: "2025·07" } },
  { src: "/photos/dscf3512.jpeg", title: "dscf3512", aspect: 0.65,  exif: { camera: "X-T50", focal: "35mm", aperture: "ƒ2.8", shutter: "1/120", iso: 800, date: "2025·07" } },
  { src: "/photos/dscf3532.jpeg", title: "dscf3532", aspect: 1.5,   exif: { camera: "X-T50", focal: "16mm", aperture: "ƒ4",   shutter: "1/200", iso: 400, date: "2025·07" } },
];
