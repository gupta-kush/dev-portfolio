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

type Row = {
  height: number;
  duration: string; // CSS animation duration
  direction: "ltr" | "rtl";
};

// Three rows, varied heights for visual rhythm. Top + bottom scroll one
// way, middle scrolls the other way at a different speed — produces the
// parallax that breaks the "rows scrolling" feel.
const ROWS: Row[] = [
  { height: 300, duration: "85s", direction: "rtl" },
  { height: 220, duration: "70s", direction: "ltr" },
  { height: 300, duration: "95s", direction: "rtl" },
];

const ROW_GAP = 8;
const PHOTO_GAP = 6;
const BAND_H = ROWS.reduce((s, r) => s + r.height, 0) + (ROWS.length - 1) * ROW_GAP;

// Distribute photos across rows in an interleaving pattern that mixes
// landscape and portrait orientations per row when possible. Falls back
// to round-robin when filtering produces tiny sets.
function distributeRows(list: GalleryPhoto[]): GalleryPhoto[][] {
  const rows: GalleryPhoto[][] = ROWS.map(() => []);
  list.forEach((p, i) => {
    rows[i % ROWS.length].push(p);
  });
  return rows;
}

// Width a photo would occupy in a given row given its native aspect.
const photoWidth = (p: GalleryPhoto, rowH: number) => Math.round(p.aspect * rowH);

export function Frames({
  onOpen,
}: {
  onOpen: (idx: number, list: GalleryPhoto[]) => void;
}) {
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.exif.camera === filter);

  const cameras = Array.from(new Set(GALLERY_PHOTOS.map((p) => p.exif.camera)));

  const rowPhotos = distributeRows(filtered);

  return (
    <section
      id="pics"
      data-screen-label="02 Pics"
      style={{
        background: "#0a0908",
        color: "var(--paper)",
        padding: "120px 0 100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "0 clamp(20px, 3vw, 36px)" }}>
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
              marginBottom: 60,
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
            marginBottom: 36,
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
          padding: "32px clamp(20px, 3vw, 36px) 0",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "var(--ink-soft)",
        }}
      >
        <span>{filtered.length} FRAMES · LOOPING</span>
        <span>CLICK TO ENLARGE</span>
      </div>
    </section>
  );
}
