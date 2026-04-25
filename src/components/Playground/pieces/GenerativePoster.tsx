import { useEffect, useMemo, useRef, useState } from "react";
import { Shuffle, Download } from "lucide-react";
import { PieceFrame, PieceAction } from "../PieceFrame";

interface Palette {
  bg: string;
  ink: string;
  accent: string;
  muted: string;
}

const PALETTES: Palette[] = [
  { bg: "#f5ede1", ink: "#1a1514", accent: "#e85d38", muted: "#8c7d77" },
  { bg: "#e8d6c4", ink: "#241710", accent: "#c64722", muted: "#6e5a4f" },
  { bg: "#1a1514", ink: "#f2ebe3", accent: "#e85d38", muted: "#8c7d77" },
  { bg: "#0e1a1f", ink: "#dfe9ea", accent: "#f2a65a", muted: "#5a7782" },
  { bg: "#efe7d2", ink: "#2a261d", accent: "#7c5e3c", muted: "#7a7363" },
  { bg: "#f0e2d6", ink: "#1d1812", accent: "#36617e", muted: "#8b7d70" },
  { bg: "#15191c", ink: "#e8e4dc", accent: "#9bd3a3", muted: "#5e6770" },
  { bg: "#fbe9d4", ink: "#231b14", accent: "#1a1514", muted: "#7a6a5d" },
  { bg: "#22201d", ink: "#f0e0c8", accent: "#d97c4a", muted: "#7a6f63" },
  { bg: "#e6dcc8", ink: "#1a1514", accent: "#3a4a3c", muted: "#7a7060" },
  { bg: "#1d1c2c", ink: "#e8e3f0", accent: "#e85d8c", muted: "#7c7a90" },
  { bg: "#f2ece0", ink: "#1f1d1a", accent: "#5a8db5", muted: "#857d72" },
];

const WORDS = [
  // generic
  "SIGNAL", "NOISE", "INDEX", "DRAFT", "REWIND", "PROOF", "FLUX",
  "STATE", "MEMORY", "TRACE", "VECTOR", "PATCH", "BUILD", "RECALL",
  "ASYNC", "RUNTIME", "OUTPUT", "SOURCE", "RENDER", "FORK", "MERGE",
  "BUFFER", "SYNTAX", "HEAP", "STACK", "QUEUE", "TOKEN", "LOCAL",
  "REMOTE", "STATIC", "VOID",
  // identity
  "KUSH", "KG", "MADE BY KG", "GUPTA", "ENGINEER",
  "DALLAS", "DALLAS · SF", "VOL. 26", "EDITION 01",
];

const SUBTITLES = [
  "ONE OFF · GENERATED IN BROWSER",
  "EVERY RELOAD IS A NEW PRESS",
  "NO TWO ARE THE SAME, PROBABLY",
  "PROOF OF NOTHING IN PARTICULAR",
  "PRINTED BY A MACHINE WITH OPINIONS",
  "FILE UNDER: TYPOGRAPHY",
  "EDITION OF ONE",
  "DRAFT 0 · NOT FOR REVIEW",
  "FOR INTERNAL USE ONLY",
  "MADE WHILE WAITING FOR A BUILD",
];

interface Design {
  palette: Palette;
  word: string;
  subtitle: string;
  variant: 0 | 1 | 2 | 3 | 4 | 5;
  serial: string;
  date: string;
  marks: { x: number; y: number; r: number; type: "circle" | "ring" | "x" | "bar" }[];
  rules: number[];
}

function pad(n: number, len: number) {
  return n.toString().padStart(len, "0");
}

function generate(): Design {
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const subtitle = SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)];
  const variant = Math.floor(Math.random() * 6) as 0 | 1 | 2 | 3 | 4 | 5;
  const serial = `${pad(Math.floor(Math.random() * 9999), 4)}/${pad(Math.floor(Math.random() * 9999), 4)}`;
  const d = new Date();
  const date = `${d.getFullYear()}.${pad(d.getMonth() + 1, 2)}.${pad(d.getDate(), 2)}`;
  const marks = Array.from({ length: 1 + Math.floor(Math.random() * 3) }).map(() => ({
    x: 80 + Math.random() * 1040,
    y: 200 + Math.random() * 1100,
    r: 18 + Math.random() * 60,
    type: (["circle", "ring", "x", "bar"] as const)[Math.floor(Math.random() * 4)],
  }));
  const rules = Array.from({ length: 2 + Math.floor(Math.random() * 4) }).map(() =>
    Math.random()
  );
  return { palette, word, subtitle, variant, serial, date, marks, rules };
}

