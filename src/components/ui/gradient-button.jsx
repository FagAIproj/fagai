import { useEffect, forwardRef } from "react";

// ─── CSS injected once into <head> ────────────────────────────────────────────
const STYLE_ID = "fagai-gradient-button-css";

const CSS = `
/* ── @property registrations (enables smooth CSS custom property transitions) ── */
@property --gb-pos-x        { syntax: '<percentage>'; initial-value: 11.14%;    inherits: false; }
@property --gb-pos-y        { syntax: '<percentage>'; initial-value: 140%;      inherits: false; }
@property --gb-spread-x     { syntax: '<percentage>'; initial-value: 150%;      inherits: false; }
@property --gb-spread-y     { syntax: '<percentage>'; initial-value: 180.06%;   inherits: false; }
@property --gb-color-1      { syntax: '<color>';      initial-value: #000;      inherits: false; }
@property --gb-color-2      { syntax: '<color>';      initial-value: #08012c;   inherits: false; }
@property --gb-color-3      { syntax: '<color>';      initial-value: #4e1e40;   inherits: false; }
@property --gb-color-4      { syntax: '<color>';      initial-value: #70464e;   inherits: false; }
@property --gb-color-5      { syntax: '<color>';      initial-value: #88394c;   inherits: false; }
@property --gb-border-angle { syntax: '<angle>';      initial-value: 20deg;     inherits: true;  }
@property --gb-bc-1         { syntax: '<color>';      initial-value: hsla(340,75%,60%,0.2);  inherits: true; }
@property --gb-bc-2         { syntax: '<color>';      initial-value: hsla(340,75%,40%,0.75); inherits: true; }
@property --gb-stop-1       { syntax: '<percentage>'; initial-value: 37.35%;    inherits: false; }
@property --gb-stop-2       { syntax: '<percentage>'; initial-value: 61.36%;    inherits: false; }
@property --gb-stop-3       { syntax: '<percentage>'; initial-value: 78.42%;    inherits: false; }
@property --gb-stop-4       { syntax: '<percentage>'; initial-value: 89.52%;    inherits: false; }
@property --gb-stop-5       { syntax: '<percentage>'; initial-value: 100%;      inherits: false; }

/* ── Base button ── */
.gb {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  appearance: none;
  cursor: pointer;
  border: none;
  outline: none;
  color: #fff;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', 'DM Sans', sans-serif;
  border-radius: 11px;
  letter-spacing: -0.01em;

  background: radial-gradient(
    var(--gb-spread-x) var(--gb-spread-y) at var(--gb-pos-x) var(--gb-pos-y),
    var(--gb-color-1) var(--gb-stop-1),
    var(--gb-color-2) var(--gb-stop-2),
    var(--gb-color-3) var(--gb-stop-3),
    var(--gb-color-4) var(--gb-stop-4),
    var(--gb-color-5) var(--gb-stop-5)
  );

  transition:
    --gb-pos-x        0.5s,
    --gb-pos-y        0.5s,
    --gb-spread-x     0.5s,
    --gb-spread-y     0.5s,
    --gb-color-1      0.5s,
    --gb-color-2      0.5s,
    --gb-color-3      0.5s,
    --gb-color-4      0.5s,
    --gb-color-5      0.5s,
    --gb-border-angle 0.5s,
    --gb-bc-1         0.5s,
    --gb-bc-2         0.5s,
    --gb-stop-1       0.5s,
    --gb-stop-2       0.5s,
    --gb-stop-3       0.5s,
    --gb-stop-4       0.5s,
    --gb-stop-5       0.5s,
    transform         0.16s ease,
    box-shadow        0.16s ease,
    opacity           0.16s ease;
}

/* Animated border via ::before mask trick */
.gb::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(var(--gb-border-angle), var(--gb-bc-1), var(--gb-bc-2));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  pointer-events: none;
}

.gb:hover {
  --gb-pos-x:        0%;
  --gb-pos-y:        91.51%;
  --gb-spread-x:     120.24%;
  --gb-spread-y:     103.18%;
  --gb-color-1:      #c96287;
  --gb-color-2:      #c66c64;
  --gb-color-3:      #cc7d23;
  --gb-color-4:      #37140a;
  --gb-color-5:      #000;
  --gb-border-angle: 190deg;
  --gb-bc-1:         hsla(340, 78%, 90%, 0.1);
  --gb-bc-2:         hsla(340, 75%, 90%, 0.6);
  --gb-stop-1:       0%;
  --gb-stop-2:       8.8%;
  --gb-stop-3:       21.44%;
  --gb-stop-4:       71.34%;
  --gb-stop-5:       85.76%;
  transform: translateY(-1px);
  box-shadow: 0 8px 32px rgba(201, 98, 135, 0.35);
}

.gb:active {
  transform: scale(0.97) translateY(0);
}

.gb:disabled {
  opacity: 0.45;
  pointer-events: none;
}

/* ── Variant (blue/teal/lime) ── */
.gb--variant {
  --gb-color-1:      #000022;
  --gb-color-2:      #1f3f6d;
  --gb-color-3:      #469396;
  --gb-color-4:      #f1ffa5;
  --gb-border-angle: 200deg;
  --gb-bc-1:         hsla(320, 75%, 90%, 0.6);
  --gb-bc-2:         hsla(320, 50%, 90%, 0.15);
}

.gb--variant:hover {
  --gb-pos-x:        0%;
  --gb-pos-y:        95.51%;
  --gb-spread-x:     110.24%;
  --gb-spread-y:     110.2%;
  --gb-color-1:      #000020;
  --gb-color-2:      #f1ffa5;
  --gb-color-3:      #469396;
  --gb-color-4:      #1f3f6d;
  --gb-color-5:      #000;
  --gb-stop-1:       0%;
  --gb-stop-2:       10%;
  --gb-stop-3:       35.44%;
  --gb-stop-4:       71.34%;
  --gb-stop-5:       90.76%;
  --gb-border-angle: 210deg;
  --gb-bc-1:         hsla(320, 75%, 90%, 0.2);
  --gb-bc-2:         hsla(320, 50%, 90%, 0.75);
  box-shadow: 0 8px 32px rgba(70, 147, 150, 0.3);
}

/* ── Sizes ── */
.gb--sm  { font-size: 13px;  padding: 8px 20px;  border-radius: 9px;  min-width: 100px; }
.gb--md  { font-size: 15px;  padding: 13px 30px; border-radius: 11px; min-width: 132px; }
.gb--lg  { font-size: 16.5px; padding: 15px 40px; border-radius: 13px; min-width: 160px; }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * GradientButton
 *
 * Props:
 *   variant  "default" | "variant"   — warm pink/purple (default) or blue/teal
 *   size     "sm" | "md" | "lg"      — default "md"
 *   onClick, disabled, children, style, className — standard button props
 */
const GradientButton = forwardRef(function GradientButton(
  { variant = "default", size = "md", className = "", style = {}, children, ...rest },
  ref
) {
  useEffect(() => { injectStyles(); }, []);

  const classes = [
    "gb",
    variant === "variant" ? "gb--variant" : "",
    `gb--${size}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <button ref={ref} className={classes} style={style} {...rest}>
      {children}
    </button>
  );
});

export default GradientButton;
