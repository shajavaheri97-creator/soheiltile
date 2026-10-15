import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { imageUrl } from "@/lib/images";
import AvailabilityToggle from "./AvailabilityToggle";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await requireAdmin();
  const db = getDb();
  const rows = db.select().from(schema.products).orderBy(desc(schema.products.id)).all();
  const imgs = db.select().from(schema.productImages).orderBy(asc(schema.productImages.sortOrder)).all();
  const cover = new Map<number, string>();
  for (const i of imgs) if (!cover.has(i.productId)) cover.set(i.productId, i.file);
  const fa = new Intl.NumberFormat("fa-IR");

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-brand-900">
          محصولات <span className="text-base font-normal text-slate-500">({fa.format(rows.length)})</span>
        </h1>
        <Link href="/admin/products/new" className="rounded-full bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700">
          + محصول جدید
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-400 bg-white p-10 text-center text-slate-500">
          هنوز محصولی ثبت نشده است.
        </p>
      ) : (
        <ul className="grid gap-3">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-100 bg-white p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                {cover.has(p.id) && (
                   
                  <img src={imageUrl(cover.get(p.id)!, 480)} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{p.nameFa} <span className="font-normal text-slate-400" dir="ltr">· {p.nameEn}</span></p>
                <p className="text-sm text-slate-500">
                  <span dir="ltr">{p.size.replace("x", "×")}</span> · {p.glaze === "polish" ? "پولیش" : "مات"}
                  {p.series && <> · {p.series}</>}
                </p>
              </div>
              <AvailabilityToggle id={p.id} available={p.available} />
              <Link href={`/admin/products/${p.id}`} className="rounded-full border border-brand-100 px-4 py-1.5 text-sm hover:bg-brand-50">ویرایش</Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