function PosterSVG({ design }: { design: Design }) {
  const { palette, word, subtitle, variant, serial, date, marks, rules } = design;
  const W = 1200;
  const H = 1500;

  const headline = (() => {
    if (variant === 0) {
      return (
        <g>
          <text
            x={80}
            y={520}
            fontFamily="Anton, sans-serif"
            fontSize={420}
            letterSpacing={-12}
            fill={palette.ink}
            style={{ textTransform: "uppercase" }}
          >
            {word}
          </text>
          <text
            x={80}
            y={760}
            fontFamily="Anton, sans-serif"
            fontSize={420}
            letterSpacing={-12}
            fill={palette.accent}
            opacity={0.85}
          >
            KUSH
          </text>
          <text
            x={80}
            y={1000}
            fontFamily="Anton, sans-serif"
            fontSize={420}
            letterSpacing={-12}
            fill={palette.ink}
          >
            GUPTA
          </text>
        </g>
      );
    }
    if (variant === 1) {
      return (
        <g>
          <text
            x={W / 2}
            y={H / 2 + 40}
            fontFamily="Anton, sans-serif"
            fontSize={520}
            letterSpacing={-16}
            fill={palette.ink}
            textAnchor="middle"
          >
            {word}
          </text>
          <circle
            cx={W / 2}
            cy={H / 2 - 20}
            r={420}
            fill="none"
            stroke={palette.accent}
            strokeWidth={3}
          />
          <circle
            cx={W / 2}
            cy={H / 2 - 20}
            r={500}
            fill="none"
            stroke={palette.muted}
            strokeWidth={1}
          />
        </g>
      );
    }
    if (variant === 2) {
      return (
        <g>
          <text
            x={-30}
            y={1240}
            fontFamily="Anton, sans-serif"
            fontSize={760}
            letterSpacing={-32}
            fill={palette.ink}
          >
            {word}
          </text>
          <text
            x={W - 60}
            y={300}
            fontFamily="Anton, sans-serif"
            fontSize={120}
            letterSpacing={-3}
            fill={palette.accent}
            textAnchor="end"
          >
            KUSH·GUPTA
          </text>
        </g>
      );
    }
    if (variant === 3) {
      return (
        <g>
          <g transform={`translate(${W - 200}, 200) rotate(90)`}>
            <text
              x={0}
              y={0}
              fontFamily="Anton, sans-serif"
              fontSize={420}
              letterSpacing={-10}
              fill={palette.ink}
            >
              {word}
            </text>
          </g>
          <text
            x={80}
            y={H - 200}
            fontFamily="Anton, sans-serif"
            fontSize={280}
            letterSpacing={-10}
            fill={palette.accent}
          >
            KUSH
          </text>
        </g>
      );
    }
    if (variant === 4) {
      // Type stack: same word repeated, decreasing in size and opacity.
      const sizes = [560, 380, 240, 140];
      const ys = [560, 880, 1100, 1240];
      return (
        <g>
          {sizes.map((s, i) => (
            <text
              key={i}
              x={80}
              y={ys[i]}
              fontFamily="Anton, sans-serif"
              fontSize={s}
              letterSpacing={-12}
              fill={i === 0 ? palette.ink : palette.accent}
              opacity={1 - i * 0.18}
            >
              {word}
            </text>
          ))}
        </g>
      );
    }
    // variant === 5: split column. Word stacked vertically + giant numeral.
    return (
      <g>
        <text
          x={W / 2 - 80}
          y={1180}
          fontFamily="Anton, sans-serif"
          fontSize={900}
          letterSpacing={-30}
          fill={palette.ink}
          textAnchor="end"
        >
          {String(2026 % 100).padStart(2, "0")}
        </text>
        <g transform={`translate(${W / 2 + 60}, 280)`}>
          {word.split("").slice(0, 8).map((ch, i) => (
            <text
              key={i}
              x={0}
              y={i * 140}
              fontFamily="Anton, sans-serif"
              fontSize={150}
              letterSpacing={-2}
              fill={palette.accent}
            >
              {ch}
            </text>
          ))}
        </g>
      </g>
    );
  })();

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className="block w-full h-full"
    >
      <rect x={0} y={0} width={W} height={H} fill={palette.bg} />

      {/* Top metadata strip */}
      <g fontFamily="JetBrains Mono, monospace" fontSize={18} fill={palette.muted}>
        <text x={80} y={100} letterSpacing={2}>PLAYGROUND · Nº 05</text>
        <text x={W - 80} y={100} textAnchor="end" letterSpacing={2}>
          {date} · SERIAL {serial}
        </text>
      </g>

      {/* Top divider */}
      <line x1={80} y1={130} x2={W - 80} y2={130} stroke={palette.ink} strokeWidth={1} />

      {/* Headline composition */}
      {headline}

      {/* Decorative marks */}
      {marks.map((m, i) => {
        if (m.type === "circle") {
          return <circle key={i} cx={m.x} cy={m.y} r={m.r} fill={palette.accent} opacity={0.85} />;
        }
        if (m.type === "ring") {
          return (
            <circle
              key={i}
              cx={m.x}
              cy={m.y}
              r={m.r}
              fill="none"
              stroke={palette.ink}
              strokeWidth={2}
            />
          );
        }
        if (m.type === "x") {
          return (
            <g key={i} transform={`translate(${m.x}, ${m.y})`} stroke={palette.ink} strokeWidth={3}>
              <line x1={-m.r / 2} y1={-m.r / 2} x2={m.r / 2} y2={m.r / 2} />
              <line x1={-m.r / 2} y1={m.r / 2} x2={m.r / 2} y2={-m.r / 2} />
            </g>
          );
        }
        // bar — short horizontal accent block
        return (
          <rect
            key={i}
            x={m.x - m.r}
            y={m.y - 6}
            width={m.r * 2}
            height={12}
            fill={palette.accent}
          />
        );
      })}

      {/* Vertical rules */}
      {rules.map((r, i) => (
        <line
          key={i}
          x1={80 + r * (W - 160)}
          y1={140}
          x2={80 + r * (W - 160)}
          y2={H - 140}
          stroke={palette.ink}
          strokeWidth={0.5}
          opacity={0.18}
        />
      ))}

      {/* Bottom divider */}
      <line x1={80} y1={H - 130} x2={W - 80} y2={H - 130} stroke={palette.ink} strokeWidth={1} />

      {/* Bottom metadata */}
      <g fontFamily="JetBrains Mono, monospace" fontSize={18} fill={palette.ink}>
        <text x={80} y={H - 80} letterSpacing={2}>{subtitle}</text>
        <text x={W - 80} y={H - 80} textAnchor="end" letterSpacing={2}>
          KUSHGUPTA.DEV
        </text>
      </g>

      <g fontFamily="JetBrains Mono, monospace" fontSize={14} fill={palette.muted}>
        <text x={80} y={H - 50} letterSpacing={2}>
          PALETTE {palette.bg.slice(1).toUpperCase()} · {palette.ink.slice(1).toUpperCase()} · {palette.accent.slice(1).toUpperCase()}
        </text>
      </g>
    </svg>
  );
}

