// Contact / Hi section — closing surface. Dark background, calling card,
// bottom rule with copyright + back-to-top.

import { ContactCard } from "./ContactCard";
import { PROFILE } from "../content";

export function Contact() {
  return (
    <section
      id="contact"
      data-screen-label="04 Contact"
      style={{ background: "#0a0908", color: "var(--paper)", padding: "140px 36px 60px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.22em",
          color: "var(--ink-faint)",
          borderTop: "1.5px solid var(--rule)",
          paddingTop: 14,
          marginBottom: 60,
        }}
      >
        <span>§ 04 — CONTACT</span>
        <span>END OF ROLL</span>
      </div>

      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: "clamp(56px, 7.4vw, 120px)",
            letterSpacing: "-0.025em",
            lineHeight: 0.94,
            fontWeight: 400,
          }}
        >
          contact me.
        </div>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: 18,
            lineHeight: 1.55,
            color: "var(--ink-soft)",
            marginTop: 22,
            maxWidth: 540,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Take a card, drop a line.
        </div>
      </div>

      <ContactCard />

      <div
        style={{
          marginTop: 100,
          paddingTop: 18,
          borderTop: "1px solid var(--rule)",
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--ink-faint)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span>© {new Date().getFullYear()} {PROFILE.name.toUpperCase()}</span>
        <a href="#top" style={{ color: "var(--paper)" }}>
          ↑ BACK TO TOP
        </a>
        <span>ALL RIGHTS RESERVED</span>
      </div>
    </section>
  );
}
