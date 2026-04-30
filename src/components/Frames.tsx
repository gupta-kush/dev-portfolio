// Photo gallery as a single horizontally-drifting wall. Photos are
// packed into variable-width columns; each column holds 1, 2, or 3
// photos stacked vertically. For 2- and 3-photo columns the heights
// are solved so every photo in the column has the same width — that
// keeps each column void-free at its natural aspects. Because column
// widths vary and the y-position of the inter-photo seams varies per
// column, the wall never reads as horizontal rows.

import { useMemo, useState } from "react";
import { GALLERY_PHOTOS, type GalleryPhoto } from "../photos";
import { Reveal } from "./Reveal";
import { Atmosphere } from "./Atmosphere";
import { useIsMobile } from "../hooks/useMediaQuery";

const BAND_DESKTOP = 540;
const BAND_MOBILE = 360;
const GAP_X = 6;
const GAP_Y = 6;
const TARGET_CANVAS_W = 3200; // minimum width before we duplicate for the loop
const DURATION_DESKTOP = 110; // seconds for one full canvas pass
const DURATION_MOBILE = 70;

// Deterministic PRNG so layouts are stable across renders.
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Place = {
  p: GalleryPhoto;
  origIdx: number;
  x: number;
  y: number;
  w: number;
  h: number;
  key: string;
};

// Width that makes two stacked photos share the same column width given
// inner stack height = h1 + h2 = innerH.  a1*h1 = a2*h2 ⇒ h1 = a2*innerH/(a1+a2)
function solveStackTwo(a1: number, a2: number, innerH: number) {
  const h1 = (a2 * innerH) / (a1 + a2);
  const h2 = innerH - h1;
  const w = a1 * h1; // == a2 * h2
  return { h1, h2, w };
}

// Three-photo stack: w/a1 + w/a2 + w/a3 = innerH ⇒ w = innerH / Σ(1/ai)
function solveStackThree(a1: number, a2: number, a3: number, innerH: number) {
  const w = innerH / (1 / a1 + 1 / a2 + 1 / a3);
  return { h1: w / a1, h2: w / a2, h3: w / a3, w };
}

// Photos sorted so portraits and landscapes are interleaved — gives
// stacks a mix of orientations rather than three skinny portraits in a
// column or three wide panoramas crushed thin.
function interleaveByOrientation(list: GalleryPhoto[]): GalleryPhoto[] {
  const portraits = list.filter((p) => p.aspect < 0.95);
  const landscapes = list.filter((p) => p.aspect >= 0.95);
  const out: GalleryPhoto[] = [];
  let pi = 0;
  let li = 0;
  while (pi < portraits.length || li < landscapes.length) {
    if (li < landscapes.length) out.push(landscapes[li++]);
    if (pi < portraits.length) out.push(portraits[pi++]);
  }
  return out;
}

