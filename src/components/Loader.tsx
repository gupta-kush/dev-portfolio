// Viewfinder intro: meter ticks 0 → 100 with focus-lock beats, then a
// shutter flash fades to reveal the page. LoaderGate wraps the site;
// sessionStorage-gated so it plays once per session, respects
// prefers-reduced-motion.

import { useEffect, useRef, useState, type CSSProperties, type FC } from "react";
import { Mark } from "./Wordmark";

type Phase = "idle" | "metering" | "lock-focus" | "lock-exposure" | "reveal" | "done";
type CornerPos = "tl" | "tr" | "bl" | "br";

const Corner: FC<{ pos: CornerPos; dim: boolean }> = ({ pos, dim }) => {
  const off = 18;
  const size = 22;
  const stroke = "#f3efe7";
  const w = 1.5;
  const style: CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    opacity: dim ? 0 : 1,
    transition: "opacity 0.3s",
  };
  if (pos === "tl") Object.assign(style, { top: off, left: off, borderTop: `${w}px solid ${stroke}`, borderLeft: `${w}px solid ${stroke}` });
  if (pos === "tr") Object.assign(style, { top: off, right: off, borderTop: `${w}px solid ${stroke}`, borderRight: `${w}px solid ${stroke}` });
  if (pos === "bl") Object.assign(style, { bottom: off, left: off, borderBottom: `${w}px solid ${stroke}`, borderLeft: `${w}px solid ${stroke}` });
  if (pos === "br") Object.assign(style, { bottom: off, right: off, borderBottom: `${w}px solid ${stroke}`, borderRight: `${w}px solid ${stroke}` });
  return <div style={style} />;
};

// Focus-lock bracket: 4 small corners surrounding the central crosshair.
// While metering, they sit "wide" (further from center); at lock they
// snap inward and tighten. Adds visible activity beyond the bare meter.
function FocusLockBracket({ phase }: { phase: Phase }) {
  const wide = phase === "metering";
  const locked = phase === "lock-focus" || phase === "lock-exposure" || phase === "reveal" || phase === "done";
  const dim = phase === "reveal" || phase === "done";
  const offset = wide ? 44 : locked ? 28 : 36;
  const size = 14;
  const stroke = "var(--accent)";
  const w = 1.5;
  const cornerStyle = (which: CornerPos): CSSProperties => {
    const base: CSSProperties = {
      position: "absolute",
      width: size,
      height: size,
      transition: "transform 0.35s cubic-bezier(.2,.7,.3,1), opacity .3s",
      opacity: dim ? 0 : locked ? 1 : 0.55,
    };
    const dx = which.includes("l") ? -offset : offset;
    const dy = which.startsWith("t") ? -offset : offset;
    base.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    base.left = "50%";
    base.top = "50%";
    if (which.startsWith("t")) base.borderTop = `${w}px solid ${stroke}`;
    if (which.startsWith("b")) base.borderBottom = `${w}px solid ${stroke}`;
    if (which.endsWith("l")) base.borderLeft = `${w}px solid ${stroke}`;
    if (which.endsWith("r")) base.borderRight = `${w}px solid ${stroke}`;
    return base;
  };
  return (
    <>
      <div style={cornerStyle("tl")} />
      <div style={cornerStyle("tr")} />
      <div style={cornerStyle("bl")} />
      <div style={cornerStyle("br")} />
    </>
  );
}

const APERTURES = ["ƒ2.8", "ƒ4", "ƒ5.6", "ƒ8", "ƒ11"] as const;
const SHUTTERS = ["1/60", "1/125", "1/250", "1/500"] as const;

