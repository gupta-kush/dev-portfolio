# Agent context for kushgupta.dev

This file is for Claude/AI agents working on the repo. Visitor-facing
overview lives in `README.md`. Read both.

## Project at a glance

Personal portfolio. Design name: "Aperture". Site combines software
engineering work with landscape/street/architecture photography under a
photographic metaphor — viewfinder loader, exposure readouts, film-leak
transitions, ƒ-stop labels on photos.

The design came out of an iterative session in Claude Design (see chat
history). The name **Aperture** and the photography vocabulary are
load-bearing — don't let copy get "simplified" into generic portfolio
language.

## Branches and deploy

- `main` is **production**. Every push triggers a GitHub Pages deploy
  via `.github/workflows/deploy.yml`. The build runs `npm ci` (strict),
  not `npm install`. The site is at https://kushgupta.dev (CNAME in
  `public/`).
- `redesign` exists for in-progress work and is kept fast-forwarded
  with `main`. Not deployed.
- Always commit + push `redesign` first, then merge to `main` only
  with explicit user confirmation. The user has authorized pushes
  during specific tasks; treat each push as needing fresh authorization
  unless they say otherwise.

## Stack constraints worth knowing

- **Vite 6**, **React 19**, **TypeScript 5.8**, **Tailwind 4**.
- **vite-imagetools must stay at 7.1.1**. Versions 8+ require vite ≥ 7.
  We're on vite 6. Upgrading vite is a separate decision.
- `.npmrc` has `legacy-peer-deps=true` — both for local installs and CI.
  Without it, peer-dep mismatches break `npm ci` deploys.
- **Sharp on Windows lacks the HEVC plugin**, so it can't decode HEIC.
  HEIC files must be converted via `tools/convert-heic.py` (pillow-heif)
  first. macOS / Linux usually have HEVC and don't need this step.
- React 19 + tsc: function components that render with a `key` prop
  may need to be typed as `FC<Props>` (not just `(props) => JSX`).
  This bit Loader.tsx and Reveal.tsx; both are now `FC`-typed.

## Image pipeline

Source photos live in `src/assets/photos/` (not `public/`). They're
imported through `vite-imagetools`, which transforms them at build time
into 1600w WebP at quality 78. Original 76 MB of JPEGs becomes ~1.4 MB
of WebP.

Default directive in `vite.config.ts` applies `?w=1600&format=webp&quality=78`
to anything imported from `src/assets/photos/`. Override per-import if
you need other sizes / responsive srcsets.

Source files are kept ≤2800px on the long edge via
`tools/shrink-sources.mjs` (sharp + mozjpeg q=88) to keep the repo lean
without hurting the 1600w build output.

**EXIF orientation matters.** Fuji shoots in landscape natively;
portraits are stored as landscape data + EXIF rotate flag.
`tools/import-photos.mjs` reads tag `0x0112` and swaps width/height for
orientations 5–8 so portraits don't end up tagged as landscapes.
`tools/shrink-sources.mjs` bakes orientation into the pixels via
`sharp().rotate()`, so post-shrink files have orientation=1 and the
aspect in `photos.ts` is the actual displayed aspect.

## Section IDs and routing

The visible nav reads `PROJECTS | PICS | RESUME | CONTACT`. The DOM IDs
match the labels: `#projects`, `#pics`, `#resume`, `#contact`. Earlier
iterations used `#work`, `#frames`, `#cv`, `#hi` — those are gone.
Don't reintroduce.

Routing is hash-based via `useRoute`:
- `#/` → home
- `#/case/<id>` → case study (where `<id>` matches `Project.id` in
  `content.ts`, e.g. `spotify-mcp` or `naked-urls`)

Anchor clicks in TopNav scroll smoothly on home; on a case page they
navigate home first, then scroll after a short delay.

## Things that were removed; don't add them back without asking

- **Tweaks panel** (theme/font/accent radio toggles). It was design
  tooling. Removed in user-feedback round.
- **Dark/light theme toggle button**. Site is hardcoded `html
  data-theme="dark"`. The light-mode CSS still exists in `index.css`
  but nothing flips it.
- **Labelled distortion bands** ("DISPLACEMENT", "GRAIN BLOOM" etc.).
  Replaced by `Atmosphere.tsx` overlays — same per-kind effects but
  un-labelled, lower opacity, inside each section as `position:
  absolute` so they don't add layout space.
