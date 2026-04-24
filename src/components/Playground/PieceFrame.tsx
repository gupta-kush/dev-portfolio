import { motion } from "motion/react";
import type { ReactNode } from "react";

interface PieceFrameProps {
  number: string;
  title: string;
  caption: string;
  hint?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PieceFrame({
  number,
  title,
  caption,
  hint,
  actions,
  children,
}: PieceFrameProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative px-6 md:px-12 py-24 md:py-32"
    >
      <div className="grid grid-cols-12 gap-6 md:gap-8 max-w-[1600px] mx-auto">
        <div className="col-span-12 md:col-span-2 flex md:flex-col items-baseline md:items-start gap-4">
          <div className="font-display text-7xl md:text-[8rem] leading-none text-[var(--color-text)] select-none">
            {number}
          </div>
        </div>

        <div className="col-span-12 md:col-span-10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--color-surface)] pb-4">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                Playground Nº {number}
              </p>
              <h3 className="font-display text-3xl md:text-5xl uppercase tracking-tight leading-[0.95] text-[var(--color-text)]">
                {title}
              </h3>
            </div>
            {actions && (
              <div className="flex items-center gap-3">{actions}</div>
            )}
          </div>

          <p className="italic text-[var(--color-muted)] text-base md:text-lg max-w-2xl leading-relaxed">
            {caption}
          </p>

          <div className="relative w-full mt-4">{children}</div>

          {hint && (
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)] mt-2">
              ↳ {hint}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function PieceAction({
  onClick,
  label,
  children,
}: {
  onClick?: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-accent)] border border-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors duration-200"
    >
      {children}
    </button>
  );
}
