// ─── FagAI Design System Tokens ──────────────────────────────────────────────
// Modern dark-mode AI product aesthetic

export const DS = {
  // ── Backgrounds ─────────────────────────────────────────────────────────
  bg:          "#08090a",
  bgSurface:   "#0f1011",
  bgElevated:  "#161719",
  bgHover:     "#1c1d1f",
  bgActive:    "#212224",

  // ── Borders ─────────────────────────────────────────────────────────────
  border:      "#1e2022",
  borderMid:   "#282a2d",
  borderHover: "#333538",

  // ── Text ────────────────────────────────────────────────────────────────
  text:        "#ededee",
  textMid:     "#9a9da3",
  textMuted:   "#585c63",
  textPlaceholder: "#404347",

  // ── Accent (indigo-violet for AI feel) ───────────────────────────────────
  accent:      "#6366f1",
  accentHover: "#5254cc",
  accentSoft:  "rgba(99,102,241,0.12)",
  accentGlow:  "rgba(99,102,241,0.25)",

  // ── Chat bubbles ─────────────────────────────────────────────────────────
  userBg:      "#1e1f2e",
  userBorder:  "#2e3050",
  aiBg:        "#0f1011",
  aiBorder:    "#1e2022",

  // ── Sidebar ──────────────────────────────────────────────────────────────
  sidebar:     "#0b0c0d",
  sidebarBorder: "#181a1c",

  // ── Status ───────────────────────────────────────────────────────────────
  success:     "#22c55e",
  error:       "#f87171",
  warning:     "#fbbf24",

  // ── Shadows ──────────────────────────────────────────────────────────────
  shadowSm:    "0 1px 3px rgba(0,0,0,0.4)",
  shadowMd:    "0 4px 16px rgba(0,0,0,0.5)",
  shadowLg:    "0 12px 40px rgba(0,0,0,0.6)",
  shadowGlow:  "0 0 24px rgba(99,102,241,0.2)",

  // ── Radii ────────────────────────────────────────────────────────────────
  radius:      "10px",
  radiusSm:    "7px",
  radiusLg:    "16px",
  radiusFull:  "9999px",

  // ── Typography — reference CSS variables set in globalCSS ──────────────────
  fontDisplay: "var(--font-display, 'Instrument Serif', serif)",
  fontBody:    "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
  fontMono:    "var(--font-mono, 'JetBrains Mono', monospace)",
};

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    color-scheme: dark;
    --scrollbar-color: #282a2d;
    /* ── Global font variables — used by every page and component ── */
    --font-body:    'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif;
    --font-display: 'Instrument Serif', 'Georgia', serif;
    --font-mono:    'JetBrains Mono', 'Fira Code', monospace;
  }

  html, body {
    font-family: var(--font-body);
    background: ${DS.bg};
    color: ${DS.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background: ${DS.bg};
    color: ${DS.text};
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${DS.borderMid}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${DS.borderHover}; }

  textarea { resize: none; }
  button, input, select, textarea { font-family: inherit; }
  button { cursor: pointer; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
  @keyframes blink    { 0%,100% { opacity:1; } 50% { opacity:0.15; } }
  @keyframes spin     { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes shimmer  { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

  .fade-up   { animation: fadeUp 0.22s ease both; }
  .fade-in   { animation: fadeIn 0.18s ease both; }
  .slide-in  { animation: slideIn 0.2s ease both; }

  [contenteditable]:focus { outline: none; }
  [contenteditable] ul { padding-left: 20px; margin: 6px 0; }
  [contenteditable] ol { padding-left: 20px; margin: 6px 0; }
  [contenteditable] p  { margin: 2px 0; line-height: 1.75; }
  [contenteditable] h2 { font-size: 18px; font-weight: 700; margin: 12px 0 4px; }
  [contenteditable] h3 { font-size: 15px; font-weight: 700; margin: 10px 0 4px; }

  .prose ul  { padding-left: 20px; margin: 6px 0; }
  .prose ol  { padding-left: 20px; margin: 6px 0; }
  .prose li  { margin-bottom: 4px; line-height: 1.75; }
  .prose h2  { font-size: 18px; font-weight: 700; margin: 14px 0 5px; }
  .prose h3  { font-size: 15px; font-weight: 600; margin: 10px 0 4px; color: ${DS.textMid}; }
  .prose p   { margin: 3px 0; line-height: 1.8; }
  .prose code {
    background: ${DS.bgElevated};
    border: 1px solid ${DS.border};
    border-radius: 5px;
    padding: 1px 6px;
    font-family: ${DS.fontMono};
    font-size: 0.85em;
    color: #a78bfa;
  }
  .prose strong { font-weight: 700; color: ${DS.text}; }
  .prose a { color: #818cf8; text-decoration: underline; text-decoration-color: rgba(129,140,248,0.4); }
`;
