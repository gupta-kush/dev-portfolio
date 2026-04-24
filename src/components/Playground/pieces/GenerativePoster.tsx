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
];

const WORDS = [
  "SIGNAL", "NOISE", "INDEX", "DRAFT", "REWIND", "PROOF", "FLUX",
  "STATE", "MEMORY", "TRACE", "VECTOR", "PATCH", "BUILD", "RECALL",
  "ASYNC", "RUNTIME", "OUTPUT", "SOURCE", "RENDER",
];

const SUBTITLES = [
  "ONE-OFF · GENERATED IN BROWSER",
  "EVERY RELOAD IS A NEW PRESS",
  "NO TWO ARE THE SAME — UNLIKELY, ANYWAY",
  "PROOF OF NOTHING IN PARTICULAR",
  "PRINTED BY A MACHINE WITH OPINIONS",
];

interface Design {
  palette: Palette;
  word: string;
  subtitle: string;
  variant: 0 | 1 | 2 | 3;
  serial: string;
  date: string;
  marks: { x: number; y: number; r: number; type: "circle" | "ring" | "x" }[];
  rules: number[];
}

function pad(n: number, len: number) {
  return n.toString().padStart(len, "0");
}

function generate(): Design {
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const subtitle = SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)];
  const variant = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
  const serial = `${pad(Math.floor(Math.random() * 9999), 4)}/${pad(Math.floor(Math.random() * 9999), 4)}`;
  const d = new Date();
  const date = `${d.getFullYear()}.${pad(d.getMonth() + 1, 2)}.${pad(d.getDate(), 2)}`;
  const marks = Array.from({ length: 1 + Math.floor(Math.random() * 3) }).map(() => ({
    x: 80 + Math.random() * 1040,
    y: 200 + Math.random() * 1100,
    r: 18 + Math.random() * 60,
    type: (["circle", "ring", "x"] as const)[Math.floor(Math.random() * 3)],
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
        return (
          <g key={i} transform={`translate(${m.x}, ${m.y})`} stroke={palette.ink} strokeWidth={3}>
            <line x1={-m.r / 2} y1={-m.r / 2} x2={m.r / 2} y2={m.r / 2} />
            <line x1={-m.r / 2} y1={m.r / 2} x2={m.r / 2} y2={-m.r / 2} />
          </g>
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
      caption="A different print every time you reload. Same elements, shuffled rules. Save the ones you like — they probably won't show up the same way twice."
      hint="shuffle for a new composition · download as SVG"
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
