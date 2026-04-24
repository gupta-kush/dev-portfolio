import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { RotateCcw } from "lucide-react";
import { PieceFrame, PieceAction } from "../PieceFrame";

const PHRASES = [
  "the best code is the code you didn't have to write. the second best is the code that another version of you can read tomorrow morning at nine without coffee.",
  "engineering is mostly negotiating with reality. you push, it pushes back, you adjust. nobody wins, but the bug closes.",
  "premature optimization is the root of evil, but premature abstraction is the root of evil with worse tests.",
  "a good interface answers two questions: what does it do, and what will it do next. everything else is decoration.",
  "computers are deterministic until you put them on a network. then they become weather.",
  "every system is exactly as complicated as the simplest correct version, plus the parts you couldn't bring yourself to delete.",
  "the rubber duck doesn't actually solve the problem. it just makes you talk slowly enough that you do.",
  "your future self is a stranger you owe a favor to. comment accordingly.",
];

function pickPhrase(exclude: string | null): string {
  let p = PHRASES[Math.floor(Math.random() * PHRASES.length)];
  let attempts = 0;
  while (p === exclude && attempts < 4) {
    p = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    attempts++;
  }
  return p;
}

export function TypingTrainer() {
  const [phrase, setPhrase] = useState<string>(() => pickPhrase(null));
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(performance.now());
  const [errors, setErrors] = useState(0);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startedAt) return;
    let raf = 0;
    const tick = () => {
      setNow(performance.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startedAt]);

  const finished = typed.length >= phrase.length;
  const minutes = startedAt ? (now - startedAt) / 60000 : 0;
  const wpm = startedAt && minutes > 0 ? Math.round(typed.length / 5 / minutes) : 0;
  const correctSoFar = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === phrase[i]) c++;
    }
    return c;
  }, [typed, phrase]);
  const accuracy = typed.length > 0 ? Math.round((correctSoFar / typed.length) * 100) : 100;

  const reset = () => {
    setPhrase(pickPhrase(phrase));
    setTyped("");
    setStartedAt(null);
    setErrors(0);
    inputRef.current?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (finished) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      setTyped((t) => t.slice(0, -1));
      return;
    }
    if (e.key.length !== 1) return;
    if (!startedAt) setStartedAt(performance.now());
    const next = e.key;
    const expected = phrase[typed.length];
    if (next !== expected) setErrors((n) => n + 1);
    setTyped((t) => t + next);
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <PieceFrame
      number="02"
      title="Typing Trainer"
      caption="A paragraph picks itself when you start. Words-per-minute and accuracy update live. The cursor blinks like it's 1996."
      hint={focused ? "type to continue · backspace to correct" : "click the page and start typing"}
      actions={
        <PieceAction onClick={reset} label="New Phrase">
          <RotateCcw size={12} strokeWidth={1.5} />
          <span>New Phrase</span>
        </PieceAction>
      }
    >
      <div
        ref={containerRef}
        onClick={focusInput}
        className="relative w-full bg-[#f5ede1] text-[#1a1514] px-6 md:px-12 py-12 md:py-20 cursor-text select-none"
        style={{ minHeight: "min(60vh, 540px)" }}
      >
        <input
          ref={inputRef}
          type="text"
          value=""
          onChange={() => {}}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Type the phrase shown"
          className="absolute opacity-0 pointer-events-none"
          style={{ left: "-9999px", top: "-9999px" }}
        />

        <div className="flex justify-between items-baseline mb-8 font-mono text-[10px] uppercase tracking-[0.25em] text-[#1a1514]/50">
          <span>{startedAt ? "Live" : "Idle"} · {wpm} WPM · {accuracy}% accuracy · {errors} mis-strokes</span>
          <span className="hidden md:inline">{typed.length} / {phrase.length}</span>
        </div>

        <p className="font-mono text-xl md:text-3xl leading-relaxed tracking-wide whitespace-pre-wrap break-words max-w-4xl">
          {phrase.split("").map((ch, i) => {
            const t = typed[i];
            const isCurrent = i === typed.length && !finished;
            let cls = "text-[#1a1514]/30";
            if (i < typed.length) {
              cls = t === ch ? "text-[#1a1514]" : "text-[#e85d38] underline decoration-[#e85d38]";
            }
            const display = ch === " " && t !== undefined && t !== ch ? "·" : ch;
            return (
              <span
                key={i}
                className={
                  cls +
                  (isCurrent ? " bg-[#e85d38]/20 border-l-2 border-[#e85d38] -ml-[2px]" : "")
                }
              >
                {display}
              </span>
            );
          })}
        </p>

        {finished && (
          <div className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-[#1a1514]/70">
            done · {wpm} WPM · {accuracy}% accuracy ·{" "}
            <button
              onClick={reset}
              className="underline underline-offset-4 hover:text-[#e85d38]"
            >
              new phrase
            </button>
          </div>
        )}
      </div>
    </PieceFrame>
  );
}
