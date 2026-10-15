import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhoneIcon } from "@/components/Icons";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import { siteConfig } from "@/config/site";
import { getDict, isLang, type Lang } from "@/i18n";
import { getProductBySlug, listProducts, projectsForProduct, toListItem } from "@/lib/catalog";
import { imageUrl } from "@/lib/images";
import { alternates, jsonLd, siteUrl } from "@/lib/seo";
import { sizeLabel } from "@/lib/text";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ lang: string; slug: string }> };

const nameOf = (p: { nameFa: string; nameEn: string }, lang: Lang) => (lang === "fa" ? p.nameFa : p.nameEn);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const p = getProductBySlug(slug);
  if (!p) return {};
  const t = getDict(lang);
  const glaze = p.glaze === "polish" ? t.list.polish : t.list.matte;
  const title = `${nameOf(p, lang)} ${sizeLabel(p.size)} ${glaze}`;
  const desc = (lang === "fa" ? p.descFa : p.descEn) || `${title} — ${t.siteDesc}`;
  const img = p.images[0] ? [{ url: imageUrl(p.images[0], 960) }] : undefined;
  return {
    title, description: desc.slice(0, 160), alternates: alternates(lang, `/products/${p.slug}`),
    openGraph: { title, description: desc.slice(0, 160), url: `/${lang}/products/${p.slug}`, images: img, type: "website" },
    twitter: { card: "summary_large_image", title, images: img?.map((i) => i.url) },
  };
}

export default async function ProductPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const p = getProductBySlug(slug);
  if (!p) notFound();
  const t = getDict(lang);
  const name = nameOf(p, lang);
  const glaze = p.glaze === "polish" ? t.list.polish : t.list.matte;
  const desc = lang === "fa" ? p.descFa : p.descEn;
  const projects = projectsForProduct(p.id, lang);
  const related = listProducts()
    .filter((o) => o.id !== p.id && (o.glaze === p.glaze || o.size === p.size))
    .slice(0, 4).map((o) => toListItem(o, lang));

  const ld = {
    "@context": "https://schema.org", "@type": "Product", name, sku: p.series || undefined,
    description: desc || undefined, url: `${siteUrl()}/${lang}/products/${p.slug}`,
    image: p.images.map((f) => `${siteUrl()}${imageUrl(f, 1600)}`),
    category: lang === "fa" ? "کاشی و سرامیک" : "Tiles & Ceramics",
    brand: { "@type": "Brand", name: lang === "fa" ? "بازرگانی سهیل" : "Soheil Trading" },
    additionalProperty: [
      { "@type": "PropertyValue", name: t.product.size, value: `${sizeLabel(p.size)} ${t.product.unit}` },
      { "@type": "PropertyValue", name: t.product.glaze, value: glaze },
    ],
  };
  const rows: [string, string][] = [
    [t.product.size, `${sizeLabel(p.size)} ${t.product.unit}`], [t.product.glaze, glaze],
    ...(p.series ? [[t.product.series, p.series] as [string, string]] : []),
    [t.product.status, p.available ? t.product.in : t.product.out],
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <Link href={`/${lang}/products`} className="text-sm font-semibold text-brand-600 hover:underline">← {t.product.back}</Link>
      <div className="mt-5 grid gap-10 md:grid-cols-2">
        <ProductGallery files={p.images} alt={`${name} ${sizeLabel(p.size)}`} t={t} />
        <div>
          <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${p.available ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
            {p.available ? t.product.in : t.product.out}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold">{name}</h1>
          <table className="my-5 w-full">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b border-line"><th className="py-2.5 text-start font-normal text-muted">{k}</th><td className="py-2.5 text-end font-semibold">{v}</td></tr>
              ))}
            </tbody>
          </table>
          {desc && <p className="whitespace-pre-line leading-8">{desc}</p>}
          <div className="mt-7 rounded-2xl border border-line bg-bg2 p-5">
            <p className="mb-3 text-sm text-muted">{t.product.callHint}</p>
            <a href={`tel:${siteConfig.phone}`} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-7 py-3 font-bold text-white shadow-lg shadow-brand-500/30 transition hover:-translate-y-0.5">
              <PhoneIcon /> {t.product.call} · <span dir="ltr">{siteConfig.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>

      {projects.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-2xl font-extrabold">{t.product.projects}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {projects.flatMap((pr) => pr.images.slice(0, 3).map((f) => (
              <figure key={f} className="group relative aspect-[4/3] overflow-hidden rounded-2xl">
                <img src={imageUrl(f, 960, "projects")} alt={pr.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-sm text-white">{pr.title}</figcaption>
              </figure>
            )))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-2xl font-extrabold">{t.product.related}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((i) => <ProductCard key={i.id} item={i} lang={lang} t={t} />)}</div>
        </section>
      )}
    </main>
  );
}
