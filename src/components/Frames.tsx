// Photo gallery as a continuous mosaic marquee. Column-based shelf packer:
// each column picks one of four slot patterns (1 tall · 3 stacked · 2+1 ·
// 1+2) and a column width within a pattern-specific range. Photos use
// object-fit: cover so each tile fills its slot exactly. By construction
// there is no whitespace between tiles within a column, and columns sit
// flush against each other with only a uniform gap.

import { useState } from "react";
import { GALLERY_PHOTOS, type GalleryPhoto } from "../photos";
import { Reveal } from "./Reveal";

const ROWS = 3;
const ROW_H = 200;
const GAP = 10;
const BAND_H = ROWS * ROW_H + (ROWS - 1) * GAP;

const seed = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

type Tile = { p: GalleryPhoto; x: number; y: number; w: number; h: number };

// Slot positions are in row-units. A pattern's slot count matches how many
// photos that column consumes. Each pattern declares its preferred width
// range so portrait-heavy columns stay narrower and stacked-short columns
// can stretch wider.
type Slot = { y: number; h: number };
type Pattern = { slots: Slot[]; minW: number; maxW: number };

const PATTERNS: Pattern[] = [
  { slots: [{ y: 0, h: 3 }], minW: 280, maxW: 380 }, // 1 tall portrait
  { slots: [{ y: 0, h: 1 }, { y: 1, h: 1 }, { y: 2, h: 1 }], minW: 320, maxW: 460 }, // 3 stacked
  { slots: [{ y: 0, h: 2 }, { y: 2, h: 1 }], minW: 320, maxW: 420 }, // 2 then 1
  { slots: [{ y: 0, h: 1 }, { y: 1, h: 2 }], minW: 320, maxW: 420 }, // 1 then 2
];

function buildPlacements(list: GalleryPhoto[]): { tiles: Tile[]; totalW: number } {
  const tiles: Tile[] = [];
  let cursorX = 0;
  let i = 0;
  let colIdx = 0;
  let lastPatIdx = -1;
  while (i < list.length) {
    const remaining = list.length - i;
    // pool of patterns whose slot count fits in remaining photos
    const valid = PATTERNS.map((p, idx) => ({ p, idx })).filter(
      ({ p }) => p.slots.length <= remaining,
    );
    // pick deterministically from photo seed + column index, avoid repeats
    const s = seed(list[i].src + ":" + colIdx);
    let choiceIdx = s % valid.length;
    if (valid.length > 1 && valid[choiceIdx].idx === lastPatIdx) {
      choiceIdx = (choiceIdx + 1) % valid.length;
    }
    const choice = valid[choiceIdx];
    const pat = choice.p;
    lastPatIdx = choice.idx;

    const colW = pat.minW + ((s >> 5) % (pat.maxW - pat.minW + 1));
    pat.slots.forEach((slot, k) => {
      tiles.push({
        p: list[i + k],
        x: cursorX,
        y: slot.y * (ROW_H + GAP),
        w: colW,
        h: slot.h * ROW_H + (slot.h - 1) * GAP,
      });
    });
    cursorX += colW + GAP;
    i += pat.slots.length;
    colIdx++;
  }
  return { tiles, totalW: cursorX };
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
