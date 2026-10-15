import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import ProjectForm from "../ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requireAdmin();
  const options = getDb().select().from(schema.products).orderBy(asc(schema.products.nameFa)).all()
    .map((p) => ({ id: p.id, name: p.nameFa, meta: `${p.size.replace("x", "×")} ${p.glaze === "polish" ? "polish" : "matte"}` }));
  return (
    <>
      <Link href="/admin/projects" className="text-sm text-brand-700 hover:underline">← بازگشت به پروژه‌ها</Link>
      <h1 className="mb-4 mt-2 text-2xl font-extrabold text-brand-900">پروژه جدید</h1>
      <ProjectForm options={options} linked={[]} />
    </>
  );
}
