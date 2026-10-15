import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { ListItem } from "@/lib/catalog";
import { sizeLabel } from "@/lib/text";
import type { Dict, Lang } from "@/i18n";
import { PhoneIcon } from "./Icons";

const srcSet = (u: string) => `${u.replace("-960", "-480")} 480w, ${u} 960w`;
const SIZES = "(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw";

export default function ProductCard({ item, lang, t }: { item: ListItem; lang: Lang; t: Dict }) {
  return (
    <article className={`group relative overflow-hidden rounded-2xl border border-line bg-card transition duration-300 hover:-translate-y-1.5 hover:shadow-soft ${item.available ? "" : "opacity-95"}`}>
      <Link href={`/${lang}/products/${item.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-bg2">
          <span className={`absolute start-3 top-3 z-10 rounded-full bg-white px-3 py-0.5 text-xs font-semibold shadow ${item.available ? "text-brand-700" : "text-rose-700"}`}>
            {item.available ? t.product.in : t.product.out}
          </span>
          <div className={`absolute inset-0 ${item.available ? "" : "grayscale opacity-60"}`}>
            {item.cover ? (
              <>
                <img src={item.cover} srcSet={srcSet(item.cover)} sizes={SIZES} alt={`${item.name} ${sizeLabel(item.size)}`} loading="lazy" decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${item.cover2 ? "group-hover:opacity-0" : "group-hover:scale-105"}`} />
                {item.cover2 && (
                  <img src={item.cover2} srcSet={srcSet(item.cover2)} sizes={SIZES} alt="" loading="lazy" decoding="async" aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-100 object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
                )}
              </>
            ) : <div className="tile-ph absolute inset-0" />}
          </div>
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-brand-900/85 to-transparent p-3 text-center text-sm font-semibold text-white transition duration-300 group-hover:translate-y-0">
            {t.product.view}
          </div>
        </div>
        <div className="p-4 pe-14">
          <h3 className="truncate font-bold">{item.name}</h3>
          <p className="text-sm text-muted"><span dir="ltr">{sizeLabel(item.size)}</span> · {item.glaze === "polish" ? t.list.polish : t.list.matte}</p>
        </div>
      </Link>
      <a href={`tel:${siteConfig.phone}`} aria-label={`${t.product.call}: ${item.name}`}
        className="absolute bottom-3 end-3 grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white shadow transition hover:scale-110 hover:bg-brand-700">
        <PhoneIcon className="h-[18px] w-[18px]" />
      </a>
    </article>
  );
}
