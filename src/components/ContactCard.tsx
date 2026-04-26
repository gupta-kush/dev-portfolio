// Calling card — dark surface, mark + name + four contact rows. Click "Say
// Hello" to expand a message form below; submit posts to Formsubmit, which
// forwards to the inbox in PROFILE.email.

import { useState, type FormEvent } from "react";
import { Mark } from "./Wordmark";
import { PROFILE } from "../content";

type Status = "idle" | "sending" | "sent" | "error";

// Formsubmit hashed key — forwards to PROFILE.email without exposing it.
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/54950e4e90748a3c6fecbcbfa9fd5099";

export function ContactCard() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sender, setSender] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !sender.trim() || !contact.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: sender,
          contact,
          message: text,
          _subject: `Portfolio · message from ${sender}`,
          _captcha: "false",
          _template: "table",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: string };
      if (res.ok && (data.success === "true" || data.success === undefined)) {
        setStatus("sent");
        setTimeout(() => {
          setStatus("idle");
          setText("");
          setSender("");
          setContact("");
          setOpen(false);
        }, 2400);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const sendLabel =
    status === "sending" ? "SENDING…" : status === "sent" ? "SENT ✓" : status === "error" ? "RETRY →" : "SEND →";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        background: "#1a1815",
        color: "var(--paper)",
        boxShadow: "0 28px 60px rgba(0,0,0,.4)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        style={{
          padding: "clamp(24px, 4vw, 36px) clamp(20px, 4vw, 40px)",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "0 clamp(16px, 3vw, 28px)",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <div style={{ width: "clamp(56px, 9vw, 72px)", height: "clamp(56px, 9vw, 72px)" }}>
          <Mark bg="#1a1815" ink="var(--paper)" />
        </div>

        <div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(22px, 4vw, 30px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontStyle: "italic",
            }}
          >
            {PROFILE.name}
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9.5,
              letterSpacing: "0.24em",
              marginTop: 8,
              opacity: 0.55,
            }}
          >
            {PROFILE.tagline}
          </div>
        </div>

        <div></div>

        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid rgba(243,239,231,0.14)",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            columnGap: 18,
            rowGap: 8,
            fontFamily: "var(--mono)",
            fontSize: 11,
            lineHeight: 1.4,
            alignItems: "baseline",
          }}
        >
          <span style={{ opacity: 0.45, letterSpacing: "0.18em" }}>EMAIL</span>
          <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          <span style={{ opacity: 0.45, letterSpacing: "0.18em" }}>PHONE</span>
          <a href={`tel:${PROFILE.phone.replace(/\D/g, "")}`}>{PROFILE.phone}</a>
          <span style={{ opacity: 0.45, letterSpacing: "0.18em" }}>GITHUB</span>
          <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">
            {PROFILE.github.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
          <span style={{ opacity: 0.45, letterSpacing: "0.18em" }}>LINKEDIN</span>
          <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
            {PROFILE.linkedin.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
          <span style={{ opacity: 0.45, letterSpacing: "0.18em" }}>BASED</span>
          <span style={{ opacity: 0.85 }}>{PROFILE.location} · open to remote</span>
        </div>
      </div>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            background: "var(--accent)",
            color: "var(--ink)",
            border: "none",
            padding: "18px 24px",
            fontFamily: "var(--mono)",
            fontSize: 12,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-warm)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          <span>Say Hello</span>
          <span style={{ opacity: 0.5 }}>↓</span>
        </button>
      )}

      <div
        style={{
          maxHeight: open ? 720 : 0,
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition:
            "max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease 0.1s",
          background: "rgba(255,184,107,0.08)",
          borderTop: open ? "1px solid rgba(243,239,231,0.14)" : "none",
        }}
      >
        <form onSubmit={submit} style={{ padding: "clamp(20px, 4vw, 28px) clamp(20px, 4vw, 40px) clamp(24px, 4vw, 32px)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <div className="label-mono" style={{ color: "var(--paper)", opacity: 0.55 }}>
              DIRECT MESSAGE
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--paper)",
                opacity: 0.5,
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
              }}
            >
              CLOSE ×
            </button>
          </div>

          <Field label="FROM">
            <input
              required
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="your name"
              style={fieldStyle}
            />
          </Field>

          <Field label="CONTACT">
            <input
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email / phone / social"
              style={fieldStyle}
            />
          </Field>

          <Field label="MESSAGE">
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="tell me what you're thinking..."
              rows={3}
              style={{ ...fieldStyle, lineHeight: 1.4, resize: "none" }}
            />
          </Field>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 9.5,
                letterSpacing: "0.18em",
                opacity: status === "error" ? 0.9 : 0.4,
                color: status === "error" ? "var(--accent-warm)" : "var(--paper)",
              }}
            >
              {status === "error"
                ? "SOMETHING WENT WRONG · TRY AGAIN OR EMAIL DIRECTLY"
                : status === "sent"
                  ? "DELIVERED · I'LL GET BACK TO YOU SOON"
                  : `${text.length} CHARS · DELIVERED TO MY INBOX`}
            </div>
            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              style={{
                padding: "12px 22px",
                background: "var(--accent)",
                color: "var(--ink)",
                border: "none",
                cursor: status === "sending" || status === "sent" ? "default" : "pointer",
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: "0.22em",
                opacity: status === "sending" ? 0.7 : 1,
                transition: "background .2s, opacity .2s",
              }}
            >
              {sendLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(243,239,231,0.2)",
  padding: "8px 0",
  marginTop: 4,
  fontFamily: "var(--serif)",
  fontSize: 17,
  fontStyle: "italic",
  color: "var(--paper)",
  outline: "none",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 9,
          letterSpacing: "0.2em",
          opacity: 0.5,
          color: "var(--paper)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

import type React from "react";
