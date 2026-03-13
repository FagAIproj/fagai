import { useState, useRef, useEffect, useCallback } from "react";

// ─── THEMES ──────────────────────────────────────────────────────────────────
const THEMES = {
  desert: {
    name: "Desert Dusk", emoji: "🏜️",
    burgundy:     "#492109", burgundyMid: "#4a1616", burgundyLight: "#da9887",
    gold: "#e7d2b2", goldDark: "#c9a96e", goldDeep: "#a07840",
    cream: "#ede5da", creamDark: "#c7b294", creamBorder: "#693815",
    text: "#101d2c", textMid: "#3a1f0d", textLight: "#7a4f38",
    white: "#fff8f0",
    shadow: "rgba(73,33,9,0.12)", shadowDeep: "rgba(73,33,9,0.24)",
    navActive: "#492109", navText: "#e7d2b2",
  },
  classic: {
    name: "Burgundy Gold", emoji: "🍷",
    burgundy:     "#5c1e0f", burgundyMid: "#7a2a17", burgundyLight: "#9e3a22",
    gold: "#f1e194", goldDark: "#d4c55a", goldDeep: "#b8a93a",
    cream: "#faf6ee", creamDark: "#f2ead8", creamBorder: "#d4b896",
    text: "#2c1810", textMid: "#6b4438", textLight: "#9e7060",
    white: "#ffffff",
    shadow: "rgba(92,30,15,0.10)", shadowDeep: "rgba(92,30,15,0.22)",
    navActive: "#5c1e0f", navText: "#f1e194",
  },
  ocean: {
    name: "Deep Ocean", emoji: "🌊",
    burgundy:     "#0c2d48", burgundyMid: "#145374", burgundyLight: "#1a6fa3",
    gold: "#cce8f4", goldDark: "#5bb8e0", goldDeep: "#2196c4",
    cream: "#f0f7fb", creamDark: "#d6eaf5", creamBorder: "#a8d4ec",
    text: "#0a1929", textMid: "#1e4060", textLight: "#4a7899",
    white: "#ffffff",
    shadow: "rgba(12,45,72,0.10)", shadowDeep: "rgba(12,45,72,0.22)",
    navActive: "#0c2d48", navText: "#cce8f4",
  },
  forest: {
    name: "Moss Forest", emoji: "🌲",
    burgundy:     "#1a3a2a", burgundyMid: "#24503a", burgundyLight: "#2d6b4a",
    gold: "#d4e9c4", goldDark: "#8fc473", goldDeep: "#5a9944",
    cream: "#f2f7ee", creamDark: "#ddecd4", creamBorder: "#a8cc90",
    text: "#0f1f18", textMid: "#2a4535", textLight: "#527a60",
    white: "#ffffff",
    shadow: "rgba(26,58,42,0.10)", shadowDeep: "rgba(26,58,42,0.22)",
    navActive: "#1a3a2a", navText: "#d4e9c4",
  },
  slate: {
    name: "Midnight Slate", emoji: "🌙",
    burgundy:     "#1a1d2e", burgundyMid: "#252840", burgundyLight: "#373b5c",
    gold: "#e2d9f3", goldDark: "#a78bdb", goldDeep: "#7c5cbf",
    cream: "#f5f4f9", creamDark: "#e8e5f2", creamBorder: "#c5bce0",
    text: "#0d0f1a", textMid: "#3a3d5c", textLight: "#6b6e96",
    white: "#ffffff",
    shadow: "rgba(26,29,46,0.10)", shadowDeep: "rgba(26,29,46,0.24)",
    navActive: "#1a1d2e", navText: "#e2d9f3",
  },
};

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
  { id:"math",    label:"Matematik",     icon:"∑",   accent:"#c84b2f" },
  { id:"danish",  label:"Dansk",         icon:"Æ",   accent:"#8b2fc9" },
  { id:"english", label:"Engelsk",       icon:"En",  accent:"#1a7a5e" },
  { id:"coding",  label:"Programmering", icon:"</>", accent:"#1e5fa8" },
  { id:"science", label:"Naturfag",      icon:"⚗",   accent:"#2e7d32" },
  { id:"history", label:"Historie",      icon:"📜",  accent:"#b5651d" },
  { id:"geo",     label:"Geografi",      icon:"🌍",  accent:"#0077a8" },
  { id:"social",  label:"Samfundsfag",   icon:"⚖",   accent:"#6a1b9a" },
];

const INITIAL_NOTES = [
  { id:1, title:"Pythagoras sætning", subject:"math", date:"I dag",
    content:"<p><strong>a² + b² = c²</strong></p><p>Gælder kun for retvinklede trekanter.</p><ul><li>Hypotenusen (c) er siden over for den rette vinkel</li><li>Den er altid den <strong>længste</strong> side</li></ul>", pinned:true },
  { id:2, title:"Novelle-analyse", subject:"danish", date:"I går",
    content:"<p>Husk at analysere:</p><ul><li><strong>Komposition</strong> – opbygning og struktur</li><li><strong>Fortæller</strong> – 1. eller 3. person?</li><li><strong>Tema og motiv</strong></li><li><strong>Miljø og tid</strong></li><li><strong>Karakterer</strong></li></ul><p>Brug altid <strong>citater</strong> som belæg!</p>", pinned:false },
  { id:3, title:"Python – for-løkker", subject:"coding", date:"Mandag",
    content:"<p><strong>Grundlæggende syntax:</strong></p><ul><li><code>for i in range(10): print(i)</code></li><li><code>range(start, stop, step)</code></li></ul><p>Eksempel: <code>range(0, 10, 2)</code> → 0, 2, 4, 6, 8</p>", pinned:false },
];

const QUICK_STARTERS = [
  { label:"Forklar fotosyntese trin for trin",    subject:"science" },
  { label:"Hvad er en andengradsligning?",        subject:"math"    },
  { label:"Idéer til min opgave om klimaet",      subject:"danish"  },
  { label:"Hvad er forskellen på class og def?",  subject:"coding"  },
  { label:"Forklar årsagerne til 1. verdenskrig", subject:"history" },
  { label:"Hvad betyder BNP?",                   subject:"social"  },
];

