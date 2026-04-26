import { useEffect } from "react";
import Lenis from "lenis";

// Wraps Lenis for momentum-style wheel/trackpad scroll. Native touch
// scrolling on mobile stays untouched (Lenis defaults to smoothTouch:false)
// because trying to intercept touch usually feels worse than the OS impl.
//
// Respects prefers-reduced-motion: returns immediately without enabling
// Lenis if the user has the OS setting on.
export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
}
