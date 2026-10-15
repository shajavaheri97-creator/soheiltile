"use client";
import { useActionState } from "react";
import { saveProduct, type FormState } from "../actions";
import type { Product } from "@/db/schema";

const field =
  "w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const label = "mb-1 block text-sm font-semibold";

export default function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});
  return (
    <form action={action} className="space-y-5 rounded-2xl border border-brand-100 bg-white p-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="nameFa">نام (فارسی)</label>
          <input id="nameFa" name="nameFa" required maxLength={120} defaultValue={product?.nameFa} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="nameEn">نام (انگلیسی)</label>
          <input id="nameEn" name="nameEn" required maxLength={120} dir="ltr" defaultValue={product?.nameEn} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="size">سایز (سانتی‌متر)</label>
          <input id="size" name="size" required list="sizes" dir="ltr" placeholder="60x60"
            defaultValue={product?.size} className={field} />
          <datalist id="sizes">
            {["60x60", "80x80", "60x120", "30x90", "30x60", "100x100"].map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>
        <div>
          <label className={label} htmlFor="glaze">لعاب</label>
          <select id="glaze" name="glaze" required defaultValue={product?.glaze ?? ""} className={field}>
            <option value="" disabled>انتخاب کنید</option>
            <option value="polish">پولیش</option>
            <option value="matte">مات</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="series">کد / سری</label>
          <input id="series" name="series" maxLength={40} dir="ltr" defaultValue={product?.series} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="slug">آدرس صفحه (slug)</label>
          <input id="slug" name="slug" maxLength={80} dir="ltr" placeholder="خالی = از نام انگلیسی ساخته می‌شود"
            defaultValue={product?.slug} className={field} />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="descFa">توضیحات (فارسی)</label>
        <textarea id="descFa" name="descFa" rows={4} maxLength={4000} defaultValue={product?.descFa} className={field} />
      </div>
      <div>
        <label className={label} htmlFor="descEn">توضیحات (انگلیسی)</label>
        <textarea id="descEn" name="descEn" rows={4} maxLength={4000} dir="ltr" defaultValue={product?.descEn} className={field} />
      </div>
      <div>
        <label className={label} htmlFor="newImages">افزودن عکس (وجه‌های مختلف محصول)</label>
        <input id="newImages" name="newImages" type="file" multiple accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm file:me-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700" />
        <p className="mt-1 text-xs text-slate-500">JPG / PNG / WebP، حداکثر ۱۲ مگابایت برای هر عکس. عکس اول، عکس اصلی محصول است.</p>
      </div>
      <label className="flex items-center gap-3">
        <input type="checkbox" name="available" defaultChecked={product?.available ?? true} className="h-5 w-5 accent-brand-600" />
        <span className="font-semibold">موجود در انبار</span>
      </label>
      {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="rounded-full bg-brand-600 px-8 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending ? "در حال ذخیره…" : "ذخیره"}
      </button>
    </form>
  );
}
