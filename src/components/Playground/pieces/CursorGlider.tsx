import { useEffect, useRef } from "react";
import { PieceFrame } from "../PieceFrame";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

const COMMITS = [
  "feat: ship cursor flock prototype",
  "fix: handle null trim on empty input",
  "refactor: collapse duplicate fetch helpers",
  "perf: memoize palette computation",
  "fix: race condition in resize observer",
  "chore: bump motion to v12",
  "feat: respect prefers-reduced-motion",
  "fix: off-by-one in column count",
  "refactor: extract canvas hooks",
  "fix: prevent scroll jump on focus",
  "perf: skip simulation when offscreen",
  "feat: warm espresso palette tokens",
  "fix: mobile touchstart not registering",
  "feat: weighted 9-point laplacian",
  "fix: dpr scaling on retina",
  "chore: add playwright review script",
  "feat: kaleidoscope quadratic smoothing",
  "fix: typing trainer wpm decay",
  "perf: cap velocity on particle field",
  "feat: side log for run history",
  "refactor: rename Lens to Playground",
  "fix: stuck mouseleave on iframe",
  "perf: skip raf when finished",
  "chore: drop unused tailwind preset",
];

export function CursorGlider() {
  return (
    <PieceFrame
      number="06"
      title="Cursor Glider"
      caption="Move your cursor up and down to fly. Slip through the gaps. Each wall you clear becomes a commit in your run log. Crash and the log freezes. That's your final commit."
      hint="click to start · move cursor up and down to steer"
    >
      <Glider />
    </PieceFrame>
  );
}

type Phase = "idle" | "play" | "crash";

