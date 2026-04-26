// Lightweight scroll-triggered reveal. Wraps content in a div that fades up
// when it enters the viewport. One IntersectionObserver per instance, fires
// once. Falls back to immediate visibility if IO is unavailable.

import { useEffect, useRef, useState, type CSSProperties, type FC, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number; // ms
  y?: number; // px
  duration?: number; // ms
  threshold?: number;
  style?: CSSProperties;
  className?: string;
  id?: string;
};

export const Reveal: FC<Props> = ({
  children,
  delay = 0,
  y = 24,
  duration = 700,
  threshold = 0.15,
  style,
  className,
  id,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translate3d(0, ${y}px, 0)`,
        transition: `opacity ${duration}ms cubic-bezier(0.2,0.7,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.2,0.7,0.3,1) ${delay}ms`,
        willChange: visible ? undefined : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};
