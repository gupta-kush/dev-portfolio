// Curated photo URLs (public Unsplash) + EXIF-derived metadata.
// These are placeholders — real shots slot in by replacing the src/exif fields.

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
  exif: Exif;
};

export const HERO_PHOTOS: HeroPhoto[] = [
  { src: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=1800&q=80", label: "X-T50 · 23mm", meta: "ƒ8 · 1/250 · ISO 200" },
  { src: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1800&q=80", label: "X-S10 · 35mm", meta: "ƒ1.8 · 1/60 · ISO 1600" },
  { src: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1800&q=80", label: "X-T50 · 18mm", meta: "ƒ5.6 · 1/500 · ISO 100" },
  { src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1800&q=80", label: "iPhone 15 Pro", meta: "ƒ1.8 · 1/1000 · ISO 64" },
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80", title: "mountain pass, dawn", exif: { camera: "X-T50", focal: "23mm", aperture: "ƒ8", shutter: "1/250", iso: 200, date: "2025·11" } },
  { src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80", title: "fjord", exif: { camera: "X-T50", focal: "18mm", aperture: "ƒ11", shutter: "1/500", iso: 100, date: "2025·09" } },
  { src: "https://images.unsplash.com/photo-1473800447596-01729482b8eb?w=1200&q=80", title: "tokyo, rain", exif: { camera: "X-S10", focal: "35mm", aperture: "ƒ1.8", shutter: "1/60", iso: 1600, date: "2025·02" } },
  { src: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=1200&q=80", title: "tokyo, neon", exif: { camera: "X-S10", focal: "35mm", aperture: "ƒ1.4", shutter: "1/120", iso: 3200, date: "2025·02" } },
  { src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80", title: "brutalist stair", exif: { camera: "X-T50", focal: "16mm", aperture: "ƒ4", shutter: "1/200", iso: 400, date: "2024·07" } },
  { src: "https://images.unsplash.com/photo-1493244040629-496f6d136cc3?w=1200&q=80", title: "concrete window", exif: { camera: "iPhone 15 Pro", focal: "24mm", aperture: "ƒ1.8", shutter: "1/400", iso: 80, date: "2024·11" } },
  { src: "https://images.unsplash.com/photo-1491466424936-e304919aada7?w=1200&q=80", title: "coast, evening", exif: { camera: "X-T50", focal: "50mm", aperture: "ƒ5.6", shutter: "1/320", iso: 200, date: "2025·05" } },
  { src: "https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=1200&q=80", title: "desert road", exif: { camera: "iPhone 15 Pro", focal: "15mm", aperture: "ƒ2.2", shutter: "1/2000", iso: 64, date: "2024·04" } },
  { src: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200&q=80", title: "crossing", exif: { camera: "X-S10", focal: "23mm", aperture: "ƒ2.8", shutter: "1/250", iso: 800, date: "2025·02" } },
  { src: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200&q=80", title: "forest, mist", exif: { camera: "X-T50", focal: "35mm", aperture: "ƒ4", shutter: "1/125", iso: 400, date: "2025·10" } },
];