function Glider() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef);
  const reduced = useReducedMotion();

  const inViewRef = useRef(inView);
  const reducedRef = useRef(reduced);
  useEffect(() => {
    inViewRef.current = inView;
  }, [inView]);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let logW = 0;
    let gameW = 0;
    let dirty = true;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      logW = Math.min(280, Math.max(180, W * 0.3));
      gameW = W - logW;
      dirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    type Wall = { x: number; gapY: number; gapH: number; msg: string; passed: boolean };

    const bird = { x: 70, y: 0, vy: 0, targetY: 0 };
    let walls: Wall[] = [];
    let lastSpawn = 0;
    let speed = 2.4;
    let logEntries: string[] = [];
    let scoreLocal = 0;
    let phase: Phase = "idle";
    let runStart = 0;
    const wallW = 26;
    const birdR = 11;

    const initBird = () => {
      bird.y = H / 2;
      bird.targetY = H / 2;
      bird.vy = 0;
    };
    initBird();

    const restart = () => {
      walls = [];
      logEntries = [];
      scoreLocal = 0;
      speed = 2.4;
      lastSpawn = 0;
      runStart = performance.now();
      initBird();
      phase = "play";
      dirty = true;
    };

    const spawn = (now: number) => {
      const minGap = 110;
      const maxGap = 180;
      const gapH = Math.max(minGap, maxGap - scoreLocal * 3);
      const margin = 28;
      const gapY = margin + Math.random() * (H - gapH - margin * 2);
      const msg = COMMITS[Math.floor(Math.random() * COMMITS.length)];
      walls.push({ x: gameW, gapY, gapH, msg, passed: false });
      lastSpawn = now;
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      // only steer when cursor is over the gameplay area
      if (x < gameW) bird.targetY = e.clientY - r.top;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const r = canvas.getBoundingClientRect();
      const x = t.clientX - r.left;
      if (x < gameW) bird.targetY = t.clientY - r.top;
    };
    const startOrRetry = () => {
      if (phase === "idle" || phase === "crash") restart();
    };
    const onClick = () => startOrRetry();
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === " " || e.key === "Enter") && (phase === "idle" || phase === "crash")) {
        e.preventDefault();
        startOrRetry();
      }
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    canvas.addEventListener("touchstart", onTouch, { passive: true });
    canvas.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);

    const drawBackground = () => {
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(0, 0, W, H);
      // faint grid stripes in gameplay area
      ctx.fillStyle = "rgba(242, 235, 227, 0.025)";
      for (let y = 0; y < H; y += 28) {
        ctx.fillRect(0, y, gameW, 1);
      }
    };

    const drawWalls = () => {
      ctx.font = `12px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";
      for (const w of walls) {
        ctx.fillStyle = w.passed ? "#1f3a23" : "#264a2c";
        ctx.fillRect(w.x, 0, wallW, w.gapY);
        ctx.fillRect(w.x, w.gapY + w.gapH, wallW, H - (w.gapY + w.gapH));
        ctx.fillStyle = w.passed ? "#3a6a44" : "#4a8a55";
        for (let py = 4; py < w.gapY; py += 14) {
          ctx.fillText("█", w.x + 7, py);
        }
        for (let py = w.gapY + w.gapH + 2; py < H - 4; py += 14) {
          ctx.fillText("█", w.x + 7, py);
        }
      }
    };

    const drawBird = () => {
      ctx.save();
      const tilt = Math.max(-0.5, Math.min(0.6, bird.vy * 0.06));
      ctx.translate(bird.x, bird.y);
      ctx.rotate(tilt);
      ctx.fillStyle = "#e85d38";
      ctx.font = `bold 22px "JetBrains Mono", monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText("▶", 0, 0);
      ctx.restore();
      // soft glow
      ctx.beginPath();
      ctx.arc(bird.x, bird.y, birdR + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(232, 93, 56, 0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawHud = () => {
      ctx.font = `10px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(242, 235, 227, 0.55)";
      ctx.fillText(`SCORE ${String(scoreLocal).padStart(3, "0")}`, 14, 14);
      if (phase === "play") {
        const t = ((performance.now() - runStart) / 1000).toFixed(1);
        ctx.fillText(`TIME ${t}s`, 14, 30);
      }
    };

    const drawLog = () => {
      // divider
      ctx.strokeStyle = "rgba(242, 235, 227, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gameW + 0.5, 0);
      ctx.lineTo(gameW + 0.5, H);
      ctx.stroke();

      const padX = gameW + 16;
      ctx.font = `10px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(242, 235, 227, 0.45)";
      ctx.fillText("RUN LOG", padX, 14);
      ctx.fillStyle = "rgba(242, 235, 227, 0.25)";
      ctx.fillText(`${logEntries.length} entries`, padX, 28);

      ctx.font = `11px "JetBrains Mono", monospace`;
      const startY = 56;
      const lineH = 17;
      const maxLines = Math.floor((H - startY - 16) / lineH);
      const offset = Math.max(0, logEntries.length - maxLines);
      const maxWidth = logW - 32;
      for (let i = offset; i < logEntries.length; i++) {
        const y = startY + (i - offset) * lineH;
        const isCrash = phase === "crash" && i === logEntries.length - 1;
        ctx.fillStyle = isCrash ? "#e85d38" : "rgba(242, 235, 227, 0.78)";
        const prefix = isCrash ? "× " : "✓ ";
        let text = prefix + logEntries[i];
        while (ctx.measureText(text).width > maxWidth && text.length > 5) {
          text = text.slice(0, -2) + "…";
        }
        ctx.fillText(text, padX, y);
      }
    };

    const drawOverlay = () => {
      if (phase === "play") return;
      ctx.fillStyle = "rgba(10, 10, 12, 0.72)";
      ctx.fillRect(0, 0, gameW, H);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const cx = gameW / 2;
      if (phase === "idle") {
        ctx.fillStyle = "#f2ebe3";
        ctx.font = `bold 14px "JetBrains Mono", monospace`;
        ctx.fillText("CLICK TO START", cx, H / 2 - 12);
        ctx.fillStyle = "rgba(242, 235, 227, 0.6)";
        ctx.font = `11px "JetBrains Mono", monospace`;
        ctx.fillText("move your cursor up and down to fly", cx, H / 2 + 12);
      } else {
        ctx.fillStyle = "#e85d38";
        ctx.font = `bold 14px "JetBrains Mono", monospace`;
        ctx.fillText(`CRASHED · ${scoreLocal} commit${scoreLocal === 1 ? "" : "s"}`, cx, H / 2 - 12);
        ctx.fillStyle = "rgba(242, 235, 227, 0.7)";
        ctx.font = `11px "JetBrains Mono", monospace`;
        ctx.fillText("click or press space to retry", cx, H / 2 + 12);
      }
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
    };

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const active = inViewRef.current && !reducedRef.current;

      if (!active) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (phase === "play") {
        // bird physics: spring towards target with damping
        const dy = bird.targetY - bird.y;
        bird.vy = bird.vy * 0.78 + dy * 0.16;
        bird.y += bird.vy;
        if (bird.y < birdR) {
          bird.y = birdR;
          bird.vy = 0;
        }
        if (bird.y > H - birdR) {
          bird.y = H - birdR;
          bird.vy = 0;
        }

        const interval = Math.max(900, 1700 - scoreLocal * 28);
        if (now - lastSpawn > interval) spawn(now);

        for (const w of walls) {
          w.x -= speed;
          if (!w.passed && w.x + wallW < bird.x - birdR) {
            w.passed = true;
            scoreLocal++;
            logEntries.push(w.msg);
          }
        }
        while (walls.length && walls[0].x + wallW < -40) walls.shift();

        for (const w of walls) {
          if (bird.x + birdR > w.x && bird.x - birdR < w.x + wallW) {
            if (bird.y - birdR < w.gapY || bird.y + birdR > w.gapY + w.gapH) {
              const elapsed = ((now - runStart) / 1000).toFixed(1);
              logEntries.push(`CRASH after ${elapsed}s · ${scoreLocal} commit${scoreLocal === 1 ? "" : "s"}`);
              phase = "crash";
              dirty = true;
              break;
            }
          }
        }

        speed = Math.min(4.5, 2.4 + scoreLocal * 0.045);
      }

      // In play we draw every frame (bird moves). In idle/crash, only when dirty.
      if (phase === "play" || dirty) {
        drawBackground();
        drawWalls();
        drawBird();
        drawHud();
        drawLog();
        drawOverlay();
        dirty = false;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onTouch);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="w-full aspect-[16/9] md:aspect-[21/9] bg-black overflow-hidden relative cursor-crosshair"
      style={{ touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
