"use client";
import { useEffect, useRef } from "react";

/**
 * Fades/slides children in when they scroll into view.
 * Progressive enhancement: content is visible in the server HTML; only blocks that start
 * below the fold are hidden (after hydration) and revealed on scroll.
 */
export default function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen
    el.classList.add("pending");
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("pending", "in"); };
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}
