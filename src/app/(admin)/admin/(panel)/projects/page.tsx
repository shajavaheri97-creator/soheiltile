import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { imageUrl } from "@/lib/image-url";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  await requireAdmin();
  const db = getDb();
  const rows = db.select().from(schema.projects).orderBy(desc(schema.projects.id)).all();
  const imgs = db.select().from(schema.projectImages).orderBy(asc(schema.projectImages.sortOrder)).all();
  const links = db.select().from(schema.productProjects).all();
  const fa = new Intl.NumberFormat("fa-IR");

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-brand-900">
          پروژه‌ها <span className="text-base font-normal text-slate-500">({fa.format(rows.length)})</span>
        </h1>
        <Link href="/admin/projects/new" className="rounded-full bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700">+ پروژه جدید</Link>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-400 bg-white p-10 text-center text-slate-500">هنوز پروژه‌ای ثبت نشده است.</p>
      ) : (
        <ul className="grid gap-3">
          {rows.map((p) => {
            const mine = imgs.filter((i) => i.projectId === p.id);
            const productCount = links.filter((l) => l.projectId === p.id).length;
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-100 bg-white p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                  {mine[0] && <img src={imageUrl(mine[0].file, 480, "projects")} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{p.titleFa} <span className="font-normal text-slate-400" dir="ltr">· {p.titleEn}</span></p>
                  <p className="text-sm text-slate-500">{fa.format(mine.length)} عکس · {fa.format(productCount)} محصول</p>
                </div>
                <Link href={`/admin/projects/${p.id}`} className="rounded-full border border-brand-100 px-4 py-1.5 text-sm hover:bg-brand-50">ویرایش</Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
