// Full-screen photo viewer with keyboard nav.

import { useEffect } from "react";
import type { GalleryPhoto } from "../photos";

type Props = {
  photos: GalleryPhoto[];
  idx: number | null;
  onClose: () => void;
  onNav: (delta: number) => void;
};

export function Lightbox({ photos, idx, onClose, onNav }: Props) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNav(-1);
      if (e.key === "ArrowRight") onNav(1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose, onNav]);

  if (idx === null) return null;
  const p = photos[idx];
  if (!p) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(8,7,6,0.94)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={p.src.replace("w=1200", "w=2000")}
          alt={p.title}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
        <div
          style={{
            position: "absolute",
            top: -32,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,.7)",
          }}
        >
          <span>
            {p.exif.camera} · {p.exif.focal} · {p.exif.aperture} · {p.exif.shutter} · ISO {p.exif.iso}
          </span>
          <span>
            {idx + 1} / {photos.length}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
          style={{
            position: "absolute",
            top: -36,
            right: -36,
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 32,
            cursor: "pointer",
          }}
        >
          ×
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNav(-1);
          }}
          aria-label="Previous"
          style={{
            position: "absolute",
            left: -50,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "1px solid rgba(255,255,255,.4)",
            color: "#fff",
            width: 44,
            height: 44,
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ←
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNav(1);
          }}
          aria-label="Next"
          style={{
            position: "absolute",
            right: -50,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "1px solid rgba(255,255,255,.4)",
            color: "#fff",
            width: 44,
            height: 44,
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
