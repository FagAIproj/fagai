import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export { supabase };

// Minimum password length — 8 chars nudges users away from common/breached passwords.
// Chrome's "leaked password" warning is fired by Chrome itself when the password the
// user chose exists in a known breach database. We cannot suppress it — it's a browser
// safety feature. What we CAN do is require a stronger password on registration.
const MIN_PASSWORD_LENGTH = 8;

export default function AuthModal({ T, initialTab = "login", onClose, onAuthSuccess }) {
  const [tab, setTab]           = useState(initialTab);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const overlayRef              = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Clear messages when switching tabs
  useEffect(() => { setError(""); setSuccess(""); setPassword(""); }, [tab]);

  const translateError = (msg) => {
    if (msg.includes("Invalid login credentials"))  return "Forkert e-mail eller adgangskode.";
    if (msg.includes("Email not confirmed"))         return "Bekræft din e-mail først – tjek din indbakke.";
    if (msg.includes("User already registered"))     return "Der findes allerede en konto med denne e-mail.";
    if (msg.includes("Password should be at least")) return `Adgangskoden skal være mindst ${MIN_PASSWORD_LENGTH} tegn.`;
    if (msg.includes("Unable to validate email"))    return "Ugyldig e-mailadresse.";
    if (msg.includes("Email rate limit exceeded"))   return "For mange forsøg. Vent lidt og prøv igen.";
    if (msg.includes("over_email_send_rate_limit"))  return "For mange forsøg. Vent et minut og prøv igen.";
    return msg;
  };

  const validate = () => {
    if (!email.trim().includes("@"))                                       return "Ugyldig e-mailadresse.";
    if (tab !== "forgot" && password.length < MIN_PASSWORD_LENGTH)         return `Adgangskoden skal være mindst ${MIN_PASSWORD_LENGTH} tegn.`;
    if (tab === "register" && name.trim().length < 2)                      return "Skriv dit navn (mindst 2 tegn).";
    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true); setError(""); setSuccess("");

    try {
      if (tab === "login") {
        // Credentials go directly to Supabase over HTTPS — never touched by our code.
        // Supabase stores passwords with bcrypt. We never see or store the plaintext.
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        onAuthSuccess({
          id:    data.user.id,
          email: data.user.email,
          name:  data.user.user_metadata?.full_name || data.user.email.split("@")[0],
        });

      } else if (tab === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) throw error;
        if (data.session) {
          onAuthSuccess({
            id:    data.user.id,
            email: data.user.email,
            name:  name.trim(),
          });
        } else {
          setSuccess("Tjek din e-mail og klik på bekræftelseslinket for at aktivere din konto.");
          setTimeout(() => setTab("login"), 5000);
        }

      } else if (tab === "forgot") {
        const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin + "/fagai";
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          { redirectTo: siteUrl }
        );
        if (error) throw error;
        setSuccess("Vi har sendt et link til din e-mail. Tjek din indbakke (og spam-mappen).");
      }

    } catch (err) {
      setError(translateError(err.message || "Noget gik galt. Prøv igen."));
    }
    setLoading(false);
  };

  // Password strength (register only)
  const strength =
    tab !== "register" || password.length === 0 ? null
    : password.length < MIN_PASSWORD_LENGTH      ? "weak"
    : password.length < 12                       ? "ok"
    : "strong";
  const strengthMeta = {
    weak:   { color: "#e74c3c", label: "For kort",  bars: 1 },
    ok:     { color: "#f39c12", label: "Okay",      bars: 2 },
    strong: { color: "#27ae60", label: "Stærk",     bars: 4 },
  };

  const inputStyle = {
    width: "100%", height: 48,
    border: `2px solid ${T.creamBorder}`,
    borderRadius: 12, padding: "0 16px",
    fontSize: 14.5, color: T.text,
    fontFamily: "'DM Sans',sans-serif",
    background: T.white,
    transition: "border-color 0.18s, box-shadow 0.18s",
    outline: "none",
  };

  const headerTitle = { login: "Velkommen tilbage", register: "Opret konto", forgot: "Nulstil adgangskode" }[tab];
  const submitLabel = { login: "Log ind →",         register: "Opret konto →", forgot: "Send nulstillingslink →" }[tab];

  return (
    <>
      <style>{`
        @keyframes modalIn   { from{opacity:0;transform:scale(0.94) translateY(12px);} to{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes overlayIn { from{opacity:0;} to{opacity:1;} }
        @keyframes spin      { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        .auth-input:focus { border-color:${T.goldDark}!important; box-shadow:0 0 0 3px ${T.gold}55!important; }
        .auth-input::placeholder { color:${T.textLight}; opacity:0.7; }
        .auth-submit { transition:all 0.16s ease; cursor:pointer; border:none; }
        .auth-submit:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
        .auth-submit:active:not(:disabled) { transform:scale(0.97); }
        .auth-tab  { transition:all 0.17s ease; cursor:pointer; border:none; font-family:'DM Sans',sans-serif; }
        .link-btn  { background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; }
        .link-btn:hover { text-decoration:underline; }
      `}</style>

      {/* Overlay */}
      <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, animation:"overlayIn 0.2s ease" }}>

        {/* Card */}
        <div style={{ width:"100%", maxWidth:440, background:T.white, borderRadius:24, border:`2.5px solid ${T.creamBorder}`, boxShadow:`0 32px 80px ${T.shadowDeep}, 0 8px 24px ${T.shadow}`, overflow:"hidden", animation:"modalIn 0.25s ease" }}>

          {/* Header */}
          <div style={{ background:T.burgundy, padding:"24px 28px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${T.gold},${T.goldDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:"0 2px 10px rgba(0,0,0,0.3)" }}>🎓</div>
              <div>
                <div style={{ fontWeight:700, fontSize:17, color:T.gold, fontFamily:"'Lora',serif" }}>FagAI</div>
                <div style={{ fontSize:11, color:`${T.gold}70`, letterSpacing:"0.8px", fontFamily:"'DM Sans',sans-serif" }}>{headerTitle}</div>
              </div>
            </div>
            <button onClick={onClose}
              style={{ width:34, height:34, borderRadius:10, background:`${T.gold}18`, border:`1.5px solid ${T.gold}30`, color:`${T.gold}80`, fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1, transition:"all 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.background=`${T.gold}30`; e.currentTarget.style.color=T.gold; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=`${T.gold}18`; e.currentTarget.style.color=`${T.gold}80`; }}>✕</button>
          </div>

          {/* Tabs */}
          {tab !== "forgot" && (
            <div style={{ display:"flex", background:T.creamDark, borderBottom:`2px solid ${T.creamBorder}`, padding:"10px 10px 0" }}>
              {[{ id:"login", label:"Log ind" }, { id:"register", label:"Registrér" }].map(t => (
                <button key={t.id} className="auth-tab" onClick={() => setTab(t.id)}
                  style={{ flex:1, padding:"11px 0", fontWeight:tab===t.id?700:500, fontSize:14, color:tab===t.id?T.burgundy:T.textLight, background:tab===t.id?T.white:"transparent", borderRadius:"10px 10px 0 0", borderBottom:tab===t.id?`2.5px solid ${T.burgundy}`:"2.5px solid transparent" }}>
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Back button for forgot */}
          {tab === "forgot" && (
            <div style={{ padding:"14px 28px 0", background:T.creamDark, borderBottom:`2px solid ${T.creamBorder}` }}>
              <button className="link-btn" onClick={() => setTab("login")}
                style={{ fontSize:13, color:T.textMid, fontWeight:600, display:"flex", alignItems:"center", gap:5, padding:"8px 0" }}>
                ← Tilbage til login
              </button>
            </div>
          )}

          {/* ── FORM ── */}
          {/*
            Security notes:
            - autocomplete="username"       on email  → lets browser save credentials correctly
            - autocomplete="current-password" on login → browser fills saved password
            - autocomplete="new-password"   on register → browser offers to save NEW password
            - Passwords are never stored by our code — sent directly to Supabase over HTTPS
            - Supabase hashes with bcrypt internally
          */}
          <form
            onSubmit={handleSubmit}
            autoComplete="on"
            style={{ padding:"28px 28px 24px", display:"flex", flexDirection:"column", gap:14 }}
          >
            {/* Forgot description */}
            {tab === "forgot" && (
              <p style={{ fontSize:13.5, color:T.textMid, lineHeight:1.65, fontFamily:"'DM Sans',sans-serif", background:T.creamDark, borderRadius:10, padding:"12px 14px", border:`1.5px solid ${T.creamBorder}`, margin:0 }}>
                Skriv din e-mail nedenfor. Vi sender dig et link, hvor du kan vælge en ny adgangskode.
              </p>
            )}

            {/* Name (register only) */}
            {tab === "register" && (
              <div>
                <label style={{ display:"block", fontSize:12.5, fontWeight:700, color:T.textMid, marginBottom:6, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.3px" }}>NAVN</label>
                <input
                  className="auth-input"
                  style={inputStyle}
                  type="text"
                  name="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Dit fulde navn"
                  autoComplete="name"
                  autoFocus
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display:"block", fontSize:12.5, fontWeight:700, color:T.textMid, marginBottom:6, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.3px" }}>E-MAIL</label>
              <input
                className="auth-input"
                style={inputStyle}
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="din@email.dk"
                autoComplete="username"
                autoFocus={tab === "login" || tab === "forgot"}
              />
            </div>

            {/* Password (login + register) */}
            {tab !== "forgot" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <label style={{ fontSize:12.5, fontWeight:700, color:T.textMid, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.3px" }}>ADGANGSKODE</label>
                  {tab === "login" && (
                    <button type="button" className="link-btn" onClick={() => setTab("forgot")}
                      style={{ fontSize:12, color:T.burgundy, fontWeight:600 }}>
                      Glemt adgangskode?
                    </button>
                  )}
                </div>
                <div style={{ position:"relative" }}>
                  <input
                    className="auth-input"
                    style={{ ...inputStyle, paddingRight:48 }}
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={tab === "register" ? `Mindst ${MIN_PASSWORD_LENGTH} tegn` : "Din adgangskode"}
                    autoComplete={tab === "login" ? "current-password" : "new-password"}
                    minLength={MIN_PASSWORD_LENGTH}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    title={showPass ? "Skjul adgangskode" : "Vis adgangskode"}
                    style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:T.textLight, lineHeight:1, padding:4 }}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>

                {/* Strength bar — only on register */}
                {strength && (
                  <div style={{ display:"flex", gap:4, alignItems:"center", marginTop:8 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex:1, height:4, borderRadius:2, transition:"background 0.25s",
                        background: i <= strengthMeta[strength].bars
                          ? strengthMeta[strength].color
                          : T.creamBorder
                      }}/>
                    ))}
                    <span style={{ fontSize:11, color:strengthMeta[strength].color, marginLeft:6, flexShrink:0, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>
                      {strengthMeta[strength].label}
                    </span>
                  </div>
                )}

                {/* Hint for register */}
                {tab === "register" && !strength && (
                  <p style={{ fontSize:11.5, color:T.textLight, marginTop:6, fontFamily:"'DM Sans',sans-serif" }}>
                    Brug mindst {MIN_PASSWORD_LENGTH} tegn — undgå simple ord og tal.
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ background:"#fff0f0", border:"1.5px solid #f5c6cb", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#c0392b", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:7 }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{ background:"#f0fff4", border:"1.5px solid #9ae6b4", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#276749", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:7 }}>
                <span>✅</span> {success}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="auth-submit" disabled={loading || !!success}
              style={{ width:"100%", height:50, marginTop:4, background:(loading||!!success)?T.creamBorder:`linear-gradient(135deg,${T.burgundy},${T.burgundyLight})`, color:(loading||!!success)?T.textLight:T.gold, borderRadius:13, fontSize:15, fontWeight:700, fontFamily:"'DM Sans',sans-serif", boxShadow:(loading||!!success)?"none":`0 6px 20px ${T.shadowDeep}`, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {loading
                ? <><span style={{ display:"inline-block", animation:"spin 0.9s linear infinite" }}>⟳</span> Behandler...</>
                : submitLabel
              }
            </button>

            {/* Switch tab */}
            {tab !== "forgot" && (
              <div style={{ textAlign:"center", fontSize:13, color:T.textLight, fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>
                {tab === "login"
                  ? <>Har du ikke en konto? <button type="button" className="link-btn" onClick={() => setTab("register")} style={{ color:T.burgundy, fontWeight:700, fontSize:13 }}>Registrér her</button></>
                  : <>Har du allerede en konto? <button type="button" className="link-btn" onClick={() => setTab("login")} style={{ color:T.burgundy, fontWeight:700, fontSize:13 }}>Log ind her</button></>
                }
              </div>
            )}
          </form>

          <div style={{ padding:"14px 28px 18px", fontSize:11.5, color:T.textLight, fontFamily:"'DM Sans',sans-serif", textAlign:"center", borderTop:`1px solid ${T.creamBorder}`, lineHeight:1.6 }}>
            🔒 Adgangskoder sendes krypteret og gemmes aldrig af FagAI.
          </div>
        </div>
      </div>
    </>
  );
}
