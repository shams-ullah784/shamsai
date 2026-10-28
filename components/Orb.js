"use client";

import { useEffect, useRef } from "react";

/** The ShamsAI sun: a 3D glowing core with orbiting rings. Tilts toward the pointer. */
export default function Orb({ size = "lg", busy = false, interactive = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!interactive) return;
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce) return;
    const move = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty("--tx", `${x * 18}deg`);
      el.style.setProperty("--ty", `${-y * 14}deg`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [interactive]);

  return (
    <div ref={ref} className={`orb ${size === "sm" ? "sm" : ""} ${busy ? "busy" : ""}`} aria-hidden="true">
      <div className="orb-stage">
        <div className="ring c" />
        <div className="ring b" />
        <div className="orb-core" />
        <div className="ring a" />
      </div>
    </div>
  );
}