// Pack photos into a single horizontal canvas of stacked columns.
// Returns placements + total canvas width.  The same `seedOffset` always
// produces the same layout, so re-renders don't reshuffle photos.
function packWall(
  photos: GalleryPhoto[],
  bandH: number,
  filteredOrigIndex: (p: GalleryPhoto) => number,
  seedOffset = 0,
): { places: Place[]; canvasW: number } {
  const places: Place[] = [];
  if (photos.length === 0) return { places, canvasW: 0 };

  // Repeat the photo list until packing it would exceed TARGET_CANVAS_W.
  // Average column width ≈ 0.9 × bandH; one cycle ≈ photos.length × that.
  const avgColW = bandH * 0.9;
  const minReps = Math.max(1, Math.ceil(TARGET_CANVAS_W / Math.max(photos.length * avgColW, 1)));
  const sequence: GalleryPhoto[] = [];
  for (let r = 0; r < minReps; r++) sequence.push(...photos);

  const rng = mulberry32(1337 + seedOffset);

  let cursor = 0;
  let i = 0;
  let colCount = 0;
  while (i < sequence.length) {
    const remaining = sequence.length - i;
    const innerH2 = bandH - GAP_Y;
    const innerH3 = bandH - 2 * GAP_Y;

    // Pick a column type (1 / 2 / 3 photos).  Bias toward 2-stacks for
    // density, with full-height singles and triples sprinkled in.
    let stackSize: 1 | 2 | 3;
    const r = rng();
    if (remaining >= 3 && r < 0.18) stackSize = 3;
    else if (remaining >= 2 && r < 0.78) stackSize = 2;
    else stackSize = 1;

    // Avoid two singles in a row late in the sequence — keeps rhythm
    // varied when filter shrinks the photo set.
    if (stackSize === 1 && remaining >= 2 && colCount > 0) {
      const lastWasSingle =
        places.length > 0 &&
        places[places.length - 1].h === bandH &&
        (places.length === 1 || places[places.length - 2].x !== places[places.length - 1].x);
      if (lastWasSingle && rng() < 0.7) stackSize = 2;
    }

    if (stackSize === 3) {
      const [p1, p2, p3] = [sequence[i], sequence[i + 1], sequence[i + 2]];
      const { h1, h2, h3, w } = solveStackThree(p1.aspect, p2.aspect, p3.aspect, innerH3);
      // Reject pathologically narrow triples (all-portraits give very
      // thin columns).  Fall back to a 2-stack.
      if (w < bandH * 0.42) {
        stackSize = 2;
      } else {
        places.push({ p: p1, origIdx: filteredOrigIndex(p1), x: cursor, y: 0, w, h: h1, key: `${i}-0` });
        places.push({ p: p2, origIdx: filteredOrigIndex(p2), x: cursor, y: h1 + GAP_Y, w, h: h2, key: `${i}-1` });
        places.push({ p: p3, origIdx: filteredOrigIndex(p3), x: cursor, y: h1 + h2 + 2 * GAP_Y, w, h: h3, key: `${i}-2` });
        cursor += w + GAP_X;
        i += 3;
        colCount++;
        continue;
      }
    }

    if (stackSize === 2) {
      const [p1, p2] = [sequence[i], sequence[i + 1]];
      const { h1, h2, w } = solveStackTwo(p1.aspect, p2.aspect, innerH2);
      // If the stack would be unreasonably narrow (two tall portraits)
      // or unreasonably wide (two wide panoramas), fall back to singles.
      if (w < bandH * 0.42 || w > bandH * 2.2) {
        stackSize = 1;
      } else {
        places.push({ p: p1, origIdx: filteredOrigIndex(p1), x: cursor, y: 0, w, h: h1, key: `${i}-0` });
        places.push({ p: p2, origIdx: filteredOrigIndex(p2), x: cursor, y: h1 + GAP_Y, w, h: h2, key: `${i}-1` });
        cursor += w + GAP_X;
        i += 2;
        colCount++;
        continue;
      }
    }

    const p = sequence[i];
    const w = p.aspect * bandH;
    places.push({ p, origIdx: filteredOrigIndex(p), x: cursor, y: 0, w, h: bandH, key: `${i}-0` });
    cursor += w + GAP_X;
    i += 1;
    colCount++;
  }

  return { places, canvasW: cursor };
}

