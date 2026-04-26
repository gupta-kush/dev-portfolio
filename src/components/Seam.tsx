// Wide ambient transition strip between sections. Gradients between the two
// adjacent section colours over a tall enough strip that the colour blend
// itself reads as the transition. A scroll-driven CSS var (--peak: 0..1)
// ramps a quiet per-kind effect on top — never assertive, just present.
//
// One passive scroll listener per seam writes CSS variables; effects are
// pure CSS-var-driven so there are no re-renders.

import { useEffect, useRef, type CSSProperties } from "react";

export type SeamKind = "leak" | "grain" | "chroma" | "displace";

type Props = {
  kind: SeamKind;
  /** Background colour at the top of the strip (matches the previous section). */
  from: string;
  /** Background colour at the bottom of the strip (matches the next section). */
  to: string;
  /** Override the default 130px height. */
  height?: number;
};

export function Seam({ kind, from, to, height = 130 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = 1 - (r.top + r.height / 2) / (vh + r.height / 2);
      const p = Math.max(0, Math.min(1, progress));
      const peak = Math.max(0, 1 - Math.abs(p - 0.5) * 2);
      el.style.setProperty("--peak", String(peak));
      el.style.setProperty("--p", String(p));
    };
    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // The wider the seam, the slower the colour transition reads — that does
  // most of the heavy lifting. Effects ride on top at low intensity.
  const baseStyle: CSSProperties = {
    position: "relative",
    height,
    overflow: "hidden",
    background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
  };

  return (
    <div ref={ref} data-seam={kind} style={baseStyle}>
      <Effect kind={kind} />
    </div>
  );
}

function Effect({ kind }: { kind: SeamKind }) {
  if (kind === "leak") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 90% at calc(20% + var(--p) * 60%) 50%, rgba(255,184,107, calc(var(--peak) * 0.32)) 0%, rgba(255,122,69, calc(var(--peak) * 0.12)) 30%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
    );
  }
  if (kind === "grain") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: "calc(var(--peak) * 0.4)",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='1.4' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 1, 0 0 0 0 0.94, 0 0 0 0 0.84, 0 0 0 1.4 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: "overlay",
        }}
      />
    );
  }
  if (kind === "chroma") {
    return (
      <>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(255,0,80,.32), transparent 60%)",
            opacity: "calc(var(--peak) * 0.55)",
            transform: "translateX(calc(var(--peak) * -22px))",
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(270deg, rgba(0,180,255,.32), transparent 60%)",
            opacity: "calc(var(--peak) * 0.55)",
            transform: "translateX(calc(var(--peak) * 22px))",
            mixBlendMode: "screen",
          }}
        />
      </>
    );
  }
  // displace — gentle vertical shear via a few skewed strips
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateRows: "repeat(6, 1fr)",
        pointerEvents: "none",
      }}
    >
      {[...Array(6)].map((_, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        return (
          <div
            key={i}
            style={{
              background: "rgba(255,184,107, calc(var(--peak) * 0.04))",
              transform: `translateX(calc((var(--p) - 0.5) * ${80 * dir}px)) skewX(calc(var(--peak) * ${dir * 1.6}deg))`,
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
}
