"use client";
import { useEffect, useRef } from "react";

const TILES: [number, number, number, string][] = [
  [8, 8, 46, "#18c3c6,#8cecec"], [52, 4, 40, "#0b7f86,#18c3c6"], [4, 52, 40, "#8cecec,#e6fafa"],
  [48, 48, 46, "#18c3c6,#0b7f86"], [30, 30, 34, "#e6fafa,#8cecec"],
];

/** Decorative tile composition that drifts slightly with the pointer/scroll. */
export default function HeroTiles() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (x: number, y: number) =>
      root.current?.querySelectorAll<HTMLElement>("[data-z]").forEach((el) => {
        const z = Number(el.dataset.z);
        el.style.transform = `translate(${x * z * 6}px, ${y * z * 6}px)`;
      });
    const onMouse = (e: MouseEvent) => move(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
    const onScroll = () => move(0, Math.min(scrollY / 400, 1) - 0.5);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("mousemove", onMouse); window.removeEventListener("scroll", onScroll); };
  }, []);
  return (
    <div ref={root} aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[460px]">
      {TILES.map(([l, t, s, c], i) => (
        <div key={i} data-z={i + 1} className="absolute rounded-2xl shadow-soft transition-transform duration-300 ease-out"
          style={{ left: `${l}%`, top: `${t}%`, width: `${s}%`, height: `${s}%`, background: `linear-gradient(135deg,${c})` }} />
      ))}
    </div>
  );
}
