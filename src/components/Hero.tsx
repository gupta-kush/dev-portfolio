import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="h-screen w-full flex flex-col justify-center px-6 md:px-12 relative overflow-hidden">
      {/* Background Image - Photography incorporated subtly */}
      <div className="absolute right-0 top-0 w-full md:w-[60vw] h-full opacity-50">
        <img
          src="https://picsum.photos/seed/kushhero2/1200/1600"
          className="w-full h-full object-cover"
          alt="Hero background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent" />
        <div className="absolute inset-0 bg-[var(--color-bg)]/30 mix-blend-multiply" />
      </div>

      <div className="relative z-10">
        <motion.h1
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[22vw] md:text-[16vw] leading-[0.8] tracking-tighter uppercase text-[var(--color-text)] mix-blend-difference"
        >
          KUSH
          <br />
          GUPTA
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
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
