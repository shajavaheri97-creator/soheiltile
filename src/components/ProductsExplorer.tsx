"use client";
import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import type { ListItem } from "@/lib/catalog";
import { fmt, type Dict, type Lang } from "@/i18n";
import { normalizeText, sizeLabel } from "@/lib/text";
import ProductCard from "./ProductCard";

type Initial = { q: string; size: string; glaze: string; av: boolean };

const chip = (on: boolean) =>
  `rounded-full border px-4 py-1.5 text-sm transition ${on ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-card hover:border-brand-400"}`;

export default function ProductsExplorer({ items, lang, t, initial }: { items: ListItem[]; lang: Lang; t: Dict; initial: Initial }) {
  const [q, setQ] = useState(initial.q);
  const [size, setSize] = useState(initial.size);
  const [glaze, setGlaze] = useState(initial.glaze);
  const [av, setAv] = useState(initial.av);

  const sizes = useMemo(() => {
    const area = (s: string) => s.split("x").reduce((a, b) => a * Number(b), 1);
    return [...new Set(items.map((i) => i.size))].sort((a, b) => area(a) - area(b));
  }, [items]);
  const fuse = useMemo(() => new Fuse(items, { keys: ["search"], threshold: 0.3, ignoreLocation: true, minMatchCharLength: 2 }), [items]);

  const shown = useMemo(() => {
    const nq = normalizeText(q);
    const base = nq ? fuse.search(nq).map((r) => r.item) : items;
    return base.filter((i) => (size === "all" || i.size === size) && (glaze === "all" || i.glaze === glaze) && (!av || i.available));
  }, [q, size, glaze, av, items, fuse]);

  // keep the URL shareable without triggering navigation
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (size !== "all") p.set("size", size);
    if (glaze !== "all") p.set("glaze", glaze);
    if (av) p.set("av", "1");
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q, size, glaze, av]);

  const filtered = q || size !== "all" || glaze !== "all" || av;
  const reset = () => { setQ(""); setSize("all"); setGlaze("all"); setAv(false); };

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-5 mb-6 space-y-3 border-b border-line bg-bg/90 px-5 py-3 backdrop-blur md:top-[56px]">
        <input
          type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.list.search} aria-label={t.list.search}
          className="w-full rounded-xl border border-line bg-card px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.list.size}>
            <span className="text-sm text-muted">{t.list.size}:</span>
            <button className={chip(size === "all")} onClick={() => setSize("all")}>{t.list.all}</button>
            {sizes.map((s) => <button key={s} className={chip(size === s)} onClick={() => setSize(s)}><span dir="ltr">{sizeLabel(s)}</span></button>)}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.list.glaze}>
            <span className="text-sm text-muted">{t.list.glaze}:</span>
            <button className={chip(glaze === "all")} onClick={() => setGlaze("all")}>{t.list.all}</button>
            <button className={chip(glaze === "polish")} onClick={() => setGlaze("polish")}>{t.list.polish}</button>
            <button className={chip(glaze === "matte")} onClick={() => setGlaze("matte")}>{t.list.matte}</button>
          </div>
          <button className={chip(av)} aria-pressed={av} onClick={() => setAv((v) => !v)}>{t.list.onlyAvailable}</button>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {fmt(t.list.count, { n: new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en").format(shown.length) })}
        {filtered && <button onClick={reset} className="ms-3 font-semibold text-brand-600 hover:underline">{t.list.reset}</button>}
      </p>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">{items.length ? t.list.none : t.list.empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((i) => <ProductCard key={i.id} item={i} lang={lang} t={t} />)}
        </div>
      )}
    </div>
  );
}
