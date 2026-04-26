// Floating top nav. Transparent over hero, blurs to solid on scroll/case page.

import { useEffect, useState, type MouseEvent } from "react";
import { Mark } from "./Wordmark";
import type { Route } from "../hooks/useRoute";

const NAV_ITEMS: { label: string; id: string }[] = [
  { label: "PROJECTS", id: "projects" },
  { label: "PICS", id: "pics" },
  { label: "RESUME", id: "resume" },
  { label: "CONTACT", id: "contact" },
];

type Props = { route: Route };

export function TopNav({ route }: Props) {
  const onCase = route.name === "case";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onS = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onS, { passive: true });
    onS();
    return () => window.removeEventListener("scroll", onS);
  }, []);

  const showSolid = onCase || scrolled;
  const bg = showSolid ? "rgba(14,12,10,0.85)" : "transparent";
  const fg = onCase ? "var(--paper)" : "#fff";
  const border = showSolid ? "1px solid var(--rule)" : "1px solid transparent";
  const markBg = onCase ? "var(--paper)" : showSolid ? "#0e0c0a" : "#0a0908";

  // Section anchors work on home directly. On a case page, navigate home
  // first, then scroll to the target after the home view mounts.
  const onAnchorClick = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    const scrollTo = () =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (onCase) {
      window.location.hash = "#/";
      window.setTimeout(scrollTo, 80);
    } else {
      scrollTo();
    }
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "14px clamp(20px, 3vw, 36px)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontFamily: "var(--mono)",
        fontSize: 11,
        letterSpacing: "0.22em",
        color: fg,
        background: bg,
        borderBottom: border,
        backdropFilter: showSolid ? "blur(14px) saturate(140%)" : "none",
        WebkitBackdropFilter: showSolid ? "blur(14px) saturate(140%)" : "none",
        transition: "background .35s, border-color .35s, color .35s",
      }}
    >
      <a href="#/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 22, height: 22, display: "inline-flex" }}>
          <Mark bg={markBg} ink={fg} />
        </span>
        <span>KUSH GUPTA</span>
      </a>

      {onCase && (
        <a
          href="#/"
          style={{
            marginLeft: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            opacity: 0.78,
            transition: "opacity .2s, gap .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.gap = "12px";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.78";
            e.currentTarget.style.gap = "8px";
          }}
        >
          ← HOME
        </a>
      )}

      <span style={{ marginLeft: "auto", display: "flex", gap: 18, alignItems: "center" }}>
        {NAV_ITEMS.map((item, i) => (
          <span key={item.id} style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <a
              href={`#${item.id}`}
              onClick={onAnchorClick(item.id)}
              style={{ transition: "color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              {item.label}
            </a>
            {i < NAV_ITEMS.length - 1 && <span style={{ opacity: 0.35 }}>|</span>}
          </span>
        ))}
      </span>
    </nav>
  );
}
