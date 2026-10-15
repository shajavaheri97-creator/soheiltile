"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dict, Lang } from "@/i18n";
import { Logo } from "./Icons";

export default function Header({ lang, t }: { lang: Lang; t: Dict }) {
  const pathname = usePathname() || `/${lang}`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const other: Lang = lang === "fa" ? "en" : "fa";
  const switchHref = pathname.replace(/^\/(fa|en)(?=\/|$)/, `/${other}`);
  const base = `/${lang}`;
  const links = [
    [`${base}/products`, t.nav.products],
    [`${base}#projects`, t.nav.projects],
    [`${base}#why`, t.nav.why],
    [`${base}#places`, t.nav.places],
    [`${base}#contact`, t.nav.contact],
  ] as const;

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur transition-all ${scrolled ? "border-line bg-bg/90 shadow-soft" : "border-transparent bg-bg/70"}`}>
      <div className={`mx-auto flex max-w-6xl items-center gap-4 px-5 transition-all ${scrolled ? "h-14" : "h-[72px]"}`}>
        <Link href={base} className="flex items-center gap-2.5 text-lg font-extrabold">
          <Logo /> {t.brand}
        </Link>
        <nav className="ms-auto hidden gap-6 text-[15px] md:flex" aria-label="main">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="text-muted transition hover:text-brand-600">{label}</Link>
          ))}
        </nav>
        <Link href={switchHref} hrefLang={other} className="ms-auto rounded-full border border-line px-3.5 py-1 text-sm font-semibold hover:bg-bg2 md:ms-0">
          {t.nav.lang}
        </Link>
        <button
          className="rounded-lg border border-line p-2 md:hidden" aria-label={t.nav.menu} aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav className="border-t border-line bg-bg px-5 py-3 md:hidden" aria-label="mobile">
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="block py-2.5 text-muted hover:text-brand-600">{label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
