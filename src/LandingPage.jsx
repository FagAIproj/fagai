import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth.jsx";
import AuthModal from "./AuthModal.jsx";
import { DS, globalCSS } from "./styles/tokens.js";
import ShaderBackground from "./components/ui/shader-background.jsx";
import GradientButton from "./components/ui/gradient-button.jsx";
import { ContainerScroll } from "./components/ui/container-scroll-animation.jsx";

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "💬", title: "AI-drevet forklaring",    desc: "Stil spørgsmål om alle fag. Få forklaringer tilpasset dit niveau — aldrig færdige svar." },
  { icon: "📝", title: "Smarte noter",            desc: "Skriv, organiser og gennemse dine noter med en intuitiv rich-text editor." },
  { icon: "🎯", title: "Fag-fokus",               desc: "Skift problemfrit mellem matematik, dansk, programmering og seks andre fag." },
  { icon: "🛡️", title: "Lær, ikke snyd",          desc: "FagAI guider dig til at forstå og tænke selv — din lærer vil sætte pris på det." },
  { icon: "🔒", title: "Sikker login",             desc: "Gem din chathistorik og noter sikkert med Supabase-autentificering." },
  { icon: "⚡", title: "Svar på sekunder",         desc: "GPT-4o-mini giver hurtige, præcise forklaringer uden ventetid." },
];

const SUBJECTS = [
  { icon: "∑",   label: "Matematik",     color: "#f97316" },
  { icon: "Æ",   label: "Dansk",         color: "#a855f7" },
  { icon: "</>", label: "Programmering", color: "#3b82f6" },
  { icon: "⚗",   label: "Naturfag",      color: "#06b6d4" },
  { icon: "📜",  label: "Historie",      color: "#d97706" },
  { icon: "🌍",  label: "Geografi",      color: "#0ea5e9" },
  { icon: "En",  label: "Engelsk",       color: "#10b981" },
  { icon: "⚖",   label: "Samfundsfag",   color: "#8b5cf6" },
];

const STEPS = [
  { n: "01", icon: "🚀", title: "Opret konto",     desc: "Registrér med din e-mail på under 30 sekunder." },
  { n: "02", icon: "📚", title: "Stil dit spørgsmål", desc: "Vælg fag og spørg om alt du undrer dig over." },
  { n: "03", icon: "💡", title: "Lær og forstå",   desc: "Få forklaringer der hjælper dig til at løse opgaverne selv." },
];

const TESTIMONIALS = [
  { name: "Emma, 9. klasse",  text: "Jeg forstår endelig algebra! Bedre forklaringer end nogen lærebog.", avatar: "E" },
  { name: "Mikkel, 1g",       text: "Bruger noter-funktionen til alt. Enormt meget bedre end Word.",        avatar: "M" },
  { name: "Sofie, 3g",        text: "Mine karakterer er steget siden jeg begyndte at bruge FagAI.",        avatar: "S" },
];

// ─── Design tokens (landing uses own light palette + shared DS) ───────────────
const L = {
  bg:        "#06060a",
  bgCard:    "#0d0e12",
  bgCardHover: "#12131a",
  border:    "#1a1b22",
  borderHover: "#26273a",
  text:      "#f2f2f5",
  textMid:   "#8b8d9e",
  textMuted: "#555768",
  accent:    "#6366f1",
  accentHover: "#5254cc",
  accentGlow: "rgba(99,102,241,0.3)",
  accentSoft: "rgba(99,102,241,0.1)",
  gradient:  "linear-gradient(135deg, #6366f1, #8b5cf6)",
};

// ─── Intersection Observer Hook ───────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}