const sub = (id) => SUBJECTS.find(s => s.id === id) || SUBJECTS[0];

// ─── Markdown renderer (for chat) ────────────────────────────────────────────
function inlineMd(text, T) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i} style={{ fontWeight:700, color:T.text }}>{p.slice(2,-2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return <code key={i} style={{ background:T.creamDark, border:`1px solid ${T.creamBorder}`, borderRadius:4, padding:"1px 6px", fontSize:"0.87em", fontFamily:"'JetBrains Mono',monospace", color:T.burgundy }}>{p.slice(1,-1)}</code>;
    return p;
  });
}

function renderMd(text, T) {
  const lines = text.split("\n");
  const out = []; let inCode = false, codeLines = [], i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (!inCode) { inCode = true; codeLines = []; }
      else {
        out.push(<pre key={"c"+i} style={{ background:"#12100e", border:`1px solid ${T.creamBorder}55`, borderRadius:12, padding:"14px 18px", overflowX:"auto", margin:"10px 0", fontSize:12.5, lineHeight:1.75, color:T.gold, fontFamily:"'JetBrains Mono',monospace", boxShadow:"inset 0 2px 10px rgba(0,0,0,0.3)" }}><code>{codeLines.join("\n")}</code></pre>);
        inCode = false; codeLines = [];
      }
      i++; continue;
    }
    if (inCode) { codeLines.push(line); i++; continue; }
    if (line.startsWith("### ")) { out.push(<h4 key={i} style={{ fontSize:12.5, fontWeight:700, color:T.burgundy, margin:"10px 0 3px", textTransform:"uppercase", letterSpacing:"0.6px", fontFamily:"'DM Sans',sans-serif" }}>{line.slice(4)}</h4>); i++; continue; }
    if (line.startsWith("## "))  { out.push(<h3 key={i} style={{ fontSize:15, fontWeight:700, color:T.text, margin:"12px 0 4px", fontFamily:"'Lora',serif" }}>{line.slice(3)}</h3>); i++; continue; }
    if (line.startsWith("# "))   { out.push(<h2 key={i} style={{ fontSize:18, fontWeight:700, color:T.text, margin:"14px 0 5px", fontFamily:"'Lora',serif" }}>{line.slice(2)}</h2>); i++; continue; }
    if (line.match(/^[-*] /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) { items.push(<li key={i} style={{ marginBottom:4 }}>{inlineMd(lines[i].slice(2), T)}</li>); i++; }
      out.push(<ul key={"ul"+i} style={{ paddingLeft:20, margin:"6px 0", lineHeight:1.8, color:T.text }}>{items}</ul>); continue;
    }
    if (line.match(/^\d+\. /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) { items.push(<li key={i} style={{ marginBottom:4 }}>{inlineMd(lines[i].replace(/^\d+\. /,""), T)}</li>); i++; }
      out.push(<ol key={"ol"+i} style={{ paddingLeft:20, margin:"6px 0", lineHeight:1.8, color:T.text }}>{items}</ol>); continue;
    }
    if (line === "") { out.push(<div key={i} style={{ height:7 }}/>); i++; continue; }
    out.push(<p key={i} style={{ margin:"3px 0", lineHeight:1.8, color:T.text }}>{inlineMd(line, T)}</p>);
    i++;
  }
  return out;
}

