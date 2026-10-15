"use client";
import { useActionState } from "react";
import { saveProject } from "../project-actions";
import type { FormState } from "../actions";

const field =
  "w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const label = "mb-1 block text-sm font-semibold";

export type ProductOption = { id: number; name: string; meta: string };

export default function ProjectForm({ project, options, linked }: {
  project?: { id: number; titleFa: string; titleEn: string };
  options: ProductOption[];
  linked: number[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProject, {});
  return (
    <form action={action} className="space-y-5 rounded-2xl border border-brand-100 bg-white p-5">
      {project && <input type="hidden" name="id" value={project.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="titleFa">عنوان پروژه (فارسی)</label>
          <input id="titleFa" name="titleFa" required maxLength={150} defaultValue={project?.titleFa} className={field} placeholder="مثلاً: ویلا — لواسان" />
        </div>
        <div>
          <label className={label} htmlFor="titleEn">عنوان پروژه (انگلیسی)</label>
          <input id="titleEn" name="titleEn" required maxLength={150} dir="ltr" defaultValue={project?.titleEn} className={field} placeholder="e.g. Villa — Lavasan" />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="newImages">افزودن عکس پروژه</label>
        <input id="newImages" name="newImages" type="file" multiple accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm file:me-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700" />
        <p className="mt-1 text-xs text-slate-500">JPG / PNG / WebP، حداکثر ۱۲ مگابایت برای هر عکس. عکس اول، عکس اصلی پروژه است.</p>
      </div>
      <fieldset>
        <legend className={label}>محصولاتی که در این پروژه استفاده شده‌اند</legend>
        {options.length === 0 ? (
          <p className="text-sm text-slate-500">هنوز محصولی ثبت نشده است.</p>
        ) : (
          <ul className="grid max-h-72 gap-1 overflow-auto rounded-xl border border-brand-100 p-2 sm:grid-cols-2">
            {options.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-brand-50">
                  <input type="checkbox" name="productIds" value={o.id} defaultChecked={linked.includes(o.id)} className="h-4 w-4 accent-brand-600" />
                  <span>{o.name} <span className="text-xs text-slate-400" dir="ltr">{o.meta}</span></span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
      {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="rounded-full bg-brand-600 px-8 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending ? "در حال ذخیره…" : "ذخیره"}
      </button>
    </form>
  );
}
