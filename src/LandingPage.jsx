import { useState, useEffect, useRef } from "react";

const FEATURES = [
  {
    icon: "💬",
    title: "AI-drevet chat",
    desc: "Stil spørgsmål om alle fag og få forklaringer der passer præcis til dit niveau – ikke færdige svar.",
  },
  {
    icon: "📝",
    title: "Smarte noter",
    desc: "Skriv og organiser dine noter med en rig teksteditor. Fed, punktlister, overskrifter – ligesom Google Docs.",
  },
  {
    icon: "📚",
    title: "Alle fag samlet",
    desc: "Matematik, dansk, engelsk, programmering, naturfag, historie og mere – alt ét sted.",
  },
  {
    icon: "🛡️",
    title: "Lær, ikke snyd",
    desc: "FagAI skriver aldrig dine opgaver. Den guider dig til at forstå og tænke selv.",
  },
  {
    icon: "🎨",
    title: "Dit eget tema",
    desc: "Vælg mellem fem smukke farvetemaer og gør appen til din egen.",
  },
  {
    icon: "⚡",
    title: "Lynhurtig hjælp",
    desc: "Få svar på sekunder. Ingen ventetid, ingen distraktioner – bare læring.",
  },
];

const SUBJECTS = [
  { icon: "∑",   label: "Matematik" },
  { icon: "Æ",   label: "Dansk" },
  { icon: "En",  label: "Engelsk" },
  { icon: "</>", label: "Programmering" },
  { icon: "⚗",   label: "Naturfag" },
  { icon: "📜",  label: "Historie" },
  { icon: "🌍",  label: "Geografi" },
  { icon: "⚖",   label: "Samfundsfag" },
];

const TESTIMONIALS = [
  { name: "Emma, 9. klasse", text: "Jeg forstår endelig algebra! FagAI forklarer det på en måde min lærer aldrig har gjort.", avatar: "👩‍🎓" },
  { name: "Mikkel, 1g",      text: "Bruger det hver dag til at organisere mine noter. Det er så meget nemmere end Word.", avatar: "👨‍💻" },
  { name: "Sofie, 3g",       text: "Har fået meget bedre karakterer siden jeg begyndte at bruge FagAI til at forstå stoffet.", avatar: "📖" },
];