// ─── Rich Text Toolbar ────────────────────────────────────────────────────────
function RichToolbar({ editorRef, T }) {
  const [activeStates, setActiveStates] = useState({});

  useEffect(() => {
    const update = () => {
      setActiveStates({
        bold:                document.queryCommandState("bold"),
        italic:              document.queryCommandState("italic"),
        underline:           document.queryCommandState("underline"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList:   document.queryCommandState("insertOrderedList"),
      });
    };
    document.addEventListener("selectionchange", update);
    document.addEventListener("keyup", update);
    document.addEventListener("mouseup", update);
    return () => {
      document.removeEventListener("selectionchange", update);
      document.removeEventListener("keyup", update);
      document.removeEventListener("mouseup", update);
    };
  }, []);

  const exec = (cmd, val) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? null);
    setTimeout(() => {
      setActiveStates(prev => ({ ...prev, [cmd]: document.queryCommandState(cmd) }));
    }, 0);
  };

  const tools = [
    { label: "B",  cmd: "bold",                title:"Fed (Ctrl+B)",    style:{ fontWeight:800, fontSize:14, fontFamily:"'Lora',serif" } },
    { label: "I",  cmd: "italic",              title:"Kursiv (Ctrl+I)", style:{ fontStyle:"italic", fontSize:14 } },
    { label: "U",  cmd: "underline",           title:"Understreg",      style:{ textDecoration:"underline", fontSize:14 } },
    { label: "•",  cmd: "insertUnorderedList", title:"Punktliste",      style:{ fontSize:17, lineHeight:1 } },
    { label: "1.", cmd: "insertOrderedList",   title:"Nummerliste",     style:{ fontSize:13, fontWeight:600 } },
  ];

  return (
    <div style={{ display:"flex", alignItems:"center", gap:2, padding:"6px 10px", background:T.creamDark, borderBottom:`2px solid ${T.creamBorder}`, borderRadius:"11px 11px 0 0" }}>
      {tools.map((t, i) => {
        const on = !!activeStates[t.cmd];
        return (
          <button key={i}
            onMouseDown={e => { e.preventDefault(); exec(t.cmd); }}
            title={t.title}
            style={{
              width:32, height:30, borderRadius:7, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"'Lora',serif", transition:"all 0.13s",
              background: on ? T.burgundy : "transparent",
              color:      on ? T.gold     : T.text,
              border:     on ? `1.5px solid ${T.burgundyLight}` : `1.5px solid transparent`,
              boxShadow:  on ? `inset 0 1px 3px rgba(0,0,0,0.2)` : "none",
              ...t.style,
              ...(on ? { color: T.gold } : {}),
            }}
            onMouseEnter={e => { if (!on) { e.currentTarget.style.background=T.white; e.currentTarget.style.borderColor=T.creamBorder; }}}
            onMouseLeave={e => { if (!on) { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}}>
            {t.label}
          </button>
        );
      })}
      <div style={{ width:1, height:20, background:T.creamBorder, margin:"0 6px" }}/>
      {["H2","H3"].map((h,i) => (
        <button key={"h"+i}
          onMouseDown={e => { e.preventDefault(); exec("formatBlock", h.toLowerCase()); }}
          title={`Overskrift ${i+1}`}
          style={{ height:30, padding:"0 8px", borderRadius:7, border:`1.5px solid transparent`, background:"transparent", cursor:"pointer", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.3px", transition:"all 0.14s" }}
          onMouseEnter={e => { e.currentTarget.style.background=T.white; e.currentTarget.style.borderColor=T.creamBorder; }}
          onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}>
          {h}
        </button>
      ))}
      <div style={{ flex:1 }}/>
      <span style={{ fontSize:11, color:T.textLight, fontFamily:"'DM Sans',sans-serif", paddingRight:4 }}>Rig teksteditor</span>
    </div>
  );
}

// ─── Theme Switcher ───────────────────────────────────────────────────────────
function ThemeSwitcher({ current, onChange, T }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display:"flex", alignItems:"center", gap:7, height:36, padding:"0 14px", background:`${T.gold}20`, border:`1.5px solid ${T.gold}45`, borderRadius:9, cursor:"pointer", color:T.gold, fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600, transition:"all 0.15s" }}>
        <span style={{ fontSize:15 }}>{THEMES[current].emoji}</span>
        {THEMES[current].name}
        <span style={{ fontSize:10, opacity:0.7, marginLeft:2 }}>▾</span>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:T.white, borderRadius:14, border:`2px solid ${T.creamBorder}`, boxShadow:`0 12px 40px ${T.shadowDeep}`, overflow:"hidden", minWidth:200, zIndex:100 }}>
          <div style={{ padding:"8px 12px 6px", fontSize:10, fontWeight:700, color:T.textLight, letterSpacing:"0.8px", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", borderBottom:`1px solid ${T.creamBorder}` }}>Vælg tema</div>
          {Object.entries(THEMES).map(([key, theme]) => (
            <button key={key} onClick={() => { onChange(key); setOpen(false); }}
              style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 14px", background:current===key ? `${T.creamDark}` : "transparent", border:"none", cursor:"pointer", textAlign:"left", borderBottom:`1px solid ${T.creamBorder}20`, transition:"background 0.12s" }}
              onMouseEnter={e => { if (current!==key) e.currentTarget.style.background=T.cream; }}
              onMouseLeave={e => { if (current!==key) e.currentTarget.style.background="transparent"; }}>
              {/* Mini color preview */}
              <div style={{ display:"flex", gap:3, flexShrink:0 }}>
                <div style={{ width:14, height:14, borderRadius:"50%", background:theme.burgundy, border:"1.5px solid rgba(0,0,0,0.12)" }}/>
                <div style={{ width:14, height:14, borderRadius:"50%", background:theme.gold, border:"1.5px solid rgba(0,0,0,0.12)" }}/>
                <div style={{ width:14, height:14, borderRadius:"50%", background:theme.cream, border:"1.5px solid rgba(0,0,0,0.12)" }}/>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:T.text, fontFamily:"'DM Sans',sans-serif" }}>{theme.emoji} {theme.name}</div>
              </div>
              {current===key && <span style={{ marginLeft:"auto", color:T.burgundy, fontSize:16 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function FagAI() {
  const [themeKey, setThemeKey] = useState("classic");
  const T = THEMES[themeKey];

  const ENV_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
  const [apiKey, setApiKey]           = useState(ENV_KEY);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(!!ENV_KEY);
  const [view, setView]               = useState("chat");
  const [activeSubject, setActiveSubject] = useState(null);
  const [messages, setMessages]       = useState([
    { role:"assistant", content:"Hej! 👋 Jeg er **FagAI** – din personlige læringsassistent.\n\nJeg kan hjælpe dig med at forstå fag, organisere noter og komme med idéer til opgaver.\n\n**Hvad vil du lære om i dag?**" }
  ]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [notes, setNotes]             = useState(INITIAL_NOTES);
  const [activeNote, setActiveNote]   = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteSearch, setNoteSearch]   = useState("");
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNote, setNewNote]         = useState({ title:"", subject:"math", content:"" });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const endRef       = useRef(null);
  const textareaRef  = useRef(null);
  const editorRef    = useRef(null);
  const newEditorRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  // Sync contentEditable when switching notes
  useEffect(() => {
    if (editingNote && editorRef.current && activeNote) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content || "";
      }
    }
  }, [editingNote, activeNote?.id]);

  const sendMessage = async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    if (!apiKey) { alert("Indsæt din OpenAI API-nøgle."); return; }
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "44px";
    const msgs = [...messages, { role:"user", content:t }];
    setMessages(msgs); setLoading(true);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${apiKey}` },
        body: JSON.stringify({
          model:"gpt-4o-mini", max_tokens:1000,
          messages:[
            { role:"system", content: SYSTEM_PROMPT + (activeSubject ? `\n\nEleven fokuserer på: ${sub(activeSubject).label}.`:"") },
            ...msgs.map(m => ({ role:m.role, content:m.content }))
          ]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setMessages([...msgs, { role:"assistant", content: data.choices?.[0]?.message?.content || "Noget gik galt." }]);
    } catch(e) { setMessages([...msgs, { role:"assistant", content:`❌ **Fejl:** ${e.message}` }]); }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const saveKey   = () => { const k=apiKeyInput.trim(); if(!k.startsWith("sk-")){alert("Ugyldig nøgle");return;} setApiKey(k); setApiKeySaved(true); };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
    n.content.replace(/<[^>]+>/g,"").toLowerCase().includes(noteSearch.toLowerCase())
  );

  const saveNewNote = () => {
    if (!newNote.title.trim()) return;
    const htmlContent = newEditorRef.current?.innerHTML || newNote.content || "<p></p>";
    const n = { id:Date.now(), ...newNote, content:htmlContent, date:"Nu", pinned:false };
    setNotes([n,...notes]); setNewNote({title:"",subject:"math",content:""}); setShowNewNote(false); setActiveNote(n);
    if (newEditorRef.current) newEditorRef.current.innerHTML = "";
  };

  const commitEditedNote = () => {
    if (!activeNote || !editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setNotes(prev => prev.map(n => n.id===activeNote.id ? {...n, content:html} : n));
    setActiveNote(prev => prev ? {...prev, content:html} : prev);
    setEditingNote(null);
  };

  const navItems = [
    { id:"chat",     label:"Chat",  icon:<IconChat/> },
    { id:"notes",    label:"Noter", icon:<IconNotes/> },
    { id:"subjects", label:"Fag",   icon:<IconBook/> },
  ];

  const stripHtml = (html) => html?.replace(/<[^>]+>/g, "") || "";

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:T.cream,fontFamily:"'Lora','Georgia',serif",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${T.creamBorder};border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:${T.textLight};}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.12;}}
        .anim{animation:fadeUp 0.22s ease;}
        .nb{border:none;background:none;cursor:pointer;}
        .npill{transition:all 0.18s ease;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .btn{transition:all 0.16s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;}
        .btn:hover:not(:disabled){filter:brightness(1.07);}
        .btn:active:not(:disabled){transform:scale(0.96);}
        .sbchip{transition:all 0.16s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;}
        .sbchip:hover{filter:brightness(1.06);}
        .sbchip:active{transform:scale(0.97);}
        .nr{transition:all 0.13s;cursor:pointer;}
        .nr:hover{background:${T.creamDark}!important;}
        .scard{transition:all 0.2s ease;border:none;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif;}
        .scard:hover{transform:translateY(-3px);box-shadow:0 14px 36px ${T.shadowDeep}!important;}
        .scard:active{transform:scale(0.97);}
        .qb{transition:all 0.15s;border:none;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif;}
        .qb:hover{background:${T.creamDark}!important;border-color:${T.goldDark}!important;}
        textarea:focus,input:focus,select:focus{outline:none;}
        textarea{resize:none;}
        .ibox:focus-within{border-color:${T.goldDark}!important;box-shadow:0 0 0 3px ${T.gold}55,0 4px 18px ${T.shadow}!important;}
        [contenteditable]:focus{outline:none;}
        [contenteditable] ul{padding-left:22px;margin:6px 0;}
        [contenteditable] ol{padding-left:22px;margin:6px 0;}
        [contenteditable] li{margin-bottom:3px;line-height:1.7;}
        [contenteditable] h2{font-size:20px;font-weight:700;margin:12px 0 5px;color:${T.text};}
        [contenteditable] h3{font-size:16px;font-weight:700;margin:10px 0 4px;color:${T.text};}
        [contenteditable] p{margin:2px 0;line-height:1.75;}
        [contenteditable] code{background:${T.creamDark};border:1px solid ${T.creamBorder};border-radius:4px;padding:1px 5px;font-family:'JetBrains Mono',monospace;font-size:0.88em;}
        .note-view-content ul{padding-left:22px;margin:6px 0;}
        .note-view-content ol{padding-left:22px;margin:6px 0;}
        .note-view-content li{margin-bottom:4px;line-height:1.75;}
        .note-view-content h2{font-size:20px;font-weight:700;margin:14px 0 5px;color:${T.text};}
        .note-view-content h3{font-size:16px;font-weight:700;margin:11px 0 4px;color:${T.textMid};}
        .note-view-content p{margin:3px 0;line-height:1.8;}
        .note-view-content strong{font-weight:700;}
        .note-view-content code{background:${T.creamDark};border:1px solid ${T.creamBorder};border-radius:4px;padding:1px 5px;font-family:'JetBrains Mono',monospace;font-size:0.88em;color:${T.burgundy};}
      `}</style>

      {/* ─── TOPBAR ─── */}
      <header style={{ height:58, background:T.burgundy, display:"flex", alignItems:"center", padding:"0 24px", gap:20, flexShrink:0, boxShadow:`0 3px 20px ${T.shadowDeep}`, zIndex:30, borderBottom:`2.5px solid ${T.creamBorder}` }}>
        {/* Brand */}
        <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0, minWidth:168 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:`linear-gradient(135deg,${T.gold},${T.goldDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, boxShadow:"0 2px 12px rgba(0,0,0,0.35)", border:`1.5px solid ${T.goldDeep}` }}>🎓</div>
          <div>
            <div style={{ fontWeight:700, fontSize:19, color:T.gold, letterSpacing:"0.3px", fontFamily:"'Lora',serif", lineHeight:1 }}>FagAI</div>
            <div style={{ fontSize:9.5, color:`${T.gold}75`, letterSpacing:"1.2px", fontFamily:"'DM Sans',sans-serif", textTransform:"uppercase" }}>Læringsassistent</div>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display:"flex", gap:3, background:"rgba(0,0,0,0.22)", borderRadius:12, padding:4, border:`1.5px solid ${T.gold}25` }}>
          {navItems.map(n => (
            <button key={n.id} className="npill" onClick={() => setView(n.id)}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 20px", borderRadius:9, fontWeight:600, fontSize:13.5, color:view===n.id?T.burgundy:`${T.gold}cc`, background:view===n.id?T.gold:"transparent", boxShadow:view===n.id?`0 2px 10px rgba(0,0,0,0.28)`:"none" }}>
              <span style={{ opacity:view===n.id?1:0.65 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>

        {activeSubject && view==="chat" && (
          <div style={{ display:"flex", alignItems:"center", gap:7, background:`${T.gold}18`, color:T.gold, borderRadius:20, padding:"5px 14px 5px 10px", fontSize:13, fontWeight:600, border:`1.5px solid ${T.gold}40`, fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
            <span style={{ fontSize:16 }}>{sub(activeSubject).icon}</span>{sub(activeSubject).label}
            <button onClick={() => setActiveSubject(null)} className="nb" style={{ color:T.gold, opacity:0.5, fontSize:14, lineHeight:1, marginLeft:2 }}>✕</button>
          </div>
        )}

        <div style={{ flex:1 }}/>

        {/* Theme switcher */}
        <ThemeSwitcher current={themeKey} onChange={setThemeKey} T={T} />

        {/* API key */}
        {!apiKeySaved ? (
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13 }}>🔑</span>
              <input value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveKey()} type="password" placeholder="OpenAI API-nøgle..."
                style={{ paddingLeft:32, paddingRight:12, height:36, border:`1.5px solid ${T.gold}40`, borderRadius:9, fontSize:13, color:T.gold, background:"rgba(0,0,0,0.22)", width:240, fontFamily:"'DM Sans',sans-serif" }}/>
            </div>
            <button onClick={saveKey} className="btn" style={{ height:36, padding:"0 16px", background:`linear-gradient(135deg,${T.gold},${T.goldDark})`, color:T.burgundy, borderRadius:9, fontSize:13, fontWeight:700, boxShadow:"0 2px 10px rgba(0,0,0,0.28)" }}>Gem nøgle</button>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:`${T.gold}18`, color:T.gold, borderRadius:8, padding:"5px 14px", fontSize:12.5, fontWeight:600, border:`1.5px solid ${T.gold}38`, fontFamily:"'DM Sans',sans-serif" }}>✓ Tilsluttet</div>
            <button onClick={()=>{setApiKey("");setApiKeySaved(false);setApiKeyInput("");}} className="nb" style={{ fontSize:12, color:`${T.gold}65`, padding:"4px 9px", borderRadius:6, border:`1px solid ${T.gold}25`, fontFamily:"'DM Sans',sans-serif" }}>ændre</button>
          </div>
        )}
      </header>

      {/* ─── BODY ─── */}
      <div style={{ flex:1, overflow:"hidden", display:"flex" }}>

        {/* ══════════════ CHAT ══════════════ */}
        {view==="chat" && (
          <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
            {/* Sidebar */}
            {sidebarOpen && (
              <div style={{ width:246, minWidth:246, background:T.burgundyMid, borderRight:`2.5px solid ${T.creamBorder}55`, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`3px 0 14px ${T.shadowDeep}` }}>
                <div style={{ flex:1, overflowY:"auto", padding:"18px 12px 10px" }}>
                  <div style={{ fontSize:9.5, fontWeight:700, color:`${T.gold}75`, letterSpacing:"1.3px", textTransform:"uppercase", marginBottom:10, paddingLeft:8, fontFamily:"'DM Sans',sans-serif" }}>Fag-fokus</div>
                  {SUBJECTS.map(s => {
                    const active = activeSubject === s.id;
                    return (
                      <button key={s.id} className="sbchip" onClick={()=>setActiveSubject(active?null:s.id)}
                        style={{
                          display:"flex", alignItems:"center", gap:10, width:"100%",
                          padding:"9px 12px", borderRadius:10, marginBottom:4,
                          background: active ? `${T.gold}25` : `rgba(255,255,255,0.04)`,
                          color: active ? T.gold : `${T.gold}80`,
                          fontWeight: active ? 700 : 400,
                          fontSize:13.5,
                          border: active
                            ? `2px solid ${T.gold}70`
                            : `2px solid rgba(255,255,255,0.12)`,
                          boxShadow: active ? `inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px ${T.shadowDeep}` : "none",
                        }}>
                        <span style={{ width:24, height:24, borderRadius:7, background: active ? `${T.gold}30` : `rgba(255,255,255,0.08)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, border: active ? `1px solid ${T.gold}50` : `1px solid rgba(255,255,255,0.1)` }}>{s.icon}</span>
                        {s.label}
                      </button>
                    );
                  })}
                  <div style={{ height:1, background:`${T.gold}20`, margin:"14px 6px" }}/>
                  <div style={{ fontSize:9.5, fontWeight:700, color:`${T.gold}75`, letterSpacing:"1.3px", textTransform:"uppercase", marginBottom:10, paddingLeft:8, fontFamily:"'DM Sans',sans-serif" }}>Hurtig start</div>
                  {QUICK_STARTERS.map((q,i) => (
                    <button key={i} className="sbchip" onClick={()=>sendMessage(q.label)}
                      style={{ display:"block", width:"100%", padding:"8px 12px", borderRadius:10, marginBottom:3, fontSize:12.5, background:"transparent", color:`${T.gold}70`, lineHeight:1.45, border:`1.5px solid transparent`, textAlign:"left" }}
                      onMouseEnter={e=>{ e.currentTarget.style.background=`rgba(255,255,255,0.06)`; e.currentTarget.style.borderColor=`rgba(255,255,255,0.12)`; e.currentTarget.style.color=T.gold; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.color=`${T.gold}70`; }}>
                      › {q.label}
                    </button>
                  ))}
                </div>
                <button className="nb" onClick={()=>setSidebarOpen(false)}
                  style={{ padding:"11px 16px", borderTop:`1px solid ${T.gold}18`, color:`${T.gold}45`, fontSize:12, textAlign:"left", display:"flex", alignItems:"center", gap:6, fontFamily:"'DM Sans',sans-serif" }}>
                  <span style={{ fontSize:15 }}>‹</span> Skjul panel
                </button>
              </div>
            )}
            {!sidebarOpen && (
              <button className="nb" onClick={()=>setSidebarOpen(true)}
                style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", zIndex:20, background:T.burgundy, border:`1.5px solid ${T.gold}35`, borderLeft:"none", borderRadius:"0 9px 9px 0", padding:"14px 6px", color:T.gold, fontSize:16, boxShadow:`3px 0 12px ${T.shadow}` }}>›</button>
            )}

            {/* Chat main */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:T.cream }}>
              <div style={{ flex:1, overflowY:"auto", padding:"36px 52px", display:"flex", flexDirection:"column", gap:26 }}>
                {messages.map((msg,i) => (
                  <div key={i} className="anim" style={{ display:"flex", gap:14, justifyContent:msg.role==="user"?"flex-end":"flex-start", alignItems:"flex-start" }}>
                    {msg.role==="assistant" && (
                      <div style={{ width:40, height:40, borderRadius:13, background:`linear-gradient(135deg,${T.burgundy},${T.burgundyLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, flexShrink:0, boxShadow:`0 3px 14px ${T.shadowDeep}`, border:`2px solid ${T.gold}50`, marginTop:1 }}>🎓</div>
                    )}
                    <div style={{ maxWidth:"62%", background:msg.role==="user"?`linear-gradient(135deg,${T.burgundy},${T.burgundyMid})`:T.white, color:msg.role==="user"?T.gold:T.text, borderRadius:msg.role==="user"?"20px 20px 5px 20px":"5px 20px 20px 20px", padding:"14px 20px", fontSize:14.5, boxShadow:msg.role==="user"?`0 5px 18px ${T.shadowDeep}`:`0 3px 14px ${T.shadow}`, border:msg.role==="user"?`1.5px solid ${T.gold}35`:`2px solid ${T.creamBorder}`, lineHeight:1.78, fontFamily:msg.role==="user"?"'DM Sans',sans-serif":"'Lora',serif" }}>
                      {msg.role==="assistant" ? renderMd(msg.content, T) : msg.content}
                    </div>
                    {msg.role==="user" && (
                      <div style={{ width:40, height:40, borderRadius:13, background:`linear-gradient(135deg,${T.gold},${T.goldDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, flexShrink:0, border:`2px solid ${T.goldDeep}`, marginTop:1 }}>👤</div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="anim" style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div style={{ width:40, height:40, borderRadius:13, background:`linear-gradient(135deg,${T.burgundy},${T.burgundyLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, flexShrink:0, border:`2px solid ${T.gold}50` }}>🎓</div>
                    <div style={{ background:T.white, borderRadius:"5px 20px 20px 20px", padding:"17px 22px", boxShadow:`0 3px 14px ${T.shadow}`, border:`2px solid ${T.creamBorder}`, display:"flex", gap:7, alignItems:"center" }}>
                      {[0,0.2,0.4].map((d,i)=><div key={i} style={{ width:9, height:9, borderRadius:"50%", background:T.burgundy, animation:`blink 1.4s ease ${d}s infinite` }}/>)}
                    </div>
                  </div>
                )}
                <div ref={endRef}/>
              </div>

              <div style={{ borderTop:`2px solid ${T.creamBorder}`, background:T.creamDark, padding:"18px 52px 22px" }}>
                <div className="ibox" style={{ display:"flex", alignItems:"flex-end", gap:12, background:T.white, borderRadius:18, border:`2px solid ${T.creamBorder}`, padding:"11px 11px 11px 20px", boxShadow:`0 3px 14px ${T.shadow}`, transition:"border-color 0.2s,box-shadow 0.2s" }}>
                  {activeSubject && <span style={{ fontSize:20, flexShrink:0, paddingBottom:5, opacity:0.7 }}>{sub(activeSubject).icon}</span>}
                  <textarea ref={textareaRef} value={input}
                    onChange={e=>{setInput(e.target.value);e.target.style.height="44px";e.target.style.height=Math.min(e.target.scrollHeight,160)+"px";}}
                    onKeyDown={handleKey}
                    placeholder={activeSubject?`Stil et spørgsmål om ${sub(activeSubject).label.toLowerCase()}...`:"Stil et spørgsmål eller beskriv hvad du vil lære..."}
                    style={{ flex:1, border:"none", background:"transparent", fontSize:15, color:T.text, lineHeight:1.6, height:44, maxHeight:160, overflowY:"auto", fontFamily:"'Lora',serif", paddingTop:4 }}/>
                  <div style={{ display:"flex", alignItems:"center", gap:9, flexShrink:0 }}>
                    {input && <button className="nb" onClick={()=>{setInput("");if(textareaRef.current)textareaRef.current.style.height="44px";}} style={{ width:33, height:33, borderRadius:"50%", background:T.creamDark, color:T.textLight, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", border:`1.5px solid ${T.creamBorder}` }}>✕</button>}
                    <button className="btn" onClick={()=>sendMessage()} disabled={!input.trim()||loading||!apiKey}
                      style={{ width:48, height:48, borderRadius:14, background:input.trim()&&!loading&&apiKey?`linear-gradient(135deg,${T.burgundy},${T.burgundyLight})`:T.creamBorder, cursor:input.trim()&&!loading&&apiKey?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:input.trim()&&!loading&&apiKey?`0 5px 16px ${T.shadowDeep}`:"none" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim()&&!loading&&apiKey?T.gold:T.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  </div>
                </div>
                <div style={{ textAlign:"center", fontSize:11, color:T.textLight, marginTop:10, fontFamily:"'DM Sans',sans-serif" }}>
                  FagAI hjælper dig med at lære – ikke med at snyde 🎯 &nbsp;·&nbsp; Shift+Enter for ny linje
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ NOTER ══════════════ */}
        {view==="notes" && (
          <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
            {/* List */}
            <div style={{ width:298, minWidth:298, background:T.white, borderRight:`2.5px solid ${T.creamBorder}`, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:`3px 0 10px ${T.shadow}` }}>
              <div style={{ padding:"16px 16px 12px", borderBottom:`2px solid ${T.creamBorder}`, background:T.creamDark }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <span style={{ fontWeight:700, fontSize:17, color:T.text, fontFamily:"'Lora',serif" }}>Mine noter</span>
                  <button className="btn" onClick={()=>{setShowNewNote(true);setActiveNote(null);setEditingNote(null);}}
                    style={{ width:32, height:32, borderRadius:10, background:T.burgundy, color:T.gold, fontWeight:700, fontSize:20, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 2px 10px ${T.shadowDeep}` }}>+</button>
                </div>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, color:T.textLight }}>🔍</span>
                  <input value={noteSearch} onChange={e=>setNoteSearch(e.target.value)} placeholder="Søg noter..."
                    style={{ width:"100%", paddingLeft:30, height:35, border:`2px solid ${T.creamBorder}`, borderRadius:9, fontSize:13, color:T.text, fontFamily:"'DM Sans',sans-serif", background:T.white }}/>
                </div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"10px 10px" }}>
                {filteredNotes.length===0 && <div style={{ textAlign:"center", color:T.textLight, fontSize:13, padding:"32px 16px", fontFamily:"'DM Sans',sans-serif" }}>{noteSearch?"Ingen resultater":"Ingen noter endnu.\nKlik + for at oprette."}</div>}
                {filteredNotes.map(note => {
                  const m=sub(note.subject), active=activeNote?.id===note.id;
                  return (
                    <div key={note.id} className="nr" onClick={()=>{setActiveNote(note);setShowNewNote(false);setEditingNote(null);}}
                      style={{ padding:"12px 14px", borderRadius:12, marginBottom:5, background:active?`${T.creamDark}`:T.white, border:`2px solid ${active?T.creamBorder:"transparent"}`, borderLeft:`4px solid ${active?T.burgundy:T.creamBorder}`, boxShadow:active?`0 2px 10px ${T.shadow}`:"none" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div style={{ fontWeight:600, fontSize:13.5, color:T.text, flex:1, fontFamily:"'Lora',serif" }}>{note.title}</div>
                        <span style={{ fontSize:10, color:T.textLight, flexShrink:0, marginLeft:6, fontFamily:"'DM Sans',sans-serif" }}>{note.date}</span>
                      </div>
                      <div style={{ fontSize:12, color:T.textLight, marginTop:4, lineHeight:1.45, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", fontFamily:"'DM Sans',sans-serif" }}>
                        {stripHtml(note.content).slice(0,100)}
                      </div>
                      <div style={{ marginTop:7 }}>
                        <span style={{ fontSize:11, background:T.burgundy, color:T.gold, borderRadius:6, padding:"2px 9px", fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>{m.icon} {m.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editor panel */}
            <div style={{ flex:1, background:T.cream, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              {showNewNote ? (
                <div style={{ flex:1, overflowY:"auto", padding:"44px 56px" }}>
                  <div style={{ maxWidth:700, margin:"0 auto" }}>
                    <h2 style={{ fontSize:27, fontWeight:700, color:T.text, marginBottom:26, fontFamily:"'Lora',serif" }}>Ny note</h2>
                    <div style={{ display:"flex", gap:12, marginBottom:14 }}>
                      <input value={newNote.title} onChange={e=>setNewNote({...newNote,title:e.target.value})} placeholder="Titel..."
                        style={{ flex:1, height:48, border:`2px solid ${T.creamBorder}`, borderRadius:11, padding:"0 16px", fontSize:15, fontFamily:"'Lora',serif", color:T.text, background:T.white }}/>
                      <select value={newNote.subject} onChange={e=>setNewNote({...newNote,subject:e.target.value})}
                        style={{ height:48, border:`2px solid ${T.creamBorder}`, borderRadius:11, padding:"0 14px", fontSize:14, fontFamily:"'DM Sans',sans-serif", color:T.text, background:T.white }}>
                        {SUBJECTS.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                      </select>
                    </div>
                    {/* Rich text editor */}
                    <div style={{ border:`2px solid ${T.creamBorder}`, borderRadius:11, overflow:"hidden", marginBottom:18, boxShadow:`0 2px 8px ${T.shadow}` }}>
                      <RichToolbar editorRef={newEditorRef} T={T}/>
                      <div ref={newEditorRef} contentEditable suppressContentEditableWarning
                        data-placeholder="Skriv dine noter her – brug værktøjslinjen til fed tekst, lister osv..."
                        style={{ minHeight:280, padding:"16px 18px", fontSize:14.5, fontFamily:"'Lora',serif", color:T.text, background:T.white, lineHeight:1.8 }}
                      />
                    </div>
                    <div style={{ display:"flex", gap:10 }}>
                      <button onClick={saveNewNote} className="btn"
                        style={{ padding:"12px 30px", background:`linear-gradient(135deg,${T.burgundy},${T.burgundyLight})`, color:T.gold, borderRadius:11, fontSize:14, fontWeight:700, boxShadow:`0 5px 16px ${T.shadowDeep}` }}>Gem note</button>
                      <button onClick={()=>setShowNewNote(false)} className="btn"
                        style={{ padding:"12px 18px", background:T.white, color:T.textMid, border:`2px solid ${T.creamBorder}`, borderRadius:11, fontSize:14 }}>Annuller</button>
                    </div>
                  </div>
                </div>
              ) : activeNote ? (
                <div style={{ flex:1, overflowY:"auto", padding:"40px 56px" }}>
                  <div style={{ maxWidth:720, margin:"0 auto" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
                      <div style={{ flex:1 }}>
                        {editingNote===activeNote.id
                          ? <input value={activeNote.title} onChange={e=>{ setActiveNote(p=>({...p,title:e.target.value})); setNotes(prev=>prev.map(n=>n.id===activeNote.id?{...n,title:e.target.value}:n)); }}
                              style={{ fontSize:28, fontWeight:700, color:T.text, border:"none", background:"transparent", fontFamily:"'Lora',serif", width:"100%", borderBottom:`2.5px solid ${T.creamBorder}`, paddingBottom:5 }}/>
                          : <h1 style={{ fontSize:28, fontWeight:700, color:T.text, letterSpacing:"-0.4px", fontFamily:"'Lora',serif" }}>{activeNote.title}</h1>}
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:9 }}>
                          <span style={{ fontSize:12, background:T.burgundy, color:T.gold, borderRadius:7, padding:"3px 11px", fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
                            {sub(activeNote.subject).icon} {sub(activeNote.subject).label}
                          </span>
                          <span style={{ fontSize:11, color:T.textLight, fontFamily:"'DM Sans',sans-serif" }}>{activeNote.date}</span>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:9, marginLeft:18 }}>
                        {editingNote===activeNote.id
                          ? <button className="btn" onClick={commitEditedNote}
                              style={{ padding:"8px 20px", background:T.burgundy, color:T.gold, border:`2px solid ${T.burgundy}`, borderRadius:10, fontSize:13, fontWeight:700 }}>Færdig ✓</button>
                          : <button className="btn" onClick={()=>{ setEditingNote(activeNote.id); setTimeout(()=>{ if(editorRef.current){ editorRef.current.innerHTML=activeNote.content||""; editorRef.current.focus(); } },50); }}
                              style={{ padding:"8px 20px", background:T.white, color:T.burgundy, border:`2px solid ${T.burgundy}`, borderRadius:10, fontSize:13, fontWeight:600 }}>Rediger</button>}
                        <button className="btn" onClick={()=>{setNotes(notes.filter(n=>n.id!==activeNote.id));setActiveNote(null);}}
                          style={{ padding:"8px 14px", background:T.white, color:"#c0392b", border:"2px solid #f5c6cb", borderRadius:10, fontSize:13, fontWeight:600 }}>Slet</button>
                      </div>
                    </div>
                    <div style={{ height:2, background:`linear-gradient(90deg,${T.burgundy}80,transparent)`, marginBottom:26, borderRadius:2 }}/>
                    {editingNote===activeNote.id ? (
                      <div style={{ border:`2px solid ${T.creamBorder}`, borderRadius:11, overflow:"hidden", boxShadow:`0 2px 8px ${T.shadow}` }}>
                        <RichToolbar editorRef={editorRef} T={T}/>
                        <div ref={editorRef} contentEditable suppressContentEditableWarning
                          style={{ minHeight:380, padding:"18px 20px", fontSize:14.5, fontFamily:"'Lora',serif", color:T.text, background:T.white, lineHeight:1.8 }}
                        />
                      </div>
                    ) : (
                      <div className="note-view-content" style={{ fontSize:15, color:T.text, lineHeight:1.85, fontFamily:"'Lora',serif" }}
                        dangerouslySetInnerHTML={{ __html: activeNote.content }}/>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ width:76, height:76, borderRadius:22, background:T.creamDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, marginBottom:18, border:`2.5px solid ${T.creamBorder}`, boxShadow:`0 4px 16px ${T.shadow}` }}>📝</div>
                  <div style={{ fontWeight:600, fontSize:18, color:T.textMid, marginBottom:7, fontFamily:"'Lora',serif" }}>Vælg en note</div>
                  <div style={{ fontSize:13, color:T.textLight, fontFamily:"'DM Sans',sans-serif" }}>eller opret en ny med + knappen</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ FAG ══════════════ */}
        {view==="subjects" && (
          <div style={{ flex:1, overflowY:"auto", padding:"44px 60px" }}>
            <div style={{ maxWidth:980, margin:"0 auto" }}>
              <div style={{ marginBottom:36 }}>
                <h1 style={{ fontSize:32, fontWeight:700, color:T.text, letterSpacing:"-0.5px", fontFamily:"'Lora',serif" }}>Faghjælp</h1>
                <p style={{ fontSize:15, color:T.textMid, marginTop:7, fontFamily:"'DM Sans',sans-serif" }}>Vælg et fag for at starte en fokuseret chat-session</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:44 }}>
                {SUBJECTS.map(s => {
                  const active = activeSubject===s.id;
                  return (
                    <button key={s.id} className="scard" onClick={()=>{setActiveSubject(s.id);setView("chat");}}
                      style={{ background:active?T.burgundy:T.white, borderRadius:20, padding:"26px 22px", border:`2.5px solid ${active?T.gold:T.creamBorder}`, boxShadow:active?`0 8px 28px ${T.shadowDeep}`:`0 2px 10px ${T.shadow}` }}>
                      <div style={{ width:56, height:56, borderRadius:17, background:active?`${T.gold}30`:T.creamDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, color:active?T.gold:s.accent, fontWeight:700, marginBottom:14, border:`2.5px solid ${active?T.gold+"60":T.creamBorder}`, boxShadow:active?`0 4px 14px ${T.shadowDeep}`:"none" }}>{s.icon}</div>
                      <div style={{ fontWeight:700, fontSize:15.5, color:active?T.gold:T.text, fontFamily:"'Lora',serif" }}>{s.label}</div>
                      <div style={{ fontSize:12, color:active?`${T.gold}80`:T.textLight, marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>Klik for at åbne →</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ background:T.white, borderRadius:22, padding:32, border:`2.5px solid ${T.creamBorder}`, boxShadow:`0 4px 18px ${T.shadow}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:7 }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:T.burgundy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💡</div>
                  <h2 style={{ fontSize:19, fontWeight:700, color:T.text, fontFamily:"'Lora',serif" }}>Idé-bank</h2>
                </div>
                <p style={{ fontSize:13, color:T.textLight, marginBottom:22, marginLeft:50, fontFamily:"'DM Sans',sans-serif" }}>Klik for at sende direkte til chat</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:11 }}>
                  {QUICK_STARTERS.map((q,i) => {
                    const m=sub(q.subject);
                    return (
                      <button key={i} className="qb" onClick={()=>{setActiveSubject(q.subject);setView("chat");setTimeout(()=>sendMessage(q.label),80);}}
                        style={{ padding:"14px 20px", background:T.cream, borderRadius:14, border:`2px solid ${T.creamBorder}`, color:T.text, fontSize:14, display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontSize:19, flexShrink:0 }}>{m.icon}</span>
                        <span style={{ flex:1, textAlign:"left", fontFamily:"'DM Sans',sans-serif" }}>{q.label}</span>
                        <span style={{ color:T.burgundy, fontSize:17, opacity:0.4 }}>→</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IconChat()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function IconNotes() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function IconBook()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>; }
