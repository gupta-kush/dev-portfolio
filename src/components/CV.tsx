// CV / timeline — paper background, dashed row separators.

import { CV_ROWS } from "../content";
import { Reveal } from "./Reveal";

export function CV() {
  return (
    <section
      id="resume"
      data-screen-label="03 Resume"
      style={{ background: "var(--paper)", color: "var(--ink)", padding: "120px 36px 100px" }}
    >
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
          <span>§ 03 / RESUME / TIMELINE</span>
          <span>OFFICIAL VERSION</span>
        </div>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64 }}>
        <Reveal delay={80}>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(48px, 6vw, 88px)",
              fontStyle: "italic",
              letterSpacing: "-0.02em",
              lineHeight: 0.96,
              fontWeight: 400,
            }}
          >
            resume.
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 17,
              lineHeight: 1.55,
              marginTop: 18,
              color: "var(--paper-soft)",
              maxWidth: 420,
            }}
          >
            My latest professional experience.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <a className="btn" style={{ color: "var(--ink)" }} href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              <span>Download resume.pdf ↓</span>
            </a>
          </div>
        </Reveal>
        <div style={{ borderLeft: "1.5px solid var(--ink)", paddingLeft: 32 }}>
          {CV_ROWS.map((e, i) => (
            <Reveal key={i} delay={120 + i * 80}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr",
                  gap: 24,
                  padding: "22px 0",
                  borderBottom: "1px dashed var(--rule-dark)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    color: "var(--paper-soft)",
                  }}
                >
                  {e.y}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 22, letterSpacing: "-0.01em" }}>
                    {e.t}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      color: "var(--paper-soft)",
                      marginTop: 4,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {e.c}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 14,
                      color: "var(--paper-soft)",
                      marginTop: 6,
                      fontStyle: "italic",
                    }}
                  >
                    {e.d}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
