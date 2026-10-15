import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin" className="text-sm text-brand-700 hover:underline">← بازگشت به محصولات</Link>
      <h1 className="mb-4 mt-2 text-2xl font-extrabold text-brand-900">محصول جدید</h1>
      <ProductForm />
    </>
  );
}
