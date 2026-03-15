/**
 * ContainerScroll — scroll-driven 3-D tilt animation
 *
 * Adapted from 21st.dev / Aceternity UI for plain React + Vite.
 * No Tailwind, no Next.js — pure inline styles + framer-motion.
 *
 * Requires: npm install framer-motion
 */
import { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

// ─── Hook: responsive breakpoint ─────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

// ─── Card frame ───────────────────────────────────────────────────────────────
function Card({ rotate, scale, children }) {
  const isMobile = useIsMobile();

  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        // Multi-layer shadow creates convincing 3-D depth
        boxShadow: [
          "0 0 #0000004d",
          "0 9px 20px #0000004a",
          "0 37px 37px #00000042",
          "0 84px 50px #00000026",
          "0 149px 60px #0000000a",
          "0 233px 65px #00000003",
        ].join(", "),
        maxWidth: 960,
        marginLeft:  "auto",
        marginRight: "auto",
        marginTop:   -48,
        height:      isMobile ? 380 : 560,
        width:       "100%",
        // Card outer frame — matches FagAI design system
        border:       "1px solid rgba(99,102,241,0.25)",
        padding:      2,
        background:   "#0a0b12",
        borderRadius: 28,
        overflow:     "hidden",
        position:     "relative",
      }}
    >
      {/* Inner surface */}
      <div style={{
        height:       "100%",
        width:        "100%",
        overflow:     "hidden",
        borderRadius: 26,
        background:   "#0d0e14",
      }}>
        {children}
      </div>
    </motion.div>
  );
}

// ─── Title block ──────────────────────────────────────────────────────────────
function Header({ translate, titleComponent }) {
  return (
    <motion.div
      style={{
        translateY: translate,
        maxWidth:   960,
        margin:     "0 auto",
        textAlign:  "center",
      }}
    >
      {titleComponent}
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * ContainerScroll
 *
 * Props:
 *   titleComponent  ReactNode   — text/buttons that translate up on scroll
 *   children        ReactNode   — content rendered inside the 3-D card
 */
export function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({ target: containerRef });

  const rotate    = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale     = useTransform(scrollYProgress, [0, 1], isMobile ? [0.72, 0.92] : [1.04, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <div
      ref={containerRef}
      style={{
        height:          isMobile ? "62rem" : "80rem",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        position:        "relative",
        padding:         isMobile ? "8px" : "80px",
      }}
    >
      <div
        style={{
          paddingTop:    isMobile ? 40 : 160,
          paddingBottom: isMobile ? 40 : 160,
          width:         "100%",
          position:      "relative",
          perspective:   "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale} translate={translate}>
          {children}
        </Card>
      </div>
    </div>
  );
}
