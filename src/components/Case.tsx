// Case study layout — title + tagline left, artifact right; four narrative
// blocks below; receipts row at the bottom (github, etc.); next/prev nav.

import { Artifact } from "./Artifact";
import { PROJECTS, type Project } from "../content";

function CaseSection({ p }: { p: Project }) {
  return (
    <section
      id={`case-${p.id}`}
      data-screen-label={`Case · ${p.title}`}
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        padding: "clamp(60px, 10vw, 120px) clamp(20px, 3vw, 36px) 100px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.22em",
          color: "var(--paper-soft)",
          marginBottom: 40,
        }}
      >
        <span>{p.n} · {p.github.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "")}</span>
        <span>{p.lang.toUpperCase()} · {p.status}</span>
      </div>

      <div
        className="case-head"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.15fr)",
          gap: "clamp(28px, 4vw, 64px)",
          alignItems: "start",
          marginBottom: 72,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(40px, 5.6vw, 92px)",
              letterSpacing: "-0.022em",
              lineHeight: 0.98,
              fontWeight: 400,
              marginBottom: 24,
            }}
          >
            {p.title}
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(17px, 1.4vw, 21px)",
              lineHeight: 1.45,
              color: "var(--paper-soft)",
              maxWidth: 460,
            }}
          >
            {p.subtitle}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
            {p.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>
        <Artifact a={p.artifact} />
      </div>

      <div
        className="case-body"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "clamp(36px, 4vw, 64px)",
          maxWidth: 1100,
        }}
      >
        {p.blocks.map((b, i) => (
          <div key={i}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.24em",
                color: "var(--paper-soft)",
                marginBottom: 12,
              }}
            >
              {String(i + 1).padStart(2, "0")} / {b.h}
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(16px, 1.3vw, 19px)",
                lineHeight: 1.55,
                textWrap: "pretty",
              }}
            >
              {b.p}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 72,
          paddingTop: 24,
          borderTop: "1px dashed var(--rule-dark)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <a href={p.github} target="_blank" rel="noopener noreferrer" className="alink">
            Github ↗
          </a>
          {p.url && (
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="alink">
              Live ↗
            </a>
          )}
        </div>
        <a href="#/" className="alink">
          ← Back to home
        </a>
      </div>
    </section>
  );
}

function CaseFooter({ p }: { p: Project }) {
  const i = PROJECTS.findIndex((x) => x.id === p.id);
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  return (
    <div
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        padding: "40px clamp(20px, 3vw, 36px) 80px",
        borderTop: "1px solid var(--rule-dark)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <a
          href={`#/case/${prev.id}`}
          style={{ padding: "24px 0", borderTop: "1px solid var(--rule-dark)" }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "var(--paper-soft)",
              marginBottom: 8,
            }}
          >
            ← PREV
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(22px, 2.4vw, 30px)",
              letterSpacing: "-0.01em",
            }}
          >
            {prev.title}
          </div>
        </a>
        <a
          href={`#/case/${next.id}`}
          style={{
            padding: "24px 0",
            borderTop: "1px solid var(--rule-dark)",
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "var(--paper-soft)",
              marginBottom: 8,
            }}
          >
            NEXT →
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(22px, 2.4vw, 30px)",
              letterSpacing: "-0.01em",
            }}
          >
            {next.title}
          </div>
        </a>
      </div>
    </div>
  );
}

export function CasePage({ id }: { id: string }) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) {
    return (
      <div
        style={{
          padding: "160px 36px",
          color: "var(--paper)",
          textAlign: "center",
          fontFamily: "var(--serif)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 18 }}>not found.</div>
        <a href="#/" className="alink">
          ← back to index
        </a>
      </div>
    );
  }
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh", paddingTop: 64 }}>
      <CaseSection p={p} />
      <CaseFooter p={p} />
    </div>
  );
}
