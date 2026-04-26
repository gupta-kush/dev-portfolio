// Slim ambient transition strip between sections. Replaces the labelled
// distortion bands. Each instance is 56px tall, sits flush at the boundary,
// and gradients its background between the two sections so the seam reads
// as film bleeding from one frame into the next. A scroll-driven CSS var
// (--peak: 0..1) ramps each effect as the seam crosses viewport center.
//
// All effects are CSS-only and update once per frame via a single passive
// scroll listener, no re-renders.

import { useEffect, useRef, type CSSProperties } from "react";

export type SeamKind = "leak" | "grain" | "chroma" | "displace";

type Props = {
  kind: SeamKind;
  /** Background colour at the top of the strip (matches the previous section). */
  from: string;
  /** Background colour at the bottom of the strip (matches the next section). */
  to: string;
  /** Override the default 56px height. */
  height?: number;
};

export function Seam({ kind, from, to, height = 56 }: Props) {
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

  const baseStyle: CSSProperties = {
    position: "relative",
    height,
    overflow: "hidden",
    background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
  };

  return (
    <div ref={ref} data-seam={kind} style={baseStyle}>
      <Effect kind={kind} />
      {/* central scan line — peaks with proximity */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--accent) 50%, transparent)",
          opacity: "calc(var(--peak) * 0.55)",
          transform: "translateY(-0.5px)",
        }}
      />
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
            "radial-gradient(ellipse 70% 140% at calc(20% + var(--p) * 60%) 50%, rgba(255,184,107, calc(var(--peak) * 0.65)) 0%, rgba(255,122,69, calc(var(--peak) * 0.25)) 25%, transparent 65%)",
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
          opacity: "calc(var(--peak) * 0.7)",
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
            background: "linear-gradient(90deg, rgba(255,0,80,.55), transparent 55%)",
            opacity: "var(--peak)",
            transform: "translateX(calc(var(--peak) * -16px))",
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(270deg, rgba(0,180,255,.55), transparent 55%)",
            opacity: "var(--peak)",
            transform: "translateX(calc(var(--peak) * 16px))",
            mixBlendMode: "screen",
          }}
        />
      </>
    );
  }
  // displace — subtle vertical shear via a few skewed strips
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateRows: "repeat(4, 1fr)",
        pointerEvents: "none",
      }}
    >
      {[...Array(4)].map((_, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        return (
          <div
            key={i}
            style={{
              background: "rgba(255,184,107, calc(var(--peak) * 0.06))",
              borderBottom: "1px solid rgba(255,255,255,calc(var(--peak) * 0.05))",
              transform: `translateX(calc((var(--p) - 0.5) * ${60 * dir}px)) skewX(calc(var(--peak) * ${dir * 1.4}deg))`,
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
}
