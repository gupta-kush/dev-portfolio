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
      caption="Draw with your cursor. Six mirrored axes do the rest. There is no undo. Don't worry about it — embarrassment is a fast way to learn what you actually wanted."
      hint="drag inside the frame · the harder you press, the more you commit"
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
    let lastX = 0;
    let lastY = 0;

    const drawSegment = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const dx1 = x1 - cx, dy1 = y1 - cy;
      const dx2 = x2 - cx, dy2 = y2 - cy;
      for (let s = 0; s < SEGMENTS; s++) {
        const angle = (Math.PI * 2 * s) / SEGMENTS;
        const cs = Math.cos(angle);
        const sn = Math.sin(angle);
        for (let m = 0; m < 2; m++) {
          const sign = m === 0 ? 1 : -1;
          const rx1 = dx1 * cs - dy1 * sign * sn + cx;
          const ry1 = dx1 * sn + dy1 * sign * cs + cy;
          const rx2 = dx2 * cs - dy2 * sign * sn + cx;
          const ry2 = dx2 * sn + dy2 * sign * cs + cy;
          ctx.strokeStyle = m === 0 ? "#1a1514" : accent;
          ctx.lineWidth = m === 0 ? 1.6 : 1.2;
          ctx.beginPath();
          ctx.moveTo(rx1, ry1);
          ctx.lineTo(rx2, ry2);
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
      lastX = p.x;
      lastY = p.y;
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return;
      const p = getPos(e);
      drawSegment(lastX, lastY, p.x, p.y);
      lastX = p.x;
      lastY = p.y;
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
