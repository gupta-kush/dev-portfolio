import { motion } from "motion/react";
import { ReactionDiffusion } from "./pieces/ReactionDiffusion";
import { TypingTrainer } from "./pieces/TypingTrainer";
import { ParticleField } from "./pieces/ParticleField";
import { Kaleidoscope } from "./pieces/Kaleidoscope";
import { GenerativePoster } from "./pieces/GenerativePoster";
import { CursorGlider } from "./pieces/CursorGlider";

export function Playground() {
  return (
    <section
      id="playground"
      className="relative bg-[var(--color-surface)] py-24 md:py-32"
    >
      <div className="px-6 md:px-12 mb-16 md:mb-24 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-muted)] mb-4">
              Six things, one tab
            </p>
            <h2 className="font-display text-6xl md:text-8xl leading-[0.85] uppercase text-[var(--color-text)]">
              The
              <br />
              Playground
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-md text-[var(--color-muted)] text-lg leading-relaxed"
          >
            Some small things I made. A few you watch, a few you mess with.
            They all run in your browser.
          </motion.p>
        </div>
      </div>

      <div className="flex flex-col">
        <ReactionDiffusion />
        <TypingTrainer />
        <ParticleField />
        <Kaleidoscope />
        <GenerativePoster />
        <CursorGlider />
      </div>
    </section>
  );
}