- **Em dashes in case-study writeups**. User specifically asked for
  plainer language without em dashes in those blocks. Date ranges in
  `CV_ROWS` still use them; that's fine.

## Component conventions

- Section components own their full layout (header rule, headline,
  body). Each non-hero section has `<Atmosphere kind="..." />` as its
  first child.
- `<Reveal>` wraps elements that should fade up on first scroll-in.
  IntersectionObserver, fires once. Don't apply to every child; that
  creates visual noise. Headers, headlines, and per-row staggers in the
  resume timeline are the canonical uses.
- `<Mark>` (default) is the geometric `</>` iris (variant B2). The
  alternate `<MarkApertureKG>` is the KG initials version (variant A2).
  Both are exported and locked at workshop slider values — don't
  refactor those constants.
- Inline styles dominate (CSS-in-JS via the `style` prop). It's not
  Tailwind-first. The CSS-vars system (`--ink`, `--paper`, `--accent`,
  `--accent-warm`) drives theming.

## Visual verification

Type-check passing ≠ feature works. The user has explicitly asked for
browser-based screenshot review after UI changes (auto-memory record).

Workflow:
1. `npm run dev` (background)
2. Run a script in `.review/` (Playwright + chromium). Existing scripts
   include:
   - `verify-final.mjs` — multi-section screenshots at 1080p
   - `verify-responsive.mjs` — desktop + laptop + tablet + mobile
   - `verify-pics.mjs` — pins the marquee animation to inspect tile
     dimensions and coordinates
3. Read the resulting PNGs from `.review/shots/` to confirm the change
   looks right.

`.review/` is **gitignored**. Playwright is in `devDependencies`.

## Content sources

- `src/content.ts` — `PROFILE`, `PROJECTS`, `CV_ROWS`. Each project has
  `n`, `id`, `title`, `subtitle`, `tags`, `lang`, `status`, `stars`,
  `updated`, `github`, optional `url`, an `artifact` (one of `tree` /
  `diff` / `terminal` / `commits`), and four narrative `blocks`
  (CONTEXT / APPROACH / NOTES / STATUS).
- `src/photos.ts` — `HERO_PHOTOS` (4-photo hero crossfade rotation) and
  `GALLERY_PHOTOS` (full set with aspect ratios + EXIF labels).
- `public/resume.pdf` — linked from the Resume section's download
  button.

## Contact form

Posts via `fetch` to `https://formsubmit.co/ajax/54950e4e90748a3c6fecbcbfa9fd5099`,
which forwards to `kushg0124@gmail.com`. The hash is the activated
endpoint for `kushgupta.dev`. Localhost is also activated. If the form
ever needs a new domain, the first submission triggers an "Activate
Form" email and submissions return `{success: "false"}` until clicked.

## Tooling scripts

| File | Purpose |
|---|---|
| `tools/import-photos.mjs` | Reads JPEG/PNG/WebP dimensions + EXIF orientation, decodes HEIC via sharp where available, extracts embedded JPEG from RAF, copies to `src/assets/photos/`, prints `photos.ts` entries. |
| `tools/convert-heic.py` | Python + pillow-heif fallback for HEIC decoding. Required on Windows. |
| `tools/shrink-sources.mjs` | Re-encodes everything in `src/assets/photos/` to ≤2800px JPEG q=88 mozjpeg. |

## Gotchas observed during build-out

- The user is on Windows. Bash environment exists (cygpath, etc.) but
  some commands need adjusting. Prefer bash with explicit unix paths
  when possible; use Windows paths for tools that require them.
- Sharp's HEIF support varies by platform. Don't assume `sharp().jpeg()`
  on a HEIC works — wrap in try/catch and fall back to the Python step.
- The first `Formsubmit` submission per origin returns `success:
  "false"` with an activation message. UI handles this as an error
  state. Activation is a one-time click in the email Formsubmit sends
  to the destination address.
- GH Pages deploys silently fail when `npm ci` rejects peer deps. Keep
  `.npmrc` with `legacy-peer-deps=true` and pin packages to versions
  that resolve cleanly with vite 6.
- The auto-memory at
  `~/.claude/projects/C--Users-klekt-OneDrive-Documents-dev-portfolio/memory/`
  has two records ("main is production", "verify UI in browser"). Keep
  them synced if behavior changes.
