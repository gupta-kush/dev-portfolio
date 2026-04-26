// Work / selected projects — expandable rows, hover slides + accent wash.
// Each row links to its case study at #/case/<id>.

import { useState } from "react";
import { PROJECTS } from "../content";
import { Reveal } from "./Reveal";
import { Atmosphere } from "./Atmosphere";
import { useIsMobile, useIsTablet } from "../hooks/useMediaQuery";

export function Work() {
  const [hover, setHover] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  return (
    <section
      id="projects"
      data-screen-label="01 Projects"
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        padding: "100px 36px 100px",
        position: "relative",
      }}
    >
      <Atmosphere kind="leak" />
      <Reveal>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "var(--paper-soft)",
            borderTop: "1.5px solid var(--ink)",
            paddingTop: 14,
            marginBottom: 60,
          }}
        >
          <span>§ 01 / PROJECTS / SELECTED</span>
          <span>SHIPPED, ON GITHUB</span>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isTablet ? "1fr" : "1.1fr 1fr",
            gap: isMobile ? 24 : 48,
            marginBottom: isMobile ? 36 : 56,
          }}
        >
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(48px, 6vw, 88px)",
              fontStyle: "italic",
              lineHeight: 0.96,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            recent projects.
          </div>
          <div
            style={{
              alignSelf: "end",
              fontFamily: "var(--serif)",
              fontSize: 18,
              lineHeight: 1.55,
              color: "var(--paper-soft)",
              maxWidth: 520,
            }}
          >
            A short list of things I&rsquo;ve built and shipped. Click any row to read the case study:
            what it is, how it works, what I&rsquo;d change.
          </div>
        </div>
      </Reveal>

      {PROJECTS.map((p, i) => (
        <div
          key={p.id}
          role="link"
          tabIndex={0}
          onClick={() => {
            window.location.hash = `#/case/${p.id}`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              window.location.hash = `#/case/${p.id}`;
            }
          }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
                ? "40px 1fr 140px"
                : "60px 1fr 200px 140px",
            gap: isMobile ? 12 : 24,
            padding: isMobile ? "20px 0" : "28px 0",
            alignItems: isMobile ? "start" : "center",
            borderTop: "1px solid var(--rule-dark)",
            color: "var(--ink)",
            cursor: "pointer",
            transition: "padding-left .35s, background .35s",
            paddingLeft: hover === i && !isMobile ? 18 : 0,
            background: hover === i && !isMobile ? "rgba(255,184,107,0.08)" : "transparent",
            ...(i === PROJECTS.length - 1 ? { borderBottom: "1px solid var(--rule-dark)" } : {}),
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 14,
              letterSpacing: "0.18em",
              color: "var(--paper-soft)",
            }}
          >
            {p.n}
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(26px, 2.4vw, 34px)",
                letterSpacing: "-0.015em",
                lineHeight: 1.1,
              }}
            >
              {p.title}
              <span
                style={{
                  display: "block",
                  color: "var(--paper-faint)",
                  fontStyle: "italic",
                  fontSize: "0.62em",
                  marginTop: 6,
                }}
              >
                {p.subtitle}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              {p.tags.map((t) => (
                <span key={t} className="tag" style={{ color: "var(--ink)" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          {!isTablet && (
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: "0.16em",
                color: "var(--paper-soft)",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <span>{p.lang}</span>
              <span>{p.stars}</span>
              <span style={{ color: "var(--accent-warm)" }}>{p.status}</span>
              <span style={{ opacity: 0.55 }}>UPD · {p.updated}</span>
            </div>
          )}
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textAlign: isMobile ? "left" : "right",
              display: "flex",
              flexDirection: isMobile ? "row" : "column",
              gap: isMobile ? 18 : 8,
              alignItems: isMobile ? "center" : "flex-end",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "gap .25s",
              }}
            >
              READ{" "}
              <span
                style={{
                  display: "inline-block",
                  transform: hover === i ? "translateX(6px)" : "translateX(0)",
                  transition: "transform .25s",
                }}
              >
                →
              </span>
            </span>
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ opacity: 0.6 }}
            >
              GITHUB ↗
            </a>
          </div>
        </div>
      ))}
    </section>
  );
}
