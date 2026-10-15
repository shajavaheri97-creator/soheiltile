"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { imageUrl } from "@/lib/image-url";
import type { Dict } from "@/i18n";
import { Chevron } from "./Icons";

export default function ProductGallery({ files, alt, t }: { files: string[]; alt: string; t: Dict }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const touch = useRef(0);
  const n = files.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  if (n === 0) return <div className="tile-ph aspect-square rounded-3xl" role="img" aria-label={alt} />;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return; // touch/pen: no hover lens
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  const rtl = typeof document !== "undefined" && document.dir === "rtl";

  return (
    <div>
      <div
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-bg2"
        onPointerMove={onMove} onPointerLeave={() => setZoom(null)} onClick={() => setOpen(true)}
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50 && n > 1) go((dx < 0) !== rtl ? 1 : -1);
        }}
      >
        {files.map((f, k) => (
          <img key={f} src={imageUrl(f, 960)} srcSet={`${imageUrl(f, 960)} 960w, ${imageUrl(f, 1600)} 1600w`} sizes="(min-width:1024px) 50vw, 100vw"
            alt={k === i ? `${alt} (${t.product.face} ${k + 1})` : ""} loading={k === 0 ? "eager" : "lazy"} draggable={false}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
            style={k === i && zoom ? { transform: "scale(2.2)", transformOrigin: `${zoom.x}% ${zoom.y}%`, transition: "transform .15s" } : undefined} />
        ))}
        <span className="pointer-events-none absolute bottom-3 start-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white">{t.product.zoom}</span>
        {n > 1 && (
          <>
            <button aria-label={t.product.prev} onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="absolute start-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brand-900 shadow hover:bg-white">
              <Chevron className="h-5 w-5 -scale-x-100 rtl:scale-x-100" />
            </button>
            <button aria-label={t.product.next} onClick={(e) => { e.stopPropagation(); go(1); }}
              className="absolute end-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brand-900 shadow hover:bg-white">
              <Chevron className="h-5 w-5 rtl:-scale-x-100" />
            </button>
          </>
        )}
      </div>
      {n > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {files.map((f, k) => (
            <li key={f}>
              <button onClick={() => setI(k)} aria-label={`${t.product.face} ${k + 1}`} aria-current={k === i}
                className={`block aspect-square w-full overflow-hidden rounded-xl border-2 transition ${k === i ? "border-brand-500" : "border-transparent opacity-70 hover:opacity-100"}`}>
                <img src={imageUrl(f, 480)} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && <Lightbox files={files} index={i} setIndex={setI} alt={alt} t={t} onClose={() => setOpen(false)} />}
    </div>
  );
}

function Lightbox({ files, index, setIndex, alt, t, onClose }: {
  files: string[]; index: number; setIndex: (n: number) => void; alt: string; t: Dict; onClose: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const spot = useRef({ x: 0.5, y: 0.5 });
  const [zoomed, setZoomed] = useState(false);
  const n = files.length;
  const goTo = useCallback((k: number) => { setZoomed(false); setIndex(k); }, [setIndex]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (n > 1 && e.key === "ArrowRight") goTo((index + 1) % n);
      if (n > 1 && e.key === "ArrowLeft") goTo((index - 1 + n) % n);
    };
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); };
  }, [index, n, onClose, goTo]);

  // after zooming in, scroll so the clicked point stays under the finger/cursor
  useEffect(() => {
    const el = box.current;
    if (!el || !zoomed) return;
    el.scrollLeft = spot.current.x * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = spot.current.y * el.scrollHeight - el.clientHeight / 2;
  }, [zoomed]);

  const toggle = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!zoomed) {
      const r = e.currentTarget.getBoundingClientRect();
      spot.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    }
    setZoomed((z) => !z);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={alt} className="fixed inset-0 z-50 bg-black/90">
      {/* dir=ltr keeps scroll maths identical in RTL pages */}
      <div ref={box} dir="ltr" className={`flex h-full w-full ${zoomed ? "overflow-auto" : "items-center justify-center overflow-hidden p-3"}`}
        style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
        <img src={imageUrl(files[index], 1600)} alt={alt} onClick={toggle} draggable={false}
          className={zoomed ? "m-auto max-w-none cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in object-contain"}
          style={zoomed ? { width: "max(250%, 1600px)" } : undefined} />
      </div>
      <button onClick={onClose} aria-label={t.product.close} className="absolute end-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-xl text-brand-900">✕</button>
      {n > 1 && (
        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
          {files.map((f, k) => (
            <button key={f} aria-label={`${t.product.face} ${k + 1}`} onClick={() => goTo(k)} className={`h-2.5 rounded-full transition-all ${k === index ? "w-7 bg-white" : "w-2.5 bg-white/50"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
