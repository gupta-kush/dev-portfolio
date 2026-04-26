// Identity marks. Two locked variants from the design workshop:
//   MarkApertureKG  (A2): KG initials, upright Fraunces, inside an iris.
//   MarkApertureCode (B2): </> drawn as three geometric strokes.
// `Mark` is the default — switch by reassigning at the bottom of the file.

import type { ReactNode } from "react";

type FrameProps = {
  openness: number;
  ink: string;
  bg: string;
  outerR?: number;
  ringW?: number;
  children: (ctx: { innerR: number; ink: string; bg: string }) => ReactNode;
};

function ApertureFrame({ openness, ink, bg, outerR = 46, ringW = 1.6, children }: FrameProps) {
  const cx = 60;
  const cy = 60;
  const innerR = 34 * openness;
  const TAU = Math.PI * 2;
  const v = (i: number) => (i / 6) * TAU + Math.PI / 6;

  const hexPath =
    Array.from({ length: 6 }, (_, i) => {
      const a = v(i);
      return `${i === 0 ? "M" : "L"} ${cx + Math.cos(a) * innerR} ${cy + Math.sin(a) * innerR}`;
    }).join(" ") + " Z";

  const leadingEdges: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = v(i);
    const ix = cx + Math.cos(a) * innerR;
    const iy = cy + Math.sin(a) * innerR;
    const leadA = a - (TAU / 6) * 0.55;
    const ox = cx + Math.cos(leadA) * outerR;
    const oy = cy + Math.sin(leadA) * outerR;
    leadingEdges.push(`M ${ix} ${iy} L ${ox} ${oy}`);
  }

  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%">
      <circle cx={cx} cy={cy} r={outerR + 2} fill="none" stroke={ink} strokeWidth={ringW} />
      <path
        d={
          `M ${cx + outerR} ${cy} A ${outerR} ${outerR} 0 1 1 ${cx - outerR} ${cy} A ${outerR} ${outerR} 0 1 1 ${cx + outerR} ${cy} Z ` +
          hexPath
        }
        fill={ink}
        fillRule="evenodd"
      />
      <g stroke={bg} strokeWidth="1.4" strokeLinecap="butt">
        {leadingEdges.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <path d={hexPath} fill="none" stroke={bg} strokeWidth="0.8" />
      <g transform={`translate(${cx}, ${cy})`}>{children({ innerR, ink, bg })}</g>
    </svg>
  );
}

type MarkProps = { bg?: string; ink?: string };

// VARIANT A2 — KG initials, upright Fraunces 500, openness 0.95, fit 1.1.
export function MarkApertureKG({ bg = "var(--paper)", ink = "currentColor" }: MarkProps) {
  const openness = 0.95;
  const fitScale = 1.1;
  const weight = 500;
  return (
    <ApertureFrame openness={openness} ink={ink} bg={bg}>
      {({ innerR }) => {
        const sz = innerR * fitScale;
        return (
          <text
            x={0}
            y={sz * 0.34}
            textAnchor="middle"
            fontFamily="var(--serif)"
            fontWeight={weight}
            fontSize={sz}
            fill={ink}
            letterSpacing="-0.04em"
          >
            KG
          </text>
        );
      }}
    </ApertureFrame>
  );
}

// VARIANT B2 — </> three geometric strokes.
// Locked: openness 0.9, scale 0.7, stroke 12, slash 0.85, reach 0.6.
export function MarkApertureCode({ bg = "var(--paper)", ink = "currentColor" }: MarkProps) {
  const openness = 0.9;
  const scale = 0.7;
  const strokeW = 12;
  const slashAngle = 0.85;
  const reach = 0.6;
  return (
    <ApertureFrame openness={openness} ink={ink} bg={bg}>
      {({ innerR }) => {
        const r = innerR * 0.95 * scale;
        const sw = Math.max(1.6, innerR * (strokeW / 100));
        const chevH = r * 0.55;
        const slashH = r * slashAngle;
        const slashW = r * 0.32;
        return (
          <g
            stroke={ink}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points={`${-r * reach},${-chevH} ${-r},0 ${-r * reach},${chevH}`} />
            <line x1={-slashW} y1={slashH} x2={slashW} y2={-slashH} />
            <polyline points={`${r * reach},${-chevH} ${r},0 ${r * reach},${chevH}`} />
          </g>
        );
      }}
    </ApertureFrame>
  );
}

// Default mark — points at B2. Change to MarkApertureKG to swap.
export const Mark = MarkApertureCode;
