# kushgupta.dev

Personal portfolio — Kush Gupta, Software Engineer + Photographer. Long-scroll
"Aperture" design that fuses dev work and photography behind a viewfinder
metaphor (loader, exposure strip, film grain transitions, contact card as a
business card).

**Live:** [kushgupta.dev](https://kushgupta.dev)

## Stack

- React 19 + TypeScript
- Vite 6 with `vite-imagetools` 7.1.1 for build-time photo optimization
- Tailwind CSS 4 (mostly bypassed in favour of CSS variables for design tokens)
- Lenis for smooth wheel/trackpad scroll
- Formsubmit for the contact form (no backend)
- GitHub Pages, auto-deploys on push to `main`

## Sections

- **Hero** — full-bleed photo crossfade, kinetic Fraunces wordmark
- **Projects** — case studies at `#/case/<id>`, typographic artifacts (file tree, terminal, diff, git log)
- **Pics** — three-row marquee with parallax, EXIF-aware sizing, lightbox
- **Resume** — paper-stock timeline, downloads `/resume.pdf`
- **Contact** — calling card with expandable Formsubmit form

## Develop

```bash
npm install
npm run dev
```

Opens on the first free port from 3000+.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | `tsc --noEmit` |
| `node tools/import-photos.mjs <dir> [camera]` | Import photos (JPEG/PNG/RAF/HEIC*) into `src/assets/photos/` and emit `photos.ts` entries |
| `python tools/convert-heic.py <src> [dst]` | Decode HEIC → JPEG (needed on Windows where sharp's libvips lacks HEVC) |
| `node tools/shrink-sources.mjs` | Re-encode `src/assets/photos/` to ≤2800px long edge at JPEG q=88 |

## Where things live

```
src/
  App.tsx                routing shell + lightbox state
  content.ts             PROFILE + PROJECTS + CV_ROWS  (single source of truth for copy)
  photos.ts              hero + gallery photo metadata, imports from src/assets/photos
  index.css              design tokens (--ink, --paper, --accent), font imports
  imagetools.d.ts        type declarations for image imports
  assets/photos/         source JPEGs (≤2800px)
  components/
    Hero.tsx             crossfade + kinetic name + peek slabs
    Work.tsx             projects rows
    Frames.tsx           three-row gallery marquee
    Lightbox.tsx         keyboard-nav photo viewer
    CV.tsx               resume timeline
    Contact.tsx          contact section wrapper
    ContactCard.tsx      calling card + Formsubmit form
    Case.tsx             case study route component
    Artifact.tsx         tree / diff / terminal / commits renderers
    TopNav.tsx           floating nav (mobile MENU, desktop inline)
    Loader.tsx           viewfinder intro + sessionStorage gate
    Wordmark.tsx         MarkApertureKG (initials) + MarkApertureCode (</> default)
    Atmosphere.tsx       subtle scroll-driven section overlays
    Reveal.tsx           IntersectionObserver fade-up wrapper
  hooks/
    useRoute.ts          hash router (#/, #/case/<id>)
    useMediaQuery.ts     useIsMobile (≤640px), useIsTablet (≤900px)
    useSmoothScroll.ts   Lenis wrapper, respects prefers-reduced-motion
tools/
  import-photos.mjs      photo importer (handles RAF inline, prints photos.ts blocks)
  convert-heic.py        pillow-heif HEIC → JPEG converter
  shrink-sources.mjs     sharp re-encode to keep repo lean
public/
  resume.pdf             served by the resume download button
  CNAME                  kushgupta.dev domain binding
```

## Adding photos

```bash
# 1. Drop files anywhere (HEIC, RAF, JPEG, PNG all welcome)
cp ~/Downloads/photos/*.* /tmp/incoming/

# 2. If any HEIC files: convert them first (Windows sharp can't)
python tools/convert-heic.py /tmp/incoming /tmp/converted

# 3. Import RAF/JPEG/PNG from /tmp/incoming
node tools/import-photos.mjs /tmp/incoming X-T50

# 4. Import the converted HEICs
node tools/import-photos.mjs /tmp/converted X-T50

# 5. Keep the repo lean
node tools/shrink-sources.mjs

# 6. Paste the printed `import` + entry blocks into src/photos.ts
```

## Deploy

Push to `main`. The GitHub Actions workflow at `.github/workflows/` runs
`npm ci && npm run build` and uploads `dist/` to Pages. `public/CNAME`
binds `kushgupta.dev`.
