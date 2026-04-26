// Typographic artifacts replace the literal screenshot hero on case studies.
// One frame style; four payload renderers (tree / diff / terminal / commits).

import type { ReactNode } from "react";
import type { Artifact as A } from "../content";

function ArtifactFrame({ title, kind, children }: { title: string; kind: string; children: ReactNode }) {
  return (
    <div
      style={{
        border: "1.5px solid var(--ink)",
        background: "#fbf8f1",
        fontFamily: "var(--mono)",
        fontSize: 13,
        lineHeight: 1.65,
        color: "var(--ink)",
        marginBottom: 64,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          borderBottom: "1px solid var(--ink)",
          background: "var(--ink)",
          color: "var(--paper)",
          fontSize: 10,
          letterSpacing: "0.22em",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: "var(--accent)" }} />
          <span>{kind.toUpperCase()}</span>
          <span style={{ opacity: 0.55 }}>· {title}</span>
        </div>
        <span style={{ opacity: 0.55 }}>READ-ONLY</span>
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

export function Artifact({ a }: { a: A }) {
  if (a.kind === "tree") {
    return (
      <ArtifactFrame kind="tree" title={a.title}>
        {a.lines.map(([type, label, size], i) => {
          const isDir = type === "dir";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: isDir ? "var(--accent-warm)" : "var(--ink)",
                fontWeight: isDir ? 600 : 400,
              }}
            >
              <span style={{ whiteSpace: "pre" }}>
                {isDir ? "▸ " : "  "}
                {label.replace(/^ {2}/, "")}
              </span>
              {size && <span style={{ opacity: 0.45 }}>{size}</span>}
            </div>
          );
        })}
      </ArtifactFrame>
    );
  }
  if (a.kind === "diff") {
    return (
      <ArtifactFrame kind="diff" title={a.title}>
        {a.lines.map(([type, text], i) => {
          const colors = {
            minus: { c: "#9b2226", bg: "rgba(155,34,38,0.06)", sym: "−" },
            plus: { c: "#2d6a4f", bg: "rgba(45,106,79,0.07)", sym: "+" },
            dim: { c: "rgba(0,0,0,0.3)", bg: "transparent", sym: " " },
          };
          const s = colors[type] ?? colors.dim;
          return (
            <div
              key={i}
              style={{
                color: s.c,
                background: s.bg,
                margin: "0 -24px",
                padding: "0 24px",
                display: "flex",
                gap: 14,
                wordBreak: "break-all",
              }}
            >
              <span style={{ opacity: 0.6, userSelect: "none", minWidth: 12 }}>{s.sym}</span>
              <span>{text || " "}</span>
            </div>
          );
        })}
      </ArtifactFrame>
    );
  }
  if (a.kind === "terminal") {
    return (
      <ArtifactFrame kind="terminal" title={a.title}>
        {a.lines.map(([type, text], i) => {
          if (type === "in") return <div key={i} style={{ color: "var(--accent-warm)" }}>→ {text}</div>;
          if (type === "out") return <div key={i}>{text || " "}</div>;
          return <div key={i} style={{ color: "rgba(0,0,0,0.35)" }}>{text || " "}</div>;
        })}
      </ArtifactFrame>
    );
  }
  if (a.kind === "commits") {
    return (
      <ArtifactFrame kind="git log" title={a.title}>
        {a.lines.map(([, sha, msg], i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "24px 96px 1fr",
              gap: 14,
              alignItems: "baseline",
            }}
          >
            <span style={{ color: "var(--accent-warm)" }}>●</span>
            <span style={{ opacity: 0.55 }}>{sha}</span>
            <span>{msg}</span>
          </div>
        ))}
      </ArtifactFrame>
    );
  }
  return null;
}
