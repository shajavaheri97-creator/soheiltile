import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import HeroTiles from "@/components/HeroTiles";
import { PhoneIcon, PinIcon } from "@/components/Icons";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { siteConfig } from "@/config/site";
import { getDict, isLang } from "@/i18n";
import { imageUrl } from "@/lib/images";
import { listProducts, listProjects, toListItem } from "@/lib/catalog";
import { alternates, jsonLd, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    title: { absolute: `${t.brand} | ${lang === "fa" ? "کاشی و سرامیک" : "Tiles & Ceramics"}` },
    description: t.siteDesc,
    alternates: alternates(lang),
    openGraph: { title: t.brand, description: t.siteDesc, url: `/${lang}`, images: [{ url: "/icons/icon-512.png" }] },
  };
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const all = listProducts();
  const featured = all.filter((p) => p.available).slice(0, 8).map((p) => toListItem(p, lang));
  const projects = listProjects(lang, 5);
  const num = new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en");
  const sizeCount = new Set(all.map((p) => p.size)).size;
  const places = siteConfig.places;

  const ld = {
    "@context": "https://schema.org", "@type": "LocalBusiness", name: t.brand, url: `${siteUrl()}/${lang}`,
    logo: `${siteUrl()}/icons/icon-512.png`, telephone: siteConfig.phone, email: siteConfig.email,
    address: { "@type": "PostalAddress", streetAddress: lang === "fa" ? places[0].addressFa : places[0].addressEn },
    hasMap: places.map((p) => p.mapUrl),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      {/* HERO: static, one clear message (no slider) */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_80%_10%,var(--color-brand-100),transparent_55%)] py-14 sm:py-20 dark:bg-none">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-[1.1fr_.9fr]">
          <Reveal>
            <h1 className="text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-tight">
              {t.hero.a} <em className="bg-gradient-to-br from-brand-500 to-brand-700 bg-clip-text not-italic text-transparent">{t.hero.em}</em> {t.hero.b}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted">{t.hero.text}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/${lang}/products`} className="rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-7 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:-translate-y-0.5">{t.hero.cta1}</Link>
              <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 rounded-full border-[1.5px] border-brand-500 px-7 py-3 font-semibold text-brand-700 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-bg2">
                <PhoneIcon className="h-4 w-4" /> {t.hero.cta2}
              </a>
            </div>
            <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4">
              {[[num.format(all.length), t.hero.designs], [num.format(sizeCount), t.hero.sizes], [num.format(siteConfig.yearsExperience), t.hero.years]].map(([v, l]) => (
                <div key={l}><dt className="sr-only">{l}</dt><dd className="text-3xl font-extrabold text-brand-600">{v}<span className="block text-sm font-normal text-muted">{l}</span></dd></div>
              ))}
            </dl>
          </Reveal>
          <HeroTiles />
        </div>
      </section>

      {/* FINISH shortcuts → pre-filtered product list */}
      <section className="bg-bg2 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="text-3xl font-extrabold">{t.finish.title}</h2>
            <p className="mt-1 text-muted">{t.finish.sub}</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {([["polish", t.finish.polish, t.finish.polishDesc, "from-brand-700 via-brand-500 to-brand-100"], ["matte", t.finish.matte, t.finish.matteDesc, "from-slate-700 via-slate-500 to-slate-300"]] as const).map(([g, name, desc, grad]) => (
                <Link key={g} href={`/${lang}/products?glaze=${g}`} className="group relative flex min-h-60 items-end overflow-hidden rounded-3xl p-6 text-white">
                  <span className={`absolute inset-0 bg-gradient-to-br ${grad} transition duration-700 group-hover:scale-110`} />
                  <span className="relative"><span className="block text-2xl font-extrabold">{name}</span><span className="opacity-90">{desc}</span></span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                <div><h2 className="text-3xl font-extrabold">{t.featured.title}</h2><p className="mt-1 text-muted">{t.featured.sub}</p></div>
                <Link href={`/${lang}/products`} className="font-semibold text-brand-600 hover:underline">{t.featured.all}</Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {featured.map((i) => <ProductCard key={i.id} item={i} lang={lang} t={t} />)}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* PROJECTS (hidden until projects exist) */}
      {projects.length > 0 && (
        <section id="projects" className="bg-bg2 py-16">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <h2 className="text-3xl font-extrabold">{t.projects.title}</h2>
              <p className="mt-1 text-muted">{t.projects.sub}</p>
              <div className="mt-8 grid auto-rows-[170px] grid-cols-2 gap-3 md:grid-cols-4">
                {projects.map((p, k) => (
                  <figure key={p.id} className={`group relative overflow-hidden rounded-2xl ${k === 0 ? "col-span-2 row-span-2" : ""} ${k === 3 ? "md:col-span-2" : ""}`}>
                    <img src={imageUrl(p.images[0], 960, "projects")} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-sm text-white">{p.title}</figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* WHY US */}
      <section id="why" className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="text-3xl font-extrabold">{t.why.title}</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {t.why.items.map((it) => (
                <div key={it.t} className="rounded-2xl border border-line bg-card p-6">
                  <h3 className="text-lg font-bold text-brand-600">{it.t}</h3><p className="mt-1 text-muted">{it.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* LOCATIONS: head office + warehouse, linked to Google Maps */}
      <section id="places" className="bg-bg2 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="text-3xl font-extrabold">{t.places.title}</h2>
            <p className="mt-1 text-muted">{t.places.sub}</p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {places.map((p) => (
                <div key={p.id} className="flex flex-col rounded-3xl border border-line bg-card p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-bg2 dark:text-brand-400"><PinIcon /></span>
                    <h3 className="text-xl font-bold">{p.id === "office" ? t.places.office : t.places.warehouse}</h3>
                  </div>
                  <p>{lang === "fa" ? p.addressFa : p.addressEn}</p>
                  <p className="mt-1 text-sm text-muted">{t.places.hours}: {lang === "fa" ? p.hoursFa : p.hoursEn}</p>
                  <a href={p.mapUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700">
                    <PinIcon className="h-4 w-4" /> {t.places.map}
                  </a>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <div className="rounded-[2rem] bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-12 text-center text-white">
              <h2 className="text-3xl font-extrabold">{t.contact.title}</h2>
              <p className="mt-2 opacity-90">{t.contact.sub}</p>
              <a href={`tel:${siteConfig.phone}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-brand-700 transition hover:scale-105">
                <PhoneIcon /> <span dir="ltr">{siteConfig.phoneDisplay}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