export default function LandingPage({ onEnter }) {
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.dataset.section]));
          }
        });
      },
      { threshold: 0.15 }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const setRef = (key) => (el) => { sectionRefs.current[key] = el; };
  const visible = (key) => visibleSections.has(key);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#faf6ee", color: "#2c1810", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;0,800;1,400&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
        @keyframes pulse{0%,100%{opacity:0.6;}50%{opacity:1;}}
        @keyframes gradientShift{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
        .reveal{opacity:0;transform:translateY(32px);transition:opacity 0.6s ease,transform 0.6s ease;}
        .reveal.show{opacity:1;transform:translateY(0);}
        .cta-btn{transition:all 0.2s ease;cursor:pointer;border:none;}
        .cta-btn:hover{transform:translateY(-2px);filter:brightness(1.06);}
        .cta-btn:active{transform:scale(0.97);}
        .feature-card{transition:all 0.22s ease;}
        .feature-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(92,30,15,0.16)!important;}
        .subj-pill{transition:all 0.18s;}
        .subj-pill:hover{transform:scale(1.05);}
        .nav-link{transition:color 0.15s;cursor:pointer;text-decoration:none;}
        .nav-link:hover{color:#5c1e0f!important;}
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-thumb{background:#d4b896;border-radius:3px;}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 60,
        background: scrollY > 40 ? "rgba(250,246,238,0.92)" : "transparent",
        backdropFilter: scrollY > 40 ? "blur(16px)" : "none",
        borderBottom: scrollY > 40 ? "1px solid #e0d0ba" : "none",
        display: "flex", alignItems: "center", padding: "0 48px",
        transition: "all 0.3s ease",
        boxShadow: scrollY > 40 ? "0 2px 16px rgba(92,30,15,0.08)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#5c1e0f,#9e3a22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, boxShadow: "0 2px 8px rgba(92,30,15,0.3)" }}>🎓</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#5c1e0f", fontFamily: "'Lora',serif" }}>FagAI</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Funktioner", "Fag", "Om"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link" style={{ fontSize: 14, fontWeight: 600, color: "#6b4438" }}>{l}</a>
          ))}
          <button className="cta-btn" onClick={onEnter}
            style={{ padding: "9px 22px", background: "linear-gradient(135deg,#5c1e0f,#9e3a22)", color: "#f1e194", borderRadius: 10, fontSize: 14, fontWeight: 700, boxShadow: "0 3px 12px rgba(92,30,15,0.3)" }}>
            Åbn app →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "120px 48px 80px", textAlign: "center", position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, #faf6ee 0%, #f2ead8 60%, #e8d8c0 100%)",
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "8%", left: "6%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(241,225,148,0.35) 0%,transparent 70%)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(92,30,15,0.08) 0%,transparent 70%)", pointerEvents: "none" }}/>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(92,30,15,0.08)", border: "1.5px solid rgba(92,30,15,0.15)", borderRadius: 20, padding: "6px 16px", marginBottom: 32, animation: "fadeIn 0.6s ease" }}>
          <span style={{ fontSize: 14 }}>✨</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#5c1e0f" }}>AI-læringsassistent til danske elever</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(42px,6vw,80px)", fontWeight: 800, lineHeight: 1.1,
          fontFamily: "'Lora',serif", letterSpacing: "-1.5px", marginBottom: 24,
          animation: "fadeUp 0.7s ease 0.1s both",
          maxWidth: 820,
        }}>
          Lær smartere.<br/>
          <span style={{ background: "linear-gradient(135deg,#5c1e0f,#c84b2f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Forstå dybere.
          </span>
        </h1>

        <p style={{
          fontSize: "clamp(16px,2vw,20px)", color: "#6b4438", lineHeight: 1.7,
          maxWidth: 580, marginBottom: 44,
          animation: "fadeUp 0.7s ease 0.2s both",
        }}>
          FagAI er din personlige læringsassistent der hjælper dig med alle fag –
          uden nogensinde at lave dine lektier for dig.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.7s ease 0.3s both", marginBottom: 64 }}>
          <button className="cta-btn" onClick={onEnter}
            style={{ padding: "16px 36px", background: "linear-gradient(135deg,#5c1e0f,#9e3a22)", color: "#f1e194", borderRadius: 14, fontSize: 16, fontWeight: 700, boxShadow: "0 8px 28px rgba(92,30,15,0.32)", letterSpacing: "0.2px" }}>
            Start gratis nu →
          </button>
          <a href="#funktioner">
            <button className="cta-btn"
              style={{ padding: "16px 32px", background: "white", color: "#5c1e0f", borderRadius: 14, fontSize: 16, fontWeight: 600, border: "2px solid #e0d0ba", boxShadow: "0 4px 16px rgba(92,30,15,0.08)" }}>
              Se funktioner ↓
            </button>
          </a>
        </div>

        {/* App preview mockup */}
        <div style={{ animation: "fadeUp 0.8s ease 0.4s both, float 5s ease-in-out 1s infinite", maxWidth: 860, width: "100%", position: "relative" }}>
          {/* Drop shadow */}
          <div style={{ position: "absolute", bottom: -24, left: "10%", right: "10%", height: 60, background: "radial-gradient(ellipse,rgba(92,30,15,0.22) 0%,transparent 70%)", filter: "blur(12px)", borderRadius: "50%", zIndex: 0 }}/>
          <div style={{
            background: "white", borderRadius: 20, overflow: "hidden",
            border: "2px solid #e0d0ba",
            boxShadow: "0 32px 80px rgba(92,30,15,0.18), 0 8px 24px rgba(92,30,15,0.1)",
            position: "relative", zIndex: 1,
          }}>
            {/* Mock topbar */}
            <div style={{ height: 48, background: "#5c1e0f", display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: "2px solid #b8a93a" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#f1e194,#d4c55a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎓</div>
              <span style={{ color: "#f1e194", fontWeight: 700, fontSize: 15, fontFamily: "'Lora',serif" }}>FagAI</span>
              <div style={{ display: "flex", gap: 3, background: "rgba(0,0,0,0.2)", borderRadius: 9, padding: 3, marginLeft: 8 }}>
                {["Chat","Noter","Fag"].map(t => (
                  <div key={t} style={{ padding: "4px 14px", borderRadius: 7, background: t==="Chat"?"#f1e194":"transparent", color: t==="Chat"?"#5c1e0f":"rgba(241,225,148,0.7)", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>{t}</div>
                ))}
              </div>
            </div>
            {/* Mock content */}
            <div style={{ display: "flex", height: 280 }}>
              {/* Sidebar mock */}
              <div style={{ width: 170, background: "#7a2a17", padding: "14px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
                {SUBJECTS.slice(0,6).map((s,i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: i===0?"rgba(241,225,148,0.2)":"transparent", border: i===0?"1.5px solid rgba(241,225,148,0.4)":"1.5px solid transparent" }}>
                    <span style={{ fontSize: 13, width: 18, textAlign: "center", color: i===0?"#f1e194":"rgba(241,225,148,0.6)" }}>{s.icon}</span>
                    <span style={{ fontSize: 12, color: i===0?"#f1e194":"rgba(241,225,148,0.55)", fontFamily: "'DM Sans',sans-serif", fontWeight: i===0?600:400 }}>{s.label}</span>
                  </div>
                ))}
              </div>
              {/* Chat mock */}
              <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, background: "#faf6ee" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#5c1e0f,#9e3a22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: "1.5px solid rgba(241,225,148,0.5)", flexShrink: 0 }}>🎓</div>
                  <div style={{ background: "white", borderRadius: "4px 14px 14px 14px", padding: "10px 14px", fontSize: 13, color: "#2c1810", border: "1.5px solid #e0d0ba", lineHeight: 1.6, maxWidth: 340, fontFamily: "'Lora',serif" }}>
                    Hej! 👋 Jeg er <strong>FagAI</strong>. Hvad vil du lære om i dag?
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", justifyContent: "flex-end" }}>
                  <div style={{ background: "linear-gradient(135deg,#5c1e0f,#7a2a17)", borderRadius: "14px 14px 4px 14px", padding: "10px 14px", fontSize: 13, color: "#f1e194", maxWidth: 280, fontFamily: "'DM Sans',sans-serif" }}>
                    Kan du forklare hvad fotosyntese er?
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#f1e194,#d4c55a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#5c1e0f,#9e3a22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: "1.5px solid rgba(241,225,148,0.5)", flexShrink: 0 }}>🎓</div>
                  <div style={{ background: "white", borderRadius: "4px 14px 14px 14px", padding: "10px 14px", fontSize: 12.5, color: "#2c1810", border: "1.5px solid #e0d0ba", lineHeight: 1.6, maxWidth: 360, fontFamily: "'Lora',serif" }}>
                    God spørgsmål! Lad mig forklare det trin for trin:<br/>
                    <strong>Fotosyntese</strong> er den proces planter bruger til at lave mad af sollys, vand og CO₂...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUBJECT PILLS ── */}
      <section style={{ padding: "48px 48px 56px", background: "#f2ead8", borderTop: "1px solid #e0d0ba", borderBottom: "1px solid #e0d0ba" }}>
        <p style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: "#9e7060", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 20 }}>Dækker alle dine fag</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {SUBJECTS.map((s, i) => (
            <div key={i} className="subj-pill" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "white", borderRadius: 12, border: "2px solid #e0d0ba", boxShadow: "0 2px 8px rgba(92,30,15,0.06)" }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#2c1810", fontFamily: "'DM Sans',sans-serif" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funktioner" style={{ padding: "100px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            ref={setRef("features-title")}
            data-section="features-title"
            className={`reveal${visible("features-title") ? " show" : ""}`}
            style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, fontFamily: "'Lora',serif", letterSpacing: "-0.8px", color: "#2c1810", marginBottom: 14 }}>
              Alt hvad du behøver
            </h2>
            <p style={{ fontSize: 17, color: "#6b4438", maxWidth: 500, margin: "0 auto", lineHeight: 1.65 }}>
              FagAI er bygget til elever der vil lære ordentligt – ikke bare bestå.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i}
                ref={setRef("feat-"+i)}
                data-section={"feat-"+i}
                className={`feature-card reveal${visible("feat-"+i) ? " show" : ""}`}
                style={{
                  background: "white", borderRadius: 20, padding: "30px 28px",
                  border: "2px solid #e0d0ba",
                  boxShadow: "0 4px 16px rgba(92,30,15,0.07)",
                  transitionDelay: `${i * 0.07}s`,
                }}>
                <div style={{ width: 52, height: 52, borderRadius: 15, background: "linear-gradient(135deg,#5c1e0f,#9e3a22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18, boxShadow: "0 4px 14px rgba(92,30,15,0.25)" }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#2c1810", marginBottom: 10, fontFamily: "'Lora',serif" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#6b4438", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 48px 100px", background: "linear-gradient(160deg,#5c1e0f 0%,#7a2a17 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(241,225,148,0.1) 0%,transparent 70%)" }}/>
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(241,225,148,0.07) 0%,transparent 70%)" }}/>
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div
            ref={setRef("how")}
            data-section="how"
            className={`reveal${visible("how") ? " show" : ""}`}
            style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, fontFamily: "'Lora',serif", color: "#f1e194", letterSpacing: "-0.5px", marginBottom: 14 }}>
              Sådan fungerer det
            </h2>
            <p style={{ fontSize: 16, color: "rgba(241,225,148,0.75)", maxWidth: 460, margin: "0 auto" }}>Kom i gang på under ét minut</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { step: "01", title: "Åbn FagAI", desc: "Ingen installation. Ingen konto. Bare åbn appen og begynd.", icon: "🚀" },
              { step: "02", title: "Vælg dit fag", desc: "Vælg det fag du arbejder med, og stil dit spørgsmål.", icon: "📚" },
              { step: "03", title: "Lær og forstå", desc: "Få forklaringer der hjælper dig til selv at tænke og løse opgaver.", icon: "💡" },
            ].map((s, i) => (
              <div key={i}
                ref={setRef("step-"+i)}
                data-section={"step-"+i}
                className={`reveal${visible("step-"+i) ? " show" : ""}`}
                style={{ textAlign: "center", transitionDelay: `${i*0.1}s` }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(241,225,148,0.15)", border: "2px solid rgba(241,225,148,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(241,225,148,0.5)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Trin {s.step}</div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: "#f1e194", fontFamily: "'Lora',serif", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(241,225,148,0.7)", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="om" style={{ padding: "100px 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div
            ref={setRef("testimonials")}
            data-section="testimonials"
            className={`reveal${visible("testimonials") ? " show" : ""}`}
            style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, fontFamily: "'Lora',serif", letterSpacing: "-0.5px", color: "#2c1810", marginBottom: 14 }}>
              Elever elsker FagAI
            </h2>
            <p style={{ fontSize: 16, color: "#6b4438" }}>Rigtige elever, rigtige resultater</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i}
                ref={setRef("test-"+i)}
                data-section={"test-"+i}
                className={`reveal${visible("test-"+i) ? " show" : ""}`}
                style={{ background: "white", borderRadius: 20, padding: "28px 26px", border: "2px solid #e0d0ba", boxShadow: "0 4px 16px rgba(92,30,15,0.06)", transitionDelay: `${i*0.1}s` }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{t.avatar}</div>
                <p style={{ fontSize: 15, color: "#2c1810", lineHeight: 1.7, fontStyle: "italic", fontFamily: "'Lora',serif", marginBottom: 18 }}>"{t.text}"</p>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#5c1e0f" }}>{t.name}</div>
                <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
                  {[...Array(5)].map((_,j) => <span key={j} style={{ color: "#d4c55a", fontSize: 14 }}>★</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section style={{ padding: "100px 48px", background: "linear-gradient(135deg,#faf6ee,#f2ead8)", borderTop: "1px solid #e0d0ba" }}>
        <div
          ref={setRef("cta")}
          data-section="cta"
          className={`reveal${visible("cta") ? " show" : ""}`}
          style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 24, animation: "float 4s ease-in-out infinite" }}>🎓</div>
          <h2 style={{ fontSize: "clamp(30px,5vw,56px)", fontWeight: 800, fontFamily: "'Lora',serif", letterSpacing: "-1px", color: "#2c1810", marginBottom: 20, lineHeight: 1.15 }}>
            Klar til at lære<br/>
            <span style={{ background: "linear-gradient(135deg,#5c1e0f,#c84b2f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>smartere?</span>
          </h2>
          <p style={{ fontSize: 17, color: "#6b4438", lineHeight: 1.7, marginBottom: 40 }}>
            Kom i gang nu – det er gratis og du behøver ingen konto.
          </p>
          <button className="cta-btn" onClick={onEnter}
            style={{ padding: "18px 48px", background: "linear-gradient(135deg,#5c1e0f,#9e3a22)", color: "#f1e194", borderRadius: 16, fontSize: 18, fontWeight: 700, boxShadow: "0 10px 36px rgba(92,30,15,0.30)", letterSpacing: "0.3px" }}>
            Start FagAI nu →
          </button>
          <p style={{ fontSize: 12, color: "#9e7060", marginTop: 16 }}>Ingen konto · Ingen installation · Gratis at bruge</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#5c1e0f", padding: "32px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#f1e194,#d4c55a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎓</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#f1e194", fontFamily: "'Lora',serif" }}>FagAI</span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(241,225,148,0.5)", fontFamily: "'DM Sans',sans-serif" }}>
          © 2025 FagAI · Lavet til danske elever
        </p>
        <button className="cta-btn" onClick={onEnter}
          style={{ padding: "8px 20px", background: "rgba(241,225,148,0.15)", color: "#f1e194", border: "1.5px solid rgba(241,225,148,0.3)", borderRadius: 9, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
          Åbn app →
        </button>
      </footer>
    </div>
  );
}
