// Subtle ambient overlay placed at the top of a section as an absolute-
// positioned strip. Sections butt directly against each other (no layout
// space taken), but a quiet scroll-driven effect ramps as the strip
// crosses viewport center, so transitions still have texture.
//
// One passive scroll listener per atmosphere writes CSS variables; effects
// are pure CSS-var-driven so there are no re-renders.

import { useEffect, useRef, type CSSProperties } from "react";

export type AtmosphereKind = "leak" | "grain" | "chroma" | "displace";

type Props = {
  kind: AtmosphereKind;
  /** Override the default 220px strip height. */
  height?: number;
};

export function Atmosphere({ kind, height = 220 }: Props) {
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height,
    pointerEvents: "none",
    zIndex: 0,
    overflow: "hidden",
  };

  return (
    <div ref={ref} data-atmosphere={kind} aria-hidden style={baseStyle}>
      <Effect kind={kind} />
    </div>
  );
}

// Effects are deliberately quiet — peak opacities ~0.10–0.22. Should read
// as "something briefly pulsed across the seam" rather than a labelled
// transition band.
function Effect({ kind }: { kind: AtmosphereKind }) {
  if (kind === "leak") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 100% at calc(20% + var(--p) * 60%) 50%, rgba(255,184,107, calc(var(--peak) * 0.18)) 0%, rgba(255,122,69, calc(var(--peak) * 0.07)) 30%, transparent 70%)",
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
          opacity: "calc(var(--peak) * 0.22)",
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
            background: "linear-gradient(90deg, rgba(255,0,80,.22), transparent 60%)",
            opacity: "calc(var(--peak) * 0.4)",
            transform: "translateX(calc(var(--peak) * -16px))",
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(270deg, rgba(0,180,255,.22), transparent 60%)",
            opacity: "calc(var(--peak) * 0.4)",
            transform: "translateX(calc(var(--peak) * 16px))",
            mixBlendMode: "screen",
          }}
        />
      </>
    );
  }
  // displace — slight horizontal sway
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
              background: "rgba(255,184,107, calc(var(--peak) * 0.025))",
              transform: `translateX(calc((var(--p) - 0.5) * ${60 * dir}px)) skewX(calc(var(--peak) * ${dir * 1}deg))`,
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
}