function Loader({ play, onDone }: { play: boolean; onDone?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  // Shutter / aperture readouts shuffle while metering, settle at lock.
  const [readoutTick, setReadoutTick] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!play) return;
    setProgress(0);
    setPhase("metering");
    const start = performance.now();
    const DURATION = 1400; // metering: 0 → 100 over 1.4s
    let raf = 0;
    const timeouts: number[] = [];

    const tick = (t: number) => {
      const e = Math.min(1, (t - start) / DURATION);
      const eased = 1 - Math.pow(1 - e, 3);
      const stutter = e > 0.78 && e < 0.82 ? -0.02 : 0;
      const p = Math.max(0, Math.min(100, Math.round((eased + stutter) * 100)));
      setProgress(p);
      // Readout shuffle slows as we approach lock.
      setReadoutTick((r) => r + 1);
      if (e < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setPhase("lock-focus");
        timeouts.push(window.setTimeout(() => setPhase("lock-exposure"), 220));
        timeouts.push(window.setTimeout(() => setPhase("reveal"), 520));
        timeouts.push(
          window.setTimeout(() => {
            setPhase("done");
            onDoneRef.current?.();
          }, 1080),
        );
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [play]);

  const revealing = phase === "reveal" || phase === "done";
  const locked = phase === "lock-focus" || phase === "lock-exposure" || phase === "reveal" || phase === "done";
  const aperture = locked ? "ƒ8" : APERTURES[readoutTick % APERTURES.length];
  const shutter = locked ? "1/250" : SHUTTERS[Math.floor(readoutTick / 2) % SHUTTERS.length];

  const phaseLabel: Record<Phase, string> = {
    idle: " ",
    metering: "> SETTING METER…",
    "lock-focus": "> FOCUS LOCK ●",
    "lock-exposure": "> EXPOSURE LOCK ●",
    reveal: "> SHUTTER",
    done: " ",
  };

  return (
    <div
      className="loader-frame"
      style={{
        background: revealing ? "transparent" : "var(--ink)",
        transition: "background 0.4s ease",
      }}
    >
      {(["tl", "tr", "bl", "br"] as CornerPos[]).map((p) => (
        <Corner key={p} pos={p} dim={revealing} />
      ))}

      {/* center crosshair + focus-lock bracket */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: revealing ? 0 : 1,
          transition: "opacity 0.4s",
        }}
      >
        <FocusLockBracket phase={phase} />
        <svg
          viewBox="0 0 60 60"
          width="60"
          height="60"
          fill="none"
          stroke="#f3efe7"
          strokeWidth="1"
          opacity={locked ? 0.95 : 0.65}
          style={{ transition: "opacity .25s" }}
        >
          <line x1="30" y1="0" x2="30" y2="22" />
          <line x1="30" y1="38" x2="30" y2="60" />
          <line x1="0" y1="30" x2="22" y2="30" />
          <line x1="38" y1="30" x2="60" y2="30" />
          <circle cx="30" cy="30" r={locked ? 4 : 6} style={{ transition: "r .25s" }} />
        </svg>
      </div>

      {/* top-left mark + label */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 22,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#f3efe7",
          opacity: revealing ? 0 : 1,
          transition: "opacity 0.3s",
        }}
      >
        <div style={{ width: 24, height: 24 }}>
          <Mark bg="#0e0c0a" ink="#f3efe7" />
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: "0.24em", opacity: 0.7 }}>
          KUSHGUPTA · {locked ? "LOCKED" : "METERING"}
        </span>
      </div>

      {/* top-right exif readout — shuffles, then settles */}
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 22,
          fontFamily: "var(--mono)",
          fontSize: 9.5,
          letterSpacing: "0.18em",
          color: "#f3efe7",
          opacity: revealing ? 0 : 0.78,
          transition: "opacity 0.3s",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {aperture} · {shutter} · ISO 200
      </div>

      {/* bottom strip: exposure meter + status */}
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 22,
          opacity: revealing ? 0 : 1,
          transition: "opacity 0.3s",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            color: "#f3efe7",
            marginBottom: 6,
            fontFamily: "var(--mono)",
            fontSize: 9.5,
            letterSpacing: "0.2em",
          }}
        >
          <span style={{ opacity: 0.6 }}>EXPOSURE</span>
          <span style={{ fontSize: 13, letterSpacing: "0.06em", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color: "var(--accent)" }}>{String(progress).padStart(3, "0")}</span>
            <span style={{ opacity: 0.4 }}> / 100</span>
          </span>
        </div>
        <div className="meter-bar">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div
          style={{
            marginTop: 8,
            color: "#f3efe7",
            fontFamily: "var(--mono)",
            fontSize: 9,
            letterSpacing: "0.2em",
            opacity: 0.55,
            minHeight: "1em",
          }}
        >
          {phaseLabel[phase]}
        </div>
      </div>

      {phase === "reveal" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#f3efe7",
            animation: "shutter 0.55s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

export function LoaderGate() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const alreadyShown =
    typeof sessionStorage !== "undefined" && sessionStorage.getItem("aperture.shown") === "1";
  const [show, setShow] = useState(!alreadyShown && !reduced);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className={`gate ${fading ? "gate-done" : ""}`}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && e.propertyName === "opacity") setShow(false);
      }}
    >
      <Loader
        play
        onDone={() => {
          sessionStorage.setItem("aperture.shown", "1");
          setFading(true);
        }}
      />
    </div>
  );
}
