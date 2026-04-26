// Full-bleed photo crossfade + giant kinetic name + viewfinder corners +
// live exposure strip + project peek slabs along the bottom.

import { useEffect, useState } from "react";
import { HERO_PHOTOS } from "../photos";
import { PROJECTS_BRIEF } from "../content";

type Corner = { top?: number; left?: number; right?: number; bottom?: number; b: "tl" | "tr" | "bl" | "br" };

function ViewfinderCorners() {
  const corners: Corner[] = [
    { top: 24, left: 24, b: "tl" },
    { top: 24, right: 24, b: "tr" },
    { bottom: 24, left: 24, b: "bl" },
    { bottom: 24, right: 24, b: "br" },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            width: 22,
            height: 22,
            pointerEvents: "none",
            borderTop: c.b[0] === "t" ? "1.5px solid rgba(255,255,255,.85)" : "none",
            borderBottom: c.b[0] === "b" ? "1.5px solid rgba(255,255,255,.85)" : "none",
            borderLeft: c.b[1] === "l" ? "1.5px solid rgba(255,255,255,.85)" : "none",
            borderRight: c.b[1] === "r" ? "1.5px solid rgba(255,255,255,.85)" : "none",
          }}
        />
      ))}
    </>
  );
}

function KineticName() {
  const wrap = (word: string) =>
    word.split("").map((c, i) => (
      <span key={i} className="kchar" style={{ transitionDelay: `${i * 18}ms` }}>
        {c}
      </span>
    ));
  const [hover, setHover] = useState(false);
  const drift = (children: ReturnType<typeof wrap>, even: boolean) =>
    children.map((el, i) =>
      // eslint-disable-next-line react/no-array-index-key
      <span
        key={i}
        className="kchar"
        style={{
          transition: "transform .55s cubic-bezier(.2,.7,.3,1)",
          transitionDelay: `${i * 18}ms`,
          transform: hover
            ? `translateY(${(i % 2 ? -1 : 1) * (even ? 4 : -4)}px)`
            : "translateY(0)",
          display: "inline-block",
        }}
      >
        {el.props.children}
      </span>
    );

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        left: 32,
        right: 32,
        top: "47%",
        transform: "translateY(-50%)",
        lineHeight: 0.84,
        fontFamily: "var(--serif)",
        fontWeight: 300,
        fontStyle: "italic",
        zIndex: 10,
        color: "#fff",
        userSelect: "none",
      }}
    >
      <div style={{ fontSize: "clamp(96px, 13.5vw, 200px)", letterSpacing: "-0.045em" }}>
        {drift(wrap("Kush"), true)}
      </div>
      <div
        style={{
          fontSize: "clamp(96px, 13.5vw, 200px)",
          letterSpacing: "-0.045em",
          paddingLeft: "11vw",
          marginTop: "-0.12em",
        }}
      >
        {drift(wrap("Gupta"), false)}
        <span
          style={{
            display: "inline-block",
            width: "14vw",
            height: 2,
            background: "#fff",
            verticalAlign: "middle",
            marginLeft: 24,
            opacity: 0.7,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "clamp(11px, 0.95vw, 14px)",
          letterSpacing: "0.34em",
          marginTop: 22,
          paddingLeft: 8,
          opacity: 0.82,
          fontStyle: "normal",
        }}
      >
        SOFTWARE · PHOTOGRAPHY
      </div>
    </div>
  );
}

function ExposureStrip({ meta }: { meta: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 32,
        bottom: 168,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 22,
        fontFamily: "var(--mono)",
        fontSize: 11,
        letterSpacing: "0.2em",
        color: "rgba(255,255,255,.78)",
      }}
    >
      <span>{meta}</span>
      <span style={{ width: 24, height: 1, background: "rgba(255,255,255,.4)" }} />
      <span style={{ color: "var(--accent)" }}>● NOW</span>
      <span>BUILDING IN PUBLIC</span>
    </div>
  );
}

function HeroPeekSlabs() {
  return (
    <div
      style={{
        position: "absolute",
        left: 32,
        right: 32,
        bottom: 36,
        zIndex: 10,
        display: "grid",
        gridTemplateColumns: `repeat(${PROJECTS_BRIEF.length}, 1fr)`,
        gap: 12,
        fontFamily: "var(--mono)",
      }}
    >
      {PROJECTS_BRIEF.map((p) => (
        <a
          key={p.n}
          href={`#/case/${p.id}`}
          style={{
            padding: "12px 14px",
            border: "1px solid rgba(255,255,255,.4)",
            background: "rgba(0,0,0,.32)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            transition: "border-color .25s, background .25s, transform .25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.background = "rgba(255,184,107,.12)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,.4)";
            e.currentTarget.style.background = "rgba(0,0,0,.32)";
            e.currentTarget.style.transform = "";
          }}
        >
          <div style={{ fontSize: 10, opacity: 0.58, letterSpacing: "0.22em" }}>{p.n} —</div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", marginTop: 4 }}>
            {p.t.toUpperCase()}
          </div>
          <div style={{ fontSize: 10, opacity: 0.68, marginTop: 4, letterSpacing: "0.05em" }}>
            {p.lang} · {p.stat}
          </div>
        </a>
      ))}
    </div>
  );
}

export function Hero() {
  const photos = HERO_PHOTOS;
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), 6000);
    return () => clearInterval(t);
  }, [photos.length]);

  return (
    <section
      id="top"
      data-screen-label="00 Hero"
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 720,
        overflow: "hidden",
        background: "#0a0908",
      }}
    >
      {photos.map((p, i) => (
        <div
          key={i}
          className="imgph"
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === idx ? 1 : 0,
            transition: "opacity 1.6s cubic-bezier(.4,0,.2,1)",
            transform: `scale(${i === idx ? 1.04 : 1})`,
            transitionProperty: "opacity, transform",
            transitionDuration: i === idx ? "1.6s, 8s" : "1.6s, 1.6s",
          }}
        >
          <img src={p.src} alt="" loading={i === 0 ? "eager" : "lazy"} />
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          background:
            "linear-gradient(180deg, rgba(10,9,8,.58) 0%, rgba(10,9,8,.05) 38%, rgba(10,9,8,.92) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 6,
          pointerEvents: "none",
          opacity: 0.18,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: "overlay",
        }}
      />

      <ViewfinderCorners />
      <KineticName />
      <ExposureStrip meta={photos[idx].meta} />
      <HeroPeekSlabs />

      <div
        style={{
          position: "absolute",
          right: 32,
          top: 96,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 10,
        }}
      >
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Show photo ${i + 1}`}
            style={{
              width: 18,
              height: 1.5,
              padding: 0,
              border: "none",
              cursor: "pointer",
              background: i === idx ? "#fff" : "rgba(255,255,255,.35)",
              transition: "background .3s, width .3s",
            }}
          />
        ))}
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,.5)",
            marginTop: 6,
          }}
        >
          {String(idx + 1).padStart(2, "0")}/{String(photos.length).padStart(2, "0")}
        </div>
      </div>

      <div
        className="scroll-hint"
        style={{
          position: "absolute",
          right: 32,
          bottom: 168,
          zIndex: 10,
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.28em",
          color: "rgba(255,255,255,.62)",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}
      >
        ↓ SCROLL TO DEVELOP
      </div>
    </section>
  );
}
