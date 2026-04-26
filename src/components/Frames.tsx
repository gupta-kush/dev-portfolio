// Photo gallery as a continuous mosaic marquee. Column-based shelf packer:
// each column picks one of four slot patterns (1 tall · 3 stacked · 2+1 ·
// 1+2) and a column width within a pattern-specific range. Photos use
// object-fit: cover so each tile fills its slot exactly. By construction
// there is no whitespace between tiles within a column, and columns sit
// flush against each other with only a uniform gap.

import { useState } from "react";
import { GALLERY_PHOTOS, type GalleryPhoto } from "../photos";
import { Reveal } from "./Reveal";

const ROWS = 4;
const ROW_H = 200;
const GAP = 8;
const BAND_H = ROWS * ROW_H + (ROWS - 1) * GAP;

const seed = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

type Tile = { p: GalleryPhoto; x: number; y: number; w: number; h: number };

// Skyline packer with min-x placement. For each photo we try every valid
// row offset, compute the resulting x as max(cursor[row..row+span]), and
// pick the offset with smallest x (tie-break: smallest y for top-first).
// This avoids the staircase voids the old packer hit when a multi-row
// photo started inside a row that was further along than its neighbours.
//
// Span and width are seeded per-photo so each photo independently chooses
// a shape — not coupled to a column-pattern. The resulting layout reads
// as a proper collage rather than tidy 1-3 photo columns.
function buildPlacements(list: GalleryPhoto[]): { tiles: Tile[]; totalW: number } {
  const cursor = new Array(ROWS).fill(0);
  const tiles: Tile[] = [];
  list.forEach((p, idx) => {
    const s = seed(p.src + ":" + idx);
    const r = s % 100;
    // weighted span distribution: 1-row 50%, 2-row 30%, 3-row 20%
    const span = r < 50 ? 1 : r < 80 ? 2 : 3;
    // wider width pool than before — portrait-y when span is large, lots
    // of variety when span is 1. avoids the old "every column is 280-460"
    // feel.
    const widthOpts =
      span === 1
        ? [220, 280, 340, 400, 460, 540]
        : span === 2
          ? [220, 280, 340, 420, 500]
          : [200, 260, 320, 380];
    const w = widthOpts[(s >> 5) % widthOpts.length];

    let bestRow = 0;
    let bestX = Infinity;
    for (let i = 0; i + span <= ROWS; i++) {
      let x = 0;
      for (let j = i; j < i + span; j++) x = Math.max(x, cursor[j]);
      if (x < bestX) {
        bestX = x;
        bestRow = i;
      }
    }
    const x = bestX;
    const y = bestRow * (ROW_H + GAP);
    const h = span * ROW_H + (span - 1) * GAP;
    tiles.push({ p, x, y, w, h });
    for (let i = bestRow; i < bestRow + span; i++) cursor[i] = x + w + GAP;
  });
  // pad cursors so all rows end at the same x — the marquee loop then
  // sees a uniform total width regardless of which row finished latest.
  const totalW = Math.max(...cursor);
  return { tiles, totalW };
}

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

  const { tiles, totalW } = buildPlacements(filtered);

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

      <div style={{ position: "relative", width: "100%", height: BAND_H, overflow: "hidden" }}>
        <div
          style={{
            position: "relative",
            height: "100%",
            width: totalW * 2,
            animation: "mosaic-marq 140s linear infinite",
          }}
        >
          {[0, 1].map((copy) =>
            tiles.map((t, i) => (
              <button
                key={`${copy}-${i}`}
                onClick={() => onOpen(filtered.indexOf(t.p), filtered)}
                className="imgph"
                style={{
                  position: "absolute",
                  left: t.x + copy * totalW,
                  top: t.y,
                  width: t.w,
                  height: t.h,
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
                <img src={t.p.src} alt={t.p.title} loading="lazy" />
                <div className="label">{t.p.exif.camera.toUpperCase()}</div>
                <div className="meta">
                  {t.p.exif.focal} · {t.p.exif.aperture} · {t.p.exif.shutter}
                </div>
              </button>
            )),
          )}
        </div>
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
