// Floating top nav. Transparent over hero, blurs to solid on scroll/case
// page. On mobile the section anchors collapse into a "MENU" toggle that
// drops a small panel below the bar.

import { useEffect, useState, type MouseEvent } from "react";
import { Mark } from "./Wordmark";
import type { Route } from "../hooks/useRoute";
import { useIsMobile } from "../hooks/useMediaQuery";

const NAV_ITEMS: { label: string; id: string }[] = [
  { label: "PROJECTS", id: "projects" },
  { label: "PICS", id: "pics" },
  { label: "RESUME", id: "resume" },
  { label: "CONTACT", id: "contact" },
];

type Props = { route: Route };

export function TopNav({ route }: Props) {
  const onCase = route.name === "case";
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onS = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onS, { passive: true });
    onS();
    return () => window.removeEventListener("scroll", onS);
  }, []);

  // Close the mobile menu when route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [route]);

  const showSolid = onCase || scrolled || menuOpen;
  const bg = showSolid ? "rgba(14,12,10,0.92)" : "transparent";
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
    setMenuOpen(false);
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "12px clamp(16px, 3vw, 36px)",
        display: "flex",
        alignItems: "center",
        gap: 12,
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
      <a href="#/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 22, height: 22, display: "inline-flex" }}>
          <Mark bg={markBg} ink={fg} />
        </span>
        <span style={{ whiteSpace: "nowrap" }}>KUSH GUPTA</span>
      </a>

      {onCase && (
        <a
          href="#/"
          style={{
            marginLeft: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            opacity: 0.78,
            transition: "opacity .2s, gap .2s",
            whiteSpace: "nowrap",
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

      <span
        style={{
          marginLeft: "auto",
          display: "flex",
          gap: isMobile ? 0 : 16,
          alignItems: "center",
        }}
      >
        {!isMobile &&
          NAV_ITEMS.map((item, i) => (
            <span key={item.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
        {isMobile && (
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            style={{
              background: "transparent",
              color: "inherit",
              border: "1px solid currentColor",
              padding: "6px 10px",
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.22em",
              cursor: "pointer",
            }}
          >
            {menuOpen ? "CLOSE" : "MENU"}
          </button>
        )}
      </span>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(14,12,10,0.95)",
            backdropFilter: "blur(14px) saturate(140%)",
            WebkitBackdropFilter: "blur(14px) saturate(140%)",
            borderBottom: "1px solid var(--rule)",
            padding: "16px clamp(16px, 3vw, 36px) 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            color: "#fff",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={onAnchorClick(item.id)}
              style={{
                fontFamily: "var(--mono)",
                fontSize: 13,
                letterSpacing: "0.22em",
                padding: "6px 0",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
