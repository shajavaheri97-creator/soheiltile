import Link from "next/link";
import { siteConfig } from "@/config/site";
import { fmt, type Dict, type Lang } from "@/i18n";
import { Logo, PhoneIcon } from "./Icons";

export default function Footer({ lang, t }: { lang: Lang; t: Dict }) {
  return (
    <footer className="border-t border-line bg-bg2">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted">
        <Link href={`/${lang}`} className="flex items-center gap-2 font-bold text-ink"><Logo className="h-7 w-7" /> {t.brand}</Link>
        <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 hover:text-brand-600">
          <PhoneIcon className="h-4 w-4" /> <span dir="ltr">{siteConfig.phoneDisplay}</span>
        </a>
        <p>{fmt(t.footer.rights, { y: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