export function Frames({
  onOpen,
}: {
  onOpen: (idx: number, list: GalleryPhoto[]) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const isMobile = useIsMobile();
  const bandH = isMobile ? BAND_MOBILE : BAND_DESKTOP;
  const duration = isMobile ? DURATION_MOBILE : DURATION_DESKTOP;

  const filtered = useMemo(
    () =>
      filter === "all"
        ? GALLERY_PHOTOS
        : GALLERY_PHOTOS.filter((p) => p.exif.camera === filter),
    [filter],
  );

  const cameras = useMemo(
    () => Array.from(new Set(GALLERY_PHOTOS.map((p) => p.exif.camera))),
    [],
  );

  const { places, canvasW } = useMemo(() => {
    const ordered = interleaveByOrientation(filtered);
    const indexOf = (p: GalleryPhoto) => filtered.indexOf(p);
    return packWall(ordered, bandH, indexOf, filter === "all" ? 0 : filter.length);
  }, [filtered, bandH, filter]);

  return (
    <section
      id="pics"
      data-screen-label="02 Pics"
      style={{
        background: "#0a0908",
        color: "var(--paper)",
        padding: "80px 0 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Atmosphere kind="grain" />
      <div style={{ padding: "0 clamp(20px, 3vw, 36px)", position: "relative", zIndex: 1 }}>
        <Reveal>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.22em",
              color: "var(--ink-faint)",
              borderTop: "1.5px solid var(--rule)",
              paddingTop: 14,
              marginBottom: 36,
            }}
          >
            <span>§ 02 / PICS / LIGHT</span>
            <span>SHOT ON FUJI X-T50 · X-S10</span>
          </div>
        </Reveal>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 18,
          }}
        >
          <Reveal delay={80}>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: "clamp(40px, 6vw, 88px)",
                letterSpacing: "-0.02em",
                lineHeight: 0.96,
                fontWeight: 400,
              }}
            >
              light I caught.
            </div>
          </Reveal>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[{ v: "all", l: "All" }, ...cameras.map((c) => ({ v: c, l: c }))].map((f) => (
              <button
                key={f.v}
                onClick={() => setFilter(f.v)}
                style={{
                  padding: "7px 14px",
                  border: "1px solid",
                  borderColor: filter === f.v ? "var(--accent)" : "rgba(255,255,255,.25)",
                  background: filter === f.v ? "rgba(255,184,107,0.14)" : "transparent",
                  color: filter === f.v ? "var(--accent)" : "var(--paper)",
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: bandH,
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {/* The wall: one canvas of width `canvasW`, duplicated side-by-side
           for a seamless loop.  The wrapper translates from 0 to -canvasW
           over `duration` seconds. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: bandH,
            width: canvasW * 2,
            animation: `frames-wall ${duration}s linear infinite`,
            willChange: "transform",
          }}
        >
          {[0, 1].map((copy) =>
            places.map((pl) => (
              <button
                key={`${copy}-${pl.key}`}
                onClick={() => onOpen(pl.origIdx, filtered)}
                className="imgph"
                style={{
                  position: "absolute",
                  left: copy * canvasW + pl.x,
                  top: pl.y,
                  width: pl.w,
                  height: pl.h,
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition:
                    "transform .35s cubic-bezier(.2,.7,.3,1), filter .35s, z-index 0s .35s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.filter = "brightness(1.08)";
                  e.currentTarget.style.zIndex = "5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.filter = "";
                  e.currentTarget.style.zIndex = "";
                }}
              >
                <img src={pl.p.src} alt={pl.p.title} loading="lazy" />
                <div className="label">{pl.p.exif.camera.toUpperCase()}</div>
                <div className="meta">
                  {pl.p.exif.focal} · {pl.p.exif.aperture} · {pl.p.exif.shutter}
                </div>
              </button>
            )),
          )}
        </div>
        {/* edge fades to soften the loop boundary */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 100,
            background: "linear-gradient(90deg, #0a0908 10%, transparent)",
            pointerEvents: "none",
            zIndex: 6,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: 100,
            background: "linear-gradient(270deg, #0a0908 10%, transparent)",
            pointerEvents: "none",
            zIndex: 6,
          }}
        />
      </div>

      <div
        style={{
          padding: "24px clamp(20px, 3vw, 36px) 0",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "var(--ink-soft)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span>{filtered.length} FRAMES · LOOPING</span>
        <span>CLICK TO ENLARGE</span>
      </div>
    </section>
  );
}
