"use server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { deleteImage, saveImage } from "@/lib/images";
import type { FormState } from "./actions";

const { products, projects, projectImages, productProjects } = schema;

const Input = z.object({
  titleFa: z.string().trim().min(1, "عنوان فارسی را وارد کنید").max(150),
  titleEn: z.string().trim().min(1, "عنوان انگلیسی را وارد کنید").max(150),
});

export async function saveProject(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const idRaw = String(fd.get("id") ?? "");
  const id = idRaw ? Number(idRaw) : null;
  if (idRaw && !Number.isInteger(id)) return { error: "شناسه نامعتبر است" };

  const parsed = Input.safeParse({ titleFa: fd.get("titleFa") ?? "", titleEn: fd.get("titleEn") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const files = fd.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 20) return { error: "در هر بار حداکثر ۲۰ عکس" };

  const db = getDb();
  const wanted = [...new Set(fd.getAll("productIds").map(Number).filter(Number.isInteger))];
  const validIds = wanted.length
    ? db.select({ id: products.id }).from(products).where(inArray(products.id, wanted)).all().map((r) => r.id)
    : [];

  const saved: string[] = [];
  try {
    for (const f of files) saved.push(await saveImage(f, "projects"));
  } catch (e) {
    await Promise.all(saved.map((s) => deleteImage(s, "projects")));
    return { error: e instanceof Error ? e.message : "خطا در ذخیره عکس" };
  }

  try {
    db.transaction((tx) => {
      let pid = id;
      if (pid) tx.update(projects).set(parsed.data).where(eq(projects.id, pid)).run();
      else pid = tx.insert(projects).values(parsed.data).returning({ id: projects.id }).get().id;

      tx.delete(productProjects).where(eq(productProjects.projectId, pid)).run();
      for (const productId of validIds) tx.insert(productProjects).values({ productId, projectId: pid }).run();

      const existing = tx.select({ s: projectImages.sortOrder }).from(projectImages)
        .where(eq(projectImages.projectId, pid)).orderBy(asc(projectImages.sortOrder)).all();
      let order = existing.length ? existing[existing.length - 1].s + 1 : 0;
      for (const file of saved) tx.insert(projectImages).values({ projectId: pid, file, sortOrder: order++ }).run();
    });
  } catch {
    await Promise.all(saved.map((s) => deleteImage(s, "projects")));
    return { error: "ذخیره در دیتابیس انجام نشد" };
  }
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function deleteProject(id: number) {
  await requireAdmin();
  const db = getDb();
  const imgs = db.select().from(projectImages).where(eq(projectImages.projectId, id)).all();
  db.delete(projects).where(eq(projects.id, id)).run(); // image + link rows cascade
  await Promise.all(imgs.map((i) => deleteImage(i.file, "projects")));
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function deleteProjectImage(projectId: number, imageId: number) {
  await requireAdmin();
  const db = getDb();
  const img = db.select().from(projectImages)
    .where(and(eq(projectImages.id, imageId), eq(projectImages.projectId, projectId))).get();
  if (!img) return;
  db.delete(projectImages).where(eq(projectImages.id, imageId)).run();
  await deleteImage(img.file, "projects");
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function setProjectCover(projectId: number, imageId: number) {
  await requireAdmin();
  const db = getDb();
  const all = db.select({ id: projectImages.id }).from(projectImages)
    .where(eq(projectImages.projectId, projectId)).orderBy(asc(projectImages.sortOrder)).all();
  if (!all.some((i) => i.id === imageId)) return;
  const ordered = [imageId, ...all.map((i) => i.id).filter((i) => i !== imageId)];
  db.transaction((tx) => {
    ordered.forEach((iid, idx) => tx.update(projectImages).set({ sortOrder: idx }).where(eq(projectImages.id, iid)).run());
  });
  revalidatePath(`/admin/projects/${projectId}`);
}
