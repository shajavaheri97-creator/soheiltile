import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "ورود مدیر", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-sm rounded-3xl border border-brand-100 bg-white p-8 shadow-xl shadow-brand-100/50">
        { }
        <img src="/logo.png" alt="" width={56} height={56} className="mx-auto mb-4 h-14 w-14 object-contain" />
        <h1 className="mb-6 text-center text-xl font-extrabold text-brand-900">پنل مدیریت بازرگانی سهیل</h1>
        <LoginForm />
      </div>
    </main>
  );
}
