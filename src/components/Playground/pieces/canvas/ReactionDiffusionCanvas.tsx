import { useEffect, useRef } from "react";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export interface RDPalette {
  bg: [number, number, number];
  fg: [number, number, number];
}

export interface ReactionDiffusionCanvasProps {
  gridW?: number;
  gridH?: number;
  feed?: number;
  kill?: number;
  diffA?: number;
  diffB?: number;
  steps?: number;
  interactive?: boolean;
  autoSeedInterval?: number;
  palette?: RDPalette;
  className?: string;
  ariaLabel?: string;
}

export interface ReactionDiffusionHandle {
  seedAt: (xNorm: number, yNorm: number, radius?: number) => void;
  clear: () => void;
}

const DEFAULT_PALETTE: RDPalette = {
  bg: [10, 10, 12],
  fg: [242, 235, 227],
};

export function ReactionDiffusionCanvas({
  gridW = 220,
  gridH = 130,
  feed = 0.054,
  kill = 0.062,
  diffA = 1.0,
  diffB = 0.5,
  steps = 8,
  interactive = true,
  autoSeedInterval = 0,
  palette = DEFAULT_PALETTE,
  className = "",
  ariaLabel = "Reaction-diffusion simulation",
}: ReactionDiffusionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const W = gridW;
    const H = gridH;
    const size = W * H;
    let A = new Float32Array(size);
    let B = new Float32Array(size);
    let A2 = new Float32Array(size);
    let B2 = new Float32Array(size);

    const reset = () => {
      A.fill(1);
      B.fill(0);
      for (let s = 0; s < 5; s++) {
        const sx = Math.floor(Math.random() * (W - 20)) + 10;
        const sy = Math.floor(Math.random() * (H - 20)) + 10;
        seed(sx, sy, 4);
      }
    };

    function seed(cx: number, cy: number, r: number) {
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          if (x * x + y * y > r * r) continue;
          const px = cx + x;
          const py = cy + y;
          if (px < 1 || py < 1 || px >= W - 1 || py >= H - 1) continue;
          const idx = py * W + px;
          A[idx] = 0.5;
          B[idx] = 0.25;
        }
      }
    }

    const step = () => {
      // Weighted 9-point Laplacian (Karl Sims): cardinals 0.2, diagonals 0.05, center -1.
      // Stable with dt=1.0 for Da=1.0, Db=0.5.
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          const lapA =
            A[i - 1] * 0.2 + A[i + 1] * 0.2 + A[i - W] * 0.2 + A[i + W] * 0.2 +
            A[i - W - 1] * 0.05 + A[i - W + 1] * 0.05 +
            A[i + W - 1] * 0.05 + A[i + W + 1] * 0.05 +
            A[i] * -1;
          const lapB =
            B[i - 1] * 0.2 + B[i + 1] * 0.2 + B[i - W] * 0.2 + B[i + W] * 0.2 +
            B[i - W - 1] * 0.05 + B[i - W + 1] * 0.05 +
            B[i + W - 1] * 0.05 + B[i + W + 1] * 0.05 +
            B[i] * -1;
          const a = A[i];
          const b = B[i];
          const abb = a * b * b;
          A2[i] = a + (diffA * lapA - abb + feed * (1 - a));
          B2[i] = b + (diffB * lapB + abb - (kill + feed) * b);
          if (A2[i] < 0) A2[i] = 0;
          if (A2[i] > 1) A2[i] = 1;
          if (B2[i] < 0) B2[i] = 0;
          if (B2[i] > 1) B2[i] = 1;
        }
      }
      const tA = A;
      A = A2;
      A2 = tA;
      const tB = B;
      B = B2;
      B2 = tB;
    };

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;
    const image = ctx.createImageData(W, H);
    const data = image.data;

    const render = () => {
      const [br, bg, bb] = palette.bg;
      const [fr, fg, fb] = palette.fg;
      for (let i = 0; i < size; i++) {
        const v = B[i];
        const t = Math.min(1, Math.max(0, v * 1.6));
        const r = br + (fr - br) * t;
        const g = bg + (fg - bg) * t;
        const b = bb + (fb - bb) * t;
        const o = i * 4;
        data[o] = r;
        data[o + 1] = g;
        data[o + 2] = b;
        data[o + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    };

    reset();
    render();

    let raf = 0;
    let lastSeed = performance.now();
    const stepsPerFrame = reduced ? 0 : steps;

    const tick = () => {
      if (inView && stepsPerFrame > 0) {
        for (let s = 0; s < stepsPerFrame; s++) step();
        if (autoSeedInterval > 0 && performance.now() - lastSeed > autoSeedInterval) {
          const sx = Math.floor(Math.random() * (W - 20)) + 10;
          const sy = Math.floor(Math.random() * (H - 20)) + 10;
          seed(sx, sy, 3 + Math.floor(Math.random() * 4));
          lastSeed = performance.now();
        }
        render();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      const x = ((clientX - rect.left) / rect.width) * W;
      const y = ((clientY - rect.top) / rect.height) * H;
      seed(Math.floor(x), Math.floor(y), 5);
    };

    canvas.addEventListener("mousedown", handleClick);
    canvas.addEventListener("touchstart", handleClick, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousedown", handleClick);
      canvas.removeEventListener("touchstart", handleClick);
    };
  }, [gridW, gridH, feed, kill, diffA, diffB, steps, interactive, autoSeedInterval, palette, inView, reduced]);

  return (
    <div ref={wrapRef} className={className}>
      <canvas
        ref={canvasRef}
        aria-label={ariaLabel}
        className="w-full h-full block"
      />
    </div>
  );
}
