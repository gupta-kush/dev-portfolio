import { useEffect, useMemo, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { PieceFrame, PieceAction } from "../PieceFrame";

const SEGMENTS = 6;

export function Kaleidoscope() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <PieceFrame
      number="04"
      title="Kaleidoscope Pad"
      caption="Drag to draw. Whatever you do gets mirrored across six axes. The accent color is random per session."
      hint="drag inside the frame · clear to start over"
      actions={
        <PieceAction onClick={() => setResetKey((k) => k + 1)} label="Clear">
          <Eraser size={12} strokeWidth={1.5} />
          <span>Clear</span>
        </PieceAction>
      }
    >
      <Pad key={resetKey} />
    </PieceFrame>
  );
}

function Pad() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const accent = useMemo(() => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 65%, 55%)`;
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;

    const fill = () => {
      ctx.fillStyle = "#f5ede1";
      ctx.fillRect(0, 0, W, H);
    };
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
      fill();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let drawing = false;
    let prevX = 0, prevY = 0;
    let prevMidX = 0, prevMidY = 0;

    // Draw a smooth quadratic curve from prevMid → control (prev) → newMid.
    // Mirrored across SEGMENTS radial axes and reflected along each.
    const drawSmoothSegment = (
      sx: number, sy: number, cxp: number, cyp: number, ex: number, ey: number
    ) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const transform = (px: number, py: number, cs: number, sn: number, sign: number) => {
        const dx = px - cx, dy = py - cy;
        return {
          x: dx * cs - dy * sign * sn + cx,
          y: dx * sn + dy * sign * cs + cy,
        };
      };
      for (let s = 0; s < SEGMENTS; s++) {
        const angle = (Math.PI * 2 * s) / SEGMENTS;
        const cs = Math.cos(angle);
        const sn = Math.sin(angle);
        for (let m = 0; m < 2; m++) {
          const sign = m === 0 ? 1 : -1;
          const a = transform(sx, sy, cs, sn, sign);
          const b = transform(cxp, cyp, cs, sn, sign);
          const c = transform(ex, ey, cs, sn, sign);
          ctx.strokeStyle = m === 0 ? "#1a1514" : accent;
          ctx.lineWidth = m === 0 ? 1.6 : 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(b.x, b.y, c.x, c.y);
          ctx.stroke();
        }
      }
    };

    const getPos = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      if ("touches" in e && e.touches[0]) {
        return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
      }
      const me = e as MouseEvent;
      return { x: me.clientX - r.left, y: me.clientY - r.top };
    };

    const start = (e: MouseEvent | TouchEvent) => {
      drawing = true;
      const p = getPos(e);
      prevX = p.x;
      prevY = p.y;
      prevMidX = p.x;
      prevMidY = p.y;
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return;
      const p = getPos(e);
      const midX = (prevX + p.x) / 2;
      const midY = (prevY + p.y) / 2;
      drawSmoothSegment(prevMidX, prevMidY, prevX, prevY, midX, midY);
      prevMidX = midX;
      prevMidY = midY;
      prevX = p.x;
      prevY = p.y;
    };
    const end = () => { drawing = false; };

    canvas.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: true });
    canvas.addEventListener("touchmove", (e) => { e.preventDefault(); move(e); }, { passive: false });
    canvas.addEventListener("touchend", end);

    return () => {
      ro.disconnect();
      canvas.removeEventListener("mousedown", start);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchend", end);
    };
  }, [accent]);

  return (
    <div
      ref={wrapRef}
      className="w-full aspect-[16/10] md:aspect-[21/10] bg-[#f5ede1] overflow-hidden relative"
      style={{ touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#1a1514]/40">
        accent · {accent}
      </div>
    </div>
  );
}
