import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ReactionDiffusionCanvas } from "./Playground/pieces/canvas/ReactionDiffusionCanvas";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-4%", "8%"]);

  const firstName = "KUSH".split("");
  const lastName = "GUPTA".split("");

  const letterVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  return (
    <section ref={containerRef} className="h-screen w-full flex flex-col justify-center px-6 md:px-12 relative overflow-hidden">
      {/* Reaction-diffusion backdrop with parallax */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-x-0 -top-[12%] h-[140%]"
      >
        <div className="absolute inset-0 opacity-55">
          <ReactionDiffusionCanvas
            gridW={220}
            gridH={130}
            steps={2}
            interactive={false}
            autoSeedInterval={2200}
            ariaLabel="Slow reaction-diffusion pattern"
          />
        </div>
        {/* Soften the left third so the name is readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)]/55 to-transparent" />
        {/* Vertical fades at the very top + bottom so parallax can't reveal a hard seam */}
        <div className="absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-[var(--color-bg)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
        <div className="absolute inset-0 bg-[var(--color-bg)]/20 mix-blend-multiply" />
      </motion.div>

      <div className="relative z-10">
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="font-display text-[22vw] md:text-[16vw] leading-[0.8] tracking-tighter uppercase text-[var(--color-text)] mix-blend-difference flex flex-col"
        >
          <div className="flex overflow-hidden">
            {firstName.map((letter, i) => (
              <motion.span key={`f-${i}`} variants={letterVariants} className="inline-block">
                {letter}
              </motion.span>
            ))}
          </div>
          <div className="flex overflow-hidden">
            {lastName.map((letter, i) => (
              <motion.span key={`l-${i}`} variants={letterVariants} className="inline-block">
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </div>
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{
          opacity: { duration: 1, delay: 0.8 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
        }}
        className="absolute bottom-12 left-6 md:left-12 flex flex-col md:flex-row gap-4 md:gap-12 font-mono text-xs md:text-sm uppercase tracking-widest text-[var(--color-muted)] z-20"
      >
        <p className="flex items-center gap-4">
          <span className="w-8 h-px bg-[var(--color-accent)]"></span>
          Software Engineer
        </p>
      </motion.div>
    </section>
  );
}
