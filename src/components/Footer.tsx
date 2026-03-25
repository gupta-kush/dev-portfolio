import { motion } from "motion/react";

export function Footer() {
  return (
    <footer className="bg-[var(--color-accent)] text-[var(--color-bg)] py-32 px-6 md:px-12 selection:bg-[var(--color-bg)] selection:text-[var(--color-accent)]">
      <div className="max-w-[100vw] overflow-hidden">
        <motion.h2 
          initial={{ y: "120%" }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "0px 0px -20% 0px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[18vw] leading-[0.8] uppercase text-center mb-20 tracking-tighter"
        >
          Let's Talk
        </motion.h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto font-mono uppercase tracking-widest text-sm">
        <div className="flex flex-col gap-4">
          <p className="text-[var(--color-bg)]/60 mb-4">Socials</p>
          <a href="https://github.com/gupta-kush/" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 group transition-transform hover:translate-x-2">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/kushgg/" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 group transition-transform hover:translate-x-2">
            LinkedIn
          </a>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-[var(--color-bg)]/60 mb-4">Contact</p>
          <a href="mailto:kushg0124@gmail.com" className="hover:underline underline-offset-4 group transition-transform hover:translate-x-2">
            kushg0124@gmail.com
          </a>
          <a href="tel:972-800-4922" className="hover:underline underline-offset-4 group transition-transform hover:translate-x-2">
            972-800-4922
          </a>
        </div>
        <div className="flex flex-col gap-4 md:text-right">
          <p className="text-[var(--color-bg)]/60 mb-4">Location</p>
          <p>Dallas, TX</p>
          <p className="mt-auto pt-8 text-xs text-[var(--color-bg)]/60">
            © {new Date().getFullYear()} Kush Gupta
          </p>
        </div>
      </div>
    </footer>
  );
}
