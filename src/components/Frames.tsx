// Photo gallery as three horizontally-scrolling rows of different heights
// and opposing scroll speeds. Each photo's width is its natural aspect
// ratio times the row height, so a landscape shot reads as a landscape
// rectangle and a portrait reads as a portrait. Within a row there is
// zero whitespace by construction (it's just photos chained at fixed
// height). The parallax of three different speeds + alternating scroll
// directions reads as a 2D collage rather than tidy horizontal rows.

import { useState } from "react";
import { GALLERY_PHOTOS, type GalleryPhoto } from "../photos";
import { Reveal } from "./Reveal";
import { Atmosphere } from "./Atmosphere";
import { useIsMobile } from "../hooks/useMediaQuery";

type Row = {
  height: number;
  duration: string; // CSS animation duration
  direction: "ltr" | "rtl";
};

// Three rows, varied heights for visual rhythm. Top + bottom scroll one
// way, middle scrolls the other way at a different speed — produces the
// parallax that breaks the "rows scrolling" feel. Heights tuned to fit
// inside a 1080p viewport once the section header + footer are added.
const ROWS_DESKTOP: Row[] = [
  { height: 200, duration: "85s", direction: "rtl" },
  { height: 150, duration: "70s", direction: "ltr" },
  { height: 200, duration: "95s", direction: "rtl" },
];

// Tighter rows on mobile so the gallery fits inside a typical phone
// viewport without dominating the page.
const ROWS_MOBILE: Row[] = [
  { height: 130, duration: "60s", direction: "rtl" },
  { height: 100, duration: "50s", direction: "ltr" },
  { height: 130, duration: "70s", direction: "rtl" },
];

const ROW_GAP = 8;
const PHOTO_GAP = 6;

// Width a photo would occupy in a given row given its native aspect.
const photoWidth = (p: GalleryPhoto, rowH: number) => Math.round(p.aspect * rowH);

// Distribute photos across rows. Portraits and landscapes are interleaved
// so each row gets a mix of orientations rather than a clump of all-tall
// or all-wide. Each row's content is then repeated until it's wide enough
// for the marquee to feel populated even with a small photo set.
function distributeRows(list: GalleryPhoto[], rows: Row[]): GalleryPhoto[][] {
  if (list.length === 0) return rows.map(() => []);
  // Interleave portraits and landscapes
  const portraits = list.filter((p) => p.aspect < 0.95);
  const landscapes = list.filter((p) => p.aspect >= 0.95);
  const interleaved: GalleryPhoto[] = [];
  let pi = 0;
  let li = 0;
  while (pi < portraits.length || li < landscapes.length) {
    if (li < landscapes.length) interleaved.push(landscapes[li++]);
    if (pi < portraits.length) interleaved.push(portraits[pi++]);
  }
  const buckets: GalleryPhoto[][] = rows.map(() => []);
  interleaved.forEach((p, i) => {
    buckets[i % rows.length].push(p);
  });
  // Repeat each bucket so its content is wide enough that the marquee
  // duplication doesn't show obvious gaps with sparse photo sets.
  const TARGET_ROW_W = 2600;
  return buckets.map((bucket, ri) => {
    if (bucket.length === 0) return bucket;
    const rowH = rows[ri].height;
    const oneCycleW = bucket.reduce(
      (s, p) => s + photoWidth(p, rowH) + PHOTO_GAP,
      0,
    );
    const reps = Math.max(2, Math.ceil(TARGET_ROW_W / Math.max(oneCycleW, 1)));
    const out: GalleryPhoto[] = [];
    for (let r = 0; r < reps; r++) out.push(...bucket);
    return out;
  });
}

export function Frames({
  onOpen,
}: {
  onOpen: (idx: number, list: GalleryPhoto[]) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const isMobile = useIsMobile();
  const ROWS = isMobile ? ROWS_MOBILE : ROWS_DESKTOP;
  const BAND_H = ROWS.reduce((s, r) => s + r.height, 0) + (ROWS.length - 1) * ROW_GAP;

  const filtered =
    filter === "all"
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.exif.camera === filter);

  const cameras = Array.from(new Set(GALLERY_PHOTOS.map((p) => p.exif.camera)));

  const rowPhotos = distributeRows(filtered, ROWS);

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
            <span>SHOT ON FUJI X-T50 · X-S10 · IPHONE 15 PRO</span>
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
          height: BAND_H,
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {ROWS.map((row, rIdx) => {
          const photos = rowPhotos[rIdx];
          if (photos.length === 0) return null;
          // Total width of photos in this row (one copy worth)
          const rowWidth = photos.reduce((sum, p) => sum + photoWidth(p, row.height) + PHOTO_GAP, 0);
          const top = ROWS.slice(0, rIdx).reduce((s, r) => s + r.height + ROW_GAP, 0);
          const animName = row.direction === "rtl" ? "frames-rtl" : "frames-ltr";
          return (
            <div
              key={rIdx}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top,
                height: row.height,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "100%",
                  width: rowWidth * 2,
                  animation: `${animName} ${row.duration} linear infinite`,
                  willChange: "transform",
                }}
              >
                {[0, 1].map((copy) => {
                  let cursor = copy * rowWidth;
                  return photos.map((p, pi) => {
                    const w = photoWidth(p, row.height);
                    const x = cursor;
                    cursor += w + PHOTO_GAP;
                    const photoIdxInList = filtered.indexOf(p);
                    return (
                      <button
                        key={`${rIdx}-${copy}-${pi}`}
                        onClick={() => onOpen(photoIdxInList, filtered)}
                        className="imgph"
                        style={{
                          position: "absolute",
                          left: x,
                          top: 0,
                          width: w,
                          height: row.height,
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
                        <img src={p.src} alt={p.title} loading="lazy" />
                        <div className="label">{p.exif.camera.toUpperCase()}</div>
                        <div className="meta">
                          {p.exif.focal} · {p.exif.aperture} · {p.exif.shutter}
                        </div>
                      </button>
                    );
                  });
                })}
              </div>
            </div>
          );
        })}
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
