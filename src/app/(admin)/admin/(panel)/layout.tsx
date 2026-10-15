import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../login/actions";

export const metadata: Metadata = { title: "پنل مدیریت", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-extrabold text-brand-900">
            { }
            <img src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            پنل بازرگانی سهیل
          </Link>
          <nav className="ms-4 flex gap-1 text-sm font-semibold" aria-label="admin">
            <Link href="/admin" className="rounded-full px-3 py-1.5 hover:bg-brand-50">محصولات</Link>
            <Link href="/admin/projects" className="rounded-full px-3 py-1.5 hover:bg-brand-50">پروژه‌ها</Link>
          </nav>
          <Link href="/fa" className="ms-auto text-sm text-slate-500 hover:text-brand-700">مشاهده سایت</Link>
          <form action={logout}>
            <button className="rounded-full border border-brand-100 px-4 py-1.5 text-sm hover:bg-brand-50">خروج</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
