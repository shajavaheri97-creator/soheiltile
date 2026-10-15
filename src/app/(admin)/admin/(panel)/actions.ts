"use server";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { deleteImage, saveImage } from "@/lib/images";

const { products, productImages } = schema;

export type FormState = { error?: string };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const ProductInput = z.object({
  nameFa: z.string().trim().min(1, "نام فارسی را وارد کنید").max(120),
  nameEn: z.string().trim().min(1, "نام انگلیسی را وارد کنید").max(120),
  slug: z.string().trim().max(80).regex(/^[a-zA-Z0-9-]*$/, "آدرس فقط حروف انگلیسی، عدد و خط تیره").default(""),
  size: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase().replace(/[×*x\s]+/g, "x"))
    .pipe(z.string().regex(/^\d{2,3}x\d{2,3}$/, "سایز را مثل 60x60 وارد کنید")),
  glaze: z.enum(["polish", "matte"], { error: "نوع لعاب را انتخاب کنید" }),
  series: z.string().trim().max(40).default(""),
  descFa: z.string().trim().max(4000).default(""),
  descEn: z.string().trim().max(4000).default(""),
});

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function saveProduct(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const idRaw = text(fd, "id");
  const id = idRaw ? Number(idRaw) : null;
  if (idRaw && !Number.isInteger(id)) return { error: "شناسه نامعتبر است" };

  const parsed = ProductInput.safeParse({
    nameFa: text(fd, "nameFa"), nameEn: text(fd, "nameEn"), slug: text(fd, "slug"),
    size: text(fd, "size"), glaze: text(fd, "glaze"), series: text(fd, "series"),
    descFa: text(fd, "descFa"), descEn: text(fd, "descEn"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;
  const available = fd.get("available") === "on";
  const slug = slugify(data.slug || data.nameEn);
  if (!slug) return { error: "آدرس (slug) معتبر ساخته نشد؛ نام انگلیسی را بررسی کنید" };

  const files = fd.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 12) return { error: "در هر بار حداکثر ۱۲ عکس" };

  const db = getDb();
  const clash = db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).get();
  if (clash && clash.id !== id) return { error: "این آدرس (slug) قبلاً استفاده شده است" };

  const saved: string[] = [];
  try {
    for (const f of files) saved.push(await saveImage(f));
  } catch (e) {
    await Promise.all(saved.map((s) => deleteImage(s)));
    return { error: e instanceof Error ? e.message : "خطا در ذخیره عکس" };
  }

  try {
    db.transaction((tx) => {
      const values = { ...data, slug, available, updatedAt: Math.floor(Date.now() / 1000) };
      let productId = id;
      if (productId) {
        tx.update(products).set(values).where(eq(products.id, productId)).run();
      } else {
        productId = tx.insert(products).values(values).returning({ id: products.id }).get().id;
      }
      const maxRow = tx.select({ s: productImages.sortOrder }).from(productImages)
        .where(eq(productImages.productId, productId)).orderBy(asc(productImages.sortOrder)).all();
      let order = maxRow.length ? maxRow[maxRow.length - 1].s + 1 : 0;
      for (const file of saved) {
        tx.insert(productImages).values({ productId, file, sortOrder: order++ }).run();
      }
    });
  } catch {
    await Promise.all(saved.map((s) => deleteImage(s)));
    return { error: "ذخیره در دیتابیس انجام نشد" };
  }
  revalidatePath("/admin");
  redirect("/admin");
}

export async function toggleAvailability(id: number, available: boolean) {
  await requireAdmin();
  if (!Number.isInteger(id)) return;
  getDb().update(products).set({ available, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(products.id, id)).run();
  revalidatePath("/admin");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  const db = getDb();
  const imgs = db.select().from(productImages).where(eq(productImages.productId, id)).all();
  db.delete(products).where(eq(products.id, id)).run(); // images rows cascade
  await Promise.all(imgs.map((i) => deleteImage(i.file)));
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProductImage(productId: number, imageId: number) {
  await requireAdmin();
  const db = getDb();
  const img = db.select().from(productImages)
    .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId))).get();
  if (!img) return;
  db.delete(productImages).where(eq(productImages.id, imageId)).run();
  await deleteImage(img.file);
  revalidatePath(`/admin/products/${productId}`);
}

export async function setCoverImage(productId: number, imageId: number) {
  await requireAdmin();
  const db = getDb();
  const all = db.select({ id: productImages.id }).from(productImages)
    .where(eq(productImages.productId, productId)).orderBy(asc(productImages.sortOrder)).all();
  if (!all.some((i) => i.id === imageId)) return;
  const ordered = [imageId, ...all.map((i) => i.id).filter((i) => i !== imageId)];
  db.transaction((tx) => {
    ordered.forEach((iid, idx) =>
      tx.update(productImages).set({ sortOrder: idx }).where(eq(productImages.id, iid)).run(),
    );
  });
  revalidatePath(`/admin/products/${productId}`);
}
