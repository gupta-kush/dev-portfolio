// Type declarations for vite-imagetools imports.
// Files in src/assets/photos default to ?w=1600&format=webp via vite.config.ts.

declare module "*.jpeg" {
  const src: string;
  export default src;
}
declare module "*.jpg" {
  const src: string;
  export default src;
}
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.webp" {
  const src: string;
  export default src;
}
declare module "*.avif" {
  const src: string;
  export default src;
}
declare module "*.tiff" {
  const src: string;
  export default src;
}
// HEIC works only when the platform's libvips includes HEIF support
// (varies by OS / sharp prebuild). On Windows you typically need to
// convert to JPEG first. RAW (.raf, .cr2, etc.) is not supported.
declare module "*.heic" {
  const src: string;
  export default src;
}
declare module "*.heif" {
  const src: string;
  export default src;
}

// Allow query-string imports for the lightbox's higher-resolution
// variant. TypeScript module patterns allow only one wildcard per
// pattern, so we pin the exact query string used by photos.ts.
declare module "*?w=2400&format=webp&quality=85" {
  const src: string;
  export default src;
}
