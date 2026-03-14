import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./AuthModal.jsx";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword]   = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [ready, setReady]         = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken  = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type         = params.get("type");

    if (type === "recovery" && accessToken) {
      supabase.auth.setSession({
        access_token:  accessToken,
        refresh_token: refreshToken || "",
      }).then(({ error }) => {
        if (error) {
          setError("Reset-linket er ugyldigt eller udløbet. Anmod om et nyt.");
        } else {
          setReady(true);
        }
        window.history.replaceState(null, "", window.location.pathname);
      });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setReady(true);
        else setError("Reset-linket er ugyldigt eller udløbet. Anmod om et nyt.");
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6)   { setError("Adgangskoden skal være mindst 6 tegn."); return; }
    if (password !== password2) { setError("De to adgangskoder er ikke ens."); return; }

    setLoading(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }

    setSuccess(true);
    setLoading(false);
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate("/");
    }, 2500);
  };

  const T = {
    burgundy: "#5c1e0f", burgundyLight: "#9e3a22",
    gold: "#f1e194", goldDark: "#d4c55a",
    cream: "#faf6ee", creamDark: "#f2ead8", creamBorder: "#d4b896",
    text: "#2c1810", textMid: "#6b4438", textLight: "#9e7060",
    white: "#ffffff",
    shadow: "rgba(92,30,15,0.10)", shadowDeep: "rgba(92,30,15,0.22)",
  };

  const strength = password.length === 0 ? null
    : password.length < 6  ? "weak"
    : password.length < 10 ? "ok"
    : "strong";
  const strengthColor = { weak: "#e74c3c", ok: "#f39c12", strong: "#27ae60" };
  const strengthLabel = { weak: "For kort", ok: "Okay", strong: "Stærk" };

  return (
    <div style={{ minHeight:"100vh", background:T.cream, display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@700&family=DM+Sans:wght@400;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin   { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        .rp-input { transition:border-color 0.18s,box-shadow 0.18s; outline:none; }
        .rp-input:focus { border-color:${T.goldDark}!important; box-shadow:0 0 0 3px ${T.gold}55!important; }
        .rp-input::placeholder { color:${T.textLight}; opacity:0.7; }
        .rp-btn { transition:all 0.16s ease; cursor:pointer; border:none; }
        .rp-btn:hover:not(:disabled) { filter:brightness(1.07); transform:translateY(-1px); }
        .rp-btn:active:not(:disabled) { transform:scale(0.97); }
      `}</style>

      <div style={{ width:"100%", maxWidth:420, background:T.white, borderRadius:24, border:`2.5px solid ${T.creamBorder}`, boxShadow:`0 24px 64px ${T.shadowDeep}`, overflow:"hidden", animation:"fadeUp 0.3s ease" }}>

        {/* Header */}
        <div style={{ background:T.burgundy, padding:"28px 32px 24px", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:13, background:`linear-gradient(135deg,${T.gold},${T.goldDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 2px 12px rgba(0,0,0,0.3)", flexShrink:0 }}>🎓</div>
          <div>
            <div style={{ fontWeight:700, fontSize:18, color:T.gold, fontFamily:"'Lora',serif" }}>FagAI</div>
            <div style={{ fontSize:12, color:`${T.gold}70`, letterSpacing:"0.6px" }}>Vælg ny adgangskode</div>
          </div>
        </div>

        <div style={{ padding:"32px 32px 28px" }}>

          {/* Indlæser */}
          {!ready && !error && !success && (
            <div style={{ textAlign:"center", padding:"20px 0 10px" }}>
              <div style={{ display:"inline-block", animation:"spin 1s linear infinite", fontSize:28, marginBottom:14 }}>⟳</div>
              <p style={{ fontSize:14, color:T.textMid, lineHeight:1.6 }}>
                Bekræfter dit reset-link...<br/>
                <span style={{ fontSize:12, color:T.textLight }}>Dette tager kun et sekund</span>
              </p>
            </div>
          )}

          {/* Fejl */}
          {!ready && error && (
            <div style={{ textAlign:"center", padding:"16px 0" }}>
              <div style={{ fontSize:44, marginBottom:14 }}>⛔</div>
              <p style={{ fontSize:14, color:"#c0392b", lineHeight:1.65, marginBottom:20 }}>{error}</p>
              <button className="rp-btn" onClick={() => navigate("/")}
                style={{ padding:"12px 28px", background:`linear-gradient(135deg,${T.burgundy},${T.burgundyLight})`, color:T.gold, borderRadius:12, fontSize:14, fontWeight:700, boxShadow:`0 4px 16px ${T.shadowDeep}` }}>
                Gå til login
              </button>
            </div>
          )}

          {/* Succes */}
          {success && (
            <div style={{ textAlign:"center", padding:"16px 0" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
              <h2 style={{ fontSize:20, fontWeight:700, color:T.text, fontFamily:"'Lora',serif", marginBottom:8 }}>Adgangskode opdateret!</h2>
              <p style={{ fontSize:14, color:T.textMid, lineHeight:1.6 }}>Du sendes nu videre til login...</p>
            </div>
          )}

          {/* Formular */}
          {ready && !success && (
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <p style={{ fontSize:14, color:T.textMid, lineHeight:1.65, margin:0 }}>
                Vælg en ny adgangskode til din konto.
              </p>

              <div>
                <label style={{ display:"block", fontSize:12.5, fontWeight:700, color:T.textMid, marginBottom:6, letterSpacing:"0.3px" }}>NY ADGANGSKODE</label>
                <div style={{ position:"relative" }}>
                  <input className="rp-input"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="Mindst 6 tegn"
                    autoComplete="new-password"
                    autoFocus
                    style={{ width:"100%", height:48, border:`2px solid ${T.creamBorder}`, borderRadius:12, padding:"0 48px 0 16px", fontSize:14.5, color:T.text, background:T.white, fontFamily:"'DM Sans',sans-serif" }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:T.textLight, padding:2 }}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
                {strength && (
                  <div style={{ display:"flex", gap:4, alignItems:"center", marginTop:8 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex:1, height:4, borderRadius:2, transition:"background 0.2s",
                        background:(strength==="weak"&&i<=1)||(strength==="ok"&&i<=2)||(strength==="strong"&&i<=4)
                          ? strengthColor[strength] : T.creamBorder }} />
                    ))}
                    <span style={{ fontSize:11, color:strengthColor[strength], marginLeft:6, flexShrink:0, fontWeight:600 }}>
                      {strengthLabel[strength]}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display:"block", fontSize:12.5, fontWeight:700, color:T.textMid, marginBottom:6, letterSpacing:"0.3px" }}>BEKRÆFT ADGANGSKODE</label>
                <input className="rp-input"
                  type={showPass ? "text" : "password"}
                  value={password2}
                  onChange={e => { setPassword2(e.target.value); setError(""); }}
                  placeholder="Skriv adgangskoden igen"
                  autoComplete="new-password"
                  style={{ width:"100%", height:48, border:`2px solid ${password2&&password2!==password?"#f5c6cb":T.creamBorder}`, borderRadius:12, padding:"0 16px", fontSize:14.5, color:T.text, background:T.white, fontFamily:"'DM Sans',sans-serif" }}
                />
                {password2 && password2 !== password && (
                  <p style={{ fontSize:12, color:"#c0392b", marginTop:5 }}>Adgangskoderne er ikke ens</p>
                )}
              </div>

              {error && (
                <div style={{ background:"#fff0f0", border:"1.5px solid #f5c6cb", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#c0392b", display:"flex", alignItems:"center", gap:7 }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <button type="submit" className="rp-btn" disabled={loading}
                style={{ width:"100%", height:50, marginTop:4, background:loading?T.creamBorder:`linear-gradient(135deg,${T.burgundy},${T.burgundyLight})`, color:loading?T.textLight:T.gold, borderRadius:13, fontSize:15, fontWeight:700, fontFamily:"'DM Sans',sans-serif", boxShadow:loading?"none":`0 6px 20px ${T.shadowDeep}`, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {loading
                  ? <><span style={{ display:"inline-block", animation:"spin 0.9s linear infinite" }}>⟳</span> Gemmer...</>
                  : "Gem ny adgangskode →"
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
