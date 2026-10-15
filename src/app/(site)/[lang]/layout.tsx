import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../../globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PwaRegister from "@/components/PwaRegister";
import { LOCALES, dirOf, getDict, isLang } from "@/i18n";
import { siteUrl } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));
export const viewport: Viewport = { themeColor: "#18c3c6", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t.brand, template: `%s | ${t.brand}` },
    description: t.siteDesc,
    applicationName: t.brand,
    manifest: "/manifest.webmanifest",
    openGraph: { siteName: t.brand, locale: lang === "fa" ? "fa_IR" : "en_US", type: "website" },
  };
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  return (
    <html lang={lang} dir={dirOf(lang)} className="site">
      <body className="flex min-h-screen flex-col antialiased">
        <Header lang={lang} t={t} />
        <div className="flex-1">{children}</div>
        <Footer lang={lang} t={t} />
        <PwaRegister />
      </body>
    </html>
  );
}
