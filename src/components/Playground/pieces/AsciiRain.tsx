import { useEffect, useRef } from "react";
import { PieceFrame } from "../PieceFrame";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

const CHARS = "01abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ{}[]()<>/\\|=+-_*&^%$#@!?".split("");

export function AsciiRain() {
  return (
    <PieceFrame
      number="06"
      title="ASCII Rain"
      caption="The Snake game used to live here. It got demoted. This is what nineteen-ninety-nine looked like to nine-year-olds who hadn't seen The Matrix yet."
      hint="move your cursor through the stream · it parts around you"
    >
      <Rain />
    </PieceFrame>
  );
}

function Rain() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef);
  const reduced = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    const FONT_SIZE = 16;
    let columns = 0;
    let drops: number[] = [];
    let speeds: number[] = [];
    let lastChars: string[][] = [];

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.floor(W / FONT_SIZE);
      drops = Array.from({ length: columns }).map(() => Math.random() * -50);
      speeds = Array.from({ length: columns }).map(() => 0.4 + Math.random() * 0.9);
      lastChars = Array.from({ length: columns }).map(() => []);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const mouse = { x: -10000, y: -10000, inside: false };

    let raf = 0;
    const tick = () => {
      if (inView && !reduced) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.fillRect(0, 0, W, H);
        ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
        ctx.textBaseline = "top";

        for (let i = 0; i < columns; i++) {
          const x = i * FONT_SIZE;
          drops[i] += speeds[i];
          const y = drops[i] * FONT_SIZE;

          // distance to mouse for parting effect
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const parted = mouse.inside && dist < 90;

          const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
          lastChars[i].push(ch);
          if (lastChars[i].length > 30) lastChars[i].shift();

          if (!parted && y >= 0 && y <= H + FONT_SIZE) {
            // bright head
            ctx.fillStyle = "#d4f7d4";
            ctx.fillText(ch, x, y);
            // medium trail just above
            ctx.fillStyle = "#5cd16a";
            const aboveY = y - FONT_SIZE;
            const aboveCh = lastChars[i][lastChars[i].length - 2];
            if (aboveY >= 0 && aboveCh) ctx.fillText(aboveCh, x, aboveY);
          }

          if (y > H && Math.random() > 0.975) {
            drops[i] = Math.random() * -10;
            speeds[i] = 0.4 + Math.random() * 0.9;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.inside = true;
    };
    const onLeave = () => { mouse.inside = false; mouse.x = -10000; mouse.y = -10000; };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const r = canvas.getBoundingClientRect();
      mouse.x = t.clientX - r.left;
      mouse.y = t.clientY - r.top;
      mouse.inside = true;
    };
    const onTouchEnd = () => { mouse.inside = false; mouse.x = -10000; mouse.y = -10000; };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    canvas.addEventListener("touchstart", onTouch, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("touchmove", onTouch);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [inView, reduced]);

  return (
    <div
      ref={wrapRef}
      className="w-full aspect-[16/9] md:aspect-[21/9] bg-black overflow-hidden relative"
      style={{ touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
