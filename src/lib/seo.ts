import type { Lang } from "@/i18n";

export const siteUrl = () => (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** canonical + hreflang for a path that exists in both languages, e.g. "/products". */
export function alternates(lang: Lang, path = "") {
  return {
    canonical: `/${lang}${path}`,
    languages: { fa: `/fa${path}`, en: `/en${path}`, "x-default": `/fa${path}` },
  };
}

/** Safe JSON for <script type="application/ld+json"> */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
