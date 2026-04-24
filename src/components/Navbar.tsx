import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center z-50 mix-blend-difference pointer-events-none text-[var(--color-text)]"
    >
      <a
        href="#top"
        className="font-display text-3xl uppercase tracking-widest pointer-events-auto hover:text-[var(--color-accent)] transition-colors"
      >
        KG
      </a>
      <div className="flex gap-6 md:gap-12 font-mono text-xs md:text-sm uppercase tracking-widest pointer-events-auto">
        <a href="#code" className="hover:text-[var(--color-accent)] transition-colors">
          Code
        </a>
        <a href="#playground" className="hover:text-[var(--color-accent)] transition-colors">
          Playground
        </a>
      </div>
    </motion.nav>
  );
}
