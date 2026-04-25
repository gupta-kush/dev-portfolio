import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { PieceFrame, PieceAction } from "../PieceFrame";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function ParticleField() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <PieceFrame
      number="03"
      title="Particle Field"
      caption="A flow field with a thousand particles drifting through it. Move your cursor to push them around. Click and hold to push harder."
      hint="hover to nudge · click and hold to scatter"
      actions={
        <PieceAction onClick={() => setResetKey((k) => k + 1)} label="Reset">
          <RotateCcw size={12} strokeWidth={1.5} />
          <span>Reset</span>
        </PieceAction>
      }
    >
      <Field key={resetKey} />
    </PieceFrame>
  );
}

function Field() {
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
    const PARTICLE_COUNT = window.matchMedia("(max-width: 768px)").matches ? 600 : 1200;

    const xs = new Float32Array(PARTICLE_COUNT);
    const ys = new Float32Array(PARTICLE_COUNT);
    const vxs = new Float32Array(PARTICLE_COUNT);
    const vys = new Float32Array(PARTICLE_COUNT);

    const seed = () => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        xs[i] = Math.random() * W;
        ys[i] = Math.random() * H;
        vxs[i] = 0;
        vys[i] = 0;
      }
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
      seed();
      ctx.fillStyle = "#0b1014";
      ctx.fillRect(0, 0, W, H);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const mouse = { x: -1, y: -1, down: false, inside: false };

    const flowAngle = (x: number, y: number, t: number) => {
      const a =
        Math.sin(x * 0.0042 + t * 0.00012) +
        Math.cos(y * 0.0048 - t * 0.00018) +
        Math.sin((x + y) * 0.0028 + t * 0.00009);
      return a * 1.7;
    };

    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      if (inView && !reduced) {
        const t = performance.now() - t0;
        // Lower alpha = longer trails. 0.04 keeps them visible without blooming.
        ctx.fillStyle = "rgba(11, 16, 20, 0.04)";
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const angle = flowAngle(xs[i], ys[i], t);
          const fx = Math.cos(angle) * 0.14;
          const fy = Math.sin(angle) * 0.14;
          vxs[i] = vxs[i] * 0.93 + fx;
          vys[i] = vys[i] * 0.93 + fy;

          // Cursor forces apply only when actually inside the canvas, and only
          // press when held — hovering nudges gently, holding shoves hard.
          if (mouse.inside) {
            const dx = mouse.x - xs[i];
            const dy = mouse.y - ys[i];
            const d2 = dx * dx + dy * dy;
            if (d2 < 22000) {
              const inv = 1 / Math.sqrt(d2 + 1);
              const force = mouse.down ? -1.6 : -0.18;
              vxs[i] += dx * inv * force;
              vys[i] += dy * inv * force;
            }
          }

          // Velocity ceiling so wraps don't fling particles past the boundary.
          const sp = Math.hypot(vxs[i], vys[i]);
          if (sp > 3.2) {
            vxs[i] = (vxs[i] / sp) * 3.2;
            vys[i] = (vys[i] / sp) * 3.2;
          }

          xs[i] += vxs[i];
          ys[i] += vys[i];

          if (xs[i] < -4) xs[i] = W + 4;
          else if (xs[i] > W + 4) xs[i] = -4;
          if (ys[i] < -4) ys[i] = H + 4;
          else if (ys[i] > H + 4) ys[i] = -4;

          const speed = Math.min(1, sp * 0.7);
          const r = 120 + speed * 60;
          const g = 180 + speed * 40;
          const b = 210 + speed * 30;
          ctx.fillStyle = `rgba(${r|0}, ${g|0}, ${b|0}, ${0.55 + speed * 0.4})`;
          ctx.fillRect(xs[i], ys[i], 2.4, 2.4);
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
    const onLeave = () => { mouse.inside = false; };
    const onDown = () => { mouse.down = true; };
    const onUp = () => { mouse.down = false; };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const r = canvas.getBoundingClientRect();
      mouse.x = t.clientX - r.left;
      mouse.y = t.clientY - r.top;
      mouse.inside = true;
      mouse.down = true;
    };
    const onTouchEnd = () => { mouse.down = false; mouse.inside = false; };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    canvas.addEventListener("touchstart", onTouch, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchmove", onTouch);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [inView, reduced]);

  return (
    <div
      ref={wrapRef}
      className="w-full aspect-[16/9] md:aspect-[21/9] bg-[#0b1014] overflow-hidden relative"
      style={{ touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