// ─── Hero Chat Preview ────────────────────────────────────────────────────────
function ChatPreview() {
  const messages = [
    { role: "user",      text: "Hvad er en andengradsligning?" },
    { role: "assistant", text: "En andengradsligning er en ligning med formen **ax² + bx + c = 0**.\n\nLad os starte med diskriminanten: **D = b² − 4ac**\n\nHvilke værdier har du for a, b og c i din opgave?" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0d0e14", overflow: "hidden" }}>
      {/* Chrome bar */}
      <div style={{ height: 44, background: "#0a0b10", borderBottom: `1px solid ${L.border}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 14, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: L.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🎓</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: L.textMid, fontFamily: 'var(--font-body)' }}>FagAI</span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {["Chat", "Noter", "Fag"].map((t, i) => (
            <div key={t} style={{ padding: "4px 12px", borderRadius: 7, background: i === 0 ? "rgba(99,102,241,0.15)" : "transparent", color: i === 0 ? "#818cf8" : L.textMuted, fontSize: 11.5, fontWeight: i === 0 ? 600 : 400 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Messages — flex: 1 so it fills remaining space */}
      <div style={{ flex: 1, padding: "28px 28px 0", display: "flex", flexDirection: "column", gap: 22, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: 9, background: L.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🎓</div>
            )}
            <div style={{ maxWidth: "78%", background: m.role === "user" ? "#1e1f2e" : "transparent", border: m.role === "user" ? `1px solid #2e3050` : "none", borderRadius: m.role === "user" ? "14px 14px 3px 14px" : 0, padding: m.role === "user" ? "10px 16px" : "2px 0", fontSize: 14, color: L.text, lineHeight: 1.78, fontFamily: 'var(--font-body)' }}>
              {m.role === "assistant" ? (
                <div style={{ lineHeight: 1.78 }}>
                  <span>En andengradsligning er en ligning med formen </span>
                  <code style={{ background: "#1a1b2e", padding: "1px 6px", borderRadius: 4, fontSize: "0.87em", color: "#a78bfa", fontFamily: "monospace" }}>ax² + bx + c = 0</code>
                  <br /><br />
                  <span>Lad os starte med diskriminanten: </span>
                  <code style={{ background: "#1a1b2e", padding: "1px 6px", borderRadius: 4, fontSize: "0.87em", color: "#a78bfa", fontFamily: "monospace" }}>D = b² − 4ac</code>
                  <br /><br />
                  <span style={{ color: "#818cf8" }}>Hvilke værdier har du for a, b og c i din opgave?</span>
                </div>
              ) : m.text}
            </div>
            {m.role === "user" && (
              <div style={{ width: 32, height: 32, borderRadius: 9, background: DS.bgElevated, border: `1px solid ${L.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: L.textMid, flexShrink: 0, fontWeight: 700 }}>E</div>
            )}
          </div>
        ))}
      </div>

      {/* Input bar — pinned to bottom */}
      <div style={{ padding: "16px 20px 20px", flexShrink: 0 }}>
        <div style={{ background: "#0a0b10", borderRadius: 12, border: `1px solid ${L.borderHover}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1, fontSize: 14, color: L.textMuted, fontFamily: 'var(--font-body)' }}>Stil et spørgsmål…</span>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: L.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay = 0 }) {
  const [ref, inView] = useInView();
  const [hover, setHover] = useState(false);

  return (
    <div ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: hover ? L.bgCardHover : L.bgCard, borderRadius: 16, padding: "24px 22px", border: `1px solid ${hover ? L.borderHover : L.border}`, transition: "all 0.2s ease", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transitionDelay: `${delay}s`, transitionProperty: "opacity,transform,background,border-color", boxShadow: hover ? "0 12px 40px rgba(0,0,0,0.5)" : "none" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: L.accentSoft, border: `1px solid rgba(99,102,241,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: L.text, marginBottom: 8, fontFamily: 'var(--font-body)' }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: L.textMid, lineHeight: 1.65, fontFamily: 'var(--font-body)' }}>{desc}</p>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [featRef, featInView] = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const openAuth = (tab) => { setAuthTab(tab); setShowAuth(true); };
  const handleAuthSuccess = () => { setShowAuth(false); navigate("/chat"); };
  const scrolled = scrollY > 50;

  return (
    <div style={{ background: L.bg, color: L.text, fontFamily: 'var(--font-body)', overflowX: "hidden", minHeight: "100vh", position: "relative" }}>
      <style>{`
        ${globalCSS}
        html { scroll-behavior: smooth; color-scheme: dark; }
        /* ── Landing-page scoped overrides ── */
        .lp-btn { transition: all 0.16s ease; cursor: pointer; border: none; font-family: var(--font-body); }
        .lp-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .lp-btn:active { transform: scale(0.97); }
        .nav-link { text-decoration: none; transition: color 0.14s; font-family: var(--font-body); }
        .nav-link:hover { color: #818cf8 !important; }
        @keyframes floatY { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
        @keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 58, background: scrolled ? "rgba(6,6,10,0.92)" : "rgba(6,6,10,0.40)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderBottom: scrolled ? `1px solid ${L.border}` : "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", padding: "0 40px", gap: 24, transition: "all 0.28s ease" }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })
        } style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: L.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, boxShadow: `0 2px 12px ${L.accentGlow}` }}>🎓</div>
          <span style={{ fontWeight: 800, fontSize: 17, color: L.text, fontFamily: 'var(--font-display)', letterSpacing: "-0.2px" }}>FagAI</span>
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {["Funktioner", "Om"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: L.textMid }}>{l}</a>
          ))}
          <div style={{ width: 1, height: 18, background: L.border }} />
          {user ? (
            <GradientButton size="sm" onClick={() => navigate("/chat")}>
              Åbn FagAI →
            </GradientButton>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button className="lp-btn" onClick={() => openAuth("login")}
                style={{ padding: "8px 18px", background: "transparent", color: L.textMid, border: `1px solid ${L.border}`, borderRadius: 9, fontSize: 13.5, fontWeight: 500 }}>
                Log ind
              </button>
              <GradientButton size="sm" onClick={() => openAuth("register")}>
                Kom i gang →
              </GradientButton>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero with ContainerScroll ── */}
      <section style={{ position: "relative", overflow: "hidden", background: L.bg }}>

        {/* WebGL shader fills the full section height (set by ContainerScroll) */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <ShaderBackground opacity={0.9} />
        </div>

        {/* Layer 1: Radial vignette — darkens edges */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 85% 70% at 50% 40%, transparent 15%, rgba(6,6,10,0.50) 60%, rgba(6,6,10,0.90) 100%)", pointerEvents: "none", zIndex: 1 }} />

        {/* Layer 2: Top+bottom gradient — protects navbar and grounds section */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,6,10,0.70) 0%, rgba(6,6,10,0.08) 25%, rgba(6,6,10,0.08) 70%, rgba(6,6,10,0.95) 100%)", pointerEvents: "none", zIndex: 1 }} />

        {/* Layer 3: Central indigo accent bloom */}
        <div style={{ position: "absolute", top: "22%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 65%)", pointerEvents: "none", zIndex: 2 }} />

        {/* ContainerScroll — content above all overlays */}
        <div style={{ position: "relative", zIndex: 3 }}>
          <ContainerScroll
            titleComponent={
              <div style={{ paddingTop: 80 }}>
                {/* Badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: L.accentSoft, border: `1px solid rgba(99,102,241,0.25)`, borderRadius: 9999, padding: "5px 14px", marginBottom: 28, animation: "fadeIn 0.7s ease both" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s ease infinite" }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#818cf8", fontFamily: "var(--font-body)" }}>AI-læringsassistent til danske elever</span>
                </div>

                {/* Headline */}
                <h1 style={{ fontSize: "clamp(38px, 5.5vw, 72px)", fontWeight: 700, lineHeight: 1.1, fontFamily: "var(--font-display)", letterSpacing: "-1.5px", marginBottom: 20, animation: "fadeUp 0.7s ease 0.1s both", color: L.text }}>
                  Lær smartere.<br />
                  <span style={{ background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #6366f1 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "gradMove 4s linear infinite" }}>
                    Forstå dybere.
                  </span>
                </h1>

                {/* Subtext */}
                <p style={{ fontSize: "clamp(15px, 1.8vw, 17px)", color: L.textMid, lineHeight: 1.7, maxWidth: 500, margin: "0 auto 36px", animation: "fadeUp 0.7s ease 0.18s both", fontFamily: "var(--font-body)" }}>
                  FagAI hjælper dig med alle fag —
                  uden nogensinde at lave dine lektier for dig.
                </p>

                {/* CTA Buttons */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.7s ease 0.26s both", paddingBottom: 56 }}>
                  <GradientButton size="lg" onClick={() => openAuth("register")}>
                    Start gratis →
                  </GradientButton>
                  <button className="lp-btn" onClick={() => openAuth("login")}
                    style={{ padding: "14px 28px", background: "rgba(255,255,255,0.04)", color: L.textMid, border: `1px solid ${L.border}`, borderRadius: 12, fontSize: 16, fontWeight: 500 }}>
                    Log ind
                  </button>
                </div>
              </div>
            }
          >
            <ChatPreview />
          </ContainerScroll>
        </div>
      </section>

      {/* ── Subjects strip ── */}
      <div style={{ borderTop: `1px solid ${L.border}`, borderBottom: `1px solid ${L.border}`, padding: "28px 40px", background: L.bgCard }}>
        <p style={{ textAlign: "center", fontSize: 11.5, fontWeight: 600, color: L.textMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 18 }}>Dækker alle dine fag</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", maxWidth: 800, margin: "0 auto" }}>
          {SUBJECTS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: L.bg, borderRadius: 9, border: `1px solid ${L.border}`, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = L.borderHover; e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.transform = "scale(1)"; }}>
              <span style={{ fontSize: 14, color: s.color }}>{s.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: L.textMid }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="funktioner" style={{ padding: "100px 40px" }}>
        <div ref={featRef} style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60, opacity: featInView ? 1 : 0, transform: featInView ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s ease" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: "-1px", color: L.text, marginBottom: 12 }}>Alt hvad du behøver</h2>
            <p style={{ fontSize: 16, color: L.textMid, maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>Bygget til elever der vil lære ordentligt — ikke bare bestå.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {FEATURES.map((f, i) => <FeatureCard key={i} {...f} delay={i * 0.06} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "80px 40px 100px", background: L.bgCard, borderTop: `1px solid ${L.border}`, borderBottom: `1px solid ${L.border}` }}>
        <div ref={stepsRef} style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60, opacity: stepsInView ? 1 : 0, transform: stepsInView ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s ease" }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 800, fontFamily: 'var(--font-display)', color: L.text, letterSpacing: "-0.8px", marginBottom: 12 }}>Kom i gang på 1 minut</h2>
            <p style={{ fontSize: 15, color: L.textMid }}>Tre trin til smartere læring</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "28px 20px", background: L.bg, borderRadius: 16, border: `1px solid ${L.border}`, opacity: stepsInView ? 1 : 0, transform: stepsInView ? "translateY(0)" : "translateY(24px)", transition: `all 0.6s ease ${i * 0.1}s` }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: L.accentSoft, border: `1px solid rgba(99,102,241,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>{s.icon}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: L.textMuted, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Trin {s.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: L.text, fontFamily: 'var(--font-display)', marginBottom: 9 }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, color: L.textMid, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="om" style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 800, fontFamily: 'var(--font-display)', color: L.text, letterSpacing: "-0.8px", marginBottom: 12 }}>Elever elsker FagAI</h2>
            <p style={{ fontSize: 15, color: L.textMid }}>Rigtige elever, rigtige resultater</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: L.bgCard, borderRadius: 16, padding: "24px 22px", border: `1px solid ${L.border}`, transition: "all 0.2s ease" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = L.borderHover; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => <span key={j} style={{ color: "#fbbf24", fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, color: L.textMid, lineHeight: 1.72, fontStyle: "italic", marginBottom: 18 }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: L.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{t.avatar}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: L.text }}>{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px 40px", background: L.bgCard, borderTop: `1px solid ${L.border}` }}>
        <div ref={ctaRef} style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", opacity: ctaInView ? 1 : 0, transform: ctaInView ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s ease" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: L.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 28px", boxShadow: `0 10px 40px ${L.accentGlow}`, animation: "floatY 4s ease-in-out infinite" }}>🎓</div>
          <h2 style={{ fontSize: "clamp(28px,5vw,54px)", fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: "-1.2px", color: L.text, marginBottom: 16, lineHeight: 1.1 }}>
            Klar til at lære<br />
            <span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>smartere?</span>
          </h2>
          <p style={{ fontSize: 16, color: L.textMid, lineHeight: 1.65, marginBottom: 36 }}>Opret din gratis konto og begynd at lære med FagAI.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <GradientButton size="lg" onClick={() => openAuth("register")}>
              Opret konto →
            </GradientButton>
            <button className="lp-btn" onClick={() => openAuth("login")}
              style={{ padding: "15px 32px", background: "rgba(255,255,255,0.05)", color: L.textMid, border: `1px solid ${L.border}`, borderRadius: 14, fontSize: 16, fontWeight: 500 }}>
              Log ind
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: L.bg, borderTop: `1px solid ${L.border}`, padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: L.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🎓</div>
          <span style={{ fontWeight: 700, fontSize: 14, color: L.textMid, fontFamily: 'var(--font-display)' }}>FagAI</span>
        </button>
        <p style={{ fontSize: 12, color: L.textMuted }}>© 2026 FagAI · Lavet til danske elever</p>
        <GradientButton size="sm" onClick={() => openAuth("register")}>
          Opret konto →
        </GradientButton>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          T={{
            burgundy: "#0d0e18", burgundyMid: "#12131e", burgundyLight: "#1a1b2e",
            gold: "#e2d9f3", goldDark: "#a78bdb", goldDeep: "#7c5cbf",
            cream: L.bgCard, creamDark: "#0a0b10", creamBorder: L.border,
            text: L.text, textMid: L.textMid, textLight: L.textMuted,
            white: L.bgCard, shadow: "rgba(0,0,0,0.5)", shadowDeep: "rgba(0,0,0,0.7)",
          }}
          initialTab={authTab}
          onClose={() => setShowAuth(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