export function GenerativePoster() {
  const [design, setDesign] = useState<Design>(() => generate());
  const svgWrapRef = useRef<HTMLDivElement>(null);

  const downloadSVG = () => {
    const svg = svgWrapRef.current?.querySelector("svg");
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob(
      ['<?xml version="1.0" encoding="UTF-8"?>\n', serialized],
      { type: "image/svg+xml" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kushgupta-poster-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // memoized to avoid re-render churn
  const svgEl = useMemo(() => <PosterSVG design={design} />, [design]);

  return (
    <PieceFrame
      number="05"
      title="Generative Poster"
      caption="A random typographic poster. Hit shuffle for a new one. Download the ones you like as SVG."
      hint="shuffle to roll a new layout · save what you like"
      actions={
        <>
          <PieceAction onClick={() => setDesign(generate())} label="Shuffle">
            <Shuffle size={12} strokeWidth={1.5} />
            <span>Shuffle</span>
          </PieceAction>
          <PieceAction onClick={downloadSVG} label="Download">
            <Download size={12} strokeWidth={1.5} />
            <span>Save</span>
          </PieceAction>
        </>
      }
    >
      <div
        ref={svgWrapRef}
        className="w-full mx-auto"
        style={{ maxWidth: "min(620px, 90%)" }}
      >
        {svgEl}
      </div>
    </PieceFrame>
  );
}
