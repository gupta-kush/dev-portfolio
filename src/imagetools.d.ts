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

// Allow query-string imports e.g. "./img.jpeg?w=400;800&format=webp&as=srcset".
declare module "*?w=*" {
  const value: string;
  export default value;
}
declare module "*?format=*" {
  const value: string;
  export default value;
}
