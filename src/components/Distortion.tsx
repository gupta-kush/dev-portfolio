// Scroll-driven distortion bands. Real SVG turbulence + displacement maps
// warp the label as you cross the band; chromatic aberration ramps with
// scroll peak; per-kind overlays add character. CSS-only, GPU-light.
//
// Animation strategy: a single passive scroll listener writes CSS variables
// (--peak, --p) on the band element and updates the SVG displacement scale
// via setAttribute. We never re-render — all visuals are driven by CSS.

import { useEffect, useRef } from "react";

export type DistortionKind = "displace" | "leak" | "grain" | "chroma";

const LABELS: Record<DistortionKind, string> = {
  displace: "DISPLACEMENT",
  leak: "LIGHT LEAK",
  grain: "GRAIN BLOOM",
  chroma: "CHROMATIC SHUTTER",
};

// Shared SVG <defs> block, mounted once into the document. Each band picks
// the appropriate filter id; the displacement scale is updated per-band on
// scroll via setAttribute, so multiple bands can warp at different rates.
function FilterDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
      aria-hidden
    >
      <defs>
        {/* gentle warp for the label — coarse turbulence so glyphs ripple */}
        <filter id="ap-displace" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="3" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="0" id="ap-displace-map" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* heavy warp for displace-kind hero text */}
        <filter id="ap-warp" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.06" numOctaves="3" seed="7" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="0" id="ap-warp-map" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* heavy grain — additive noise overlay */}
        <filter id="ap-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="9" />
          <feColorMatrix values="0 0 0 0 1, 0 0 0 0 0.95, 0 0 0 0 0.85, 0 0 0 1.4 0" />
        </filter>
      </defs>
    </svg>
  );
}

let defsMounted = false;

export function Distortion({ kind, desc }: { kind: DistortionKind; desc: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Find the per-instance displacement-map node (we set unique ids when
    // rendering multiple bands of the same kind via a counter).
    const dispMap = el.querySelector<SVGFEDisplacementMapElement>("[data-disp-map]");

    let raf = 0;
    let scheduled = false;

    const compute = () => {
      scheduled = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when band sits at viewport bottom, 1 when at top.
      const progress = 1 - (r.top + r.height / 2) / (vh + r.height / 2);
      const p = Math.max(0, Math.min(1, progress));
      const peak = Math.max(0, 1 - Math.abs(p - 0.5) * 2);
      el.style.setProperty("--p", String(p));
      el.style.setProperty("--peak", String(peak));
      // Drive SVG displacement scale directly — CSS vars don't reach SVG attrs.
      if (dispMap) {
        const maxScale = kind === "displace" ? 90 : 35;
        dispMap.setAttribute("scale", String(peak * maxScale));
      }
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [kind]);

  // Only the first band on the page mounts the shared <defs>.
  const showDefs = !defsMounted;
  if (showDefs) defsMounted = true;

  const label = LABELS[kind];

  return (
    <div
      ref={ref}
      data-distortion={kind}
      style={
        {
          position: "relative",
          height: 320,
          background: "var(--ink)",
          overflow: "hidden",
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
          // CSS vars updated by the scroll listener.
          ["--p" as string]: 0,
          ["--peak" as string]: 0,
        } as CSSProperties
      }
    >
      {showDefs && <FilterDefs />}

      {/* per-kind backdrop layer */}
      <KindLayer kind={kind} />

      {/* horizontal scan strips — skew with peak, slide with p */}
      <ScanStrips />

      {/* the label, warped by SVG turbulence + chromatic-split overlay */}
      <DistortionLabel kind={kind} label={label} desc={desc} />
    </div>
  );
}

// CSSProperties is needed for the inline-vars declaration above.
type CSSProperties = React.CSSProperties;
import type React from "react";

function KindLayer({ kind }: { kind: DistortionKind }) {
  if (kind === "displace") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,184,107, calc(var(--peak) * 0.22)) 0%, transparent 55%, rgba(0,0,0, calc(var(--peak) * 0.45)) 100%)",
          mixBlendMode: "screen",
        }}
      />
    );
  }
  if (kind === "leak") {
    return (
      <>
        {/* warm light flare that sweeps across as you scroll past */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 70% at calc(20% + var(--p) * 60%) 50%, rgba(255,122,69, calc(var(--peak) * 0.85)) 0%, rgba(255,184,107, calc(var(--peak) * 0.4)) 18%, transparent 55%)",
            mixBlendMode: "screen",
          }}
        />
        {/* vertical bright slit travelling left-to-right */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 8,
            left: "calc(var(--p) * 100%)",
            background: "linear-gradient(180deg, transparent, rgba(255,210,150,0.95), transparent)",
            opacity: "var(--peak)",
            filter: "blur(6px)",
            transform: "translateX(-50%)",
            mixBlendMode: "screen",
          }}
        />
      </>
    );
  }
  if (kind === "grain") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: "calc(var(--peak) * 0.95)",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='1.6' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 1, 0 0 0 0 0.95, 0 0 0 0 0.85, 0 0 0 1.4 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: "screen",
        }}
      />
    );
  }
  // chroma
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(255,0,80,.6), transparent 55%)",
          opacity: "var(--peak)",
          mixBlendMode: "screen",
          transform: "translateX(calc(var(--peak) * -28px))",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(270deg, rgba(0,180,255,.6), transparent 55%)",
          opacity: "var(--peak)",
          mixBlendMode: "screen",
          transform: "translateX(calc(var(--peak) * 28px))",
        }}
      />
    </>
  );
}

