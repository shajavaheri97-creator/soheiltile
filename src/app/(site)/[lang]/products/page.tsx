import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductsExplorer from "@/components/ProductsExplorer";
import { getDict, isLang } from "@/i18n";
import { listProducts, toListItem } from "@/lib/catalog";
import { alternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return { title: t.list.title, description: t.list.sub, alternates: alternates(lang, "/products") };
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ProductsPage({ params, searchParams }: {
  params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const sp = await searchParams;
  const t = getDict(lang);
  const items = listProducts().map((p) => toListItem(p, lang));
  const glaze = one(sp.glaze);
  const initial = {
    q: one(sp.q).slice(0, 80),
    size: /^\d{2,3}x\d{2,3}$/.test(one(sp.size)) ? one(sp.size) : "all",
    glaze: glaze === "polish" || glaze === "matte" ? glaze : "all",
    av: one(sp.av) === "1",
  };
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl font-extrabold">{t.list.title}</h1>
      <p className="mb-6 mt-1 text-muted">{t.list.sub}</p>
      <ProductsExplorer items={items} lang={lang} t={t} initial={initial} />
    </main>
  );
}
