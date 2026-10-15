import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { imageUrl } from "@/lib/images";
import { deleteProduct, deleteProductImage, setCoverImage } from "../../actions";
import ConfirmButton from "../ConfirmButton";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const db = getDb();
  const product = db.select().from(schema.products).where(eq(schema.products.id, id)).get();
  if (!product) notFound();
  const images = db.select().from(schema.productImages)
    .where(eq(schema.productImages.productId, id)).orderBy(asc(schema.productImages.sortOrder)).all();

  return (
    <>
      <Link href="/admin" className="text-sm text-brand-700 hover:underline">← بازگشت به محصولات</Link>
      <h1 className="mb-4 mt-2 text-2xl font-extrabold text-brand-900">ویرایش: {product.nameFa}</h1>
      <ProductForm product={product} />

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">عکس‌های محصول ({images.length})</h2>
        {images.length === 0 ? (
          <p className="text-sm text-slate-500">عکسی ثبت نشده است.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img, idx) => (
              <li key={img.id} className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
                { }
                <img src={imageUrl(img.file, 480)} alt="" className="aspect-square w-full object-cover" />
                <div className="flex items-center justify-between gap-1 p-2 text-xs">
                  {idx === 0 ? (
                    <span className="font-semibold text-brand-700">عکس اصلی</span>
                  ) : (
                    <form action={setCoverImage.bind(null, id, img.id)}>
                      <button className="rounded-full bg-brand-50 px-2 py-1 font-semibold text-brand-700">عکس اصلی شود</button>
                    </form>
                  )}
                  <form action={deleteProductImage.bind(null, id, img.id)}>
                    <ConfirmButton message="این عکس حذف شود؟" className="rounded-full bg-rose-50 px-2 py-1 font-semibold text-rose-700">حذف</ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
        <h2 className="mb-2 font-bold text-rose-800">حذف محصول</h2>
        <form action={deleteProduct.bind(null, id)}>
          <ConfirmButton message="محصول و همه عکس‌هایش برای همیشه حذف شود؟" className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white">
            حذف کامل محصول
          </ConfirmButton>
        </form>
      </section>
    </>
  );
}