function ScanStrips() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateRows: "repeat(10, 1fr)",
        pointerEvents: "none",
      }}
    >
      {[...Array(10)].map((_, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        return (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.025)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              transform: `translateX(calc((var(--p) - 0.5) * ${120 * dir}px)) skewX(calc(var(--peak) * ${dir * 3}deg))`,
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
}

function DistortionLabel({
  kind,
  label,
  desc,
}: {
  kind: DistortionKind;
  label: string;
  desc: string;
}) {
  // The hero text is wrapped in a <g> with the SVG filter applied. The
  // filter scale is updated by the scroll listener on the parent.
  const filterId = kind === "displace" ? "ap-warp" : "ap-displace";
  const dispMapId = kind === "displace" ? "ap-warp-map" : "ap-displace-map";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        gap: 18,
        padding: "0 clamp(20px, 4vw, 56px)",
        zIndex: 5,
      }}
    >
      <div
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: "clamp(48px, 9vw, 132px)",
          fontWeight: 300,
          letterSpacing: "-0.04em",
          lineHeight: 0.92,
          color: "#fff",
          position: "relative",
          mixBlendMode: "difference",
        }}
      >
        {/* chromatic split layers — pull apart with peak */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            color: "#ff3060",
            transform: "translate3d(calc(var(--peak) * -10px), 0, 0)",
            mixBlendMode: "screen",
            pointerEvents: "none",
            opacity: "calc(var(--peak) * 0.95)",
          }}
        >
          {label}
        </span>
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            color: "#30b0ff",
            transform: "translate3d(calc(var(--peak) * 10px), 0, 0)",
            mixBlendMode: "screen",
            pointerEvents: "none",
            opacity: "calc(var(--peak) * 0.95)",
          }}
        >
          {label}
        </span>
        {/* main label, warped by the SVG turbulence filter */}
        <svg
          viewBox="0 0 1200 160"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* tag the displacement-map node so the band's effect can reach in */}
          <defs>
            <filter id={`${filterId}-${kind}`} x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency={kind === "displace" ? "0.018 0.06" : "0.012 0.04"}
                numOctaves={kind === "displace" ? 3 : 2}
                seed={kind === "displace" ? 7 : 3}
                result="t"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="t"
                scale="0"
                data-disp-map
                id={`${dispMapId}-${kind}`}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--serif)"
            fontStyle="italic"
            fontWeight={300}
            fontSize="120"
            letterSpacing="-4"
            fill="#fff"
            filter={`url(#${filterId}-${kind})`}
          >
            {label.toLowerCase()}.
          </text>
        </svg>
      </div>

      {/* metadata strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,.78)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px",
            border: "1px solid rgba(255,255,255,.55)",
            background: "rgba(0,0,0,.32)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          ≋ <span style={{ color: "var(--accent)" }}>{label}</span>
        </span>
        <span style={{ flex: 1, opacity: 0.85 }}>{desc}</span>
        <span
          style={{
            opacity: 0.6,
            fontVariantNumeric: "tabular-nums",
            minWidth: 56,
            textAlign: "right",
          }}
        >
          <PeakReadout />
        </span>
      </div>
    </div>
  );
}

// Reads --peak off the nearest [data-distortion] ancestor at the same
// rate as the scroll listener via a tiny RAF loop. Only one node updated.
function PeakReadout() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const band = el.closest<HTMLElement>("[data-distortion]");
    if (!band) return;
    let raf = 0;
    const tick = () => {
      const peak = parseFloat(getComputedStyle(band).getPropertyValue("--peak")) || 0;
      el.textContent = `${Math.round(peak * 100)}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <span ref={ref}>0%</span>;
}
