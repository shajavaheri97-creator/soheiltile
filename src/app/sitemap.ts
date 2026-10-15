import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const pair = (path: string, lastModified?: Date): MetadataRoute.Sitemap =>
    (["fa", "en"] as const).map((l) => ({
      url: `${base}/${l}${path}`, lastModified,
      alternates: { languages: { fa: `${base}/fa${path}`, en: `${base}/en${path}` } },
    }));
  return [
    ...pair(""), ...pair("/products"),
    ...listProducts().flatMap((p) => pair(`/products/${p.slug}`, new Date(p.updatedAt * 1000))),
  ];
}
