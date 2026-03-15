import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth.jsx";
import { useNotes } from "./useNotes.jsx";
import { useConversations, groupByDate } from "./useConversations.jsx";
import AuthModal from "./AuthModal.jsx";
import { DS, globalCSS } from "./styles/tokens.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Du er FagAI – en venlig og klog læringsassistent for danske skoleelever. 
Dit mål er at hjælpe elever med at LÆRE selv – ikke at lave opgaverne for dem.

REGLER:
1. Skriv ALDRIG en hel stil, opgave, rapport eller aflevering for eleven.
2. Giv idéer, forklaringer, eksempler og spørgsmål der hjælper eleven til selv at lære.
3. Forklar svære begreber med hverdagseksempler.
4. Til matematik: vis fremgangsmåden men lad eleven selv regne svaret.
5. Til programmering: forklar koncepter og giv korte eksempler.
6. Vær altid opmuntrende og positiv.
7. Svar på dansk medmindre eleven skriver på et andet sprog.
8. Brug punktlister, kodeblokke og overskrifter når det giver mening.`;

const SUBJECTS = [
  { id:"math",    label:"Matematik",     icon:"∑",    color:"#f97316" },
  { id:"danish",  label:"Dansk",         icon:"Æ",    color:"#a855f7" },
  { id:"english", label:"Engelsk",       icon:"En",   color:"#10b981" },
  { id:"coding",  label:"Programmering", icon:"</>",  color:"#3b82f6" },
  { id:"science", label:"Naturfag",      icon:"⚗",    color:"#06b6d4" },
  { id:"history", label:"Historie",      icon:"📜",   color:"#d97706" },
  { id:"geo",     label:"Geografi",      icon:"🌍",   color:"#0ea5e9" },
  { id:"social",  label:"Samfundsfag",   icon:"⚖",    color:"#8b5cf6" },
];

const QUICK_STARTERS = [
  { label: "Forklar hvordan et essay opbygges", subject: "danish" },
  { label: "Hvad er en andengradsligning?",     subject: "math" },
  { label: "Hjælp mig med at forstå fotosyntese", subject: "science" },
  { label: "Forklar den kolde krig kort",       subject: "history" },
  { label: "Hvad er en for-løkke i Python?",    subject: "coding" },
  { label: "Forklar forskellen på der/there/their", subject: "english" },
];

const sub = (id) => SUBJECTS.find(s => s.id === id) || SUBJECTS[0];

// ─── Markdown Renderer ────────────────────────────────────────────────────────
function renderMarkdown(text) {
  const lines = text.split("\n");
  const out = [];
  let inCode = false, codeLang = "", codeLines = [], i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        out.push(
          <div key={"c" + i} style={{ position: "relative", margin: "12px 0" }}>
            {codeLang && (
              <div style={{ position: "absolute", top: 8, right: 12, fontSize: 11, color: DS.textMuted, fontFamily: 'var(--font-mono)', letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {codeLang}
              </div>
            )}
            <pre style={{ background: "#0d0d0f", border: `1px solid ${DS.border}`, borderRadius: DS.radius, padding: "14px 16px", overflowX: "auto", fontSize: 13, lineHeight: 1.8, color: "#c4b5fd", fontFamily: 'var(--font-mono)', margin: 0 }}>
              <code>{codeLines.join("\n")}</code>
            </pre>
          </div>
        );
        inCode = false; codeLang = ""; codeLines = [];
      }
      i++; continue;
    }
    if (inCode) { codeLines.push(line); i++; continue; }

    if (line.startsWith("### ")) {
      out.push(<h4 key={i} style={{ fontSize: 12, fontWeight: 600, color: DS.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", margin: "14px 0 5px", fontFamily: 'var(--font-body)' }}>{line.slice(4)}</h4>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      out.push(<h3 key={i} style={{ fontSize: 16, fontWeight: 700, color: DS.text, margin: "14px 0 5px" }}>{line.slice(3)}</h3>);
      i++; continue;
    }
    if (line.startsWith("# ")) {
      out.push(<h2 key={i} style={{ fontSize: 19, fontWeight: 700, color: DS.text, margin: "16px 0 6px" }}>{line.slice(2)}</h2>);
      i++; continue;
    }

    if (line.match(/^[-*] /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(<li key={i} style={{ marginBottom: 4, paddingLeft: 2 }}>{inlineMarkdown(lines[i].slice(2))}</li>);
        i++;
      }
      out.push(<ul key={"ul" + i} style={{ paddingLeft: 20, margin: "8px 0", color: DS.text, lineHeight: 1.8 }}>{items}</ul>);
      continue;
    }

    if (line.match(/^\d+\. /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(<li key={i} style={{ marginBottom: 4 }}>{inlineMarkdown(lines[i].replace(/^\d+\. /, ""))}</li>);
        i++;
      }
      out.push(<ol key={"ol" + i} style={{ paddingLeft: 20, margin: "8px 0", color: DS.text, lineHeight: 1.8 }}>{items}</ol>);
      continue;
    }

    if (line === "") { out.push(<div key={i} style={{ height: 6 }} />); i++; continue; }

    out.push(
      <p key={i} style={{ margin: "3px 0", lineHeight: 1.82, color: DS.text, fontSize: 14.5 }}>
        {inlineMarkdown(line)}
      </p>
    );
    i++;
  }
  return out;
}

function inlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i} style={{ fontWeight: 700, color: DS.text }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return <code key={i} style={{ background: DS.bgElevated, border: `1px solid ${DS.border}`, borderRadius: 5, padding: "1px 6px", fontSize: "0.85em", fontFamily: 'var(--font-mono)', color: "#a78bfa" }}>{p.slice(1, -1)}</code>;
    if (p.startsWith("*") && p.endsWith("*"))
      return <em key={i} style={{ fontStyle: "italic", color: DS.textMid }}>{p.slice(1, -1)}</em>;
    return p;
  });
}

// ─── UI Primitives ────────────────────────────────────────────────────────────
function Button({ children, onClick, variant = "primary", size = "md", disabled, style: extraStyle, ...props }) {
  const [hover, setHover] = useState(false);

  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 7, border: "none", borderRadius: DS.radiusSm, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: 'var(--font-body)', fontWeight: 600, transition: "all 0.14s ease",
    opacity: disabled ? 0.45 : 1,
    outline: "none",
  };

  const sizes = {
    sm: { fontSize: 12.5, padding: "6px 12px", height: 30 },
    md: { fontSize: 13.5, padding: "8px 16px", height: 36 },
    lg: { fontSize: 15,   padding: "11px 22px", height: 44 },
  };

  const variants = {
    primary: {
      background: hover ? DS.accentHover : DS.accent,
      color: "#fff",
      boxShadow: hover ? `0 0 20px ${DS.accentGlow}` : "none",
    },
    ghost: {
      background: hover ? DS.bgHover : "transparent",
      color: hover ? DS.text : DS.textMid,
      border: `1px solid ${hover ? DS.borderMid : "transparent"}`,
    },
    outline: {
      background: hover ? DS.bgHover : "transparent",
      color: DS.text,
      border: `1px solid ${hover ? DS.borderHover : DS.border}`,
    },
    danger: {
      background: hover ? "rgba(248,113,113,0.15)" : "transparent",
      color: DS.error,
      border: `1px solid ${hover ? "rgba(248,113,113,0.4)" : "transparent"}`,
    },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}
      {...props}
    >
      {children}
    </button>
  );
}

function Tooltip({ children, label }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: DS.bgElevated, border: `1px solid ${DS.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: DS.textMid, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 99, animation: "fadeIn 0.12s ease" }}>
          {label}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose, conversations, activeConvId, loadingConvs, onSelect, onCreate, onDelete, user, onLogout, navigate }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div onClick={onClose} style={{ display: "none", position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 39 }}
          className="mobile-overlay" />
      )}

      <aside style={{
        width: 260, minWidth: 260,
        background: DS.sidebar,
        borderRight: `1px solid ${DS.sidebarBorder}`,
        display: "flex", flexDirection: "column",
        height: "100%", overflow: "hidden",
        transition: "transform 0.22s ease",
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${DS.sidebarBorder}`, flexShrink: 0 }}>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%", marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, boxShadow: "0 2px 10px rgba(99,102,241,0.4)" }}>🎓</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: DS.text, fontFamily: 'var(--font-body)', letterSpacing: "-0.2px" }}>FagAI</span>
          </button>

          <button onClick={onCreate}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: DS.radiusSm, background: DS.bgElevated, border: `1px solid ${DS.border}`, color: DS.text, fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: 'var(--font-body)', transition: "all 0.13s" }}
            onMouseEnter={e => { e.currentTarget.style.background = DS.bgHover; e.currentTarget.style.borderColor = DS.borderMid; }}
            onMouseLeave={e => { e.currentTarget.style.background = DS.bgElevated; e.currentTarget.style.borderColor = DS.border; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.textMid} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Ny samtale
          </button>
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {loadingConvs && (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: 34, background: DS.bgElevated, borderRadius: DS.radiusSm, marginBottom: 4, opacity: 1 - i * 0.15, animation: "pulse 1.8s ease infinite" }} />
              ))}
            </div>
          )}
          {!loadingConvs && conversations.length === 0 && (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>💬</div>
              <p style={{ fontSize: 13, color: DS.textMuted, lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>Ingen samtaler endnu.<br />Start ved at stille et spørgsmål.</p>
            </div>
          )}
          {!loadingConvs && Object.entries(groupByDate(conversations)).map(([label, convs]) => (
            <div key={label} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: DS.textMuted, letterSpacing: "0.7px", textTransform: "uppercase", padding: "8px 8px 4px", fontFamily: 'var(--font-body)' }}>
                {label}
              </div>
              {convs.map(conv => {
                const isActive = conv.id === activeConvId;
                const isHovered = hoveredId === conv.id;
                return (
                  <div key={conv.id}
                    style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 1 }}
                    onMouseEnter={() => setHoveredId(conv.id)}
                    onMouseLeave={() => setHoveredId(null)}>
                    <button onClick={() => onSelect(conv.id)}
                      style={{ flex: 1, padding: "7px 10px", borderRadius: DS.radiusSm, background: isActive ? DS.bgElevated : isHovered ? "rgba(255,255,255,0.04)" : "transparent", border: `1px solid ${isActive ? DS.borderMid : "transparent"}`, color: isActive ? DS.text : DS.textMid, fontSize: 13, fontWeight: isActive ? 500 : 400, textAlign: "left", cursor: "pointer", fontFamily: 'var(--font-body)', lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "all 0.1s" }}>
                      {conv.title}
                    </button>
                    {isHovered && (
                      <button onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
                        style={{ width: 26, height: 26, borderRadius: 6, background: "transparent", border: "none", color: DS.textMuted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.1s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.12)"; e.currentTarget.style.color = DS.error; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = DS.textMuted; }}>
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* User section */}
        <div style={{ borderTop: `1px solid ${DS.sidebarBorder}`, padding: "12px 12px", flexShrink: 0 }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {(user.name || user.email || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: DS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name || user.email}</div>
                <div style={{ fontSize: 11, color: DS.textMuted }}>{user.email}</div>
              </div>
              <button onClick={onLogout} title="Log ud"
                style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: "none", color: DS.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.1s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.1)"; e.currentTarget.style.color = DS.error; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = DS.textMuted; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
            </div>
          ) : (
            <button onClick={() => { }}
              style={{ width: "100%", padding: "9px 12px", borderRadius: DS.radiusSm, background: DS.accentSoft, border: `1px solid rgba(99,102,241,0.25)`, color: "#818cf8", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: 'var(--font-body)', transition: "all 0.13s" }}>
              Log ind for at gemme historik
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Chat Message ─────────────────────────────────────────────────────────────
function Message({ msg, isLast, user }) {
  const isUser = msg.role === "user";

  return (
    <div className="fade-up" style={{ display: "flex", gap: 12, justifyContent: isUser ? "flex-end" : "flex-start", alignItems: "flex-start", maxWidth: 720, margin: "0 auto", width: "100%", padding: "0 16px" }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, marginTop: 2, boxShadow: "0 2px 12px rgba(99,102,241,0.35)" }}>🎓</div>
      )}

      <div style={{
        maxWidth: isUser ? "72%" : "100%",
        background: isUser ? DS.userBg : "transparent",
        border: isUser ? `1px solid ${DS.userBorder}` : "none",
        borderRadius: isUser ? "16px 16px 4px 16px" : 0,
        padding: isUser ? "11px 16px" : "4px 0",
        fontSize: 14.5,
        color: DS.text,
        lineHeight: 1.78,
        fontFamily: 'var(--font-body)',
      }}>
        {isUser ? (
          <span style={{ color: DS.text }}>{msg.content}</span>
        ) : (
          <div className="prose">{renderMarkdown(msg.content)}</div>
        )}
      </div>

      {isUser && (
        <div style={{ width: 32, height: 32, borderRadius: 9, background: DS.bgElevated, border: `1px solid ${DS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: DS.textMid, flexShrink: 0, marginTop: 2, fontWeight: 700 }}>
          {user ? (user.name || user.email || "?")[0].toUpperCase() : "U"}
        </div>
      )}
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="fade-in" style={{ display: "flex", gap: 12, alignItems: "flex-start", maxWidth: 720, margin: "0 auto", width: "100%", padding: "0 16px" }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, boxShadow: "0 2px 12px rgba(99,102,241,0.35)" }}>🎓</div>
      <div style={{ padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
        {[0, 0.22, 0.44].map((d, i) => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: DS.textMuted, animation: `blink 1.4s ease ${d}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Empty State / Welcome ────────────────────────────────────────────────────
function WelcomeScreen({ onQuickStart, activeSubject }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 40, maxWidth: 680, margin: "0 auto", width: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(99,102,241,0.35)" }}>🎓</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: DS.text, fontFamily: 'var(--font-display)', marginBottom: 10, letterSpacing: "-0.5px" }}>
          {activeSubject ? `Lad os tale om ${sub(activeSubject).label}` : "Hvad vil du lære i dag?"}
        </h1>
        <p style={{ fontSize: 15, color: DS.textMid, lineHeight: 1.65, maxWidth: 420, margin: "0 auto" }}>
          Stil mig et spørgsmål — jeg hjælper dig med at forstå, ikke med at snyde.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
        {QUICK_STARTERS.map((q, i) => {
          const s = sub(q.subject);
          return (
            <button key={i} onClick={() => onQuickStart(q)}
              style={{ padding: "12px 14px", borderRadius: DS.radius, background: DS.bgSurface, border: `1px solid ${DS.border}`, color: DS.textMid, fontSize: 13.5, cursor: "pointer", textAlign: "left", fontFamily: 'var(--font-body)', transition: "all 0.14s", display: "flex", alignItems: "flex-start", gap: 10, lineHeight: 1.4 }}
              onMouseEnter={e => { e.currentTarget.style.background = DS.bgElevated; e.currentTarget.style.borderColor = DS.borderMid; e.currentTarget.style.color = DS.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = DS.bgSurface; e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.color = DS.textMid; }}>
              <span style={{ fontSize: 14, opacity: 0.7, flexShrink: 0 }}>{s.icon}</span>
              <span>{q.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chat Input ───────────────────────────────────────────────────────────────
function ChatInput({ value, onChange, onSend, onKeyDown, loading, activeSubject, onClearSubject, textareaRef }) {
  const [focused, setFocused] = useState(false);
  const s = activeSubject ? sub(activeSubject) : null;

  return (
    <div style={{ padding: "16px 24px 20px", background: DS.bg, borderTop: `1px solid ${DS.border}`, flexShrink: 0 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {s && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: DS.radiusFull, background: `${s.color}18`, border: `1px solid ${s.color}35`, color: s.color, fontSize: 12, fontWeight: 500 }}>
              <span>{s.icon}</span> {s.label}
              <button onClick={onClearSubject} style={{ background: "none", border: "none", color: s.color, opacity: 0.6, fontSize: 13, cursor: "pointer", lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
            </div>
          </div>
        )}
        <div style={{ position: "relative", background: DS.bgSurface, border: `1px solid ${focused ? DS.borderHover : DS.border}`, borderRadius: 14, transition: "border-color 0.18s, box-shadow 0.18s", boxShadow: focused ? `0 0 0 3px rgba(99,102,241,0.12)` : DS.shadowSm }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={s ? `Spørg om ${s.label.toLowerCase()}…` : "Stil et spørgsmål…"}
            rows={1}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", padding: "14px 56px 14px 16px", fontSize: 15, color: DS.text, fontFamily: 'var(--font-body)', lineHeight: 1.6, maxHeight: 160, overflowY: "auto", display: "block" }}
          />
          <button onClick={onSend}
            disabled={!value.trim() || loading}
            style={{ position: "absolute", right: 10, bottom: 10, width: 36, height: 36, borderRadius: DS.radiusSm, background: value.trim() && !loading ? DS.accent : DS.bgElevated, border: "none", cursor: value.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.14s", boxShadow: value.trim() && !loading ? `0 2px 12px ${DS.accentGlow}` : "none" }}>
            {loading ? (
              <div style={{ width: 14, height: 14, border: `2px solid ${DS.textMuted}`, borderTopColor: DS.text, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={value.trim() ? "#fff" : DS.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
        <p style={{ fontSize: 11.5, color: DS.textMuted, textAlign: "center", marginTop: 8, fontFamily: 'var(--font-body)' }}>
          FagAI hjælper dig med at lære — ikke med at snyde · Enter for send, Shift+Enter for ny linje
        </p>
      </div>
    </div>
  );
}

// ─── Notes View ───────────────────────────────────────────────────────────────
function NotesView({ notes, notesLoading, notesSaving, onSelect, onCreate, onDelete, onUpdate, activeNote, setActiveNote }) {
  const [noteSearch, setNoteSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("math");
  const editorRef = useRef(null);
  const newEditorRef = useRef(null);
  const [editing, setEditing] = useState(false);

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
    (n.content || "").replace(/<[^>]+>/g, "").toLowerCase().includes(noteSearch.toLowerCase())
  );

  const stripHtml = (html) => (html || "").replace(/<[^>]+>/g, "");

  const saveNew = async () => {
    if (!newTitle.trim()) return;
    const body = newEditorRef.current?.innerHTML || "";
    const note = await onCreate({ title: newTitle, subject: newSubject, body });
    if (note) { setShowNew(false); setNewTitle(""); setActiveNote(note); }
  };

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Notes list */}
      <div style={{ width: 280, minWidth: 280, background: DS.bgSurface, borderRight: `1px solid ${DS.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${DS.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: DS.text, fontFamily: 'var(--font-body)', display: "flex", alignItems: "center", gap: 8 }}>
              Noter
              {notesSaving && <span style={{ fontSize: 11, color: DS.textMuted, fontWeight: 400 }}>· gemmer…</span>}
            </span>
            <button onClick={() => { setShowNew(true); setActiveNote(null); setEditing(false); }}
              style={{ width: 28, height: 28, borderRadius: 7, background: DS.accent, border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.13s" }}
              onMouseEnter={e => e.currentTarget.style.background = DS.accentHover}
              onMouseLeave={e => e.currentTarget.style.background = DS.accent}>+</button>
          </div>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DS.textMuted} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input value={noteSearch} onChange={e => setNoteSearch(e.target.value)} placeholder="Søg noter…"
              style={{ width: "100%", height: 34, paddingLeft: 30, background: DS.bgElevated, border: `1px solid ${DS.border}`, borderRadius: DS.radiusSm, fontSize: 13, color: DS.text, fontFamily: 'var(--font-body)', outline: "none" }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {notesLoading && <div style={{ padding: "24px", textAlign: "center", color: DS.textMuted, fontSize: 13 }}>Indlæser…</div>}
          {!notesLoading && filtered.length === 0 && (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>📝</div>
              <p style={{ fontSize: 13, color: DS.textMuted }}>{noteSearch ? "Ingen resultater" : "Opret din første note →"}</p>
            </div>
          )}
          {filtered.map(note => {
            const s = sub(note.subject);
            const isActive = activeNote?.id === note.id;
            return (
              <button key={note.id} onClick={() => { onSelect(note); setShowNew(false); setEditing(false); }}
                style={{ width: "100%", padding: "11px 12px", borderRadius: DS.radiusSm, background: isActive ? DS.bgElevated : "transparent", border: `1px solid ${isActive ? DS.border : "transparent"}`, cursor: "pointer", textAlign: "left", marginBottom: 2, transition: "all 0.12s" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: DS.text, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{note.title}</div>
                <div style={{ fontSize: 12, color: DS.textMuted, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.45 }}>{stripHtml(note.content).slice(0, 80)}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: DS.radiusFull, background: `${s.color}15`, color: s.color, fontWeight: 500 }}>{s.icon} {s.label}</span>
                  <span style={{ fontSize: 11, color: DS.textMuted }}>{note.date}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Note content */}
      <div style={{ flex: 1, background: DS.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {showNew ? (
          <div style={{ flex: 1, overflowY: "auto", padding: "40px 56px" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: DS.text, marginBottom: 24, fontFamily: 'var(--font-display)' }}>Ny note</h2>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Titel…"
                  style={{ flex: 1, height: 42, background: DS.bgSurface, border: `1px solid ${DS.border}`, borderRadius: DS.radiusSm, padding: "0 14px", fontSize: 14.5, color: DS.text, fontFamily: 'var(--font-body)', outline: "none" }} />
                <select value={newSubject} onChange={e => setNewSubject(e.target.value)}
                  style={{ height: 42, background: DS.bgSurface, border: `1px solid ${DS.border}`, borderRadius: DS.radiusSm, padding: "0 12px", fontSize: 13, color: DS.text, fontFamily: 'var(--font-body)' }}>
                  {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                </select>
              </div>
              <div ref={newEditorRef} contentEditable suppressContentEditableWarning
                style={{ minHeight: 240, background: DS.bgSurface, border: `1px solid ${DS.border}`, borderRadius: DS.radius, padding: "14px 16px", fontSize: 14.5, color: DS.text, fontFamily: 'var(--font-body)', lineHeight: 1.8, marginBottom: 16, outline: "none" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <Button onClick={saveNew}>Gem note</Button>
                <Button variant="outline" onClick={() => setShowNew(false)}>Annuller</Button>
              </div>
            </div>
          </div>
        ) : activeNote ? (
          <div style={{ flex: 1, overflowY: "auto", padding: "40px 56px" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 700, color: DS.text, fontFamily: 'var(--font-display)', letterSpacing: "-0.3px", marginBottom: 8 }}>{activeNote.title}</h1>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: DS.radiusFull, background: `${sub(activeNote.subject).color}15`, color: sub(activeNote.subject).color, fontWeight: 500 }}>{sub(activeNote.subject).icon} {sub(activeNote.subject).label}</span>
                    <span style={{ fontSize: 12, color: DS.textMuted }}>{activeNote.date}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {editing ? (
                    <Button size="sm" onClick={() => { const html = editorRef.current?.innerHTML || ""; onUpdate(activeNote.id, { content: html }); setActiveNote(p => ({ ...p, content: html })); setEditing(false); }}>Færdig ✓</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { setEditing(true); setTimeout(() => { if (editorRef.current) { editorRef.current.innerHTML = activeNote.content || ""; editorRef.current.focus(); } }, 40); }}>Rediger</Button>
                  )}
                  <Button size="sm" variant="danger" onClick={async () => { await onDelete(activeNote.id); setActiveNote(null); }}>Slet</Button>
                </div>
              </div>
              <div style={{ height: 1, background: DS.border, marginBottom: 28 }} />
              {editing ? (
                <div ref={editorRef} contentEditable suppressContentEditableWarning
                  onInput={() => { if (!editorRef.current) return; onUpdate(activeNote.id, { content: editorRef.current.innerHTML }); }}
                  style={{ minHeight: 320, background: DS.bgSurface, border: `1px solid ${DS.border}`, borderRadius: DS.radius, padding: "16px 18px", fontSize: 14.5, color: DS.text, fontFamily: 'var(--font-body)', lineHeight: 1.8, outline: "none" }} />
              ) : (
                <div className="prose" style={{ fontSize: 14.5, lineHeight: 1.82 }} dangerouslySetInnerHTML={{ __html: activeNote.content }} />
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: DS.bgSurface, border: `1px solid ${DS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>📝</div>
              <p style={{ fontSize: 14, color: DS.textMuted }}>Vælg en note, eller opret en ny</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Subjects View ────────────────────────────────────────────────────────────
function SubjectsView({ activeSubject, onSelect, onQuickStart }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "40px 40px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: DS.text, fontFamily: 'var(--font-display)', letterSpacing: "-0.4px", marginBottom: 8 }}>Vælg fag</h1>
          <p style={{ fontSize: 14, color: DS.textMid }}>Start en fokuseret chat-session for et bestemt fag</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
          {SUBJECTS.map(s => {
            const isActive = activeSubject === s.id;
            return (
              <button key={s.id} onClick={() => onSelect(s.id)}
                style={{ background: isActive ? DS.bgElevated : DS.bgSurface, borderRadius: DS.radiusLg, padding: "22px 20px", border: `1px solid ${isActive ? DS.accent + "50" : DS.border}`, cursor: "pointer", textAlign: "left", transition: "all 0.16s", boxShadow: isActive ? `0 0 0 1px ${DS.accent}30, 0 8px 24px rgba(0,0,0,0.3)` : "none" }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = DS.borderMid; e.currentTarget.style.background = DS.bgElevated; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.background = DS.bgSurface; } }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: s.color, marginBottom: 12, border: `1px solid ${s.color}25` }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: DS.text, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: DS.textMuted }}>→ Åbn chat</div>
              </button>
            );
          })}
        </div>

        {/* Quick starters */}
        <div style={{ background: DS.bgSurface, borderRadius: DS.radiusLg, padding: "24px", border: `1px solid ${DS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: DS.bgElevated, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>💡</div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: DS.text }}>Idéer til at komme i gang</h2>
          </div>
          <p style={{ fontSize: 12.5, color: DS.textMuted, marginBottom: 16, marginLeft: 42 }}>Klik for at sende direkte til chat</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {QUICK_STARTERS.map((q, i) => {
              const s = sub(q.subject);
              return (
                <button key={i} onClick={() => onQuickStart(q)}
                  style={{ padding: "12px 14px", background: DS.bgElevated, borderRadius: DS.radiusSm, border: `1px solid ${DS.border}`, color: DS.textMid, fontSize: 13.5, cursor: "pointer", textAlign: "left", fontFamily: 'var(--font-body)', display: "flex", alignItems: "center", gap: 10, transition: "all 0.13s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = DS.borderMid; e.currentTarget.style.color = DS.text; e.currentTarget.style.background = DS.bgHover; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.color = DS.textMid; e.currentTarget.style.background = DS.bgElevated; }}>
                  <span style={{ opacity: 0.65 }}>{s.icon}</span>{q.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Top Navigation ───────────────────────────────────────────────────────────
function TopNav({ view, setView, user, onAuthOpen, onLogout, navigate }) {
  const navItems = [
    { id: "chat", label: "Chat", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
    { id: "notes", label: "Noter", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
    { id: "subjects", label: "Fag", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg> },
  ];

  return (
    <header style={{ height: 52, background: DS.bgSurface, borderBottom: `1px solid ${DS.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0, zIndex: 20 }}>
      {/* Nav tabs */}
      <div style={{ display: "flex", gap: 2 }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setView(n.id)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: DS.radiusSm, fontWeight: 500, fontSize: 13.5, color: view === n.id ? DS.text : DS.textMid, background: view === n.id ? DS.bgElevated : "transparent", border: `1px solid ${view === n.id ? DS.border : "transparent"}`, cursor: "pointer", fontFamily: 'var(--font-body)', transition: "all 0.12s" }}>
            <span style={{ opacity: view === n.id ? 1 : 0.6 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {!user && (
        <div style={{ display: "flex", gap: 6 }}>
          <Button variant="ghost" size="sm" onClick={() => onAuthOpen("login")}>Log ind</Button>
          <Button size="sm" onClick={() => onAuthOpen("register")}>Registrér</Button>
        </div>
      )}
    </header>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function FagAI() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [view, setView] = useState("chat");
  const [activeSubject, setActiveSubject] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeNote, setActiveNote] = useState(null);

  const endRef = useRef(null);
  const textareaRef = useRef(null);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";

  const { notes, loading: notesLoading, saving: notesSaving, createNote, debouncedUpdate, deleteNote } = useNotes(user?.id);
  const { conversations, activeId: activeConvId, messages, loadingConvs, loadingMsgs, selectConversation, createConversation, saveMessage, maybeSetTitle, deleteConversation, setMessages } = useConversations(user?.id);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const sendMessage = async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput("");
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }

    let convId = activeConvId;
    if (!convId) { convId = await createConversation(); if (!convId) return; }

    const isFirst = messages.length === 0;
    const userMsg = { role: "user", content: t };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    await saveMessage(convId, "user", t);
    if (isFirst) await maybeSetTitle(convId, t);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini", max_tokens: 1000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT + (activeSubject ? `\n\nEleven fokuserer på: ${sub(activeSubject).label}.` : "") },
            ...updated.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.choices?.[0]?.message?.content || "Noget gik galt.";
      const final = [...updated, { role: "assistant", content: reply }];
      setMessages(final);
      await saveMessage(convId, "assistant", reply);
    } catch (e) {
      setMessages([...updated, { role: "assistant", content: `❌ **Fejl:** ${e.message}` }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const handleQuickStart = ({ label, subject }) => {
    setActiveSubject(subject);
    setView("chat");
    setTimeout(() => sendMessage(label), 80);
  };

  const openAuth = (tab) => { setAuthTab(tab); setShowAuthModal(true); };

  return (
    <div style={{ display: "flex", height: "100vh", background: DS.bg, overflow: "hidden" }}>
      <style>{globalCSS}</style>

      {/* Sidebar — only on chat view */}
      {view === "chat" && (
        <Sidebar
          open={true}
          conversations={conversations}
          activeConvId={activeConvId}
          loadingConvs={loadingConvs}
          onSelect={selectConversation}
          onCreate={async () => { setMessages([]); await createConversation(); }}
          onDelete={deleteConversation}
          user={user}
          onLogout={logout}
          navigate={navigate}
        />
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopNav view={view} setView={setView} user={user} onAuthOpen={openAuth} onLogout={logout} navigate={navigate} />

        {/* ── Chat ── */}
        {view === "chat" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 0", display: "flex", flexDirection: "column", gap: 20 }}>
              {loadingMsgs ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: DS.textMuted, margin: "0 auto 12px", animation: "pulse 1.4s ease infinite" }} />
                    <p style={{ fontSize: 13, color: DS.textMuted }}>Indlæser samtale…</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <WelcomeScreen onQuickStart={handleQuickStart} activeSubject={activeSubject} />
              ) : (
                messages.map((msg, i) => <Message key={i} msg={msg} isLast={i === messages.length - 1} user={user} />)
              )}
              {loading && <TypingIndicator />}
              <div ref={endRef} />
            </div>

            <ChatInput
              value={input}
              onChange={handleTextareaChange}
              onSend={sendMessage}
              onKeyDown={handleKey}
              loading={loading}
              activeSubject={activeSubject}
              onClearSubject={() => setActiveSubject(null)}
              textareaRef={textareaRef}
            />
          </div>
        )}

        {/* ── Notes ── */}
        {view === "notes" && (
          <NotesView
            notes={notes}
            notesLoading={notesLoading}
            notesSaving={notesSaving}
            onSelect={setActiveNote}
            onCreate={createNote}
            onDelete={deleteNote}
            onUpdate={debouncedUpdate}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
          />
        )}

        {/* ── Subjects ── */}
        {view === "subjects" && (
          <SubjectsView
            activeSubject={activeSubject}
            onSelect={(id) => { setActiveSubject(id); setView("chat"); }}
            onQuickStart={handleQuickStart}
          />
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          T={{
            burgundy: "#1a1a2e", burgundyMid: "#16213e", burgundyLight: "#0f3460",
            gold: "#e2d9f3", goldDark: "#a78bdb", goldDeep: "#7c5cbf",
            cream: DS.bgSurface, creamDark: DS.bgElevated, creamBorder: DS.border,
            text: DS.text, textMid: DS.textMid, textLight: DS.textMuted,
            white: DS.bgSurface, shadow: "rgba(0,0,0,0.4)", shadowDeep: "rgba(0,0,0,0.6)",
          }}
          initialTab={authTab}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
